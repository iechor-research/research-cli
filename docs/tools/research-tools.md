# Research Tools

The Research CLI includes a comprehensive suite of academic research tools that enable researchers to streamline their workflow from literature search to paper submission. These tools are designed to support the entire research lifecycle.

## Overview

The research tools are organized into several categories:

- **[Writing Tools](#writing-tools)**: Paper outline generation, academic writing assistance, and LaTeX management
- **[Analysis Tools](#analysis-tools)**: Bibliography management, data analysis, and experiment code generation  
- **[Submission Tools](#submission-tools)**: Journal matching, submission preparation, and template extraction

## Writing Tools

### Paper Outline Generator (`generate_paper_outline`)

Generate structured outlines for academic papers with support for multiple formats and citation styles.

**Usage:**
```bash
/paper outline "Machine Learning in Healthcare" --type=research --format=ieee
```

**Parameters:**
- `topic` (string): Research topic or paper title
- `paperType` (string): Type of paper (research, review, case_study, survey, thesis)
- `citationStyle` (string): Citation format (APA, IEEE, MLA, Chicago, Nature, etc.)
- `sections` (array): Custom sections to include
- `journalStyle` (string): Specific journal formatting requirements

**Features:**
- Multiple paper types with appropriate structures
- Journal-specific templates (Nature, IEEE, ACM, etc.)
- Automatic section suggestions based on research field
- Citation style formatting
- LaTeX and Markdown output formats

### Academic Writing Assistant (`academic_writing_assistant`)

Comprehensive writing assistance for academic texts including grammar checking, style improvement, and citation verification.

**Usage:**
```bash
/research analyze paper.tex --type=grammar
```

**Operations:**
- `analyze_structure`: Analyze document organization and flow
- `check_grammar`: Grammar and syntax checking
- `improve_style`: Academic style and tone suggestions
- `verify_citations`: Citation format and completeness check
- `check_readability`: Readability analysis for target audience
- `comprehensive_review`: Complete document review

**Features:**
- Academic tone and style optimization
- Citation format verification
- Readability analysis
- Plagiarism detection integration
- Multi-language support

### LaTeX Manager (`latex_manager`)

Complete LaTeX project management with compilation, template support, and error handling.

**Usage:**
```bash
/submit latex compile --project ./my-paper --engine=pdflatex
```

**Operations:**
- `create`: Create new LaTeX project with templates
- `compile`: Compile LaTeX documents with error handling
- `template`: Manage and apply journal templates
- `diagnose`: Analyze compilation errors and suggest fixes
- `package`: Create submission-ready packages

**Features:**
- Multiple LaTeX engines (pdflatex, xelatex, lualatex)
- Journal-specific templates
- Bibliography integration
- Error diagnosis and suggestions
- Automated package management

## Analysis Tools

### Bibliography Manager (`manage_bibliography`)

Search academic databases and manage citations with BibTeX support.

**Usage:**
```bash
/research search "neural networks" --source=arxiv --limit=10
```

**Databases Supported:**
- arXiv (preprint server)
- PubMed (medical literature)
- IEEE Xplore (engineering)
- Google Scholar (general academic)
- CrossRef (DOI resolution)

**Features:**
- Multi-database search with deduplication
- BibTeX export and import
- Citation network analysis
- Automatic metadata extraction
- Full-text paper download (where available)

### Research Data Analyzer (`research_data_analyzer`)

Comprehensive data analysis tool for research datasets with statistical analysis and visualization.

**Usage:**
```bash
/research data analyze dataset.csv --type=descriptive,inferential
```

**Analysis Types:**
- `DESCRIPTIVE`: Summary statistics and data profiling
- `INFERENTIAL`: Hypothesis testing and statistical inference
- `MACHINE_LEARNING`: Clustering, classification, and regression
- `TIME_SERIES`: Temporal analysis and forecasting
- `VISUALIZATION`: Automated chart and graph generation

**Features:**
- Multiple data format support (CSV, JSON, Excel, HDF5)
- Statistical significance testing
- Machine learning model evaluation
- Interactive visualizations
- Automated report generation

### Experiment Code Generator (`generate_experiment_code`)

Generate research code templates for various programming languages and methodologies.

**Usage:**
```bash
/research experiment python machine-learning --method=classification
```

**Supported Languages:**
- Python (with scientific libraries)
- R (statistical analysis)
- MATLAB (numerical computing)
- Julia (high-performance computing)

**Research Methods:**
- Machine learning (classification, regression, clustering)
- Statistical analysis (hypothesis testing, regression)
- Numerical methods (optimization, simulation)
- Data visualization and plotting

## Submission Tools

### Journal Matcher (`match_journal`)

Find suitable journals for your research based on content analysis and journal metrics.

**Usage:**
```bash
/submit journal --topic "computer vision" --impact-factor=high
```

**Matching Criteria:**
- Research field and topic alignment
- Impact factor and citation metrics
- Open access policies
- Submission timeline and review process
- Historical acceptance rates

**Features:**
- Multi-disciplinary journal database
- Impact factor and ranking information
- Submission requirement analysis
- Timeline and deadline tracking
- Success probability estimation

### Submission Preparator (`submission_preparator`)

Prepare complete submission packages with templates and requirement checking.

**Usage:**
```bash
/submit prepare --project ./my-paper --journal "Nature"
```

**Operations:**
- `init`: Initialize project from journal template
- `template`: Search and fetch journal templates
- `extract`: Extract templates from arXiv papers
- `validate`: Check submission requirements
- `prepare`: Create submission package
- `package`: Generate final submission archive

**Features:**
- Journal-specific template extraction
- Requirement validation and checklist
- Automated file organization
- Supplementary material handling
- Submission timeline management

## Integration with External Services

### arXiv Integration

Direct integration with arXiv for paper search, download, and template extraction.

**Features:**
- Real-time paper search
- Full-text paper download
- Template extraction from papers
- Citation network analysis
- Automatic metadata extraction

### MCP Server Support

The research tools support Model Context Protocol (MCP) servers for extended functionality:

- **arXiv MCP Server**: Enhanced arXiv integration
- **Zotero MCP Server**: Bibliography management
- **Overleaf MCP Server**: Online LaTeX editing
- **Custom Research Servers**: Domain-specific tools

## Configuration

Research tools can be configured through the `settings.json` file:

```json
{
  "research": {
    "defaultCitationStyle": "IEEE",
    "preferredJournals": ["Nature", "Science", "Cell"],
    "dataAnalysisEngine": "python",
    "latexEngine": "pdflatex",
    "bibliographyManager": "bibtex",
    "externalAPIs": {
      "arxiv": { "enabled": true },
      "pubmed": { "enabled": true, "apiKey": "..." },
      "ieee": { "enabled": true, "apiKey": "..." }
    }
  }
}
```

## Best Practices

### Research Workflow

1. **Literature Review**: Start with `/research search` to find relevant papers
2. **Project Setup**: Use `/paper outline` to structure your research
3. **Data Analysis**: Employ `/research data` for statistical analysis
4. **Writing**: Utilize `/research analyze` for writing assistance
5. **Submission**: Apply `/submit prepare` for journal submission

### Tool Integration

- Use bibliography manager early to collect relevant papers
- Generate code templates before starting experiments
- Regularly analyze writing quality during drafting
- Validate submission requirements before final preparation

### Performance Tips

- Cache frequently accessed papers locally
- Use batch operations for large datasets
- Configure external API keys for enhanced functionality
- Regular cleanup of temporary files and caches

## Troubleshooting

### Common Issues

- **API Rate Limits**: Configure API keys for higher limits
- **LaTeX Compilation Errors**: Use diagnostic tools for error analysis
- **Large Dataset Processing**: Enable streaming for memory efficiency
- **Template Compatibility**: Validate templates before use

### Support Resources

- Check the [troubleshooting guide](../troubleshooting.md)
- Review tool-specific documentation
- Report issues on the project GitHub repository
- Join the research community discussions

## Future Enhancements

The research tools are continuously evolving with planned additions:

- Enhanced AI-powered writing assistance
- More database integrations (Scopus, Web of Science)
- Collaborative research features
- Advanced visualization capabilities
- Integration with research management platforms 