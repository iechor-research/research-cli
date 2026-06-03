/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { act, renderHook } from '@testing-library/react';
import {
  useConsoleMessages,
  initializeConsoleStore,
} from './useConsoleMessages.js';
import { coreEvents } from '@iechor/research-cli-core';

// Mock setTimeout and clearTimeout
vi.useFakeTimers();

describe('useConsoleMessages', () => {
  beforeEach(() => {
    // Reset the global console store and (re)attach the core event listeners.
    initializeConsoleStore();
  });

  it('should initialize with an empty array of console messages', () => {
    const { result } = renderHook(() => useConsoleMessages());
    expect(result.current).toEqual([]);
  });

  it('should add a new message', () => {
    const { result } = renderHook(() => useConsoleMessages());

    act(() => {
      coreEvents.emitConsoleLog('log', 'Test message');
    });

    act(() => {
      vi.runAllTimers(); // Process the queue
    });

    expect(result.current).toEqual([
      { type: 'log', content: 'Test message', count: 1 },
    ]);
  });

  it('should consolidate identical consecutive messages', () => {
    const { result } = renderHook(() => useConsoleMessages());

    act(() => {
      coreEvents.emitConsoleLog('log', 'Test message');
      coreEvents.emitConsoleLog('log', 'Test message');
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toEqual([
      { type: 'log', content: 'Test message', count: 2 },
    ]);
  });

  it('should not consolidate different messages', () => {
    const { result } = renderHook(() => useConsoleMessages());

    act(() => {
      coreEvents.emitConsoleLog('log', 'Test message 1');
      coreEvents.emitConsoleLog('error', 'Test message 2');
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toEqual([
      { type: 'log', content: 'Test message 1', count: 1 },
      { type: 'error', content: 'Test message 2', count: 1 },
    ]);
  });

  it('should not consolidate messages if type is different', () => {
    const { result } = renderHook(() => useConsoleMessages());

    act(() => {
      coreEvents.emitConsoleLog('log', 'Test message');
      coreEvents.emitConsoleLog('error', 'Test message');
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toEqual([
      { type: 'log', content: 'Test message', count: 1 },
      { type: 'error', content: 'Test message', count: 1 },
    ]);
  });

  it('should clear console messages when the store is re-initialized', () => {
    const { result } = renderHook(() => useConsoleMessages());

    act(() => {
      coreEvents.emitConsoleLog('log', 'Test message');
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toHaveLength(1);

    act(() => {
      initializeConsoleStore();
    });

    expect(result.current).toEqual([]);
  });

  it('should clear a pending queue when the store is re-initialized', () => {
    const { result } = renderHook(() => useConsoleMessages());

    act(() => {
      // Add a message but don't process the queue yet.
      coreEvents.emitConsoleLog('log', 'Test message');
    });

    act(() => {
      initializeConsoleStore();
    });

    // Process any pending timeouts (the queue should have been cleared).
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toEqual([]);
  });
});
