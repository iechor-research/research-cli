# 研究数据分析工具使用示例

## 概述

研究数据分析工具 (`ResearchDataAnalyzer`) 是一个功能强大的数据分析平台，提供从描述性统计到机器学习的全面分析功能。支持多种分析类型和数据格式，帮助研究人员深入理解和分析研究数据。

## 主要特性

- **全面的统计分析**: 描述性统计、推断统计、相关性分析
- **机器学习分析**: 聚类、降维、监督学习
- **时间序列分析**: 趋势检测、季节性分析、平稳性检验
- **智能可视化**: 自动生成多种类型的统计图表
- **探索性数据分析**: 自动数据质量检测和洞察发现
- **报告生成**: 支持 Markdown、HTML 格式的分析报告

## 使用示例

### 1. 描述性统计分析

```typescript
const analyzer = new ResearchDataAnalyzer();

const params: DataAnalyzerParams = {
  action: 'analyze',
  analysisTypes: [AnalysisType.DESCRIPTIVE],
  dataPath: './research_data.csv',
  includeVisualization: true,
  correlationMethod: 'pearson'
};

const result = await analyzer.execute(params);

// 查看分析结果
console.log('数据摘要:', result.data.summary);
console.log('描述性统计:', result.data.results[0].descriptiveStats);
console.log('相关性分析:', result.data.results[0].correlationAnalysis);
```

**输出示例:**
```
数据摘要: {
  totalRows: 1000,
  totalColumns: 8,
  numericColumns: ['age', 'income', 'score'],
  categoricalColumns: ['gender', 'education'],
  missingValues: { age: 5, income: 12 }
}

描述性统计: [
  {
    column: 'age',
    count: 995,
    mean: 35.2,
    std: 12.4,
    min: 18,
    max: 65,
    skewness: 0.15,
    kurtosis: -0.8
  }
]
```

### 2. 推断统计分析

```typescript
const params: DataAnalyzerParams = {
  action: 'analyze',
  analysisTypes: [AnalysisType.INFERENTIAL],
  dataPath: './experiment_data.csv',
  targetColumn: 'performance_score',
  significanceLevel: 0.05
};

const result = await analyzer.execute(params);

// 查看假设检验结果
result.data.results[0].hypothesisTests?.forEach(test => {
  console.log(`${test.testName}: p值=${test.pValue}, 结论=${test.interpretation}`);
});
```

**输出示例:**
```
Shapiro-Wilk正态性检验: p值=0.023, 结论=数据不符合正态分布
age 与 performance_score 相关性检验: p值=0.001, 结论=存在显著相关性
Levene方差齐性检验: p值=0.156, 结论=方差齐性
```

### 3. 机器学习分析

```typescript
const params: DataAnalyzerParams = {
  action: 'analyze',
  analysisTypes: [AnalysisType.MACHINE_LEARNING],
  dataPath: './customer_data.csv',
  targetColumn: 'purchase_amount',
  clusteringMethod: 'kmeans',
  regressionMethod: 'random_forest',
  includeVisualization: true
};

const result = await analyzer.execute(params);

// 查看机器学习结果
const mlResults = result.data.results[0].mlResults;
mlResults?.forEach(ml => {
  console.log(`${ml.analysisType}: ${ml.algorithm}`);
  console.log('建议:', ml.recommendations.join(', '));
});
```

**输出示例:**
```
clustering: K-Means (k=3)
建议: 建议尝试不同的聚类数量, 可以使用肘部法则确定最优聚类数

dimensionality_reduction: PCA
建议: 前两个主成分解释了90%的方差, 可以用于降维和可视化

regression: 随机森林回归
建议: 模型R²为 0.857, 建议进行交叉验证
```

### 4. 时间序列分析

```typescript
const params: DataAnalyzerParams = {
  action: 'analyze',
  analysisTypes: [AnalysisType.TIME_SERIES],
  dataPath: './sales_timeseries.csv',
  timeColumn: 'date',
  targetColumn: 'sales_amount',
  includeVisualization: true
};

const result = await analyzer.execute(params);

// 查看时间序列分析结果
const tsAnalysis = result.data.results[0].timeSeriesAnalysis;
console.log('趋势:', tsAnalysis?.trend);
console.log('季节性:', tsAnalysis?.seasonality.detected ? '有' : '无');
console.log('平稳性:', tsAnalysis?.stationarity.isStationary ? '平稳' : '非平稳');
```

### 5. 探索性数据分析

```typescript
const params: DataAnalyzerParams = {
  action: 'explore',
  analysisTypes: [AnalysisType.DESCRIPTIVE],
  dataPath: './survey_data.csv',
  includeVisualization: true
};

const result = await analyzer.execute(params);

// 查看数据质量洞察
console.log('数据洞察:');
result.data.results[0].recommendations.forEach((insight, index) => {
  console.log(`${index + 1}. ${insight}`);
});
```

**输出示例:**
```
数据洞察:
1. 数据集包含 2500 行和 12 列
2. 数值列: 7 个，分类列: 5 个
3. 发现缺失值：income(45), education(12)
4. age 列值重复度较高，可能适合作为分类变量
5. 发现强相关关系：income-education(0.72)
```

