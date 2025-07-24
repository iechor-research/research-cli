# LaTeX 管理器使用示例

## 概述

LaTeX 管理器 (`LaTeXManager`) 是一个全面的 LaTeX 项目管理工具，提供从项目创建到编译、诊断的完整工作流支持。它集成了多种专业期刊和会议的模板，支持自动化编译和智能错误诊断。

## 主要特性

- **项目创建**: 基于模板快速创建 LaTeX 项目
- **多模板支持**: IEEE、ACM、Springer、学位论文等专业模板
- **自动编译**: 支持多种 LaTeX 引擎（pdflatex、xelatex、lualatex）
- **智能诊断**: 自动检测常见错误和给出修复建议
- **包管理**: 自动检测和管理 LaTeX 包依赖
- **项目清理**: 一键清理编译产生的临时文件

## 核心操作

### 1. 创建项目 (create)

#### 创建 IEEE 会议论文

```typescript
const latexManager = new LaTeXManager();

const ieeeParams: LaTeXManagerParams = {
  action: 'create',
  projectName: 'my-ieee-paper',
  documentType: DocumentType.CONFERENCE_PAPER,
  journalStyle: 'ieee',
  includeBibliography: true,
  authorInfo: {
    name: 'Dr. Jane Smith',
    email: 'jane.smith@university.edu',
    affiliation: 'Department of Computer Science, University of Research',
  },
  customPackages: ['algorithm2e', 'tikz'],
};

const result = await latexManager.execute(ieeeParams);
// 创建完整的 IEEE 格式项目结构
```

生成的项目结构：

```
my-ieee-paper/
├── main.tex                    # 主文档文件
├── sections/                   # 章节目录
├── figures/                    # 图片目录
├── tables/                     # 表格目录
├── bibliography/               # 参考文献目录
│   └── references.bib
├── appendix/                   # 附录目录
├── build/                      # 编译输出目录
├── Makefile                    # 自动化编译脚本
└── .gitignore                  # Git 忽略文件
```

#### 创建 ACM 期刊文章

```typescript
const acmParams: LaTeXManagerParams = {
  action: 'create',
  projectName: 'acm-journal-paper',
  documentType: DocumentType.JOURNAL_ARTICLE,
  templateName: 'acm-article',
  authorInfo: {
    name: 'Prof. John Doe',
    email: 'john.doe@research-inst.org',
    affiliation: 'Institute of Advanced Research',
  },
  customPackages: ['booktabs', 'subcaption', 'listings'],
};

const result = await latexManager.execute(acmParams);
```

#### 创建博士论文

```typescript
const thesisParams: LaTeXManagerParams = {
  action: 'create',
  projectName: 'phd-dissertation',
  documentType: DocumentType.THESIS,
  templateName: 'thesis',
  authorInfo: {
    name: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    affiliation: 'Graduate School of Engineering',
  },
  customPackages: ['nomencl', 'glossaries', 'appendix'],
};

const result = await latexManager.execute(thesisParams);
```

### 2. 编译项目 (compile)

#### 基本编译

```typescript
const compileParams: LaTeXManagerParams = {
  action: 'compile',
  projectPath: './my-ieee-paper/',
  engine: LaTeXEngine.PDFLATEX,
  outputFormat: 'pdf',
};

const result = await latexManager.execute(compileParams);

if (result.success) {
  const compileResult = result.data.compileResult;
  console.log(`编译成功！用时: ${compileResult.compilationTime}ms`);
  console.log(`输出文件: ${compileResult.outputFiles.join(', ')}`);
} else {
  console.error(`编译失败: ${result.error}`);
}
```

#### 使用 XeLaTeX 引擎

```typescript
const xelatexParams: LaTeXManagerParams = {
  action: 'compile',
  projectPath: './my-paper/',
  engine: LaTeXEngine.XELATEX,
  compileOptions: ['-shell-escape', '-synctex=1'],
  outputFormat: 'pdf',
};

const result = await latexManager.execute(xelatexParams);
```

#### 批量编译多个项目

