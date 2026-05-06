/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Adapted from upstream gemini-cli commit 3b29f118 (#6747,
// "improve stdin handling and add initial state check").
const MAX_STDIN_SIZE = 10 * 1024 * 1024; // 10 MB

export async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    let totalSize = 0;
    let hasReceivedData = false;

    process.stdin.setEncoding('utf8');

    function cleanup() {
      clearTimeout(timeout);
      process.stdin.removeListener('readable', onReadable);
      process.stdin.removeListener('end', onEnd);
      process.stdin.removeListener('error', onError);
    }

    function processChunk(chunk: string): boolean {
      hasReceivedData = true;
      if (totalSize + chunk.length > MAX_STDIN_SIZE) {
        const remainingSize = MAX_STDIN_SIZE - totalSize;
        data += chunk.slice(0, remainingSize);
        console.warn(
          `Warning: stdin input truncated to ${MAX_STDIN_SIZE} bytes.`,
        );
        process.stdin.destroy();
        return true; // Indicates truncation occurred
      } else {
        data += chunk;
        totalSize += chunk.length;
        return false;
      }
    }

    function checkInitialState(): boolean {
      if (process.stdin.destroyed || process.stdin.readableEnded) {
        cleanup();
        resolve('');
        return true;
      }

      const chunk = process.stdin.read();
      if (chunk !== null) {
        processChunk(chunk);
        return false;
      }

      if (!process.stdin.readable) {
        cleanup();
        resolve('');
        return true;
      }

      return false;
    }

    // timeout allows early-return if stdin has no data (non-piped invocation)
    const timeout = setTimeout(() => {
      if (!hasReceivedData) {
        cleanup();
        resolve('');
      }
    }, 50);

    if (checkInitialState()) {
      return;
    }

    function onReadable() {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        const truncated = processChunk(chunk);
        if (truncated) {
          break;
        }
      }
    }

    function onEnd() {
      cleanup();
      resolve(data);
    }

    function onError(err: Error) {
      cleanup();
      reject(err);
    }

    process.stdin.on('readable', onReadable);
    process.stdin.on('end', onEnd);
    process.stdin.on('error', onError);
  });
}
