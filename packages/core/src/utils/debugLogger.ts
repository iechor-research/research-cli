/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console */

/**
 * A centralized logger for developer-facing debug messages.
 *
 * These messages are intended for contributors and developers, not end-users.
 * Using this logger (rather than raw console.* calls) makes the intent clear
 * and provides a single point of control for debug-log behavior.
 *
 * Adapted from upstream gemini-cli debugLogger utility.
 */
class DebugLogger {
  log(...args: unknown[]): void {
    console.log(...args);
  }

  warn(...args: unknown[]): void {
    console.warn(...args);
  }

  error(...args: unknown[]): void {
    console.error(...args);
  }

  debug(...args: unknown[]): void {
    console.debug(...args);
  }
}

export const debugLogger = new DebugLogger();
