#!/usr/bin/env node

/**
 * Qianwen LaTeX 功能演示
 * 展示 research-cli 中 LaTeX 相关功能在 Qianwen 模式下的使用
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QianwenLatexDemo {
  constructor() {
    this.demoDir = path.join(__dirname, 'qianwen_latex_demo');
  }

  async setup() {
    console.log('🚀 Qianwen LaTeX 功能演示');
    console.log('='.repeat(50));
    
    await fs.mkdir(this.demoDir, { recursive: true });
    console.log(`📁 演示目录: ${this.demoDir}`);
  }

  async cleanup() {
    await fs.rm(this.demoDir, { recursive: true, force: true });
  }

  async demonstrateLatexCore() {
    console.log('\n📦 LaTeX 核心功能演示');
    console.log('-'.repeat(30));
    
    try {
      // 尝试导入实际的 LaTeX 管理器
      const { LaTeXManager } = await import('../packages/core/dist/src/tools/research/submission/latex-manager.js');
      const { DocumentType, LaTeXEngine } = await import('../packages/core/dist/src/tools/research/types.js');
      
      console.log('✅ 成功导入 LaTeX 管理器');
      console.log('📋 可用文档类型:', Object.keys(DocumentType).slice(0, 5).join(', '), '...');
      console.log('🔧 可用引擎:', Object.keys(LaTeXEngine).join(', '));
      
      const manager = new LaTeXManager();
      console.log('✅ LaTeX 管理器实例创建成功');
      
      // 获取模板列表
      const templateResult = await manager.execute({ action: 'template' });
      if (templateResult.success) {
        console.log(`📋 发现 ${templateResult.data.templates.length} 个模板:`);
        templateResult.data.templates.slice(0, 3).forEach(template => {
          console.log(`  - ${template.name}: ${template.description}`);
        });
      }
      
      return { manager, DocumentType, LaTeXEngine, isReal: true };
      
    } catch (error) {
      console.log('⚠️  使用模拟 LaTeX 管理器进行演示');
      return this.createMockManager();
    }
  }

  createMockManager() {
    const DocumentType = {
      JOURNAL_ARTICLE: 'JOURNAL_ARTICLE',
      CONFERENCE_PAPER: 'CONFERENCE_PAPER',
      THESIS: 'THESIS'
    };
    
    const LaTeXEngine = {
      PDFLATEX: 'PDFLATEX',
      XELATEX: 'XELATEX',
      LUALATEX: 'LUALATEX'
    };
    
    const manager = {
      async execute(params) {
        switch (params.action) {
          case 'template':
            return {
              success: true,
              data: {
                templates: [
                  { name: 'qianwen-paper', description: 'Qianwen AI 论文模板' },
                  { name: 'ieee-conference', description: 'IEEE 会议论文模板' },
                  { name: 'thesis-chinese', description: '中文学位论文模板' }
                ]
              }
            };
          case 'create':
            return { success: true, data: { projectPath: params.projectPath } };
          default:
            return { success: true, data: {} };
        }
      }
    };
    
    return { manager, DocumentType, LaTeXEngine, isReal: false };
  }

  async createQianwenLatexProject() {
    console.log('\n📄 创建 Qianwen LaTeX 项目');
    console.log('-'.repeat(30));
    
    const projectName = 'qianwen-ai-paper';
    const projectPath = path.join(this.demoDir, projectName);
    
    // 创建项目结构
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, 'sections'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'figures'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'bibliography'), { recursive: true });
    
    // 创建主文档
    const mainTex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[UTF8]{ctex}
\\usepackage{amsmath,amssymb,amsthm}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{geometry}
\\usepackage{xcolor}
\\usepackage{tikz}

% 页面设置
\\geometry{margin=2.5cm}
\\hypersetup{colorlinks=true, linkcolor=blue, citecolor=red}

% 自定义命令
\\newcommand{\\qianwen}{\\textcolor{blue}{\\textbf{Qianwen}}}

\\title{\\qianwen\\ 模式下的 LaTeX 学术写作}
\\author{
    Qianwen AI 研究团队 \\\\
    \\texttt{research@qianwen.ai}
}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
本文演示了在 \\qianwen\\ 模式下进行 LaTeX 学术写作的完整流程。我们展示了如何使用 research-cli 工具创建、管理和编译 LaTeX 项目，特别关注中文学术写作的需求和最佳实践。
\\end{abstract}

\\tableofcontents

\\section{引言}

\\qianwen\\ 是一个强大的大语言模型，在学术写作和 LaTeX 文档处理方面具有独特优势。本文档展示了如何充分利用这些功能。

\\subsection{主要特性}

\\begin{itemize}
    \\item 中英文混合排版支持
    \\item 智能模板选择和自定义
    \\item 自动化编译和错误诊断
    \\item 数学公式智能处理
\\end{itemize}

\\section{数学公式示例}

\\subsection{基础公式}

爱因斯坦质能方程：
\\begin{equation}
    E = mc^2
    \\label{eq:einstein}
\\end{equation}

\\subsection{复杂数学表达式}

机器学习中的损失函数：
\\begin{align}
    \\mathcal{L}(\\theta) &= \\frac{1}{n} \\sum_{i=1}^{n} \\ell(f_\\theta(x_i), y_i) \\\\
    &= \\frac{1}{n} \\sum_{i=1}^{n} -\\log p(y_i | x_i; \\theta)
\\end{align}

注意力机制计算：
\\begin{equation}
    \\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V
\\end{equation}

\\section{图表支持}

\\subsection{简单图形}

\\begin{figure}[h]
\\centering
\\begin{tikzpicture}
    \\draw[->] (0,0) -- (4,0) node[right] {$x$};
    \\draw[->] (0,0) -- (0,3) node[above] {$y$};
    \\draw[domain=0:3.5, smooth, variable=\\x, blue, thick] 
        plot ({\\x}, {\\x*\\x/4});
    \\node at (2, 2.5) {$y = \\frac{x^2}{4}$};
\\end{tikzpicture}
\\caption{\\qianwen\\ 生成的数学函数图像}
\\label{fig:parabola}
\\end{figure}

\\section{代码展示}

\\qianwen\\ 支持代码块的智能格式化：

\\begin{verbatim}
def qianwen_latex_demo():
    """Qianwen LaTeX 演示函数"""
    print("欢迎使用 Qianwen 模式！")
    return "LaTeX 项目创建成功"
\\end{verbatim}

\\section{表格示例}

\\begin{table}[h]
\\centering
\\begin{tabular}{|c|c|c|}
\\hline
\\textbf{功能} & \\textbf{支持程度} & \\textbf{备注} \\\\
\\hline
中文排版 & 完全支持 & 使用 ctex 宏包 \\\\
数学公式 & 完全支持 & amsmath 增强 \\\\
图片插入 & 完全支持 & graphicx 宏包 \\\\
参考文献 & 完全支持 & BibTeX 集成 \\\\
\\hline
\\end{tabular}
\\caption{\\qianwen\\ LaTeX 功能支持情况}
\\label{tab:features}
\\end{table}

\\section{最佳实践}

\\subsection{中文学术写作建议}

\\begin{enumerate}
    \\item 使用 \\texttt{xelatex} 编译器处理中文字体
    \\item 合理设置页面边距和行距
    \\item 使用语义化的章节结构
    \\item 保持数学符号的一致性
\\end{enumerate}

\\subsection{\\qianwen\\ 模式优势}

\\begin{itemize}
    \\item 智能错误检测和修复建议
    \\item 自动化的格式优化
    \\item 上下文感知的内容生成
    \\item 多语言混排支持
\\end{itemize}

\\section{结论}

本文展示了 \\qianwen\\ 模式在 LaTeX 学术写作中的强大功能。通过 research-cli 工具，用户可以：

\\begin{itemize}
    \\item 快速创建专业的学术文档
    \\item 享受智能化的编译和诊断服务
    \\item 获得中英文混合排版的完美支持
    \\item 利用 AI 辅助进行内容创作和格式优化
\\end{itemize}

未来，我们将继续改进 \\qianwen\\ 的 LaTeX 支持，为学术研究者提供更加便捷和强大的写作工具。

\\section*{致谢}

感谢 \\qianwen\\ 团队在自然语言处理和文档生成方面的杰出贡献。

% 参考文献
\\begin{thebibliography}{9}
\\bibitem{latex}
Leslie Lamport. \\textit{LaTeX: A Document Preparation System}. Addison-Wesley, 1994.

\\bibitem{qianwen}
Qianwen Team. \\textit{Qianwen: A Large Language Model for Academic Writing}. arXiv preprint, 2024.

\\bibitem{ctex}
ctex-kit Team. \\textit{ctex: LaTeX Classes and Packages for Chinese Typesetting}. CTAN, 2023.
\\end{thebibliography}

\\end{document}`;

    await fs.writeFile(path.join(projectPath, 'main.tex'), mainTex);
    console.log('✅ 主文档 main.tex 创建完成');

    // 创建 Makefile
    const makefile = `# Qianwen LaTeX Makefile
LATEX = xelatex
BIBTEX = bibtex
TARGET = main
BUILDDIR = build

.PHONY: all clean pdf view help

all: pdf

pdf: \$(BUILDDIR)/\$(TARGET).pdf

\$(BUILDDIR)/\$(TARGET).pdf: \$(TARGET).tex
\t@mkdir -p \$(BUILDDIR)
\t\$(LATEX) -output-directory=\$(BUILDDIR) \$(TARGET).tex
\t@if grep -q "\\\\bibliography" \$(TARGET).tex; then \\
\t\t\$(BIBTEX) \$(BUILDDIR)/\$(TARGET); \\
\t\t\$(LATEX) -output-directory=\$(BUILDDIR) \$(TARGET).tex; \\
\tfi
\t\$(LATEX) -output-directory=\$(BUILDDIR) \$(TARGET).tex

view: \$(BUILDDIR)/\$(TARGET).pdf
\t@if command -v open >/dev/null 2>&1; then \\
\t\topen \$(BUILDDIR)/\$(TARGET).pdf; \\
\telif command -v xdg-open >/dev/null 2>&1; then \\
\t\txdg-open \$(BUILDDIR)/\$(TARGET).pdf; \\
\tfi

clean:
\t@rm -rf \$(BUILDDIR)
\t@find . -name "*.aux" -type f -delete
\t@find . -name "*.log" -type f -delete
\t@find . -name "*.bbl" -type f -delete
\t@find . -name "*.blg" -type f -delete
\t@find . -name "*.toc" -type f -delete
\t@find . -name "*.out" -type f -delete

help:
\t@echo "Qianwen LaTeX Makefile"
\t@echo "Available targets:"
\t@echo "  pdf    - Build PDF using XeLaTeX (default)"
\t@echo "  view   - Build and open PDF"
\t@echo "  clean  - Remove build files"
\t@echo "  help   - Show this help"
\t@echo ""
\t@echo "Note: Uses XeLaTeX for better Chinese support"`;

    await fs.writeFile(path.join(projectPath, 'Makefile'), makefile);
    console.log('✅ Makefile 创建完成');

    // 创建 README
    const readme = `# Qianwen LaTeX 项目演示

这是一个展示 Qianwen 模式下 LaTeX 功能的演示项目。

## 项目结构

\`\`\`
qianwen-ai-paper/
├── main.tex          # 主文档
├── Makefile          # 构建脚本
├── sections/         # 章节目录
├── figures/          # 图片目录
└── bibliography/     # 参考文献目录
\`\`\`

## 编译说明

### 使用 Makefile (推荐)

\`\`\`bash
# 编译 PDF
make pdf

# 编译并打开 PDF
make view

# 清理临时文件
make clean
\`\`\`

### 手动编译

\`\`\`bash
# 使用 XeLaTeX (推荐，支持中文)
xelatex main.tex

# 或使用 PDFLaTeX
pdflatex main.tex
\`\`\`

## 特性

- ✅ 中英文混合排版
- ✅ 数学公式支持
- ✅ 图表和代码展示
- ✅ 自动化构建
- ✅ Qianwen AI 优化

## 依赖

确保系统已安装以下 LaTeX 包：
- ctex (中文支持)
- amsmath (数学公式)
- tikz (绘图)
- hyperref (超链接)

## 使用建议

1. 使用 XeLaTeX 编译器获得最佳中文支持
2. 定期清理临时文件
3. 使用语义化的文件结构
4. 充分利用 Qianwen 的智能建议

---
由 Qianwen AI 生成 | $(date)`;

    await fs.writeFile(path.join(projectPath, 'README.md'), readme);
    console.log('✅ README.md 创建完成');

    console.log(`\n📁 项目创建完成: ${projectPath}`);
    console.log('📄 包含文件:');
    const files = await fs.readdir(projectPath);
    files.forEach(file => console.log(`  - ${file}`));

    return projectPath;
  }

  async demonstrateCompilation(projectPath) {
    console.log('\n🔨 LaTeX 编译演示');
    console.log('-'.repeat(30));

    console.log('📋 编译选项:');
    console.log('  1. XeLaTeX (推荐，支持中文)');
    console.log('  2. PDFLaTeX (标准编译器)');
    console.log('  3. LuaLaTeX (现代编译器)');

    console.log('\n🚀 模拟编译过程...');
    console.log('  ✅ 解析文档结构');
    console.log('  ✅ 处理中文字体');
    console.log('  ✅ 渲染数学公式');
    console.log('  ✅ 生成图表');
    console.log('  ✅ 创建目录和交叉引用');
    console.log('  ✅ 编译完成');

    console.log('\n📊 编译统计:');
    console.log('  - 页数: 6 页');
    console.log('  - 章节: 7 个');
    console.log('  - 公式: 4 个');
    console.log('  - 图表: 2 个');
    console.log('  - 编译时间: 2.3 秒');
  }

  async demonstrateDiagnostics() {
    console.log('\n🔍 LaTeX 诊断演示');
    console.log('-'.repeat(30));

    console.log('📋 智能诊断功能:');
    console.log('  ✅ 语法错误检测');
    console.log('  ✅ 包依赖分析');
    console.log('  ✅ 中文编码检查');
    console.log('  ✅ 数学公式验证');
    console.log('  ✅ 引用完整性检查');

    console.log('\n🔧 Qianwen 增强诊断:');
    console.log('  - 智能错误修复建议');
    console.log('  - 性能优化提示');
    console.log('  - 排版美化建议');
    console.log('  - 学术规范检查');

    console.log('\n💡 诊断结果示例:');
    console.log('  ✅ 无语法错误');
    console.log('  ⚠️  建议: 使用 geometry 包优化页面布局');
    console.log('  💡 提示: 可以添加 cleveref 包改善引用格式');
    console.log('  🎯 优化: 数学公式可以使用 \\operatorname 改善显示');
  }

  async showQianwenFeatures() {
    console.log('\n🤖 Qianwen 模式特色功能');
    console.log('-'.repeat(30));

    console.log('📝 智能写作辅助:');
    console.log('  • 上下文感知的内容生成');
    console.log('  • 学术语言风格优化');
    console.log('  • 中英文表达润色');
    console.log('  • 逻辑结构建议');

    console.log('\n🔧 技术增强:');
    console.log('  • 自动错误修复');
    console.log('  • 智能包管理');
    console.log('  • 格式标准化');
    console.log('  • 编译优化');

    console.log('\n🌏 多语言支持:');
    console.log('  • 中文排版优化');
    console.log('  • 英文学术规范');
    console.log('  • 混合语言处理');
    console.log('  • 字体智能选择');

    console.log('\n📊 质量保证:');
    console.log('  • 学术规范检查');
    console.log('  • 引用格式验证');
    console.log('  • 图表质量评估');
    console.log('  • 整体美观度分析');
  }

  async runDemo() {
    try {
      await this.setup();
      
      // 核心功能演示
      const latexComponents = await this.demonstrateLatexCore();
      
      // 创建项目演示
      const projectPath = await this.createQianwenLatexProject();
      
      // 编译演示
      await this.demonstrateCompilation(projectPath);
      
      // 诊断演示
      await this.demonstrateDiagnostics();
      
      // Qianwen 特色功能
      await this.showQianwenFeatures();
      
      console.log('\n🎉 Qianwen LaTeX 功能演示完成！');
      console.log('='.repeat(50));
      console.log('\n📁 演示项目位置:');
      console.log(`   ${projectPath}`);
      console.log('\n🚀 下一步建议:');
      console.log('   1. 进入项目目录');
      console.log('   2. 运行 make pdf 编译文档');
      console.log('   3. 使用 make view 查看结果');
      console.log('   4. 体验 Qianwen 的智能功能');
      
    } catch (error) {
      console.error('❌ 演示过程中发生错误:', error);
    }
  }
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new QianwenLatexDemo();
  demo.runDemo().catch(console.error);
}

export default QianwenLatexDemo;
