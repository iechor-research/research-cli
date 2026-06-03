/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type {
  ToolCallRequestInfo,
  ToolCallResponseInfo,
  ToolRegistry,
  ToolResult,
} from '../index.js';
import {
  logToolCall,
  ToolCallEvent,
} from '../index.js';
import type { Config } from '../config/config.js';
import { ToolErrorType } from '../tools/tool-error.js';
import { convertToFunctionResponse } from './coreToolScheduler.js';

/**
 * Executes a single tool call non-interactively.
 * It does not handle confirmations, multiple calls, or live updates.
 */
export async function executeToolCall(
  config: Config,
  toolCallRequest: ToolCallRequestInfo,
  toolRegistry: ToolRegistry,
  abortSignal?: AbortSignal,
): Promise<ToolCallResponseInfo> {
  const tool = toolRegistry.getTool(toolCallRequest.name);

  const startTime = Date.now();
  if (!tool) {
    const error = new Error(
      `Tool "${toolCallRequest.name}" not found in registry.`,
    );
    const durationMs = Date.now() - startTime;
    logToolCall(
      config,
      new ToolCallEvent(
        undefined,
        toolCallRequest.name,
        toolCallRequest.args,
        durationMs,
        false,
        toolCallRequest.prompt_id,
        'native',
        error.message,
      ),
    );
    // Ensure the response structure matches what the API expects for an error
    return {
      callId: toolCallRequest.callId,
      responseParts: [
        {
          functionResponse: {
            id: toolCallRequest.callId,
            name: toolCallRequest.name,
            response: { error: error.message },
          },
        },
      ],
      resultDisplay: error.message,
      error,
      errorType: ToolErrorType.EXECUTION_FAILED,
    };
  }

  try {
    // Directly execute without confirmation or live output handling
    const effectiveAbortSignal = abortSignal ?? new AbortController().signal;
    const toolResult: ToolResult = await tool
      .build(toolCallRequest.args)
      .execute({ abortSignal: effectiveAbortSignal });

    const tool_output = toolResult.llmContent;

    const tool_display = toolResult.returnDisplay;

    const durationMs = Date.now() - startTime;
    logToolCall(
      config,
      new ToolCallEvent(
        undefined,
        toolCallRequest.name,
        toolCallRequest.args,
        durationMs,
        true,
        toolCallRequest.prompt_id,
        'native',
      ),
    );

    const response = convertToFunctionResponse(
      toolCallRequest.name,
      toolCallRequest.callId,
      tool_output,
    );

    return {
      callId: toolCallRequest.callId,
      responseParts: response,
      resultDisplay: tool_display,
      error: undefined,
      errorType: undefined,
    };
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    const durationMs = Date.now() - startTime;
    logToolCall(
      config,
      new ToolCallEvent(
        undefined,
        toolCallRequest.name,
        toolCallRequest.args,
        durationMs,
        false,
        toolCallRequest.prompt_id,
        'native',
        error.message,
      ),
    );
    return {
      callId: toolCallRequest.callId,
      responseParts: [
        {
          functionResponse: {
            id: toolCallRequest.callId,
            name: toolCallRequest.name,
            response: { error: error.message },
          },
        },
      ],
      resultDisplay: error.message,
      error,
      errorType: ToolErrorType.EXECUTION_FAILED,
    };
  }
}
