/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiProviderContentGenerator } from './multi-provider-content-generator.js';
import { ContentGenerator } from './contentGenerator.js';
import { ModelProvider } from './model-providers/types.js';
import { GenerateContentResponse, FinishReason } from '@google/genai';

// Mock ContentGenerator
class MockGeminiGenerator implements ContentGenerator {
  async generateContent(): Promise<GenerateContentResponse> {
    const response = new GenerateContentResponse();
    response.candidates = [{
      content: { parts: [{ text: 'Gemini response' }], role: 'model' },
      finishReason: FinishReason.STOP,
      index: 0,
      safetyRatings: []
    }];
    return response;
  }

  async generateContentStream(): Promise<AsyncGenerator<GenerateContentResponse>> {
    async function* mockStream() {
      const response = new GenerateContentResponse();
      response.candidates = [{
        content: { parts: [{ text: 'Gemini stream' }], role: 'model' },
        finishReason: FinishReason.STOP,
        index: 0,
        safetyRatings: []
      }];
      yield response;
    }
    return mockStream();
  }

  async countTokens() {
    return { totalTokens: 100 };
  }

  async embedContent() {
    return { embeddings: [] };
  }
}

describe('MultiProviderContentGenerator', () => {
  let mockGeminiGenerator: MockGeminiGenerator;
  let multiProviderGenerator: MultiProviderContentGenerator;

  beforeEach(() => {
    mockGeminiGenerator = new MockGeminiGenerator();
    multiProviderGenerator = new MultiProviderContentGenerator(mockGeminiGenerator);
  });

  describe('countTokens', () => {
    it('should use Gemini generator for Gemini models', async () => {
      const spy = vi.spyOn(mockGeminiGenerator, 'countTokens');
      
      await multiProviderGenerator.countTokens({
        model: 'gemini-1.5-pro',
        contents: [{ role: 'user', parts: [{ text: 'test' }] }]
      });

      expect(spy).toHaveBeenCalled();
    });

    it('should provide token estimation for non-Gemini models', async () => {
      const result = await multiProviderGenerator.countTokens({
        model: 'deepseek-chat',
        contents: [{ role: 'user', parts: [{ text: 'test message' }] }]
      });

      expect(result.totalTokens).toBeGreaterThan(0);
      expect(typeof result.totalTokens).toBe('number');
    });

    it('should estimate tokens correctly for text content', async () => {
      const longText = 'a'.repeat(100); // 100 characters
      const result = await multiProviderGenerator.countTokens({
        model: 'deepseek-chat',
        contents: [{ role: 'user', parts: [{ text: longText }] }]
      });

      // Should be approximately 25 tokens (100 chars / 4)
      expect(result.totalTokens).toBe(25);
    });
  });

  describe('generateContent', () => {
    it('should use Gemini generator for Gemini models', async () => {
      const spy = vi.spyOn(mockGeminiGenerator, 'generateContent');
      
      await multiProviderGenerator.generateContent({
        model: 'gemini-1.5-pro',
        contents: [{ role: 'user', parts: [{ text: 'test' }] }]
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('configureProvider', () => {
    it('should allow configuring providers', () => {
      expect(() => {
        multiProviderGenerator.configureProvider(ModelProvider.DEEPSEEK, {
          apiKey: 'test-key'
        });
      }).not.toThrow();
    });
  });
}); 