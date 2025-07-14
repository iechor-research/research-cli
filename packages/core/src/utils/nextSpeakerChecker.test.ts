/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest';
import { Content, GoogleGenAI, Models } from '@iechor/genai';
import { DEFAULT_RESEARCH_FLASH_MODEL } from '../config/models.js';
import { ResearchClient } from '../core/client.js';
import { Config } from '../config/config.js';
import { checkNextSpeaker, NextSpeakerResponse } from './nextSpeakerChecker.js';
import { ResearchChat } from '../core/researchChat.js';

// Mock ResearchClient and Config constructor
vi.mock('../core/client.js');
vi.mock('../config/config.js');

// Define mocks for iEchorGenAI and Models instances that will be used across tests
const mockModelsInstance = {
  generateContent: vi.fn(),
  generateContentStream: vi.fn(),
  countTokens: vi.fn(),
  embedContent: vi.fn(),
  batchEmbedContents: vi.fn(),
} as unknown as Models;

const mockGoogleGenAIInstance = {
  getGenerativeModel: vi.fn().mockReturnValue(mockModelsInstance),
  // Add other methods of GoogleGenAI if they are directly used by ResearchChat constructor or its methods
} as unknown as GoogleGenAI;

vi.mock('@iechor/genai', async () => {
  const actualGenAI =
    await vi.importActual<typeof import('@iechor/genai')>('@iechor/genai');
  return {
    ...actualGenAI,
    GoogleGenAI: vi.fn(() => mockGoogleGenAIInstance), // Mock constructor to return the predefined instance
    // If Models is instantiated directly in ResearchChat, mock its constructor too
    // For now, assuming Models instance is obtained via getGenerativeModel
  };
});

describe('checkNextSpeaker', () => {
  let chatInstance: ResearchChat;
  let mockResearchClient: ResearchClient;
  let MockConfig: Mock;
  const abortSignal = new AbortController().signal;

  beforeEach(() => {
    MockConfig = vi.mocked(Config);
    const mockConfigInstance = new MockConfig(
      'test-api-key',
      'research-pro',
      false,
      '.',
      false,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
    );

    mockResearchClient = new ResearchClient(mockConfigInstance);

    // Reset mocks before each test to ensure test isolation
    vi.mocked(mockModelsInstance.generateContent).mockReset();
    vi.mocked(mockModelsInstance.generateContentStream).mockReset();

    // ResearchChat will receive the mocked instances via the mocked iEchorGenAI constructor
    chatInstance = new ResearchChat(
      mockConfigInstance,
      mockModelsInstance, // This is the instance returned by mockiEchorGenAIInstance.getGenerativeModel
      {},
      [], // initial history
    );

    // Spy on getHistory for chatInstance
    vi.spyOn(chatInstance, 'getHistory');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return null if history is empty', async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([]);
    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toBeNull();
    expect(mockResearchClient.generateJson).not.toHaveBeenCalled();
  });

  it('should return null if the last speaker was the user', async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'user', parts: [{ text: 'Hello' }] },
    ] as Content[]);
    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toBeNull();
    expect(mockResearchClient.generateJson).not.toHaveBeenCalled();
  });

  it("should return { next_speaker: 'model' } when model intends to continue", async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'I will now do something.' }] },
    ] as Content[]);
    const mockApiResponse: NextSpeakerResponse = {
      reasoning: 'Model stated it will do something.',
      next_speaker: 'model',
    };
    (mockResearchClient.generateJson as Mock).mockResolvedValue(mockApiResponse);

    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toEqual(mockApiResponse);
    expect(mockResearchClient.generateJson).toHaveBeenCalledTimes(1);
  });

  it("should return { next_speaker: 'user' } when model asks a question", async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'What would you like to do?' }] },
    ] as Content[]);
    const mockApiResponse: NextSpeakerResponse = {
      reasoning: 'Model asked a question.',
      next_speaker: 'user',
    };
    (mockResearchClient.generateJson as Mock).mockResolvedValue(mockApiResponse);

    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toEqual(mockApiResponse);
  });

  it("should return { next_speaker: 'user' } when model makes a statement", async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'This is a statement.' }] },
    ] as Content[]);
    const mockApiResponse: NextSpeakerResponse = {
      reasoning: 'Model made a statement, awaiting user input.',
      next_speaker: 'user',
    };
    (mockResearchClient.generateJson as Mock).mockResolvedValue(mockApiResponse);

    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toEqual(mockApiResponse);
  });

  it('should return null if researchClient.generateJson throws an error', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'Some model output.' }] },
    ] as Content[]);
    (mockResearchClient.generateJson as Mock).mockRejectedValue(
      new Error('API Error'),
    );

    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toBeNull();
    consoleWarnSpy.mockRestore();
  });

  it('should return null if researchClient.generateJson returns invalid JSON (missing next_speaker)', async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'Some model output.' }] },
    ] as Content[]);
    (mockResearchClient.generateJson as Mock).mockResolvedValue({
      reasoning: 'This is incomplete.',
    } as unknown as NextSpeakerResponse); // Type assertion to simulate invalid response

    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toBeNull();
  });

  it('should return null if researchClient.generateJson returns a non-string next_speaker', async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'Some model output.' }] },
    ] as Content[]);
    (mockResearchClient.generateJson as Mock).mockResolvedValue({
      reasoning: 'Model made a statement, awaiting user input.',
      next_speaker: 123, // Invalid type
    } as unknown as NextSpeakerResponse);

    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toBeNull();
  });

  it('should return null if researchClient.generateJson returns an invalid next_speaker string value', async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'Some model output.' }] },
    ] as Content[]);
    (mockResearchClient.generateJson as Mock).mockResolvedValue({
      reasoning: 'Model made a statement, awaiting user input.',
      next_speaker: 'neither', // Invalid enum value
    } as unknown as NextSpeakerResponse);

    const result = await checkNextSpeaker(
      chatInstance,
      mockResearchClient,
      abortSignal,
    );
    expect(result).toBeNull();
  });

  it('should call generateJson with DEFAULT_RESEARCH_FLASH_MODEL', async () => {
    (chatInstance.getHistory as Mock).mockReturnValue([
      { role: 'model', parts: [{ text: 'Some model output.' }] },
    ] as Content[]);
    const mockApiResponse: NextSpeakerResponse = {
      reasoning: 'Model made a statement, awaiting user input.',
      next_speaker: 'user',
    };
    (mockResearchClient.generateJson as Mock).mockResolvedValue(mockApiResponse);

    await checkNextSpeaker(chatInstance, mockResearchClient, abortSignal);

    expect(mockResearchClient.generateJson).toHaveBeenCalled();
    const generateJsonCall = (mockResearchClient.generateJson as Mock).mock
      .calls[0];
    expect(generateJsonCall[3]).toBe(DEFAULT_RESEARCH_FLASH_MODEL);
  });
});