### 6. 数据预处理建议

```typescript
const params: DataAnalyzerParams = {
  action: 'preprocess',
  analysisTypes: [AnalysisType.DESCRIPTIVE],
  dataPath: './raw_data.csv'
};

const result = await analyzer.execute(params);

// 查看预处理建议
console.log('预处理建议:');
result.data.results[0].recommendations.forEach(recommendation => {
  console.log('- ' + recommendation);
});
```

**输出示例:**
```
预处理建议:
- income: 缺失值较多(8.5%)，建议使用插值或建模填充
- age: 缺失值较少(1.2%)，可以删除这些行或用均值填充
- salary 列发现 15 个异常值(3.2%)
- education: 可以转换为分类变量(6个唯一值)
- 考虑对数值变量进行标准化或归一化
- 可以尝试创建变量间的交互项
```

### 7. 生成分析报告

```typescript
const params: DataAnalyzerParams = {
  action: 'report',
  analysisTypes: [
    AnalysisType.DESCRIPTIVE,
    AnalysisType.INFERENTIAL,
    AnalysisType.MACHINE_LEARNING
  ],
  dataPath: './complete_dataset.csv',
  outputFormat: 'html',
  includeVisualization: true,
  includeRecommendations: true
};

const result = await analyzer.execute(params);

// 保存报告到文件
const report = result.data.report;
// fs.writeFileSync('analysis_report.html', report);
```

### 8. 使用自定义数据

```typescript
// 使用 JSON 格式的数据内容
const customData = [
  { id: 1, age: 25, score: 85, group: 'A' },
  { id: 2, age: 30, score: 92, group: 'B' },
  { id: 3, age: 35, score: 78, group: 'A' },
  // ... 更多数据
];

const params: DataAnalyzerParams = {
  action: 'analyze',
  analysisTypes: [AnalysisType.DESCRIPTIVE, AnalysisType.VISUALIZATION],
  dataContent: JSON.stringify(customData),
  includeVisualization: true
};

const result = await analyzer.execute(params);
```

## 参数详解

### 必需参数

- `action`: 分析动作类型
  - `'analyze'`: 执行指定的分析类型
  - `'explore'`: 探索性数据分析
  - `'visualize'`: 专门的可视化分析
  - `'preprocess'`: 数据预处理建议
  - `'report'`: 生成完整报告

- `analysisTypes`: 分析类型数组
  - `DESCRIPTIVE`: 描述性统计分析
  - `INFERENTIAL`: 推断统计分析
  - `MACHINE_LEARNING`: 机器学习分析
  - `TIME_SERIES`: 时间序列分析
  - `VISUALIZATION`: 数据可视化

- `dataPath` 或 `dataContent`: 数据源
  - `dataPath`: 数据文件路径
  - `dataContent`: JSON 格式的数据内容

### 可选参数

- `targetColumn`: 目标列（用于监督学习和相关性分析）
- `featureColumns`: 特征列列表
- `timeColumn`: 时间列（用于时间序列分析）
- `outputFormat`: 输出格式 (`'json'`, `'html'`, `'pdf'`, `'markdown'`)
- `includeVisualization`: 是否包含可视化
- `includeRecommendations`: 是否包含建议

### 分析选项

- `correlationMethod`: 相关性分析方法 (`'pearson'`, `'spearman'`, `'kendall'`)
- `clusteringMethod`: 聚类方法 (`'kmeans'`, `'hierarchical'`, `'dbscan'`)
- `regressionMethod`: 回归方法 (`'linear'`, `'polynomial'`, `'random_forest'`)
- `significanceLevel`: 显著性水平（默认 0.05）

## 支持的数据格式

- CSV 文件
- JSON 数据
- Excel 文件（通过适当的解析）
- 内存中的 JavaScript 对象数组

## 分析输出结构

```typescript
interface DataAnalysisResult {
  action: string;
  summary: StatisticalSummary;        // 数据摘要
  results: AnalysisResults[];         // 分析结果数组
  report?: string;                    // 格式化报告
  executionTime: number;              // 执行时间
  recommendations: string[];          // 总体建议
}
```

## 可视化类型

工具自动生成以下类型的可视化：

- **直方图**: 数值变量的分布
- **箱线图**: 数据分布和异常值检测
- **散点图**: 变量间关系
- **热力图**: 相关性矩阵
- **条形图**: 分类变量分布
- **折线图**: 时间序列趋势

## 最佳实践

1. **数据准备**: 确保数据格式正确，列名清晰
2. **分析顺序**: 建议先进行探索性分析，再进行具体分析
3. **参数选择**: 根据数据特性选择合适的分析方法
4. **结果解释**: 结合领域知识解释统计结果
5. **可视化**: 充分利用可视化功能辅助分析

## 常见用例

### 学术研究
- 实验数据的统计分析
- 调查数据的探索性分析
- 论文中的数据可视化

### 市场研究
- 客户行为分析
- 产品性能评估
- 市场趋势分析

### 质量控制
- 生产数据监控
- 异常检测
- 过程改进分析

### 医学研究
- 临床试验数据分析
- 流行病学研究
- 生物标志物分析 