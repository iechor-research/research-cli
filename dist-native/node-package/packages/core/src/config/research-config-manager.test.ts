/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ResearchConfigManager,
  ResearchConfigScope,
} from './research-config-manager.js';
import {
  DEFAULT_RESEARCH_CONFIG,
  ResearchSettings,
} from './research-config.js';
import {
  CitationStyle,
  PaperType,
  ResearchField,
} from '../tools/research/types.js';

// Mock fs module
vi.mock('fs/promises');

describe('ResearchConfigManager', () => {
  let configManager: ResearchConfigManager;
  const mockWorkspaceRoot = '/test/workspace';

  beforeEach(() => {
    configManager = new ResearchConfigManager(mockWorkspaceRoot);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with workspace root', () => {
      expect(configManager).toBeDefined();
    });

    it('should use current directory as default workspace root', () => {
      const manager = new ResearchConfigManager();
      expect(manager).toBeDefined();
    });
  });

  describe('getResearchConfig', () => {
    it('should return default config when no files exist', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const config = await configManager.getResearchConfig();

      expect(config).toEqual(DEFAULT_RESEARCH_CONFIG);
    });

    it('should merge configs from system, user, and workspace', async () => {
      const systemConfig = {
        defaults: { citationStyle: CitationStyle.IEEE },
      };
      const userConfig = {
        defaults: { paperType: PaperType.REVIEW },
      };
      const workspaceConfig = {
        defaults: { researchField: ResearchField.ENGINEERING },
      };

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(systemConfig))
        .mockResolvedValueOnce(JSON.stringify(userConfig))
        .mockResolvedValueOnce(JSON.stringify(workspaceConfig));

      const config = await configManager.getResearchConfig();

      expect(config.defaults?.citationStyle).toBe(CitationStyle.IEEE);
      expect(config.defaults?.paperType).toBe(PaperType.REVIEW);
      expect(config.defaults?.researchField).toBe(ResearchField.ENGINEERING);
    });

    it('should cache config after first load', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      await configManager.getResearchConfig();
      await configManager.getResearchConfig();

      // Should only read files once due to caching
      expect(fs.readFile).toHaveBeenCalledTimes(3); // system, user, workspace
    });
  });

  describe('setResearchConfig', () => {
    it('should set nested configuration value', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{}');
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await configManager.setResearchConfig(
        ResearchConfigScope.USER,
        'defaults.citationStyle',
        CitationStyle.APA,
      );

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('research-config.json'),
        expect.stringContaining('citationStyle'),
        'utf-8',
      );
    });

    it('should clear cache after setting config', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{}');
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      // Load config to cache it
      await configManager.getResearchConfig();
      vi.clearAllMocks();

      // Set config (should clear cache)
      await configManager.setResearchConfig(
        ResearchConfigScope.USER,
        'defaults.citationStyle',
        CitationStyle.APA,
      );

      // Next access should reload from files
      await configManager.getResearchConfig();
      expect(fs.readFile).toHaveBeenCalled();
    });
  });

  describe('getConfigValue', () => {
    it('should retrieve nested configuration value', async () => {
      const config = {
        defaults: {
          citationStyle: CitationStyle.IEEE,
          paperType: PaperType.RESEARCH_PAPER,
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(config));

      const value = await configManager.getConfigValue(
        'defaults.citationStyle',
      );
      expect(value).toBe(CitationStyle.IEEE);
    });

    it('should return undefined for non-existent paths', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const value = await configManager.getConfigValue('nonexistent.path');
      expect(value).toBeUndefined();
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const validConfig: ResearchSettings = {
        version: '1.0.0',
        defaults: {
          citationStyle: CitationStyle.APA,
        },
        apis: {
          arxiv: {
            enabled: true,
            maxResults: 20,
          },
        },
      };

      const result = configManager.validateConfig(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid version format', () => {
      const invalidConfig: ResearchSettings = {
        version: 'invalid-version',
      };

      const result = configManager.validateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('version');
    });

    it('should detect missing required PubMed email', () => {
      const invalidConfig: ResearchSettings = {
        apis: {
          pubmed: {
            enabled: true,
            // missing email
          },
        },
      };

      const result = configManager.validateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.path === 'apis.pubmed.email')).toBe(
        true,
      );
    });

    it('should detect invalid email format', () => {
      const invalidConfig: ResearchSettings = {
        latex: {
          authorInfo: {
            name: 'Test User',
            email: 'invalid-email',
            affiliation: 'Test University',
          },
        },
      };

      const result = configManager.validateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.path === 'latex.authorInfo.email'),
      ).toBe(true);
    });

    it('should generate warnings for performance issues', () => {
      const configWithWarnings: ResearchSettings = {
        apis: {
          arxiv: {
            enabled: true,
            maxResults: 150, // Too high
          },
        },
      };

      const result = configManager.validateConfig(configWithWarnings);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].path).toBe('apis.arxiv.maxResults');
    });
  });

  describe('exportConfig', () => {
    it('should export config as JSON string', async () => {
      const config = {
        defaults: { citationStyle: CitationStyle.APA },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(config));

      const exported = await configManager.exportConfig();
      expect(exported).toContain('citationStyle');
      expect(JSON.parse(exported)).toEqual(config);
    });

    it('should include defaults when requested', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const exported = await configManager.exportConfig(true);
      const parsed = JSON.parse(exported);

      expect(parsed.version).toBe(DEFAULT_RESEARCH_CONFIG.version);
      expect(parsed.defaults).toBeDefined();
    });
  });

  describe('importConfig', () => {
    it('should import valid configuration', async () => {
      const validConfig = {
        version: '1.0.0',
        defaults: { citationStyle: CitationStyle.APA },
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await configManager.importConfig(
        JSON.stringify(validConfig),
        ResearchConfigScope.USER,
      );

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('research-config.json'),
        expect.stringContaining('citationStyle'),
        'utf-8',
      );
    });

    it('should reject invalid JSON', async () => {
      await expect(
        configManager.importConfig('invalid json', ResearchConfigScope.USER),
      ).rejects.toThrow('Invalid JSON configuration');
    });

    it('should reject invalid configuration', async () => {
      const invalidConfig = {
        version: 'invalid-version',
      };

      await expect(
        configManager.importConfig(
          JSON.stringify(invalidConfig),
          ResearchConfigScope.USER,
        ),
      ).rejects.toThrow('Configuration validation failed');
    });
  });

  describe('resetConfig', () => {
    it('should reset configuration to empty', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await configManager.resetConfig(ResearchConfigScope.USER);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('research-config.json'),
        '{}',
        'utf-8',
      );
    });
  });

  describe('getDefaults', () => {
    it('should return copy of default configuration', () => {
      const defaults = configManager.getDefaults();

      expect(defaults).toEqual(DEFAULT_RESEARCH_CONFIG);
      expect(defaults).not.toBe(DEFAULT_RESEARCH_CONFIG); // Should be a copy
    });
  });

  describe('deep merge functionality', () => {
    it('should deep merge nested objects', async () => {
      const userConfig = {
        apis: {
          arxiv: { enabled: true, maxResults: 30 },
          pubmed: { enabled: false },
        },
      };
      const workspaceConfig = {
        apis: {
          arxiv: { maxResults: 50 }, // Should override user config
          ieee: { enabled: true }, // Should be added
        },
      };

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('{}') // system
        .mockResolvedValueOnce(JSON.stringify(userConfig)) // user
        .mockResolvedValueOnce(JSON.stringify(workspaceConfig)); // workspace

      const config = await configManager.getResearchConfig();

      expect(config.apis?.arxiv?.enabled).toBe(true); // from user
      expect(config.apis?.arxiv?.maxResults).toBe(50); // from workspace (override)
      expect(config.apis?.pubmed?.enabled).toBe(false); // from user
      expect(config.apis?.ieee?.enabled).toBe(true); // from workspace (new)
    });
  });
});
