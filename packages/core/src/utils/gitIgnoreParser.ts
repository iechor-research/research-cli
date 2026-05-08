/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import ignore, { type Ignore } from 'ignore';
import { isGitRepository } from './gitUtils.js';

export interface GitIgnoreFilter {
  isIgnored(filePath: string): boolean;
  getPatterns(): string[];
}

export class GitIgnoreParser implements GitIgnoreFilter {
  private projectRoot: string;
  private ig: Ignore = ignore();
  private patterns: string[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = path.resolve(projectRoot);
  }

  loadGitRepoPatterns(): void {
    if (!isGitRepository(this.projectRoot)) return;

    // Always ignore .git directory regardless of .gitignore content
    this.addPatterns(['.git']);

    const patternFiles = ['.gitignore', path.join('.git', 'info', 'exclude')];
    for (const pf of patternFiles) {
      this.loadPatterns(pf);
    }
  }

  loadPatterns(patternsFileName: string): void {
    const patternsFilePath = path.join(this.projectRoot, patternsFileName);
    let content: string;
    try {
      content = fs.readFileSync(patternsFilePath, 'utf-8');
    } catch (_error) {
      // ignore file not found
      return;
    }
    const patterns = (content ?? '')
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p !== '' && !p.startsWith('#'));
    this.addPatterns(patterns);
  }

  private addPatterns(patterns: string[]) {
    this.ig.add(patterns);
    this.patterns.push(...patterns);
  }

  isIgnored(filePath: string): boolean {
    // Defensive guards: malformed inputs should never propagate as crashes
    // out of GitIgnoreParser. See upstream gemini-cli commit 5c2bb990d
    // (#7553, "prevent crash/error when processing malformed file paths").
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }
    if (
      filePath.startsWith('\\') ||
      filePath === '/' ||
      filePath.includes('\0')
    ) {
      return false;
    }

    try {
      const relativePath = path.isAbsolute(filePath)
        ? path.relative(this.projectRoot, filePath)
        : filePath;

      if (relativePath === '' || relativePath.startsWith('..')) {
        return false;
      }

      let normalizedPath = relativePath.replace(/\\/g, '/');
      if (normalizedPath.startsWith('./')) {
        normalizedPath = normalizedPath.substring(2);
      }

      // After normalization an absolute-style path means the input was not
      // inside projectRoot — treat as not-ignored rather than feeding it to
      // the underlying ignore engine, which can throw on absolute inputs.
      if (normalizedPath.startsWith('/') || normalizedPath === '') {
        return false;
      }

      return this.ig.ignores(normalizedPath);
    } catch (_error) {
      return false;
    }
  }

  getPatterns(): string[] {
    return this.patterns;
  }
}
