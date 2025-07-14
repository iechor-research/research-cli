/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { researchCommand } from './researchCommand.js';
import { CommandContext } from '../types.js';
import { MessageType } from '../../types.js';

describe('researchCommand', () => {
  let mockContext: CommandContext;

  beforeEach(() => {
    mockContext = {
      services: {
        config: null,
        settings: {} as any,
        git: undefined,
        logger: {} as any,
      },
      ui: {
        addItem: vi.fn(),
        clear: vi.fn(),
        setDebugMessage: vi.fn(),
      },
      session: {
        stats: {} as any,
      },
    };
  });

  describe('Basic Structure', () => {
    it('should have correct name and description', () => {
      expect(researchCommand.name).toBe('research');
      expect(researchCommand.description).toContain('Research tools');
    });

    it('should have all expected subcommands', () => {
      const subCommandNames = researchCommand.subCommands?.map(cmd => cmd.name) || [];
      expect(subCommandNames).toContain('search');
      expect(subCommandNames).toContain('analyze');
      expect(subCommandNames).toContain('experiment');
      expect(subCommandNames).toContain('data');
      expect(subCommandNames).toContain('help');
    });
  });

  describe('search subcommand', () => {
    it('should handle valid search command', async () => {
      const searchCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'search');
      expect(searchCommand).toBeDefined();

      if (searchCommand?.action) {
        const result = await searchCommand.action(mockContext, 'machine learning --source=arxiv --limit=5');
        
        expect(result).toEqual({
          type: 'tool',
          toolName: 'bibliography_manager',
          toolArgs: {
            operation: 'search',
            query: 'machine',
            sources: ['arxiv'],
            maxResults: 5
          }
        });

        expect(mockContext.ui.addItem).toHaveBeenCalledWith(
          {
            type: MessageType.INFO,
            text: expect.stringContaining('Searching arxiv for: "machine"')
          },
          expect.any(Number)
        );
      }
    });

    it('should handle missing query argument', async () => {
      const searchCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'search');
      
      if (searchCommand?.action) {
        await searchCommand.action(mockContext, '');
        
        expect(mockContext.ui.addItem).toHaveBeenCalledWith(
          {
            type: MessageType.ERROR,
            text: expect.stringContaining('requires at least 1 arguments')
          },
          expect.any(Number)
        );
      }
    });

    it('should validate source option', async () => {
      const searchCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'search');
      
      if (searchCommand?.action) {
        await searchCommand.action(mockContext, 'test --source=invalid');
        
        expect(mockContext.ui.addItem).toHaveBeenCalledWith(
          {
            type: MessageType.ERROR,
            text: expect.stringContaining('Invalid value')
          },
          expect.any(Number)
        );
      }
    });
  });

  describe('analyze subcommand', () => {
    it('should handle valid analyze command', async () => {
      const analyzeCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'analyze');
      
      if (analyzeCommand?.action) {
        const result = await analyzeCommand.action(mockContext, 'paper.pdf --type=grammar');
        
        expect(result).toEqual({
          type: 'tool',
          toolName: 'read_file',
          toolArgs: { path: 'paper.pdf' }
        });

        expect(mockContext.ui.addItem).toHaveBeenCalledWith(
          {
            type: MessageType.INFO,
            text: expect.stringContaining('Analyzing paper.pdf (type: grammar)')
          },
          expect.any(Number)
        );
      }
    });

    it('should default to structure analysis', async () => {
      const analyzeCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'analyze');
      
      if (analyzeCommand?.action) {
        await analyzeCommand.action(mockContext, 'paper.pdf');
        
        expect(mockContext.ui.addItem).toHaveBeenCalledWith(
          {
            type: MessageType.INFO,
            text: expect.stringContaining('type: structure')
          },
          expect.any(Number)
        );
      }
    });
  });

  describe('experiment subcommand', () => {
    it('should handle valid experiment command', async () => {
      const experimentCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'experiment');
      
      if (experimentCommand?.action) {
        const result = await experimentCommand.action(mockContext, 'python ml --output=./test');
        
        expect(result).toEqual({
          type: 'tool',
          toolName: 'experiment_code_generator',
          toolArgs: {
            language: 'python',
            researchMethod: 'ml',
            outputDirectory: './test',
            includeTests: true,
            includeDocs: true
          }
        });
      }
    });

    it('should validate language option', async () => {
      const experimentCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'experiment');
      
      if (experimentCommand?.action) {
        await experimentCommand.action(mockContext, 'invalid ml');
        
        expect(mockContext.ui.addItem).toHaveBeenCalledWith(
          {
            type: MessageType.ERROR,
            text: expect.stringContaining('Invalid value')
          },
          expect.any(Number)
        );
      }
    });
  });

  describe('data subcommand', () => {
    it('should handle valid data command', async () => {
      const dataCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'data');
      
      if (dataCommand?.action) {
        const result = await dataCommand.action(mockContext, 'describe data.csv --format=report');
        
        expect(result).toEqual({
          type: 'tool',
          toolName: 'research_data_analyzer',
          toolArgs: {
            operation: 'describe',
            dataFile: 'data.csv',
            outputFormat: 'report',
            includeVisualizations: true
          }
        });
      }
    });
  });

  describe('help subcommand', () => {
    it('should display help information', () => {
      const helpCommand = researchCommand.subCommands?.find(cmd => cmd.name === 'help');
      
      if (helpCommand?.action) {
        helpCommand.action(mockContext, '');
        
        expect(mockContext.ui.addItem).toHaveBeenCalledWith(
          {
            type: MessageType.INFO,
            text: expect.stringContaining('Research tools for literature search')
          },
          expect.any(Number)
        );
      }
    });
  });
}); 