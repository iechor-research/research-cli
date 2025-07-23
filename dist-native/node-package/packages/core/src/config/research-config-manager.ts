/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { homedir, platform } from 'os';
import {
  ResearchSettings,
  DEFAULT_RESEARCH_CONFIG,
  ConfigValidationError,
  ConfigValidationResult,
  AuthorInfo
} from './research-config.js';
import {
  CitationStyle,
  PaperType,
  ResearchField,
  LaTeXEngine,
  WritingStyle,
  TargetAudience,
  ProjectMember
} from '../tools/research/types.js';

/**
 * 配置文件作用域
 */
export enum ResearchConfigScope {
  SYSTEM = 'system',
  USER = 'user',
  WORKSPACE = 'workspace'
}

/**
 * 配置文件路径管理
 */
export class ResearchConfigPaths {
  private static getSystemConfigPath(): string {
    if (platform() === 'darwin') {
      return '/Library/Application Support/ResearchCli/research-config.json';
    } else if (platform() === 'win32') {
      return 'C:\\ProgramData\\research-cli\\research-config.json';
    } else {
      return '/etc/research-cli/research-config.json';
    }
  }

  private static getUserConfigPath(): string {
    return path.join(homedir(), '.research', 'research-config.json');
  }

  private static getWorkspaceConfigPath(workspaceRoot: string): string {
    return path.join(workspaceRoot, '.research', 'research-config.json');
  }

  public static getConfigPath(scope: ResearchConfigScope, workspaceRoot?: string): string {
    switch (scope) {
      case ResearchConfigScope.SYSTEM:
        return this.getSystemConfigPath();
      case ResearchConfigScope.USER:
        return this.getUserConfigPath();
      case ResearchConfigScope.WORKSPACE:
        if (!workspaceRoot) {
          throw new Error('Workspace root required for workspace config');
        }
        return this.getWorkspaceConfigPath(workspaceRoot);
      default:
        throw new Error(`Unknown config scope: ${scope}`);
    }
  }
}

/**
 * 研究配置管理器
 * 负责读取、写入、验证和合并研究配置
 */
export class ResearchConfigManager {
  private workspaceRoot: string;
  private cachedConfig: ResearchSettings | null = null;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * 获取合并后的研究配置
   */
  public async getResearchConfig(): Promise<ResearchSettings> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    // 加载并合并配置：系统 < 用户 < 工作空间
    const systemConfig = await this.loadConfig(ResearchConfigScope.SYSTEM);
    const userConfig = await this.loadConfig(ResearchConfigScope.USER);
    const workspaceConfig = await this.loadConfig(ResearchConfigScope.WORKSPACE);

    this.cachedConfig = this.mergeConfigs([
      DEFAULT_RESEARCH_CONFIG,
      systemConfig,
      userConfig,
      workspaceConfig
    ]);

