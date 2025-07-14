# 实验代码生成器使用示例

## 概述

实验代码生成器 (`ExperimentCodeGenerator`) 是一个强大的工具，能够根据研究方法、编程语言和分析需求自动生成完整的实验代码框架。支持多种编程语言和研究方法，帮助研究人员快速开始实验项目。

## 主要特性

- **多语言支持**: Python、R、MATLAB、Julia、JavaScript/TypeScript
- **研究方法模板**: 机器学习、统计分析、数值计算、数据挖掘等
- **自动依赖管理**: 根据需求自动生成依赖文件
- **完整代码框架**: 包含数据加载、处理、分析、可视化的完整流程
- **最佳实践**: 遵循各语言和领域的编程最佳实践

## 使用示例

### 1. Python 机器学习实验

```typescript
const generator = new ExperimentCodeGenerator();

const mlParams: ExperimentCodeParams = {
  experimentName: 'Customer Churn Prediction',
  researchMethod: ResearchMethod.MACHINE_LEARNING,
  language: ProgrammingLanguage.PYTHON,
  dataTypes: [DataFormat.CSV, DataFormat.JSON],
  analysisTypes: [AnalysisType.MACHINE_LEARNING, AnalysisType.DESCRIPTIVE],
  outputFormats: ['html', 'jupyter'],
  includeVisualization: true,
  includeTesting: true,
  dataPath: './data/',
  description: 'Predict customer churn using machine learning models'
};

const result = await generator.execute(mlParams);

// 生成的文件包括:
// - customer_churn_prediction_experiment.py (主实验脚本)
// - config.json (配置文件)
// - requirements.txt (Python依赖)
// - README.md (项目文档)
```

生成的 Python 代码包含：
- 完整的机器学习管道
- 数据预处理和清洗
- 多种模型比较（随机森林、逻辑回归等）
- 交叉验证和模型评估
- 数据可视化和报告生成

### 2. R 统计分析实验

```typescript
const statsParams: ExperimentCodeParams = {
  experimentName: 'Survey Data Analysis',
  researchMethod: ResearchMethod.STATISTICAL_ANALYSIS,
  language: ProgrammingLanguage.R,
  dataTypes: [DataFormat.CSV, DataFormat.EXCEL],
  analysisTypes: [AnalysisType.DESCRIPTIVE, AnalysisType.INFERENTIAL],
  outputFormats: ['pdf', 'html'],
  includeVisualization: true,
  dataPath: './survey_data/',
  description: 'Comprehensive statistical analysis of survey responses'
};

const result = await generator.execute(statsParams);

// 生成的文件包括:
// - survey_data_analysis_experiment.R (主分析脚本)
// - config.json (配置文件)
// - README.md (项目文档)
```

生成的 R 代码包含：
- Tidyverse 生态系统的最佳实践
- 描述性统计分析
- 推断统计检验
- ggplot2 数据可视化
- R Markdown 报告生成

### 3. 多语言数值计算实验

```typescript
const numericParams: ExperimentCodeParams = {
  experimentName: 'Monte Carlo Simulation',
  researchMethod: ResearchMethod.NUMERICAL_COMPUTATION,
  language: ProgrammingLanguage.JULIA,
  dataTypes: [DataFormat.CSV],
  analysisTypes: [AnalysisType.SIMULATION],
  outputFormats: ['html', 'pdf'],
  includeVisualization: true,
  customRequirements: ['Distributions.jl', 'Plots.jl'],
  description: 'Monte Carlo simulation for financial risk assessment'
};

const result = await generator.execute(numericParams);
```

### 4. JavaScript 数据分析实验

```typescript
const jsParams: ExperimentCodeParams = {
  experimentName: 'Web Analytics Dashboard',
  researchMethod: ResearchMethod.DATA_MINING,
  language: ProgrammingLanguage.JAVASCRIPT,
  dataTypes: [DataFormat.JSON, DataFormat.CSV],
  analysisTypes: [AnalysisType.DESCRIPTIVE, AnalysisType.VISUALIZATION],
  outputFormats: ['html'],
  includeVisualization: true,
  description: 'Interactive web analytics dashboard'
};
```

## 配置选项

### 必需参数

