# 期刊匹配器 (Journal Matcher) 使用示例

期刊匹配器提供智能期刊推荐、搜索、比较和分析功能，帮助研究人员找到最适合的期刊发表其研究成果。

## 基本功能

### 1. 智能期刊匹配

根据论文内容匹配最合适的期刊：

```typescript
const params: JournalMatcherParams = {
  action: 'match',
  title: 'Deep Learning for Computer Vision Applications',
  abstract:
    'This paper presents novel neural network architectures for image recognition tasks using convolutional neural networks and attention mechanisms.',
  keywords: [
    'deep learning',
    'computer vision',
    'neural networks',
    'image recognition',
  ],
  researchField: ResearchField.COMPUTER_SCIENCE,
  impactFactorRange: { min: 2.0, max: 10.0 },
  quartile: ['Q1', 'Q2'],
  maxResults: 10,
};

const result = await journalMatcher.execute(params);
// result.data 包含匹配结果
```

### 2. 期刊搜索

搜索符合特定条件的期刊：

```typescript
const params: JournalMatcherParams = {
  action: 'search',
  researchField: ResearchField.COMPUTER_SCIENCE,
  openAccess: true,
  quartile: ['Q1'],
  sortBy: 'impact_factor',
  sortOrder: 'desc',
  maxResults: 20,
};

const result = await journalMatcher.execute(params);
// result.data 包含搜索到的期刊列表
```

### 3. 期刊比较

比较多个期刊的特性：

```typescript
const params: JournalMatcherParams = {
  action: 'compare',
  journalNames: [
    'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    'ACM Computing Surveys',
    'Nature Machine Intelligence',
  ],
  includeRequirements: true,
};

const result = await journalMatcher.execute(params);
// result.data 包含比较结果
```

### 4. 期刊数据分析

分析期刊数据库的统计信息：

```typescript
const params: JournalMatcherParams = {
  action: 'analyze',
  researchField: ResearchField.COMPUTER_SCIENCE,
};

const result = await journalMatcher.execute(params);
// result.data 包含分析结果
```

## 高级用例

### 筛选高质量期刊

```typescript
const params: JournalMatcherParams = {
  action: 'search',
  researchField: ResearchField.COMPUTER_SCIENCE,
  quartile: ['Q1'],
  impactFactorRange: { min: 5.0 },
  publisher: ['IEEE', 'ACM', 'Springer Nature'],
  sortBy: 'impact_factor',
  sortOrder: 'desc',
};
```

### 寻找快速发表的期刊

```typescript
const params: JournalMatcherParams = {
  action: 'search',
  researchField: ResearchField.COMPUTER_SCIENCE,
  sortBy: 'review_time',
  sortOrder: 'asc',
  maxResults: 15,
};
```

### 匹配特定类型的论文

```typescript
const params: JournalMatcherParams = {
  action: 'match',
  title: 'A Comprehensive Survey of Machine Learning in Healthcare',
  paperType: 'review',
  researchField: ResearchField.COMPUTER_SCIENCE,
  keywords: ['machine learning', 'healthcare', 'survey', 'medical AI'],
};
```

## 结果格式

### 匹配结果 (JournalMatchResult)

```typescript
{
  journal: JournalInfo,           // 期刊详细信息
  matchScore: 0.85,               // 总体匹配分数 (0-1)
  relevanceScore: 0.90,           // 相关性分数
  qualityScore: 0.80,             // 质量分数
  feasibilityScore: 0.85,         // 可行性分数
  scores: {
    titleMatch: 0.75,             // 标题匹配度
    abstractMatch: 0.80,          // 摘要匹配度
    keywordMatch: 0.90,           // 关键词匹配度
    fieldMatch: 1.0,              // 领域匹配度
    scopeMatch: 0.70,             // 范围匹配度
    impactAlignment: 0.85,        // 影响因子对齐度
    requirementFit: 0.75          // 要求匹配度
  },
  matchReasons: [
    'Strong alignment with research field',
    'High keyword relevance',
    'Good impact factor alignment'
  ],
  concerns: [
    'Very low acceptance rate'
  ],
  recommendations: [
    'Consider revising title to better match journal scope',
    'Follow IEEE citation style'
  ]
}
```

### 期刊信息 (JournalInfo)

```typescript
{
  id: 'ieee-tpami',
  name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
  abbreviation: 'IEEE TPAMI',
  issn: '0162-8828',

  // 期刊指标
  impactFactor: 24.31,
  quartile: 'Q1',

  // 出版信息
  publisher: 'IEEE',
  frequency: 'monthly',
  language: ['English'],
  country: 'USA',

  // 内容和范围
  scope: 'Computer vision, machine learning, pattern recognition, and related fields',
  researchFields: ['computer_science', 'engineering'],
  subjects: ['computer vision', 'machine learning', 'pattern recognition'],
  keywords: ['deep learning', 'neural networks', 'computer vision'],

  // 投稿信息
  acceptanceRate: 14,
  averageReviewTime: 180,      // 天数
  publicationFee: 0,
  openAccess: false,
  hybridOA: true,

  // 格式要求
  citationStyle: 'ieee',
  wordLimit: 8000,
  pageLimit: 14,
  formatRequirements: ['IEEE format', 'Double column'],

  // 其他信息
  website: 'https://ieeexplore.ieee.org/...',
  indexedIn: ['SCI', 'Scopus', 'DBLP'],
  specialIssues: ['Deep Learning', 'Computer Vision']
}
```

## 内置期刊数据库

系统包含以下主要期刊的详细信息：

### 计算机科学

- IEEE Transactions on Pattern Analysis and Machine Intelligence (IF: 24.31, Q1)
- ACM Computing Surveys (IF: 14.32, Q1)
- Nature Machine Intelligence (IF: 25.89, Q1)
- IEEE Transactions on Industrial Informatics (IF: 12.09, Q1)

### 开放获取期刊

- PLOS ONE (IF: 3.75, Q2, Open Access)

### 数学期刊

- Journal of the American Mathematical Society (IF: 5.09, Q1)

### 医学期刊

- Nature Medicine (IF: 87.24, Q1)

### 心理学期刊

- Psychological Science (IF: 7.73, Q1)

## 评分算法说明

匹配算法使用多维度加权评分：

1. **标题匹配** (15%): 分析标题与期刊关键词的相关性
2. **摘要匹配** (20%): 分析摘要内容与期刊范围的匹配度
3. **关键词匹配** (20%): 计算用户关键词与期刊关键词的重叠度
4. **领域匹配** (15%): 研究领域的精确或相关匹配
5. **范围匹配** (10%): 论文类型与期刊接收范围的匹配
6. **影响因子对齐** (10%): 期刊影响因子与用户期望的对齐度
7. **要求匹配** (10%): 开放获取、出版商偏好等要求的匹配

## 最佳实践

### 提高匹配精度

1. 提供详细的摘要和精确的关键词
2. 选择合适的研究领域分类
3. 设置合理的影响因子期望范围

### 期刊选择策略

1. 综合考虑匹配分数、影响因子和接收率
2. 关注期刊的审稿时间和发表周期
3. 考虑开放获取政策和发表费用

### 投稿准备

1. 仔细阅读期刊的格式要求
2. 遵循推荐的引用格式
3. 关注期刊的特殊问题和热点话题
