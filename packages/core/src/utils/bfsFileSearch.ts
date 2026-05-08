/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Dirent } from 'fs';
import { FileDiscoveryService } from '../services/fileDiscoveryService.js';

// Simple console logger for now.
// TODO: Integrate with a more robust server-side logger.
const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...args: any[]) => console.debug('[DEBUG] [BfsFileSearch]', ...args),
};

interface BfsFileSearchOptions {
  fileName: string;
  ignoreDirs?: string[];
  maxDirs?: number;
  debug?: boolean;
  fileService?: FileDiscoveryService;
}

/**
 * Performs a breadth-first search for a specific file within a directory structure.
 *
 * @param rootDir The directory to start the search from.
 * @param options Configuration for the search.
 * @returns A promise that resolves to an array of paths where the file was found.
 */
export async function bfsFileSearch(
  rootDir: string,
  options: BfsFileSearchOptions,
): Promise<string[]> {
  const {
    fileName,
    ignoreDirs = [],
    maxDirs = Infinity,
    debug = false,
    fileService,
  } = options;
  const foundFiles: string[] = [];
  const queue: string[] = [rootDir];
  const visited = new Set<string>();
  let scannedDirCount = 0;

  while (queue.length > 0 && scannedDirCount < maxDirs) {
    const currentDir = queue.shift()!;
    if (visited.has(currentDir)) {
      continue;
    }
    visited.add(currentDir);
    scannedDirCount++;

    if (debug) {
      logger.debug(`Scanning [${scannedDirCount}/${maxDirs}]: ${currentDir}`);
    }

    let entries: Dirent[];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      // Ignore errors for directories we can't read (e.g., permissions)
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const isDirectory = entry.isDirectory();
      const isMatchingFile = entry.isFile() && entry.name === fileName;

      // Skip entries that are neither traversable directories nor the file
      // we are looking for, before performing the (relatively expensive)
      // gitignore lookup. See upstream gemini-cli commit de2903b10 (#8173).
      if (!isDirectory && !isMatchingFile) {
        continue;
      }
      if (isDirectory && ignoreDirs.includes(entry.name)) {
        continue;
      }

      if (fileService?.shouldGitIgnoreFile(fullPath)) {
        continue;
      }

      if (isDirectory) {
        queue.push(fullPath);
      } else {
        foundFiles.push(fullPath);
      }
    }
  }

  return foundFiles;
}
