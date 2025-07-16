# Research Tools 研究工具使用指南

Research-CLI 提供了完整的学术研究工具套件，支持从论文写作到投稿准备的全流程。本文档详细介绍了所有研究工具的使用方法和最佳实践。

## 📋 目录

1. [快速开始](#快速开始)
2. [论文写作工具](#论文写作工具)
3. [文献管理工具](#文献管理工具)
4. [数据分析工具](#数据分析工具)
5. [实验代码生成](#实验代码生成)
6. [LaTeX 管理](#latex-管理)
7. [投稿准备工具](#投稿准备工具)
8. [命令行界面](#命令行界面)
9. [最佳实践](#最佳实践)
10. [故障排除](#故障排除)

## 🚀 快速开始

### 安装和配置

```bash
# 安装 research-cli
npm install -g @iechor/research-cli

# 初始化研究配置
research-cli config init

# 查看可用的研究工具
research-cli tools list --category research
```

### 基本使用

```bash
# 启动交互式会话
research-cli

# 使用斜杠命令
/research search "machine learning" --source=arxiv --limit=5
/paper outline EXPERIMENTAL COMPUTER_SCIENCE --journal="Nature"
/submit match "Deep Learning for NLP" "This paper presents..." --field=COMPUTER_SCIENCE
```

## 📝 论文写作工具

### 论文大纲生成器 (Paper Outline Generator)

生成结构化的学术论文大纲，支持多种论文类型和研究领域。

#### 基本用法

```bash
# 生成实验性论文大纲
/paper outline EXPERIMENTAL COMPUTER_SCIENCE --journal="Nature Machine Intelligence"

# 生成综述论文大纲
/paper outline SURVEY BIOLOGY --length=8000 --timeline
```

#### 支持的论文类型

- `EXPERIMENTAL`: 实验性研究论文
- `SURVEY`: 综述论文
- `THEORETICAL`: 理论研究论文
- `EMPIRICAL`: 实证研究论文
- `CONCEPTUAL`: 概念性论文

#### 支持的研究领域

- `COMPUTER_SCIENCE`: 计算机科学
- `BIOLOGY`: 生物学
- `PHYSICS`: 物理学
- `MATHEMATICS`: 数学
- `ENGINEERING`: 工程学

#### 示例输出

```markdown
# Deep Learning for Natural Language Processing: A Comprehensive Survey

## Abstract (200-250 words)
- Background and motivation
- Scope and objectives
- Main contributions
- Key findings

## 1. Introduction (800-1000 words)
### 1.1 Background
### 1.2 Motivation
### 1.3 Contributions
### 1.4 Paper Structure

## 2. Related Work (1200-1500 words)
### 2.1 Traditional NLP Methods
### 2.2 Early Deep Learning Approaches
### 2.3 Recent Advances

...
```

### 学术写作助手 (Academic Writing Assistant)

提供全面的学术写作支持，包括语法检查、风格优化和引用管理。

#### 基本用法

```bash
# 检查语法
/paper check document.pdf --type=grammar

# 分析文档结构
/paper check document.pdf --type=structure

# 全面检查
/paper check document.pdf --type=all
```

#### 功能特性

1. **语法检查**: 检测语法错误和拼写错误
2. **风格优化**: 提供学术写作风格建议
3. **结构分析**: 分析论文结构和逻辑流程
4. **引用验证**: 检查引用格式和完整性
5. **可读性评估**: 评估文档的可读性指标

#### 示例

```bash
# 检查特定章节
/paper write introduction --style=academic --length=800

# 优化现有文本
/paper check "The results show that our method performs better than baseline approaches." --type=style
```

## 📚 文献管理工具

### 文献搜索和管理

支持多个学术数据库的文献搜索和管理。

#### 基本用法

```bash
# 搜索文献
/research search "neural networks" --source=arxiv --limit=10

# 多数据库搜索
/paper bib search "machine learning" --sources=arxiv,scholar,pubmed --limit=5

# 格式化引用
/paper bib format --style=IEEE --output=references.bib
```

#### 支持的数据库

- **arXiv**: 预印本论文
- **Google Scholar**: 学术搜索引擎
- **PubMed**: 生物医学文献
- **IEEE Xplore**: 工程技术文献

#### 引用格式

- APA
- IEEE
- MLA
- Chicago
- Nature
- Science

#### 示例工作流

```bash
# 1. 搜索相关文献
/research search "transformer architecture" --source=arxiv --limit=20

# 2. 筛选和保存
/paper bib add "1706.03762" --title="Attention Is All You Need"

# 3. 生成引用
/paper bib format --style=IEEE --output=my_references.bib
```

## 📊 数据分析工具

### 研究数据分析器

提供全面的数据分析功能，支持多种数据格式和分析方法。

#### 基本用法

```bash
# 描述性统计分析
/research data analyze dataset.csv --type=descriptive

# 相关性分析
/research data analyze dataset.csv --type=correlation

# 生成报告
/research data analyze dataset.csv --type=report --format=html
```

#### 支持的数据格式

- CSV
- JSON
- Excel (XLSX)
- HDF5
- Parquet

#### 分析类型

1. **描述性统计**: 均值、方差、分布等
2. **推断统计**: 假设检验、置信区间
3. **相关性分析**: 皮尔逊相关、斯皮尔曼相关
4. **机器学习**: 分类、回归、聚类
5. **时间序列**: 趋势分析、季节性分解

#### 示例分析报告

```bash
# 完整数据分析流程
/research data analyze experiment_results.csv --type=all --output=analysis_report.html

# 生成可视化图表
/research data visualize experiment_results.csv --type=scatter --x=feature1 --y=target
```

## 🔬 实验代码生成

### 实验代码生成器

为不同研究方法生成完整的实验代码框架。

#### 基本用法

```bash
# 生成 Python 机器学习实验代码
/research experiment python ml --output=./experiments

# 生成 R 统计分析代码
/research experiment r stats --output=./statistical_analysis

# 包含测试和文档
/research experiment python ml --tests --docs --output=./my_experiment
```

#### 支持的编程语言

- **Python**: 机器学习、数据科学
- **R**: 统计分析、数据可视化
- **MATLAB**: 数值计算、信号处理
- **Julia**: 高性能计算
- **JavaScript**: 前端可视化

#### 研究方法模板

1. **机器学习 (ml)**
   - 数据预处理
   - 模型训练
   - 评估指标
   - 结果可视化

2. **统计分析 (stats)**
   - 假设检验
   - 回归分析
   - 方差分析
   - 非参数检验

3. **数值计算 (numerical)**
   - 数值积分
   - 微分方程求解
   - 优化算法
   - 线性代数

#### 生成的代码结构

```
experiment_project/
├── data/
│   ├── raw/
│   └── processed/
├── src/
│   ├── data_preprocessing.py
│   ├── model_training.py
│   ├── evaluation.py
│   └── visualization.py
├── tests/
│   ├── test_preprocessing.py
│   └── test_model.py
├── docs/
│   ├── README.md
│   └── methodology.md
├── requirements.txt
└── run_experiment.py
```

## 📄 LaTeX 管理

### LaTeX 项目管理器

提供完整的 LaTeX 项目管理功能，从创建到编译。

#### 基本用法

```bash
# 创建新的 LaTeX 项目
/submit latex create ./my-paper --template=ieee_conference --title="My Research"

# 编译 LaTeX 文档
/submit latex compile ./my-paper --engine=PDFLATEX --bibtex

# 清理临时文件
/submit latex clean ./my-paper
```

#### 支持的模板

- **IEEE Conference**: IEEE 会议论文模板
- **ACM Article**: ACM 期刊文章模板
- **Springer Journal**: Springer 期刊模板
- **Nature**: Nature 期刊模板
- **Science**: Science 期刊模板
- **Thesis**: 学位论文模板

#### 编译引擎

- **PDFLATEX**: 标准 PDF 编译
- **XELATEX**: 支持 Unicode 和现代字体
- **LUALATEX**: Lua 扩展支持

#### 项目结构

```
my-paper/
├── main.tex
├── sections/
│   ├── introduction.tex
│   ├── methodology.tex
│   ├── results.tex
│   └── conclusion.tex
├── figures/
├── tables/
├── references.bib
└── style/
    └── conference.cls
```

## 🚀 投稿准备工具

### 期刊匹配器

根据论文内容智能推荐合适的期刊。

#### 基本用法

```bash
# 期刊匹配
/submit match "Deep Learning for Computer Vision" "This paper presents a novel approach..." --field=COMPUTER_SCIENCE

# 获取期刊详细信息
/submit match "Quantum Computing Algorithm" "We propose a new quantum algorithm..." --field=PHYSICS --metrics
```

#### 匹配因素

- **研究领域匹配度**
- **影响因子**
- **接收率**
- **审稿周期**
- **开放获取政策**

#### 示例输出

```markdown
# 期刊匹配结果

## 1. Nature Machine Intelligence (匹配度: 95%)
- **影响因子**: 25.898
- **研究领域**: 人工智能, 机器学习
- **接收率**: 8%
- **平均审稿周期**: 45 天
- **开放获取**: 混合模式

## 2. IEEE Transactions on Pattern Analysis and Machine Intelligence (匹配度: 88%)
- **影响因子**: 17.861
- **研究领域**: 计算机视觉, 模式识别
- **接收率**: 14%
- **平均审稿周期**: 12 个月
```

### 投稿包准备器

自动化准备完整的投稿材料包。

#### 基本用法

```bash
# 初始化投稿项目
/submit prepare init --name="my-paper" --template="nature-template"

# 验证投稿包
/submit prepare validate --project="./my-paper" --journal="Nature"

# 创建投稿包
/submit prepare package --project="./my-paper" --output="./submission"
```

#### 验证检查项

1. **LaTeX 编译**: 确保文档无编译错误
2. **图片质量**: 检查图片分辨率和格式
3. **引用格式**: 验证引用样式一致性
4. **字数限制**: 检查各章节字数
5. **补充材料**: 确保所有文件完整

#### 投稿包内容

```
submission_package/
├── manuscript.pdf
├── figures/
│   ├── figure1.eps
│   ├── figure2.eps
│   └── figure3.eps
├── tables/
│   └── table1.xlsx
├── supplementary/
│   ├── supplementary_material.pdf
│   └── source_code.zip
├── cover_letter.pdf
└── submission_checklist.pdf
```

## 💻 命令行界面

### 斜杠命令

Research-CLI 提供了直观的斜杠命令界面。

#### 研究命令 (`/research`)

```bash
# 文献搜索
/research search <query> [--source=arxiv|scholar] [--limit=10]

# 文档分析
/research analyze <file> [--type=structure|grammar|style]

# 实验代码生成
/research experiment <language> <method> [--output=./experiments]

# 数据分析
/research data <operation> <file> [--format=table|chart|report]
```

#### 论文命令 (`/paper`)

```bash
# 大纲生成
/paper outline <type> <field> [--journal=name] [--length=8000]

# 写作辅助
/paper write <section> [--style=academic|technical] [--length=800]

# 文档检查
/paper check <file> [--type=all|grammar|style|citations]

# 文献管理
/paper bib <operation> [options]
```

#### 投稿命令 (`/submit`)

```bash
# 期刊匹配
/submit match <title> <abstract> [--field=cs|bio|physics]

# 投稿包准备
/submit prepare <paper-file> <journal> [--format=pdf|latex]

# LaTeX 管理
/submit latex <operation> <project-path> [options]
```

### 配置命令 (`/config`)

```bash
# 显示配置
/config show [research]

# 设置配置项
/config set <key> <value> [--scope=user|workspace]

# 重置配置
/config reset [research] [--scope=user|workspace]
```

## 🎯 最佳实践

### 研究工作流建议

1. **项目初始化**
   ```bash
   # 创建研究项目
   mkdir my-research-project
   cd my-research-project
   
   # 初始化配置
   research-cli config init
   ```

2. **文献调研**
   ```bash
   # 搜索相关文献
   /research search "your research topic" --source=arxiv --limit=20
   
   # 管理文献
   /paper bib search "specific keywords" --sources=arxiv,scholar
   ```

3. **论文写作**
   ```bash
   # 生成大纲
   /paper outline EXPERIMENTAL COMPUTER_SCIENCE --journal="Target Journal"
   
   # 逐步写作
   /paper write introduction --style=academic
   /paper write methodology --style=technical
   ```

4. **数据分析**
   ```bash
   # 生成实验代码
   /research experiment python ml --output=./experiments
   
   # 分析结果
   /research data analyze results.csv --type=all --format=report
   ```

5. **投稿准备**
   ```bash
   # 匹配期刊
   /submit match "Paper Title" "Abstract text" --field=COMPUTER_SCIENCE
   
   # 准备投稿包
   /submit prepare package --project=./paper --journal="Nature"
   ```

### 配置优化

```bash
# 设置默认研究领域
/config set research.defaultField COMPUTER_SCIENCE

# 设置首选引用格式
/config set research.citationStyle IEEE

# 设置默认数据库
/config set research.defaultSources "arxiv,scholar"
```

### 团队协作

```bash
# 导出项目配置
/config export research --include-defaults

# 共享配置文件
/config import team-research-config.json --scope=workspace
```

## 🛠️ 故障排除

### 常见问题

#### 1. LaTeX 编译错误

**问题**: LaTeX 文档编译失败
```bash
Error: LaTeX compilation failed with exit code 1
```

**解决方案**:
```bash
# 检查 LaTeX 安装
/submit latex check ./project

# 使用不同编译引擎
/submit latex compile ./project --engine=XELATEX

# 查看详细错误日志
/submit latex compile ./project --verbose
```

#### 2. 文献搜索失败

**问题**: 无法连接到学术数据库
```bash
Error: Failed to connect to arXiv API
```

**解决方案**:
```bash
# 检查网络连接
/research search "test" --source=arxiv --debug

# 使用代理设置
/config set research.proxy "http://proxy.example.com:8080"

# 尝试其他数据库
/research search "test" --source=scholar
```

#### 3. 数据分析错误

**问题**: 数据文件格式不支持
```bash
Error: Unsupported file format: .xlsx
```

**解决方案**:
```bash
# 转换文件格式
/research data convert data.xlsx --format=csv

# 检查支持的格式
/research data formats

# 使用原始数据
/research data analyze data.csv --type=descriptive
```

### 调试选项

```bash
# 启用详细日志
research-cli --debug

# 检查工具状态
/research status

# 验证配置
/config validate research
```

### 获取帮助

```bash
# 查看命令帮助
/research help
/paper help
/submit help

# 查看特定工具帮助
/research search --help
/paper outline --help
```

## 📖 API 参考

### 研究工具 API

所有研究工具都遵循统一的接口规范：

```typescript
interface ResearchTool {
  name: string;
  description: string;
  category: ResearchToolCategory;
  version: string;
  execute(params: ResearchToolParams): Promise<ResearchToolResult>;
  validate(params: ResearchToolParams): boolean;
  getHelp(): string;
}
```

### 工具类别

```typescript
enum ResearchToolCategory {
  WRITING = 'writing',
  ANALYSIS = 'analysis',
  SUBMISSION = 'submission',
  COLLABORATION = 'collaboration',
  INTEGRATION = 'integration'
}
```

### 参数类型

```typescript
interface ResearchToolParams {
  [key: string]: any;
}

interface ResearchToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: string;
    toolName: string;
    version: string;
    executionTime?: number;
  };
}
```

## 🔗 相关资源

- [Research-CLI 主文档](../index.md)
- [配置指南](../cli/configuration.md)
- [API 文档](../core/tools-api.md)
- [示例项目](../examples/)
- [故障排除](../troubleshooting.md)

---

如果您在使用过程中遇到任何问题，请查看 [故障排除指南](../troubleshooting.md) 或提交 [Issue](https://github.com/iechor/research-cli/issues)。 