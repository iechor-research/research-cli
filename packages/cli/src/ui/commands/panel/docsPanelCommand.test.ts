/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { docsPanelCommand } from './docsPanelCommand.js';
import type { CommandContext } from '../types.js';
import { createMockCommandContext } from '../../../test-utils/mockCommandContext.js';

describe('docsPanelCommand', () => {
  let mockContext: CommandContext;

  beforeEach(() => {
    mockContext = createMockCommandContext();
  });

  it('should have correct command properties', () => {
    expect(docsPanelCommand.name).toBe('docs-panel');
    expect(docsPanelCommand.altNames).toBe('panel docs');
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