```typescript
const projects = ['./ieee-paper/', './acm-article/', './springer-paper/'];

for (const projectPath of projects) {
  const params: LaTeXManagerParams = {
    action: 'compile',
    projectPath,
    engine: LaTeXEngine.PDFLATEX,
  };

  const result = await latexManager.execute(params);
  console.log(`${projectPath}: ${result.success ? '✓' : '✗'}`);
}
```

### 3. 项目诊断 (diagnose)

```typescript
const diagnoseParams: LaTeXManagerParams = {
  action: 'diagnose',
  projectPath: './problematic-paper/',
};

const result = await latexManager.execute(diagnoseParams);

if (result.success) {
  const diagnostics = result.data.diagnostics;

  // 显示错误
  if (diagnostics.errors.length > 0) {
    console.log('发现错误:');
    diagnostics.errors.forEach((error) => {
      console.log(`  ${error.file}:${error.line} - ${error.message}`);
      if (error.suggestion) {
        console.log(`    建议: ${error.suggestion}`);
      }
    });
  }

  // 显示警告
  if (diagnostics.warnings.length > 0) {
    console.log('警告信息:');
    diagnostics.warnings.forEach((warning) => {
      console.log(`  ${warning.file}:${warning.line} - ${warning.message}`);
    });
  }

  // 显示建议
  if (diagnostics.suggestions.length > 0) {
    console.log('优化建议:');
    diagnostics.suggestions.forEach((suggestion) => {
      console.log(`  • ${suggestion}`);
    });
  }
}
```

### 4. 项目清理 (clean)

```typescript
const cleanParams: LaTeXManagerParams = {
  action: 'clean',
  projectPath: './my-paper/',
};

const result = await latexManager.execute(cleanParams);

if (result.success) {
  const cleanedFiles = result.data.files;
  console.log(`清理完成，删除了 ${cleanedFiles.length} 个临时文件:`);
  cleanedFiles.forEach((file) => {
    console.log(`  - ${file.filename}`);
  });
}
```

### 5. 模板管理 (template)

```typescript
const templateParams: LaTeXManagerParams = {
  action: 'template',
};

const result = await latexManager.execute(templateParams);

if (result.success) {
  const templates = result.data.templates;

  console.log('可用模板:');
  templates.forEach((template) => {
    console.log(`\n${template.name}:`);
    console.log(`  描述: ${template.description}`);
    console.log(`  文档类型: ${template.documentType}`);
    console.log(`  特性: ${template.features.join(', ')}`);
    console.log(`  所需包: ${template.packages.join(', ')}`);
  });
}
```

### 6. 包管理 (package)

```typescript
const packageParams: LaTeXManagerParams = {
  action: 'package',
  projectPath: './my-paper/',
  documentType: DocumentType.JOURNAL_ARTICLE,
};

const result = await latexManager.execute(packageParams);

if (result.success) {
  const packageInfo = result.data.packageInfo;

  console.log(
    `已安装包 (${packageInfo.installed.length}):`,
    packageInfo.installed.join(', '),
  );

  if (packageInfo.missing.length > 0) {
    console.log(
      `缺失包 (${packageInfo.missing.length}):`,
      packageInfo.missing.join(', '),
    );
  }

  console.log(
    `推荐包 (${packageInfo.recommendations.length}):`,
    packageInfo.recommendations.join(', '),
  );
}
```

## 高级用法

### 自定义模板变量

```typescript
const customParams: LaTeXManagerParams = {
  action: 'create',
  projectName: 'custom-paper',
  documentType: DocumentType.CONFERENCE_PAPER,
  authorInfo: {
    name: 'Dr. Multi Author',
    email: 'multi@authors.edu',
    affiliation: 'Collaborative Research Center',
  },
  // 自定义包用于特殊需求
  customPackages: [
    'tikz', // 绘图
    'pgfplots', // 图表
    'algorithm2e', // 算法
    'listings', // 代码
    'siunitx', // 单位
    'subcaption', // 子图
  ],
};
```

### 项目自动化工作流

