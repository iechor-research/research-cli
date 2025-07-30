/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Config,
  ToolCallRequestInfo,
  executeToolCall,
  ToolRegistry,
  shutdownTelemetry,
  isTelemetrySdkInitialized,
} from '@iechor/research-cli-core';
import {
  Content,
  Part,
  FunctionCall,
  GenerateContentResponse,
} from '@google/genai';

import { parseAndFormatApiError } from './ui/utils/errorParsing.js';
import { SlashCommandProcessor } from './services/SlashCommandProcessor.js';

function getResponseText(response: GenerateContentResponse): string | null {
  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    if (
      candidate.content &&
      candidate.content.parts &&
      candidate.content.parts.length > 0
    ) {
      // We are running in headless mode so we don't need to return thoughts to STDOUT.
      const thoughtPart = candidate.content.parts[0];
      if (thoughtPart?.thought) {
        return null;
      }
      return candidate.content.parts
        .filter((part) => part.text)
        .map((part) => part.text)
        .join('');
    }
  }
  return null;
}

export async function runNonInteractive(
  config: Config,
  input: string,
  prompt_id: string,
): Promise<void> {
  await config.initialize();
  // Handle EPIPE errors when the output is piped to a command that closes early.
  process.stdout.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EPIPE') {
      // Exit gracefully if the pipe is closed.
      process.exit(0);
    }
  });

  // Check if input is a slash command
  const trimmedInput = input.trim();
  
  if (trimmedInput.startsWith('/') || trimmedInput.startsWith('?')) {
    const slashProcessor = new SlashCommandProcessor();
    await slashProcessor.initialize();
    
    const result = await slashProcessor.processCommand(trimmedInput, {
      config,
      outputMessage: (message: string, type?: 'info' | 'error') => {
        if (type === 'error') {
          console.error(message);
        } else {
          console.log(message);
        }
      },
    });

    if (result.type === 'handled') {
      if (result.message) {
        if (result.messageType === 'error') {
          console.error(result.message);
        } else {
          console.log(result.message);
        }
      }
      return;
    } else if (result.type === 'schedule_tool') {
      // Handle tool scheduling if needed
      console.log(`Tool scheduling not yet implemented: ${result.toolName}`);
      return;
    } else if (result.type === 'not_found') {
      // If it's not a recognized slash command, fall through to AI processing
      // This allows for commands like "/analyze this code" to be sent to AI
    }
  }

  const researchClient = config.getResearchClient();
  const toolRegistry: ToolRegistry = await config.getToolRegistry();

  const chat = await researchClient.getChat();
  const abortController = new AbortController();
  let currentMessages: Content[] = [{ role: 'user', parts: [{ text: input }] }];
  let turnCount = 0;
  
  // Set up a timeout for non-interactive mode to prevent hanging
  const NONINTERACTIVE_TIMEOUT_MS = 10000; // 10 seconds max for non-interactive
  const timeoutId = setTimeout(() => {
    console.error('Operation timed out after 10 seconds. This may be due to API quota limits or service unavailability.');
    process.exit(1);
  }, NONINTERACTIVE_TIMEOUT_MS);

  try {
    while (true) {
      turnCount++;
      if (
        config.getMaxSessionTurns() > 0 &&
        turnCount > config.getMaxSessionTurns()
      ) {
        console.error(
          '\n Reached max session turns for this session. Increase the number of turns by specifying maxSessionTurns in settings.json.',
        );
        return;
      }
      const functionCalls: FunctionCall[] = [];

      const responseStream = await chat.sendMessageStream(
        {
          message: currentMessages[0]?.parts || [], // Ensure parts are always provided
          config: {
            abortSignal: abortController.signal,
            tools: [
              { functionDeclarations: toolRegistry.getFunctionDeclarations() },
            ],
          },
        },
        prompt_id,
      );

      for await (const resp of responseStream) {
        if (abortController.signal.aborted) {
          console.error('Operation cancelled.');
          return;
        }
        const textPart = getResponseText(resp);
        if (textPart) {
          process.stdout.write(textPart);
        }
        if (resp.functionCalls) {
          functionCalls.push(...resp.functionCalls);
        }
      }

      if (functionCalls.length > 0) {
        const toolResponseParts: Part[] = [];

        for (const fc of functionCalls) {
          const callId = fc.id ?? `${fc.name}-${Date.now()}`;
          const requestInfo: ToolCallRequestInfo = {
            callId,
            name: fc.name as string,
            args: (fc.args ?? {}) as Record<string, unknown>,
            isClientInitiated: false,
            prompt_id,
          };

          const toolResponse = await executeToolCall(
            config,
            requestInfo,
            toolRegistry,
            abortController.signal,
          );

          if (toolResponse.error) {
            const isToolNotFound = toolResponse.error.message.includes(
              'not found in registry',
            );
            console.error(
              `Error executing tool ${fc.name}: ${toolResponse.resultDisplay || toolResponse.error.message}`,
            );
            if (!isToolNotFound) {
              process.exit(1);
            }
          }

          if (toolResponse.responseParts) {
            const parts = Array.isArray(toolResponse.responseParts)
              ? toolResponse.responseParts
              : [toolResponse.responseParts];
            for (const part of parts) {
              if (typeof part === 'string') {
                toolResponseParts.push({ text: part });
              } else if (part) {
                toolResponseParts.push(part);
              }
            }
          }
        }
        currentMessages = [{ role: 'user', parts: toolResponseParts }];
      } else {
        clearTimeout(timeoutId); // Clear timeout on successful completion
        process.stdout.write('\n'); // Ensure a final newline
        return;
      }
    }
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout on error
    console.error(
      parseAndFormatApiError(
        error,
        config.getContentGeneratorConfig()?.authType,
      ),
    );
    process.exit(1);
  } finally {
    clearTimeout(timeoutId); // Ensure timeout is always cleared
    if (isTelemetrySdkInitialized()) {
      await shutdownTelemetry();
    }
  }
}