- `experimentName`: 实验名称
- `researchMethod`: 研究方法（机器学习、统计分析等）
- `language`: 编程语言
- `dataTypes`: 输入数据格式数组
- `analysisTypes`: 分析类型数组
- `outputFormats`: 输出格式数组

### 可选参数

- `includeVisualization`: 是否包含数据可视化（默认：false）
- `includeStatistics`: 是否包含统计分析（默认：false）
- `includeTesting`: 是否包含单元测试（默认：false）
- `customRequirements`: 自定义依赖需求数组
- `dataPath`: 数据文件路径（默认：'./data/'）
- `description`: 实验描述

## 支持的研究方法

- `MACHINE_LEARNING`: 机器学习和深度学习
- `STATISTICAL_ANALYSIS`: 统计分析和假设检验
- `NUMERICAL_COMPUTATION`: 数值计算和建模
- `DATA_MINING`: 数据挖掘和知识发现
- `SIMULATION`: 仿真和蒙特卡罗方法

## 支持的编程语言

- `PYTHON`: Python 3.8+ 
- `R`: R 4.0+
- `MATLAB`: MATLAB 2020a+
- `JULIA`: Julia 1.6+
- `JAVASCRIPT`: Node.js/Browser JavaScript
- `TYPESCRIPT`: TypeScript

## 支持的数据格式

- `CSV`: 逗号分隔值文件
- `JSON`: JSON 格式数据
- `EXCEL`: Excel 电子表格
- `PARQUET`: Parquet 列式存储
- `DATABASE`: 数据库连接

## 支持的分析类型

- `DESCRIPTIVE`: 描述性统计
- `INFERENTIAL`: 推断统计
- `MACHINE_LEARNING`: 机器学习
- `VISUALIZATION`: 数据可视化
- `SIMULATION`: 仿真分析

## 输出结构

生成的实验包含以下文件：

```
experiment_project/
├── main_experiment_script.[py|R|m|jl|js]  # 主实验脚本
├── config.json                           # 实验配置
├── requirements.[txt|R|m]                # 依赖列表
├── README.md                             # 项目文档
├── data/                                 # 数据目录
│   └── (place your data files here)
└── results/                              # 结果输出目录
    ├── plots/                            # 图表输出
    ├── reports/                          # 分析报告
    └── models/                           # 模型文件
```

## 最佳实践

1. **数据准备**: 确保数据文件格式正确且完整
2. **环境设置**: 安装推荐的依赖版本
3. **配置审查**: 运行前检查 config.json 配置
4. **渐进式开发**: 从基础分析开始，逐步添加复杂功能
5. **版本控制**: 使用 Git 跟踪实验代码变更
6. **文档记录**: 详细记录实验假设和结果

## 高级功能

### 自定义模板

可以扩展代码生成器以支持自定义模板：

```typescript
// 添加自定义需求
const advancedParams: ExperimentCodeParams = {
  // ... 基础参数
  customRequirements: [
    'custom-ml-library>=1.0.0',
    'special-visualization-tool'
  ]
};
```

### 批量实验生成

```typescript
const experiments = [
  { name: 'Experiment_A', method: ResearchMethod.MACHINE_LEARNING },
  { name: 'Experiment_B', method: ResearchMethod.STATISTICAL_ANALYSIS }
];

for (const exp of experiments) {
  const params = {
    experimentName: exp.name,
    researchMethod: exp.method,
    // ... 其他参数
  };
  
  const result = await generator.execute(params);
  // 处理每个实验的结果
}
```

## 故障排除

### 常见问题

1. **依赖安装失败**: 检查网络连接和包管理器配置
2. **数据加载错误**: 验证数据文件路径和格式
3. **内存不足**: 对大数据集使用分块处理
4. **权限问题**: 确保输出目录有写入权限

### 调试建议

- 启用详细日志输出
- 使用小数据集进行初始测试
- 逐步添加分析模块
- 检查生成代码的语法正确性

## 相关工具

- `PaperOutlineGenerator`: 论文结构生成器
- `BibliographyManager`: 文献管理工具
- `ResearchDataAnalyzer`: 研究数据分析器

## 技术支持

如需技术支持或功能建议，请参考项目文档或提交问题报告。 