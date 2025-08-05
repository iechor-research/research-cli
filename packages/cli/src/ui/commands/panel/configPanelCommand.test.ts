/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configPanelCommand } from './configPanelCommand.js';
import { CommandContext } from '../types.js';

describe('configPanelCommand', () => {
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
    expect(configPanelCommand.name).toBe('config-panel');
    expect(configPanelCommand.altName).toBe('panel config');
    expect(configPanelCommand.description).toBe('Open configuration panel in web browser');
  });

  it('should return info message for default options', async () => {
    const result = await configPanelCommand.action!(mockContext, '');
    
    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Configuration panel feature is coming soon!')
    });
  });

  it('should parse custom port and host options', async () => {
    const result = await configPanelCommand.action!(mockContext, '--port 8080 --host 0.0.0.0');
    
    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('http://0.0.0.0:8080')
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock a scenario that would cause an error
    const result = await configPanelCommand.action!(mockContext, '--port invalid');
    
    expect(result).toEqual({
      type: 'message',
      messageType: 'error',
      content: expect.stringContaining('Failed to start configuration panel')
    });
  });
}); 