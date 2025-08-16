# Qianwen LaTeX 项目演示

这是一个展示 Qianwen 模式下 LaTeX 功能的演示项目。

## 项目结构

```
qianwen-ai-paper/
├── main.tex          # 主文档
├── Makefile          # 构建脚本
├── sections/         # 章节目录
├── figures/          # 图片目录
└── bibliography/     # 参考文献目录
```

## 编译说明

### 使用 Makefile (推荐)

```bash
# 编译 PDF
make pdf

# 编译并打开 PDF
make view

# 清理临时文件
make clean
```

### 手动编译

```bash
# 使用 XeLaTeX (推荐，支持中文)
xelatex main.tex

# 或使用 PDFLaTeX
pdflatex main.tex
```

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
由 Qianwen AI 生成 | $(date)