```typescript
class LaTeXProject {
  constructor(
    private manager: LaTeXManager,
    private projectPath: string,
  ) {}

  async build(): Promise<boolean> {
    // 1. 清理旧文件
    await this.manager.execute({
      action: 'clean',
      projectPath: this.projectPath,
    });

    // 2. 编译项目
    const compileResult = await this.manager.execute({
      action: 'compile',
      projectPath: this.projectPath,
      engine: LaTeXEngine.PDFLATEX,
    });

    if (!compileResult.success) {
      // 3. 如果编译失败，运行诊断
      const diagnoseResult = await this.manager.execute({
        action: 'diagnose',
        projectPath: this.projectPath,
      });

      if (diagnoseResult.success) {
        console.log('诊断结果:', diagnoseResult.data.diagnostics);
      }

      return false;
    }

    return true;
  }
}

// 使用示例
const project = new LaTeXProject(latexManager, './my-paper/');
const success = await project.build();
```

### 多引擎编译比较

```typescript
async function compareEngines(projectPath: string): Promise<void> {
  const engines = [
    LaTeXEngine.PDFLATEX,
    LaTeXEngine.XELATEX,
    LaTeXEngine.LUALATEX,
  ];

  const results = [];

  for (const engine of engines) {
    const startTime = Date.now();

    const result = await latexManager.execute({
      action: 'compile',
      projectPath,
      engine,
    });

    const duration = Date.now() - startTime;

    results.push({
      engine,
      success: result.success,
      duration,
      errors: result.success ? [] : [result.error],
    });
  }

  // 输出比较结果
  console.table(results);
}
```

## 集成工作流示例

### 与文献管理器集成

```typescript
import { BibliographyManager } from '../analysis/bibliography-manager.js';

async function createPaperWithReferences(): Promise<void> {
  const bibManager = new BibliographyManager();
  const latexManager = new LaTeXManager();

  // 1. 搜索相关文献
  const searchResult = await bibManager.execute({
    action: 'search',
    query: 'machine learning neural networks',
    databases: ['arxiv', 'ieee'],
    maxResults: 20,
  });

  // 2. 创建 LaTeX 项目
  const createResult = await latexManager.execute({
    action: 'create',
    projectName: 'ml-survey-paper',
    documentType: DocumentType.JOURNAL_ARTICLE,
    templateName: 'ieee-journal',
    includeBibliography: true,
  });

  // 3. 将搜索到的文献添加到项目
  if (searchResult.success && createResult.success) {
    const references = searchResult.data.references;
    // 这里可以将 references 写入 bibliography/references.bib 文件
    console.log(`创建项目并添加了 ${references.length} 篇参考文献`);
  }
}
```

### 自动化投稿准备

```typescript
async function prepareSubmission(
  projectPath: string,
  targetJournal: string,
): Promise<void> {
  // 1. 诊断项目
  const diagnoseResult = await latexManager.execute({
    action: 'diagnose',
    projectPath,
  });

  if (
    !diagnoseResult.success ||
    diagnoseResult.data.diagnostics.errors.length > 0
  ) {
    console.error('项目存在错误，无法准备投稿');
    return;
  }

  // 2. 编译最终版本
  const compileResult = await latexManager.execute({
    action: 'compile',
    projectPath,
    engine: LaTeXEngine.PDFLATEX,
  });

  if (!compileResult.success) {
    console.error('编译失败');
    return;
  }

  // 3. 清理项目
  await latexManager.execute({
    action: 'clean',
    projectPath,
  });

  console.log(`${targetJournal} 投稿包准备完成`);
}
```

## 错误处理和最佳实践

### 常见错误处理

