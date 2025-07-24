# Bibliography Manager 使用示例

## 概述

`BibliographyManager` 是一个强大的学术文献管理工具，集成了多个数据源（arXiv、Google Scholar、PubMed、IEEE 等），提供统一的文献搜索、管理和引用格式转换功能。

## 核心功能

### 1. 文献搜索 (支持多数据源)

- **arXiv**: 直接调用 arXiv API
- **Google Scholar**: 通过网络搜索集成
- **PubMed**: 医学文献数据库
- **IEEE**: 工程技术文献

### 2. 文献库管理

- 添加、删除、更新文献条目
- 导入/导出多种格式
- 本地文献数据库维护

### 3. 引用格式转换

- APA、IEEE、MLA、Chicago 等多种学术引用格式
- 自动格式化生成

## 使用示例

### 搜索学术文献

```typescript
// 搜索机器学习相关论文
const searchParams = {
  query: 'machine learning neural networks',
  databases: ['arxiv', 'ieee'],
  maxResults: 10,
  yearRange: { start: 2020, end: 2024 },
  includeAbstracts: true,
  sortBy: 'date',
};

const result = await bibliographyManager.execute(searchParams);
```

**结果示例**:

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "arxiv_1",
        "title": "Advanced Neural Network Architectures for Machine Learning",
        "authors": ["John Doe", "Jane Smith"],
        "year": 2023,
        "abstract": "This paper presents...",
        "arxivId": "2301.12345",
        "url": "https://arxiv.org/abs/2301.12345"
      }
    ],
    "totalCount": 15,
    "searchMetadata": {
      "searchTime": 1250,
      "duplicatesRemoved": 3
    },
    "sources": {
      "arxiv": { "count": 8, "status": "success" },
      "ieee": { "count": 7, "status": "success" }
    }
  }
}
```

### 管理文献数据库

```typescript
// 添加文献条目
await bibliographyManager.execute({
  action: 'add',
  entry: {
    title: 'Deep Learning for Computer Vision',
    authors: ['Alice Johnson', 'Bob Wilson'],
    year: 2023,
    journal: 'Nature Machine Intelligence',
    doi: '10.1038/s42256-023-00123-4',
  },
});

// 列出所有文献
const listResult = await bibliographyManager.execute({
  action: 'list',
});

// 导出 APA 格式引用
const exportResult = await bibliographyManager.execute({
  action: 'export',
  format: 'apa',
  filename: 'my-bibliography.txt',
});
```

### 高级搜索功能

```typescript
// 按研究领域过滤
const advancedSearch = {
  query: 'artificial intelligence',
  databases: ['arxiv', 'pubmed', 'ieee'],
  fields: ['computer science', 'machine learning'],
  yearRange: { start: 2022, end: 2024 },
  sortBy: 'citations',
  maxResults: 20,
};
```

## 支持的数据源

| 数据源              | 类型   | 实现状态        | 描述                         |
| ------------------- | ------ | --------------- | ---------------------------- |
| arXiv               | 预印本 | ✅ 完整实现     | 物理、数学、计算机科学等领域 |
| Google Scholar      | 综合   | ✅ 网络搜索集成 | 跨学科学术搜索               |
| PubMed              | 医学   | 🔄 模拟实现     | 生物医学文献数据库           |
| IEEE Xplore         | 工程   | 🔄 模拟实现     | 电气工程和计算机科学         |
| ACM Digital Library | 计算机 | ⏳ 计划中       | 计算机科学专业数据库         |
| Springer            | 综合   | ⏳ 计划中       | 科学技术期刊数据库           |

## 引用格式支持

### APA 格式

```
Doe, J., & Smith, J. (2023). Advanced Neural Networks. Nature AI. https://doi.org/10.1038/example
```

### IEEE 格式

```
J. Doe and J. Smith, "Advanced Neural Networks," Nature AI, 2023. DOI: 10.1038/example.
```

### MLA 格式

```
Doe, John, and Jane Smith. "Advanced Neural Networks." Nature AI 2023. Web.
```

## 集成建议

### 与现有 MCP 服务器集成

如果您已经配置了 arXiv MCP 服务器，`BibliographyManager` 可以与其协同工作：

```json
// settings.json
{
  "mcpServers": {
    "arxiv": {
      "command": "npx",
      "args": ["@arxiv/mcp-server"]
    }
  }
}
```

### 扩展实现

要添加新的数据源支持，可以：

1. 在 `searchLiterature` 方法中添加新的 case
2. 实现对应的 `search[DataSource]` 方法
3. 确保返回标准的 `BibliographyEntry` 格式

```typescript
case Database.NEW_SOURCE:
  entries = await this.searchNewSource(params, maxResults);
  break;
```

## 性能优化

- **并行搜索**: 多个数据库同时搜索，提高效率
- **智能去重**: 基于标题和年份的自动去重
- **结果缓存**: 可扩展本地缓存机制
- **分页支持**: 大量结果的分页处理

## 未来扩展计划

1. **更多数据源**: ACM、Springer、JSTOR 等
2. **实时 API 集成**: 替换模拟实现为真实 API 调用
3. **语义搜索**: 基于内容相似性的智能搜索
4. **协同过滤**: 基于用户行为的推荐系统
5. **导入格式**: 支持 BibTeX、EndNote、Zotero 格式
6. **云端同步**: 跨设备文献库同步功能
