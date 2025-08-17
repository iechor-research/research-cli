#!/usr/bin/env node

/**
 * 百度文心一言 LaTeX 功能演示
 * 展示基于文心一言的 LaTeX 智能写作系统
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BaiduLatexDemo {
  constructor() {
    this.apiKey = process.env.BAIDU_LLM_KEY || 'bce-v3/ALTAK-FllppbBEOUIKBsGvRHIul/df1f20e0216ca5ec4408085dfe20fc72a6f49ad1';
    this.apiEndpoint = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
    this.demoDir = path.join(__dirname, 'baidu_latex_demo');
  }

  async setup() {
    console.log('🚀 百度文心一言 LaTeX 演示');
    console.log('='.repeat(50));
    
    await fs.mkdir(this.demoDir, { recursive: true });
    console.log(`📁 演示目录: ${this.demoDir}`);
  }

  async generateLatexContent(prompt) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `请使用 LaTeX 格式生成一篇关于 ${prompt} 的学术论文。要求使用 ctex 宏包支持中文，包含数学公式、图表和参考文献。`
            }
          ],
          temperature: 0.7,
          top_p: 0.8,
          system: '你是一个专业的 LaTeX 学术论文生成助手，擅长使用 XeLaTeX 和 ctex 宏包生成高质量的中文学术文档。'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result || '';
    } catch (error) {
      console.error('❌ 文心一言 API 调用失败:', error.message);
      return null;
    }
  }

  async createLatexProject(topic) {
    console.log(`\n📄 创建百度文心一言 LaTeX 项目: ${topic}`);
    console.log('-'.repeat(40));
    
    const projectName = topic.toLowerCase().replace(/\s+/g, '-');
    const projectPath = path.join(this.demoDir, projectName);
    
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, 'sections'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'figures'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'bibliography'), { recursive: true });
    
    // 生成 LaTeX 内容
    const latexContent = await this.generateLatexContent(topic);
    
    if (!latexContent) {
      console.log('❌ 无法生成 LaTeX 内容');
      return null;
    }
    
    // 创建主文档
    const mainTexPath = path.join(projectPath, 'main.tex');
    await fs.writeFile(mainTexPath, latexContent);
    
    // 创建 Makefile
    const makefilePath = path.join(projectPath, 'Makefile');
    const makefile = `# 百度文心一言 LaTeX Makefile
LATEX = xelatex
BIBTEX = bibtex
TARGET = main
BUILDDIR = build

.PHONY: all clean pdf view

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
\t@find . -name "*.out" -type f -delete`;
    
    await fs.writeFile(makefilePath, makefile);
    
    // 创建 README
    const readmePath = path.join(projectPath, 'README.md');
    const readme = `# 百度文心一言 LaTeX 项目: ${topic}

## 项目描述

本项目由百度文心一言 AI 智能生成，主题为：${topic}

### 🤖 AI 生成特色
- 使用文心一言 API
- 中文学术写作优化
- 智能内容生成
- ERNIE 知识增强

### 📋 项目结构
\`\`\`
${projectName}/
├── main.tex          # 主文档
├── Makefile          # 编译脚本
├── sections/         # 章节目录
├── figures/          # 图片目录
└── bibliography/     # 参考文献目录
\`\`\`

### 🚀 编译说明
\`\`\`bash
# 编译 PDF
make pdf

# 查看 PDF
make view

# 清理临时文件
make clean
\`\`\`

---
🤖 由百度文心一言生成 | ${new Date().toLocaleString()}`;
    
    await fs.writeFile(readmePath, readme);
    
    console.log(`✅ 项目创建成功: ${projectPath}`);
    return projectPath;
  }

  async runDemo() {
    try {
      await this.setup();
      
      // 演示不同主题的 LaTeX 项目生成
      const topics = [
        '人工智能在学术写作中的应用',
        '大语言模型的技术创新',
        '中文学术论文写作的 AI 辅助',
        '深度学习在自然语言处理中的进展'
      ];
      
      for (const topic of topics) {
        await this.createLatexProject(topic);
      }
      
      console.log('\n🎉 百度文心一言 LaTeX 演示完成！');
      console.log('='.repeat(50));
      console.log('\n📁 演示项目位置:');
      console.log(`   ${this.demoDir}`);
      console.log('\n🚀 下一步建议:');
      console.log('   1. 进入项目目录');
      console.log('   2. 运行 make pdf 编译文档');
      console.log('   3. 使用 make view 查看结果');
      console.log('   4. 体验文心一言的 AI 生成功能');
      
    } catch (error) {
      console.error('❌ 演示过程中发生错误:', error);
    }
  }
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new BaiduLatexDemo();
  demo.runDemo().catch(console.error);
}

export default BaiduLatexDemo;
