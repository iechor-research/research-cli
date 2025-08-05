/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { docsPanelCommand } from './docsPanelCommand.js';
import { CommandContext } from '../types.js';

describe('docsPanelCommand', () => {
  let mockContext: CommandContext;

  beforeEach(() => {
    mockContext = {
      services: {
        config: null,
        settings: {} as any,
        git: undefined,
        logger: {
          sessionId: 'test-session'
        } as any
      },
      ui: {
        addItem: vi.fn(),
        clear: vi.fn(),
        setDebugMessage: vi.fn()
      },
      session: {
        stats: {} as any
      }
    };
  });

  it('should have correct command properties', () => {
    expect(docsPanelCommand.name).toBe('docs-panel');
    expect(docsPanelCommand.altName).toBe('panel docs');
    expect(docsPanelCommand.description).toBe('Open documentation panel in web browser');
  });

  it('should return info message for default options', async () => {
    const result = await docsPanelCommand.action!(mockContext, '');
    
    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Documentation panel feature is coming soon!')
    });
  });

  it('should parse custom port and host options', async () => {
    const result = await docsPanelCommand.action!(mockContext, '--port 8080 --host 0.0.0.0');
    
    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('http://0.0.0.0:8080')
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock a scenario that would cause an error
    const result = await docsPanelCommand.action!(mockContext, '--port invalid');
    
    expect(result).toEqual({
      type: 'message',
      messageType: 'error',
      content: expect.stringContaining('Failed to start documentation panel')
    });
  });
}); 