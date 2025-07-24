/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ResearchDataAnalyzer,
  DataAnalyzerParams,
  DataAnalysisResult,
  StatisticalSummary,
  DescriptiveStats,
  CorrelationAnalysis,
  HypothesisTestResult,
  MLAnalysisResult,
  TimeSeriesAnalysis,
} from './research-data-analyzer.js';
import { AnalysisType, DataFormat, ResearchToolCategory } from '../types.js';

describe('ResearchDataAnalyzer', () => {
  let analyzer: ResearchDataAnalyzer;

  beforeEach(() => {
    analyzer = new ResearchDataAnalyzer();
  });

  describe('基本属性', () => {
    it('应该有正确的工具名称', () => {
      expect(analyzer.name).toBe('research_data_analyzer');
    });

    it('应该有正确的描述', () => {
      expect(analyzer.description).toContain('研究数据分析工具');
    });

    it('应该属于分析类别', () => {
      expect(analyzer.category).toBe(ResearchToolCategory.ANALYSIS);
    });

    it('应该有版本号', () => {
      expect(analyzer.version).toBe('1.0.0');
    });
  });

  describe('参数验证', () => {
    it('应该拒绝无效的action', () => {
      const params = {
        action: 'invalid_action',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataPath: './test.csv',
      } as unknown as DataAnalyzerParams;

      expect(analyzer.validate(params)).toBe(false);
    });

    it('应该拒绝空的analysisTypes', () => {
      const params = {
        action: 'analyze',
        analysisTypes: [],
        dataPath: './test.csv',
      } as DataAnalyzerParams;

      expect(analyzer.validate(params)).toBe(false);
    });

    it('应该拒绝缺少数据源', () => {
      const params = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
      } as DataAnalyzerParams;

      expect(analyzer.validate(params)).toBe(false);
    });

    it('应该接受有效参数', () => {
      const params = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataPath: './test.csv',
      } as DataAnalyzerParams;

      expect(analyzer.validate(params)).toBe(true);
    });

    it('应该接受dataContent作为数据源', () => {
      const params = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataContent: '[{"x": 1, "y": 2}]',
      } as DataAnalyzerParams;

      expect(analyzer.validate(params)).toBe(true);
    });
  });

  describe('帮助信息', () => {
    it('应该提供详细的帮助信息', () => {
      const help = analyzer.getHelp();

      expect(help).toContain('研究数据分析工具使用说明');
      expect(help).toContain('action');
      expect(help).toContain('DESCRIPTIVE');
      expect(help).toContain('INFERENTIAL');
      expect(help).toContain('MACHINE_LEARNING');
      expect(help).toContain('示例');
    });
  });

  describe('数据分析功能', () => {
    const mockData = [
      { id: 1, age: 25, score: 85, category: 'A', salary: 50000 },
      { id: 2, age: 30, score: 92, category: 'B', salary: 60000 },
      { id: 3, age: 35, score: 78, category: 'A', salary: 70000 },
      { id: 4, age: 28, score: 88, category: 'C', salary: 55000 },
      { id: 5, age: 32, score: 95, category: 'B', salary: 65000 },
    ];

    describe('描述性统计分析', () => {
      it('应该执行描述性统计分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
          includeVisualization: true,
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.action).toBe('analyze');
        expect(data.results).toHaveLength(1);
        expect(data.results[0].type).toBe(AnalysisType.DESCRIPTIVE);
        expect(data.results[0].descriptiveStats).toBeDefined();
        expect(data.results[0].descriptiveStats!.length).toBeGreaterThan(0);
      });

      it('应该生成正确的数据摘要', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;

        expect(data.summary.totalRows).toBe(5);
        expect(data.summary.totalColumns).toBe(5);
        expect(data.summary.numericColumns).toContain('age');
        expect(data.summary.numericColumns).toContain('score');
        expect(data.summary.categoricalColumns).toContain('category');
      });

      it('应该计算描述性统计指标', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const descriptiveResult = data.results[0];

        expect(descriptiveResult.descriptiveStats).toBeDefined();
        const ageStats = descriptiveResult.descriptiveStats!.find(
          (stat) => stat.column === 'age',
        );

        if (ageStats) {
          expect(ageStats.count).toBe(5);
          expect(ageStats.mean).toBeDefined();
          expect(ageStats.std).toBeDefined();
          expect(ageStats.min).toBeDefined();
          expect(ageStats.max).toBeDefined();
        }
      });

      it('应该生成相关性分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
          correlationMethod: 'pearson',
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const descriptiveResult = data.results[0];

        expect(descriptiveResult.correlationAnalysis).toBeDefined();
        expect(descriptiveResult.correlationAnalysis!.method).toBe('pearson');
        expect(descriptiveResult.correlationAnalysis!.matrix).toBeDefined();
      });

      it('应该生成可视化数据', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
          includeVisualization: true,
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const descriptiveResult = data.results[0];

        expect(descriptiveResult.visualizations).toBeDefined();
        expect(descriptiveResult.visualizations.length).toBeGreaterThan(0);

        const histogram = descriptiveResult.visualizations.find(
          (viz) => viz.type === 'histogram',
        );
        expect(histogram).toBeDefined();
      });
    });

    describe('推断统计分析', () => {
      it('应该执行推断统计分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.INFERENTIAL],
          dataContent: JSON.stringify(mockData),
          targetColumn: 'score',
          significanceLevel: 0.05,
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.results[0].type).toBe(AnalysisType.INFERENTIAL);
        expect(data.results[0].hypothesisTests).toBeDefined();
        expect(data.results[0].hypothesisTests!.length).toBeGreaterThan(0);
      });

      it('应该执行正态性检验', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.INFERENTIAL],
          dataContent: JSON.stringify(mockData),
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const inferentialResult = data.results[0];

        const normalityTest = inferentialResult.hypothesisTests!.find(
          (test) => test.testType === 'normality',
        );
        expect(normalityTest).toBeDefined();
        expect(normalityTest!.testName).toContain('正态性检验');
      });

      it('应该执行相关性显著性检验', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.INFERENTIAL],
          dataContent: JSON.stringify(mockData),
          targetColumn: 'score',
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const inferentialResult = data.results[0];

        const correlationTest = inferentialResult.hypothesisTests!.find(
          (test) => test.testName.includes('相关性检验'),
        );
        expect(correlationTest).toBeDefined();
      });
    });

    describe('机器学习分析', () => {
      it('应该执行机器学习分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.MACHINE_LEARNING],
          dataContent: JSON.stringify(mockData),
          clusteringMethod: 'kmeans',
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.results[0].type).toBe(AnalysisType.MACHINE_LEARNING);
        expect(data.results[0].mlResults).toBeDefined();
        expect(data.results[0].mlResults!.length).toBeGreaterThan(0);
      });

      it('应该执行聚类分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.MACHINE_LEARNING],
          dataContent: JSON.stringify(mockData),
          clusteringMethod: 'kmeans',
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const mlResult = data.results[0];

        const clusteringAnalysis = mlResult.mlResults!.find(
          (ml) => ml.analysisType === 'clustering',
        );
        expect(clusteringAnalysis).toBeDefined();
        expect(clusteringAnalysis!.algorithm).toContain('K-Means');
        expect(clusteringAnalysis!.results.labels).toBeDefined();
        expect(clusteringAnalysis!.results.clusters).toBeDefined();
      });

      it('应该执行主成分分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.MACHINE_LEARNING],
          dataContent: JSON.stringify(mockData),
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const mlResult = data.results[0];

        const pcaAnalysis = mlResult.mlResults!.find(
          (ml) => ml.analysisType === 'dimensionality_reduction',
        );
        expect(pcaAnalysis).toBeDefined();
        expect(pcaAnalysis!.algorithm).toBe('PCA');
        expect(pcaAnalysis!.results.components).toBeDefined();
        expect(pcaAnalysis!.results.varianceExplained).toBeDefined();
      });

      it('应该执行监督学习', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.MACHINE_LEARNING],
          dataContent: JSON.stringify(mockData),
          targetColumn: 'salary',
          regressionMethod: 'linear',
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const mlResult = data.results[0];

        const supervisionAnalysis = mlResult.mlResults!.find(
          (ml) => ml.analysisType === 'regression',
        );
        expect(supervisionAnalysis).toBeDefined();
        expect(supervisionAnalysis!.results.r2Score).toBeDefined();
        expect(supervisionAnalysis!.results.predictions).toBeDefined();
      });
    });

    describe('时间序列分析', () => {
      const timeSeriesData = [
        { date: '2023-01-01', value: 100 },
        { date: '2023-02-01', value: 105 },
        { date: '2023-03-01', value: 110 },
        { date: '2023-04-01', value: 108 },
        { date: '2023-05-01', value: 115 },
      ];

      it('应该执行时间序列分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.TIME_SERIES],
          dataContent: JSON.stringify(timeSeriesData),
          timeColumn: 'date',
          targetColumn: 'value',
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.results[0].type).toBe(AnalysisType.TIME_SERIES);
        expect(data.results[0].timeSeriesAnalysis).toBeDefined();
      });

      it('应该分析趋势和季节性', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.TIME_SERIES],
          dataContent: JSON.stringify(timeSeriesData),
          timeColumn: 'date',
          targetColumn: 'value',
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const tsResult = data.results[0];

        expect(tsResult.timeSeriesAnalysis!.trend).toBeDefined();
        expect(tsResult.timeSeriesAnalysis!.seasonality).toBeDefined();
        expect(tsResult.timeSeriesAnalysis!.stationarity).toBeDefined();
      });

      it('缺少时间列时应该报错', async () => {
        const params: DataAnalyzerParams = {
          action: 'analyze',
          analysisTypes: [AnalysisType.TIME_SERIES],
          dataContent: JSON.stringify(mockData),
          // 缺少 timeColumn
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(false);
        expect(result.error).toContain('timeColumn');
      });
    });

    describe('可视化分析', () => {
      it('应该生成专门的可视化', async () => {
        const params: DataAnalyzerParams = {
          action: 'visualize',
          analysisTypes: [AnalysisType.VISUALIZATION],
          dataContent: JSON.stringify(mockData),
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.results[0].type).toBe(AnalysisType.VISUALIZATION);
        expect(data.results[0].visualizations).toBeDefined();
        expect(data.results[0].visualizations.length).toBeGreaterThan(0);
      });

      it('应该包含多种类型的图表', async () => {
        const params: DataAnalyzerParams = {
          action: 'visualize',
          analysisTypes: [AnalysisType.VISUALIZATION],
          dataContent: JSON.stringify(mockData),
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;
        const vizResult = data.results[0];

        const types = vizResult.visualizations.map((viz) => viz.type);
        expect(types).toContain('histogram');
        expect(types).toContain('bar');
        expect(types).toContain('heatmap');
      });
    });

    describe('探索性数据分析', () => {
      it('应该执行探索性分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'explore',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
          includeVisualization: true,
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.action).toBe('explore');
        expect(data.results[0].recommendations).toBeDefined();
        expect(data.results[0].recommendations.length).toBeGreaterThan(0);
      });

      it('应该检测数据质量问题', async () => {
        const dataWithMissing = [
          { id: 1, age: 25, score: null, category: 'A' },
          { id: 2, age: null, score: 92, category: 'B' },
          { id: 3, age: 35, score: 78, category: null },
        ];

        const params: DataAnalyzerParams = {
          action: 'explore',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(dataWithMissing),
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;

        expect(data.summary.missingValues.score).toBeGreaterThan(0);
        expect(data.summary.missingValues.age).toBeGreaterThan(0);
      });
    });

    describe('数据预处理', () => {
      it('应该执行数据预处理分析', async () => {
        const params: DataAnalyzerParams = {
          action: 'preprocess',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.action).toBe('preprocess');
        expect(data.results[0].recommendations).toBeDefined();
      });

      it('应该提供预处理建议', async () => {
        const dataWithIssues = [
          { id: 1, age: 25, score: 85, outlier: 10000 },
          { id: 2, age: 30, score: null, outlier: 50 },
          { id: 3, age: 200, score: 78, outlier: 60 }, // 异常年龄
        ];

        const params: DataAnalyzerParams = {
          action: 'preprocess',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(dataWithIssues),
        };

        const result = await analyzer.execute(params);
        const data = result.data as DataAnalysisResult;

        const recommendations = data.results[0].recommendations.join(' ');
        expect(recommendations).toContain('缺失值');
        expect(recommendations).toContain('异常值');
      });
    });

    describe('报告生成', () => {
      it('应该生成Markdown格式报告', async () => {
        const params: DataAnalyzerParams = {
          action: 'report',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
          outputFormat: 'markdown',
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.report).toBeDefined();
        expect(data.report!).toContain('# 研究数据分析报告');
        expect(data.report!).toContain('## 数据摘要');
      });

      it('应该生成HTML格式报告', async () => {
        const params: DataAnalyzerParams = {
          action: 'report',
          analysisTypes: [AnalysisType.DESCRIPTIVE],
          dataContent: JSON.stringify(mockData),
          outputFormat: 'html',
        };

        const result = await analyzer.execute(params);
        expect(result.success).toBe(true);

        const data = result.data as DataAnalysisResult;
        expect(data.report).toBeDefined();
        expect(data.report!).toContain('<!DOCTYPE html>');
        expect(data.report!).toContain('<h1>研究数据分析报告</h1>');
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的JSON数据', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataContent: 'invalid json',
      };

      const result = await analyzer.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse data content');
    });

    it('应该处理空数据', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataContent: '[]',
      };

      const result = await analyzer.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('应该处理不支持的分析类型', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: ['UNSUPPORTED_TYPE' as AnalysisType],
        dataContent: JSON.stringify([{ x: 1 }]),
      };

      const result = await analyzer.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported analysis type');
    });
  });

  describe('多重分析', () => {
    it('应该支持多种分析类型', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [
          AnalysisType.DESCRIPTIVE,
          AnalysisType.INFERENTIAL,
          AnalysisType.MACHINE_LEARNING,
        ],
        dataContent: JSON.stringify(mockData),
        includeVisualization: true,
      };

      const result = await analyzer.execute(params);
      expect(result.success).toBe(true);

      const data = result.data as DataAnalysisResult;
      expect(data.results).toHaveLength(3);
      expect(data.results.map((r) => r.type)).toEqual([
        AnalysisType.DESCRIPTIVE,
        AnalysisType.INFERENTIAL,
        AnalysisType.MACHINE_LEARNING,
      ]);
    });

    it('应该收集所有建议', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE, AnalysisType.INFERENTIAL],
        dataContent: JSON.stringify(mockData),
      };

      const result = await analyzer.execute(params);
      const data = result.data as DataAnalysisResult;

      expect(data.recommendations).toBeDefined();
      expect(data.recommendations.length).toBeGreaterThan(0);

      // 验证去重功能
      const uniqueRecommendations = new Set(data.recommendations);
      expect(uniqueRecommendations.size).toBe(data.recommendations.length);
    });
  });

  describe('性能和元数据', () => {
    it('应该记录执行时间', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataContent: JSON.stringify(mockData),
      };

      const result = await analyzer.execute(params);
      const data = result.data as DataAnalysisResult;

      expect(data.executionTime).toBeDefined();
      expect(data.executionTime).toBeGreaterThan(0);
    });

    it('应该包含正确的元数据', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataContent: JSON.stringify(mockData),
      };

      const result = await analyzer.execute(params);

      expect(result.metadata).toBeDefined();
      expect(result.metadata!.toolName).toBe('research_data_analyzer');
      expect(result.metadata!.version).toBe('1.0.0');
      expect(result.metadata!.timestamp).toBeDefined();
    });
  });

  describe('配置选项', () => {
    it('应该支持自定义相关性方法', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.DESCRIPTIVE],
        dataContent: JSON.stringify(mockData),
        correlationMethod: 'spearman',
      };

      const result = await analyzer.execute(params);
      const data = result.data as DataAnalysisResult;
      const correlationAnalysis = data.results[0].correlationAnalysis;

      expect(correlationAnalysis?.method).toBe('spearman');
    });

    it('应该支持自定义聚类方法', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.MACHINE_LEARNING],
        dataContent: JSON.stringify(mockData),
        clusteringMethod: 'hierarchical',
      };

      const result = await analyzer.execute(params);
      const data = result.data as DataAnalysisResult;
      const mlResults = data.results[0].mlResults;

      const clusteringResult = mlResults?.find(
        (ml) => ml.analysisType === 'clustering',
      );
      expect(clusteringResult).toBeDefined();
    });

    it('应该支持自定义显著性水平', async () => {
      const params: DataAnalyzerParams = {
        action: 'analyze',
        analysisTypes: [AnalysisType.INFERENTIAL],
        dataContent: JSON.stringify(mockData),
        significanceLevel: 0.01,
      };

      const result = await analyzer.execute(params);
      expect(result.success).toBe(true);

      // 验证参数被正确传递
      const data = result.data as DataAnalysisResult;
      expect(data.results[0].hypothesisTests).toBeDefined();
    });
  });
});

const mockData = [
  { id: 1, age: 25, score: 85, category: 'A', salary: 50000 },
  { id: 2, age: 30, score: 92, category: 'B', salary: 60000 },
  { id: 3, age: 35, score: 78, category: 'A', salary: 70000 },
  { id: 4, age: 28, score: 88, category: 'C', salary: 55000 },
  { id: 5, age: 32, score: 95, category: 'B', salary: 65000 },
  { id: 6, age: 29, score: 82, category: 'A', salary: 52000 },
  { id: 7, age: 33, score: 90, category: 'C', salary: 68000 },
  { id: 8, age: 27, score: 87, category: 'B', salary: 58000 },
  { id: 9, age: 31, score: 93, category: 'A', salary: 72000 },
  { id: 10, age: 26, score: 80, category: 'C', salary: 48000 },
];