    return this.cachedConfig;
  }

  /**
   * 设置配置项
   */
  public async setResearchConfig(
    scope: ResearchConfigScope,
    keyPath: string,
    value: unknown
  ): Promise<void> {
    const config = await this.loadConfig(scope);
    this.setNestedValue(config, keyPath, value);
    await this.saveConfig(scope, config);
    this.cachedConfig = null; // 清除缓存
  }

  /**
   * 获取配置项
   */
  public async getConfigValue(keyPath: string): Promise<unknown> {
    const config = await this.getResearchConfig();
    return this.getNestedValue(config, keyPath);
  }

  /**
   * 验证配置
   */
  public validateConfig(config: ResearchSettings): ConfigValidationResult {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationError[] = [];

    // 验证版本
    if (config.version && !this.isValidVersion(config.version)) {
      errors.push({
        path: 'version',
        message: 'Invalid configuration version format',
        severity: 'error'
      });
    }

    // 验证API配置
    if (config.apis) {
      this.validateAPIs(config.apis, errors, warnings);
    }

    // 验证LaTeX配置
    if (config.latex) {
      this.validateLaTeX(config.latex, errors, warnings);
    }

    // 验证项目配置
    if (config.projects) {
      this.validateProjects(config.projects, errors, warnings);
    }

    // 验证分析配置
    if (config.analysis) {
      this.validateAnalysis(config.analysis, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 导出配置
   */
  public async exportConfig(includeDefaults: boolean = false): Promise<string> {
    let config: ResearchSettings;
    
    if (includeDefaults) {
      config = await this.getResearchConfig();
    } else {
      // 只导出用户自定义配置
      const userConfig = await this.loadConfig(ResearchConfigScope.USER);
      const workspaceConfig = await this.loadConfig(ResearchConfigScope.WORKSPACE);
      config = this.mergeConfigs([userConfig, workspaceConfig]);
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * 导入配置
   */
  public async importConfig(
    configJson: string,
    scope: ResearchConfigScope = ResearchConfigScope.USER
  ): Promise<void> {
    let config: ResearchSettings;
    
    try {
      config = JSON.parse(configJson);
    } catch (error) {
      throw new Error(`Invalid JSON configuration: ${error}`);
    }

    // 验证配置
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `${e.path}: ${e.message}`);
      throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
    }

    await this.saveConfig(scope, config);
    this.cachedConfig = null; // 清除缓存
  }

  /**
   * 重置配置为默认值
   */
  public async resetConfig(scope: ResearchConfigScope): Promise<void> {
    await this.saveConfig(scope, {});
    this.cachedConfig = null; // 清除缓存
  }

  /**
   * 获取默认配置
   */
  public getDefaults(): ResearchSettings {
    return { ...DEFAULT_RESEARCH_CONFIG };
  }

  /**
   * 加载指定作用域的配置
   */
  private async loadConfig(scope: ResearchConfigScope): Promise<ResearchSettings> {
    try {
      const configPath = ResearchConfigPaths.getConfigPath(scope, this.workspaceRoot);
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // 配置文件不存在或读取失败，返回空配置
      return {};
    }
  }

  /**
   * 保存配置
   */
  private async saveConfig(scope: ResearchConfigScope, config: ResearchSettings): Promise<void> {
    const configPath = ResearchConfigPaths.getConfigPath(scope, this.workspaceRoot);
    const configDir = path.dirname(configPath);

    // 确保目录存在
    await fs.mkdir(configDir, { recursive: true });

    // 写入配置文件
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * 合并多个配置对象
   */
  private mergeConfigs(configs: ResearchSettings[]): ResearchSettings {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {});
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * 设置嵌套属性值
   */
  private setNestedValue(obj: any, keyPath: string, value: unknown): void {
    const keys = keyPath.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * 获取嵌套属性值
   */
  private getNestedValue(obj: any, keyPath: string): unknown {
    const keys = keyPath.split('.');
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * 验证版本格式
   */
  private isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  }

  /**
   * 验证API配置
   */
  private validateAPIs(
    apis: any,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[]
  ): void {
    if (apis.arxiv && apis.arxiv.maxResults && apis.arxiv.maxResults > 100) {
      warnings.push({
        path: 'apis.arxiv.maxResults',
        message: 'ArXiv max results should not exceed 100 for optimal performance',
        severity: 'warning'
      });
    }

    if (apis.pubmed && apis.pubmed.enabled && !apis.pubmed.email) {
      errors.push({
        path: 'apis.pubmed.email',
        message: 'Email is required for PubMed API',
        severity: 'error'
      });
    }

    if (apis.ieee && apis.ieee.enabled && !apis.ieee.apiKey) {
      warnings.push({
        path: 'apis.ieee.apiKey',
        message: 'IEEE API key is recommended for extended access',
        severity: 'warning'
      });
    }
  }

  /**
   * 验证LaTeX配置
   */
  private validateLaTeX(
    latex: any,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[]
  ): void {
    if (latex.authorInfo && !latex.authorInfo.name) {
      errors.push({
        path: 'latex.authorInfo.name',
        message: 'Author name is required',
        severity: 'error'
      });
    }

    if (latex.authorInfo && latex.authorInfo.email && !this.isValidEmail(latex.authorInfo.email)) {
      errors.push({
        path: 'latex.authorInfo.email',
        message: 'Invalid email format',
        severity: 'error'
      });
    }

    if (latex.templateDirectory && !path.isAbsolute(latex.templateDirectory) && !latex.templateDirectory.startsWith('./')) {
      warnings.push({
        path: 'latex.templateDirectory',
        message: 'Template directory path should be absolute or relative to workspace',
        severity: 'warning'
      });
    }
  }

  /**
   * 验证项目配置
   */
  private validateProjects(
    projects: any,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[]
  ): void {
    if (projects.collaborators && Array.isArray(projects.collaborators)) {
      projects.collaborators.forEach((collaborator: any, index: number) => {
        if (!collaborator.name) {
          errors.push({
            path: `projects.collaborators[${index}].name`,
            message: 'Collaborator name is required',
            severity: 'error'
          });
        }

        if (!collaborator.email || !this.isValidEmail(collaborator.email)) {
          errors.push({
            path: `projects.collaborators[${index}].email`,
            message: 'Valid collaborator email is required',
            severity: 'error'
          });
        }
      });
    }

    if (projects.backupInterval && projects.backupInterval < 1) {
      errors.push({
        path: 'projects.backupInterval',
        message: 'Backup interval must be at least 1 hour',
        severity: 'error'
      });
    }
  }

  /**
   * 验证分析配置
   */
  private validateAnalysis(
    analysis: any,
    errors: ConfigValidationError[],
    warnings: ConfigValidationError[]
  ): void {
    if (analysis.significanceLevel && (analysis.significanceLevel <= 0 || analysis.significanceLevel >= 1)) {
      errors.push({
        path: 'analysis.significanceLevel',
        message: 'Significance level must be between 0 and 1',
        severity: 'error'
      });
    }

    if (analysis.maxDataSize && analysis.maxDataSize < 1) {
      errors.push({
        path: 'analysis.maxDataSize',
        message: 'Max data size must be at least 1 MB',
        severity: 'error'
      });
    }
  }

  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 