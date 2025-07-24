/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ExperimentCodeGenerator,
  ExperimentCodeParams,
} from './experiment-code-generator.js';
import {
  ProgrammingLanguage,
  ResearchMethod,
  DataFormat,
  AnalysisType,
  ResearchToolCategory,
} from '../types.js';

describe('ExperimentCodeGenerator', () => {
  let generator: ExperimentCodeGenerator;

  beforeEach(() => {
    generator = new ExperimentCodeGenerator();
  });

  describe('基本属性', () => {
    it('应该有正确的工具属性', () => {
      expect(generator.name).toBe('generate_experiment_code');
      expect(generator.description).toBe('Generate experiment code frameworks');
      expect(generator.category).toBe(ResearchToolCategory.ANALYSIS);
      expect(generator.version).toBe('1.0.0');
    });
  });

  describe('参数验证', () => {
    it('应该验证有效的参数', () => {
      const validParams: ExperimentCodeParams = {
        experimentName: 'ML Classification Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
      };

      expect(generator.validate(validParams)).toBe(true);
    });

    it('应该拒绝空实验名称', () => {
      const invalidParams = {
        experimentName: '',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
      };

      expect(generator.validate(invalidParams)).toBe(false);
    });

    it('应该拒绝空数据类型数组', () => {
      const invalidParams = {
        experimentName: 'Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
      };

      expect(generator.validate(invalidParams)).toBe(false);
    });

    it('应该拒绝空分析类型数组', () => {
      const invalidParams = {
        experimentName: 'Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [],
        outputFormats: ['html'],
      };

      expect(generator.validate(invalidParams)).toBe(false);
    });

    it('应该拒绝空输出格式数组', () => {
      const invalidParams = {
        experimentName: 'Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: [],
      };

      expect(generator.validate(invalidParams)).toBe(false);
    });
  });

  describe('Python 代码生成', () => {
    it('应该生成 Python 机器学习实验代码', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'ML Classification Analysis',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV, DataFormat.JSON],
        analysisTypes: [
          AnalysisType.MACHINE_LEARNING,
          AnalysisType.DESCRIPTIVE,
        ],
        outputFormats: ['html', 'jupyter'],
        includeVisualization: true,
        includeTesting: true,
        dataPath: './data/',
        description: 'Test ML experiment',
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const codeResult = result.data as any;

      expect(codeResult.experimentName).toBe(params.experimentName);
      expect(codeResult.language).toBe(ProgrammingLanguage.PYTHON);
      expect(codeResult.files).toBeInstanceOf(Array);
      expect(codeResult.files.length).toBeGreaterThan(0);

      // 检查主文件
      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile).toBeDefined();
      expect(mainFile.filename).toContain('.py');
      expect(mainFile.content).toContain('import pandas as pd');
      expect(mainFile.content).toContain('from sklearn');
      expect(mainFile.content).toContain('def load_data');
      expect(mainFile.content).toContain('def main');

      // 检查配置文件
      const configFile = codeResult.files.find((f: any) => f.type === 'config');
      expect(configFile).toBeDefined();
      expect(configFile.filename).toBe('config.json');

      // 检查依赖文件
      const requirementsFile = codeResult.files.find(
        (f: any) => f.type === 'requirements',
      );
      expect(requirementsFile).toBeDefined();
      expect(requirementsFile.content).toContain('pandas');
      expect(requirementsFile.content).toContain('scikit-learn');

      // 检查 README
      const readmeFile = codeResult.files.find(
        (f: any) => f.type === 'documentation',
      );
      expect(readmeFile).toBeDefined();
      expect(readmeFile.content).toContain(params.experimentName);
    });

    it('应该生成 Python 统计分析实验代码', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Statistical Analysis',
        researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.DESCRIPTIVE, AnalysisType.INFERENTIAL],
        outputFormats: ['pdf'],
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const codeResult = result.data as any;

      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.content).toContain('import scipy.stats');
      expect(mainFile.content).toContain('from scipy.stats import');
      expect(mainFile.content).toContain('correlation_matrix');
    });

    it('应该处理可视化选项', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Visualization Test',
        researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.VISUALIZATION],
        outputFormats: ['html'],
        includeVisualization: true,
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.content).toContain('import plotly');
      expect(mainFile.content).toContain('create_visualizations');
      expect(mainFile.content).toContain('plt.savefig');
    });

    it('应该处理测试选项', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Testing Example',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
        includeTesting: true,
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.content).toContain('def test_');
      expect(mainFile.content).toContain('run_tests');
    });
  });

  describe('R 代码生成', () => {
    it('应该生成 R 统计分析代码', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'R Statistical Analysis',
        researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
        language: ProgrammingLanguage.R,
        dataTypes: [DataFormat.CSV, DataFormat.EXCEL],
        analysisTypes: [AnalysisType.DESCRIPTIVE, AnalysisType.INFERENTIAL],
        outputFormats: ['html', 'pdf'],
        includeVisualization: true,
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const codeResult = result.data as any;

      expect(codeResult.language).toBe(ProgrammingLanguage.R);

      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile).toBeDefined();
      expect(mainFile.filename).toContain('.R');
      expect(mainFile.content).toContain('library(tidyverse)');
      expect(mainFile.content).toContain('library(ggplot2)');
      expect(mainFile.content).toContain('load_data <- function');
      expect(mainFile.content).toContain('main <- function');
    });

    it('应该为 R 生成正确的数据加载代码', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'R Data Loading Test',
        researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
        language: ProgrammingLanguage.R,
        dataTypes: [DataFormat.CSV, DataFormat.EXCEL],
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.content).toContain('read_csv');
      expect(mainFile.content).toContain('read_excel');
      expect(mainFile.content).toContain('bind_rows');
    });
  });

  describe('多语言支持', () => {
    it('应该支持 MATLAB 代码生成', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'MATLAB Experiment',
        researchMethod: ResearchMethod.NUMERICAL_COMPUTATION,
        language: ProgrammingLanguage.MATLAB,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        outputFormats: ['pdf'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.language).toBe(ProgrammingLanguage.MATLAB);
      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.filename).toContain('.m');
      expect(mainFile.content).toContain('MATLAB Experiment Framework');
    });

    it('应该支持 Julia 代码生成', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Julia Experiment',
        researchMethod: ResearchMethod.NUMERICAL_COMPUTATION,
        language: ProgrammingLanguage.JULIA,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.language).toBe(ProgrammingLanguage.JULIA);
      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.filename).toContain('.jl');
      expect(mainFile.content).toContain('using DataFrames');
    });

    it('应该支持 JavaScript 代码生成', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'JS Experiment',
        researchMethod: ResearchMethod.DATA_MINING,
        language: ProgrammingLanguage.JAVASCRIPT,
        dataTypes: [DataFormat.JSON],
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.language).toBe(ProgrammingLanguage.JAVASCRIPT);
      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.filename).toContain('.js');
      expect(mainFile.content).toContain('const fs = require');
    });

    it('应该拒绝不支持的语言', async () => {
      const params = {
        experimentName: 'Invalid Language Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: 'unsupported_language',
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported language');
    });
  });

  describe('依赖管理', () => {
    it('应该根据研究方法生成正确的 Python 依赖', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Dependencies Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV, DataFormat.EXCEL],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
        includeVisualization: true,
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.dependencies).toContain('pandas>=2.0.0');
      expect(codeResult.dependencies).toContain('scikit-learn>=1.3.0');
      expect(codeResult.dependencies).toContain('plotly>=5.15.0');
      expect(codeResult.dependencies).toContain('openpyxl>=3.1.0');
    });

    it('应该为统计分析生成正确的依赖', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Stats Dependencies Test',
        researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.INFERENTIAL],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.dependencies).toContain('scipy>=1.10.0');
      expect(codeResult.dependencies).toContain('statsmodels>=0.14.0');
    });
  });

  describe('输出格式', () => {
    it('应该处理多种输出格式', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Multi Output Test',
        researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        outputFormats: ['html', 'markdown', 'pdf'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      const mainFile = codeResult.files.find((f: any) => f.type === 'main');
      expect(mainFile.content).toContain('Generate HTML Report');
      expect(mainFile.content).toContain('Generate Markdown Report');
    });
  });

  describe('估算和资源', () => {
    it('应该估算运行时间', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Runtime Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV, DataFormat.JSON],
        analysisTypes: [
          AnalysisType.MACHINE_LEARNING,
          AnalysisType.INFERENTIAL,
        ],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.estimatedRuntime).toBeDefined();
      expect(codeResult.estimatedRuntime).toContain('minutes');
    });

    it('应该提供学习资源', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Resources Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.resources).toBeInstanceOf(Array);
      expect(codeResult.resources.length).toBeGreaterThan(0);

      const pythonResource = codeResult.resources.find((r: any) =>
        r.name.includes('Pandas'),
      );
      expect(pythonResource).toBeDefined();

      const mlResource = codeResult.resources.find((r: any) =>
        r.name.includes('Statistical Learning'),
      );
      expect(mlResource).toBeDefined();
    });

    it('应该为 R 提供特定资源', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'R Resources Test',
        researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
        language: ProgrammingLanguage.R,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      const rResource = codeResult.resources.find((r: any) =>
        r.name.includes('R for Data Science'),
      );
      expect(rResource).toBeDefined();
    });
  });

  describe('使用说明', () => {
    it('应该生成详细的使用说明', async () => {
      const params: ExperimentCodeParams = {
        experimentName: 'Instructions Test',
        researchMethod: ResearchMethod.MACHINE_LEARNING,
        language: ProgrammingLanguage.PYTHON,
        dataTypes: [DataFormat.CSV],
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        outputFormats: ['html'],
      };

      const result = await generator.execute(params);
      const codeResult = result.data as any;

      expect(codeResult.instructions).toBeInstanceOf(Array);
      expect(codeResult.instructions.join(' ')).toContain('Setup Instructions');
      expect(codeResult.instructions.join(' ')).toContain('File Structure');
      expect(codeResult.instructions.join(' ')).toContain('pip install');
    });
  });

  describe('帮助信息', () => {
    it('应该提供详细的帮助信息', () => {
      const help = generator.getHelp();

      expect(help).toContain('Generate complete experiment code frameworks');
      expect(help).toContain('experimentName');
      expect(help).toContain('researchMethod');
      expect(help).toContain('language');
      expect(help).toContain('dataTypes');
      expect(help).toContain('analysisTypes');
    });
  });

  describe('错误处理', () => {
    it('应该处理无效参数', async () => {
      const invalidParams = {
        experimentName: '',
        researchMethod: undefined,
        language: undefined,
        dataTypes: [],
        analysisTypes: [],
        outputFormats: [],
      };

      const result = await generator.execute(invalidParams as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