```typescript
async function robustCompilation(projectPath: string): Promise<void> {
  try {
    const result = await latexManager.execute({
      action: 'compile',
      projectPath,
    });

    if (!result.success) {
      console.error('编译失败:', result.error);

      // 运行诊断获取详细信息
      const diagnoseResult = await latexManager.execute({
        action: 'diagnose',
        projectPath,
      });

      if (diagnoseResult.success) {
        const { errors, warnings, suggestions } =
          diagnoseResult.data.diagnostics;

        // 输出详细诊断信息
        if (errors.length > 0) {
          console.log('\n错误详情:');
          errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.file}:${error.line}`);
            console.log(`   ${error.message}`);
            if (error.suggestion) {
              console.log(`   建议: ${error.suggestion}`);
            }
          });
        }

        if (suggestions.length > 0) {
          console.log('\n优化建议:');
          suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('执行过程中发生异常:', error);
  }
}
```

### 项目验证

```typescript
async function validateProject(projectPath: string): Promise<boolean> {
  // 1. 检查项目结构
  const diagnoseResult = await latexManager.execute({
    action: 'diagnose',
    projectPath,
  });

  if (!diagnoseResult.success) {
    console.error('无法诊断项目');
    return false;
  }

  const { errors, warnings } = diagnoseResult.data.diagnostics;

  // 2. 检查致命错误
  const fatalErrors = errors.filter((e) => e.severity === 'fatal');
  if (fatalErrors.length > 0) {
    console.error(`发现 ${fatalErrors.length} 个致命错误`);
    return false;
  }

  // 3. 警告数量检查
  if (warnings.length > 10) {
    console.warn(`警告数量较多 (${warnings.length})，建议优化`);
  }

  // 4. 尝试编译
  const compileResult = await latexManager.execute({
    action: 'compile',
    projectPath,
  });

  return compileResult.success;
}
```

## 配置和自定义

### 创建自定义配置

```typescript
interface ProjectConfig {
  template: string;
  engine: LaTeXEngine;
  packages: string[];
  journalStyle?: string;
}

const configs: Record<string, ProjectConfig> = {
  'ieee-conference': {
    template: 'ieee-conference',
    engine: LaTeXEngine.PDFLATEX,
    packages: ['cite', 'algorithmic', 'array'],
    journalStyle: 'ieee',
  },
  'acm-journal': {
    template: 'acm-article',
    engine: LaTeXEngine.PDFLATEX,
    packages: ['booktabs', 'ccicons'],
    journalStyle: 'acm',
  },
  thesis: {
    template: 'thesis',
    engine: LaTeXEngine.XELATEX,
    packages: ['fancyhdr', 'setspace', 'tocloft', 'nomencl'],
  },
};

async function createProjectFromConfig(
  projectName: string,
  configName: string,
  authorInfo: any,
): Promise<void> {
  const config = configs[configName];
  if (!config) {
    throw new Error(`Unknown config: ${configName}`);
  }

  const result = await latexManager.execute({
    action: 'create',
    projectName,
    documentType: DocumentType.CONFERENCE_PAPER, // 根据 config 确定
    templateName: config.template,
    customPackages: config.packages,
    journalStyle: config.journalStyle,
    authorInfo,
  });

  if (result.success) {
    console.log(`项目 "${projectName}" 创建成功，使用配置 "${configName}"`);
  }
}
```

## 故障排除

### 常见问题及解决方案

1. **编译失败 - 包未找到**

   ```typescript
   // 检查包依赖
   const packageResult = await latexManager.execute({
     action: 'package',
     projectPath: './my-paper/',
   });

   // 安装缺失的包（需要系统级操作）
   ```

2. **中文支持问题**

   ```typescript
   // 使用 XeLaTeX 引擎处理中文
   const params: LaTeXManagerParams = {
     action: 'create',
     projectName: 'chinese-paper',
     documentType: DocumentType.JOURNAL_ARTICLE,
     customPackages: ['xeCJK', 'fontspec'],
   };

   // 编译时使用 XeLaTeX
   const compileParams: LaTeXManagerParams = {
     action: 'compile',
     projectPath: './chinese-paper/',
     engine: LaTeXEngine.XELATEX,
   };
   ```

3. **大型项目编译优化**
   ```typescript
   // 使用增量编译选项
   const compileParams: LaTeXManagerParams = {
     action: 'compile',
     projectPath: './large-thesis/',
     engine: LaTeXEngine.PDFLATEX,
     compileOptions: ['-interaction=nonstopmode', '-file-line-error'],
   };
   ```

## 相关工具集成

- **论文大纲生成器**: 用于生成论文结构后创建对应的 LaTeX 项目
- **文献管理器**: 与 LaTeX 项目的参考文献系统集成
- **实验代码生成器**: 生成的实验代码可以集成到 LaTeX 论文中

LaTeX 管理器是学术写作工作流中的核心工具，提供了从项目创建到最终发布的完整支持。
