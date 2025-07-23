/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import {
  cacheiEchorAccount,
  getCachediEchorAccount,
  clearCachediEchorAccount,
  getLifetimeiEchorAccounts,
} from './user_account.js';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

vi.mock('os', async (importOriginal) => {
  const os = await importOriginal<typeof import('os')>();
  return {
    ...os,
    homedir: vi.fn(),
  };
});

describe('user_account', () => {
  let tempHomeDir: string;
  const accountsFile = () =>
    path.join(tempHomeDir, '.research', 'iechor_accounts.json');
  beforeEach(() => {
    tempHomeDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'research-cli-test-home-'),
    );
    (os.homedir as Mock).mockReturnValue(tempHomeDir);
  });
  afterEach(() => {
    fs.rmSync(tempHomeDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  describe('cacheiEchorAccount', () => {
    it('should create directory and write initial account file', async () => {
      await cacheiEchorAccount('test1@iechor.com');

      // Verify iEchor Account ID was cached
      expect(fs.existsSync(accountsFile())).toBe(true);
      expect(fs.readFileSync(accountsFile(), 'utf-8')).toBe(
        JSON.stringify({ active: 'test1@iechor.com', old: [] }, null, 2),
      );
    });

    it('should update active account and move previous to old', async () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(
        accountsFile(),
        JSON.stringify(
          { active: 'test2@iechor.com', old: ['test1@iechor.com'] },
          null,
          2,
        ),
      );

      await cacheiEchorAccount('test3@iechor.com');

      expect(fs.readFileSync(accountsFile(), 'utf-8')).toBe(
        JSON.stringify(
          {
            active: 'test3@iechor.com',
            old: ['test1@iechor.com', 'test2@iechor.com'],
          },
          null,
          2,
        ),
      );
    });

    it('should not add a duplicate to the old list', async () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(
        accountsFile(),
        JSON.stringify(
          { active: 'test1@iechor.com', old: ['test2@iechor.com'] },
          null,
          2,
        ),
      );
      await cacheiEchorAccount('test2@iechor.com');
      await cacheiEchorAccount('test1@iechor.com');

      expect(fs.readFileSync(accountsFile(), 'utf-8')).toBe(
        JSON.stringify(
          { active: 'test1@iechor.com', old: ['test2@iechor.com'] },
          null,
          2,
        ),
      );
    });

    it('should handle corrupted JSON by starting fresh', async () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(accountsFile(), 'not valid json');
      const consoleDebugSpy = vi
        .spyOn(console, 'debug')
        .mockImplementation(() => {});

      await cacheiEchorAccount('test1@iechor.com');

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(JSON.parse(fs.readFileSync(accountsFile(), 'utf-8'))).toEqual({
        active: 'test1@iechor.com',
        old: [],
      });
    });
  });

  describe('getCachediEchorAccount', () => {
    it('should return the active account if file exists and is valid', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(
        accountsFile(),
        JSON.stringify({ active: 'active@iechor.com', old: [] }, null, 2),
      );
      const account = getCachediEchorAccount();
      expect(account).toBe('active@iechor.com');
    });

    it('should return null if file does not exist', () => {
      const account = getCachediEchorAccount();
      expect(account).toBeNull();
    });

    it('should return null if file is empty', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(accountsFile(), '');
      const account = getCachediEchorAccount();
      expect(account).toBeNull();
    });

    it('should return null and log if file is corrupted', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(accountsFile(), '{ "active": "test@iechor.com"'); // Invalid JSON
      const consoleDebugSpy = vi
        .spyOn(console, 'debug')
        .mockImplementation(() => {});

      const account = getCachediEchorAccount();

      expect(account).toBeNull();
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('clearCachediEchorAccount', () => {
    it('should set active to null and move it to old', async () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(
        accountsFile(),
        JSON.stringify(
          { active: 'active@iechor.com', old: ['old1@iechor.com'] },
          null,
          2,
        ),
      );

      await clearCachediEchorAccount();

      const stored = JSON.parse(fs.readFileSync(accountsFile(), 'utf-8'));
      expect(stored.active).toBeNull();
      expect(stored.old).toEqual(['old1@iechor.com', 'active@iechor.com']);
    });

    it('should handle empty file gracefully', async () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(accountsFile(), '');
      await clearCachediEchorAccount();
      const stored = JSON.parse(fs.readFileSync(accountsFile(), 'utf-8'));
      expect(stored.active).toBeNull();
      expect(stored.old).toEqual([]);
    });
  });

  describe('getLifetimeiEchorAccounts', () => {
    it('should return 0 if the file does not exist', () => {
      expect(getLifetimeiEchorAccounts()).toBe(0);
    });

    it('should return 0 if the file is empty', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(accountsFile(), '');
      expect(getLifetimeiEchorAccounts()).toBe(0);
    });

    it('should return 0 if the file is corrupted', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(accountsFile(), 'invalid json');
      const consoleDebugSpy = vi
        .spyOn(console, 'debug')
        .mockImplementation(() => {});

      expect(getLifetimeiEchorAccounts()).toBe(0);
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should return 1 if there is only an active account', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(
        accountsFile(),
        JSON.stringify({ active: 'test1@iechor.com', old: [] }),
      );
      expect(getLifetimeiEchorAccounts()).toBe(1);
    });

    it('should correctly count old accounts when active is null', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(
        accountsFile(),
        JSON.stringify({
          active: null,
          old: ['test1@iechor.com', 'test2@iechor.com'],
        }),
      );
      expect(getLifetimeiEchorAccounts()).toBe(2);
    });

    it('should correctly count both active and old accounts', () => {
      fs.mkdirSync(path.dirname(accountsFile()), { recursive: true });
      fs.writeFileSync(
        accountsFile(),
        JSON.stringify({
          active: 'test3@iechor.com',
          old: ['test1@iechor.com', 'test2@iechor.com'],
        }),
      );
      expect(getLifetimeiEchorAccounts()).toBe(3);
    });
  });
});
