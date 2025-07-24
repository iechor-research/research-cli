/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { 
  detectModelProvider, 
  isGeminiModel, 
  supportsCountTokens, 
  getModelTokenLimit 
} from './model-utils.js';
import { ModelProvider } from './types.js';

describe('model-utils', () => {
  describe('detectModelProvider', () => {
    it('should detect Qwen models correctly', () => {
      // 商业版模型
      expect(detectModelProvider('qwen-turbo')).toBe(ModelProvider.QWEN);
      expect(detectModelProvider('qwen-plus')).toBe(ModelProvider.QWEN);
      expect(detectModelProvider('qwen-max')).toBe(ModelProvider.QWEN);
      expect(detectModelProvider('qwq-32b-preview')).toBe(ModelProvider.QWEN);

      // Qwen2.5 开源版
      expect(detectModelProvider('qwen2.5-72b-instruct')).toBe(ModelProvider.QWEN);
      expect(detectModelProvider('qwen2.5-7b-instruct')).toBe(ModelProvider.QWEN);
      
      // 视觉模型
      expect(detectModelProvider('qwen-vl-plus')).toBe(ModelProvider.QWEN);
      expect(detectModelProvider('qvq-72b-preview')).toBe(ModelProvider.QWEN);
      
      // Qwen2 系列
      expect(detectModelProvider('qwen2-72b-instruct')).toBe(ModelProvider.QWEN);
      
      // Qwen1.5 系列
      expect(detectModelProvider('qwen1.5-72b-chat')).toBe(ModelProvider.QWEN);
    });

    it('should detect other providers correctly', () => {
      expect(detectModelProvider('deepseek-chat')).toBe(ModelProvider.DEEPSEEK);
      expect(detectModelProvider('gpt-4o')).toBe(ModelProvider.OPENAI);
      expect(detectModelProvider('gemini-1.5-pro')).toBe(ModelProvider.GEMINI);
    });

    it('should detect Claude models correctly', () => {
      // Claude 4 系列
      expect(detectModelProvider('claude-opus-4-20250514')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-sonnet-4-20250514')).toBe(ModelProvider.ANTHROPIC);
      
      // Claude 3.7 系列
      expect(detectModelProvider('claude-3-7-sonnet-20250219')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-3-7-sonnet-latest')).toBe(ModelProvider.ANTHROPIC);
      
      // Claude 3.5 系列
      expect(detectModelProvider('claude-3-5-sonnet-20241022')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-3-5-sonnet-latest')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-3-5-sonnet-20240620')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-3-5-haiku-20241022')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-3-5-haiku-latest')).toBe(ModelProvider.ANTHROPIC);
      
      // Claude 3 系列
      expect(detectModelProvider('claude-3-opus-20240229')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-3-sonnet-20240229')).toBe(ModelProvider.ANTHROPIC);
      expect(detectModelProvider('claude-3-haiku-20240307')).toBe(ModelProvider.ANTHROPIC);
    });
  });

  describe('isGeminiModel', () => {
    it('should identify Gemini models correctly', () => {
      expect(isGeminiModel('gemini-1.5-pro')).toBe(true);
      expect(isGeminiModel('gemini-1.5-flash')).toBe(true);
      expect(isGeminiModel('qwen-turbo')).toBe(false);
      expect(isGeminiModel('deepseek-chat')).toBe(false);
    });
  });

  describe('supportsCountTokens', () => {
    it('should return correct countTokens support', () => {
      expect(supportsCountTokens(ModelProvider.GEMINI)).toBe(true);
      expect(supportsCountTokens(ModelProvider.QWEN)).toBe(false);
      expect(supportsCountTokens(ModelProvider.DEEPSEEK)).toBe(false);
      expect(supportsCountTokens(ModelProvider.OPENAI)).toBe(false);
    });
  });

  describe('getModelTokenLimit', () => {
    it('should return correct token limits for Qwen models', () => {
      // 根据阿里云文档的数据
      expect(getModelTokenLimit('qwen-turbo')).toBe(1008192);
      expect(getModelTokenLimit('qwen-plus')).toBe(131072);
      expect(getModelTokenLimit('qwen-max')).toBe(32768);
      expect(getModelTokenLimit('qwq-32b-preview')).toBe(32768);
      expect(getModelTokenLimit('qwen2.5-72b-instruct')).toBe(131072);
      expect(getModelTokenLimit('qwen2-7b-instruct')).toBe(32768);
      expect(getModelTokenLimit('qwen1.5-14b-chat')).toBe(32768);
    });

    it('should return correct token limits for other models', () => {
      expect(getModelTokenLimit('deepseek-chat')).toBe(32768);
      expect(getModelTokenLimit('gpt-4o')).toBe(128000);
      expect(getModelTokenLimit('claude-3-5-sonnet-20241022')).toBe(200000);
      expect(getModelTokenLimit('gemini-1.5-pro')).toBe(2097152);
    });
  });
}); 