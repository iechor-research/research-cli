# Literature Investigation Tool

## Overview

The Literature Investigation tool is a comprehensive research feature for research-cli that performs serious academic literature research through keyword-driven search, relevance scoring, temporal analysis, and research gap identification. It goes beyond simple search to provide deep insights into research domains.

## Features

### 🔍 Keyword-Driven Search
- **Intelligent Keyword Generation**: Automatically generates 5-10 keyword sequences tailored to your research topic
- **Multi-Perspective Analysis**: Creates sequences from theoretical, empirical, methodological, applied, and review perspectives  
- **Domain-Aware**: Uses specialized knowledge bases for different research domains
- **Interactive Selection**: Choose from generated keyword sequences or let the system select optimal ones

### 📊 Comprehensive Scoring
- **Relevance Scoring**: Advanced keyword matching with title/abstract weighting
- **Temporal Analysis**: Time-based relevance with configurable timeframes
- **Citation Impact**: Citation-per-year analysis with logarithmic scaling
- **Overall Scoring**: Weighted combination of all metrics

### 🏷️ Intelligent Classification
- **Research Type**: Theoretical, empirical, methodological, applied, review, meta-analysis
- **Methodology**: Quantitative, qualitative, experimental, computational, observational
- **Evidence Level**: Medical research hierarchy adapted for all domains
- **Impact Level**: Foundational, high-impact, moderate, emerging, niche
- **Temporal Category**: Historical, established, recent, cutting-edge

### 📈 Advanced Analytics
- **Trend Analysis**: Identify emerging research directions
- **Gap Analysis**: Discover underexplored areas
- **Author Networks**: Key researchers and collaboration patterns
- **Methodology Trends**: Evolution of research approaches
- **Domain Clustering**: Automatic grouping by research area

## Usage

### Basic Investigation

```bash
/research investigate topic "machine learning in healthcare" --domain=artificial_intelligence --max-papers=50
```

### Advanced Investigation with Options

```bash
/research investigate topic "quantum computing applications" \
  --domain=physics \
  --max-papers=80 \
  --timeframe=2020-2024 \
  --methodology=experimental,computational \
  --context=quantum_algorithms,quantum_hardware \
  --databases=arxiv,ieee \
  --interactive=true
```

### Keyword Generation Only

```bash
/research investigate keywords "deep learning for medical diagnosis" \
  --domain=machine_learning \
  --description="Application of deep neural networks in medical image analysis" \
  --count=8
```

### Classification of Existing Papers

```bash
/research investigate classify --source=recent --format=detailed --categories=methodology,impact
```

### Trend Analysis

```bash
/research investigate trends "natural language processing" \
  --domain=artificial_intelligence \
  --timeframe=2020-2024 \
  --type=comprehensive
```

## Command Options

### Topic Investigation Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--domain` | Research domain (required) | - | `--domain=machine_learning` |
| `--max-papers` | Maximum papers to investigate | 80 | `--max-papers=100` |
| `--timeframe` | Publication timeframe | - | `--timeframe=2020-2024` |
| `--methodology` | Preferred methodologies | - | `--methodology=quantitative,experimental` |
| `--context` | Research context terms | - | `--context=clinical,healthcare` |
| `--databases` | Databases to search | `arxiv,scholar,pubmed` | `--databases=arxiv,ieee` |
| `--interactive` | Enable interactive mode | `true` | `--interactive=false` |

### Supported Domains

- `computer_science` - General computer science research
- `machine_learning` - ML algorithms, models, applications
- `artificial_intelligence` - AI systems, cognitive computing
- `biology` - Molecular biology, genetics, ecology
- `medicine` - Clinical research, medical treatments
- `biomedical` - Biomedical engineering, medical devices
- `physics` - Theoretical and experimental physics
- `chemistry` - Organic, inorganic, biochemistry
- `psychology` - Cognitive, behavioral psychology
- `sociology` - Social theory, network analysis
- `economics` - Economic theory, econometrics

### Supported Databases

- `arxiv` - ArXiv preprint server
- `scholar` - Google Scholar
- `pubmed` - PubMed medical database
- `ieee` - IEEE Xplore digital library

## Output Formats

### Interactive Results
- Comprehensive markdown report with analysis
- Categorized paper listings
- Research trend identification
- Gap analysis with recommendations

### Export Formats
- **Markdown**: Detailed investigation report
- **BibTeX**: Citation database format
- **RIS**: Reference manager format
- **CSV**: Spreadsheet-compatible data

## Research Workflow

### 1. Topic Definition
Define your research question with:
- Clear topic title
- Research domain
- Optional: timeframe, methodology, context

### 2. Keyword Generation
System generates multiple keyword sequences:
- Theoretical perspective (foundational concepts)
- Empirical perspective (experimental studies)
- Methodological perspective (research methods)
- Applied perspective (practical applications)
- Review perspective (literature reviews)

### 3. Interactive Selection
Choose keyword sequences or let system auto-select based on:
- Coverage of topic terms
- Keyword diversity
- Domain relevance
- Research category balance

### 4. Literature Search
Parallel search across selected databases:
- Query optimization for each database
- Deduplication across sources
- Result ranking by relevance

### 5. Comprehensive Analysis
Each paper analyzed for:
- Relevance to keyword sequences
- Temporal significance
- Citation impact
- Research classification
- Key findings extraction

### 6. Results Synthesis
Generate comprehensive report with:
- Top relevant papers
- Classification summaries
- Trend analysis
- Gap identification
- Research recommendations

## Advanced Features

### Domain Knowledge Integration
- Specialized keyword databases per domain
- Domain-specific classification rules
- Methodology mapping by field
- Citation norms by discipline

### Machine Learning Enhancements
- Semantic similarity matching
- Automatic synonym detection
- Relevance score optimization
- Trend prediction algorithms

### Research Gap Detection
- Methodology gap analysis
- Temporal gap identification
- Geographic/demographic gaps
- Interdisciplinary opportunities

## Best Practices

### Topic Formulation
- Use specific, focused research questions
- Include key concepts in the title
- Specify domain accurately
- Consider timeframe relevance

### Keyword Strategy
- Review generated sequences carefully
- Select diverse perspectives
- Balance broad and specific terms
- Consider domain terminology

### Result Interpretation
- Focus on high-relevance papers first
- Review classification distributions
- Examine trend patterns
- Consider gap analysis recommendations

### Follow-up Research
- Export results for reference management
- Use identified gaps for future research
- Follow citation networks
- Monitor trend developments

## Integration with Research Workflow

### Literature Review Process
1. **Scoping**: Use investigate to map the field
2. **Systematic Search**: Apply optimized keywords
3. **Screening**: Use classification for filtering
4. **Analysis**: Leverage trend and gap analysis
5. **Synthesis**: Export structured references

### Research Proposal Development
1. **Background Research**: Comprehensive investigation
2. **Gap Identification**: Systematic gap analysis
3. **Methodology Selection**: Review methodology trends
4. **Novelty Assessment**: Compare with existing work
5. **Impact Prediction**: Analyze citation patterns

### Ongoing Research Monitoring
1. **Trend Tracking**: Regular trend analysis
2. **Competitive Analysis**: Monitor key authors
3. **Method Evolution**: Track methodology changes
4. **Impact Assessment**: Citation analysis
5. **Opportunity Detection**: Gap monitoring

## Troubleshooting

### Common Issues

**Low Relevance Scores**
- Refine topic description
- Adjust domain selection
- Modify keyword sequences
- Expand search timeframe

**Limited Results**
- Broaden keyword terms
- Include more databases
- Extend timeframe
- Consider related domains

**Classification Errors**
- Review paper abstracts
- Check domain assignment
- Validate methodology tags
- Report systematic issues

### Performance Optimization

**Large Result Sets**
- Reduce max-papers limit
- Focus timeframe
- Select specific databases
- Use interactive filtering

**Slow Processing**
- Limit concurrent searches
- Cache frequent queries
- Use incremental processing
- Monitor API limits

## Future Enhancements

### Planned Features
- Real-time collaboration networks
- Automated literature review generation
- Citation prediction models
- Cross-lingual research support
- Visual research mapping

### Integration Roadmap
- Reference manager sync
- Academic writing assistant
- Peer review automation
- Grant proposal support
- Research impact tracking

## Support and Feedback

For issues, suggestions, or feature requests related to the Literature Investigation tool, please:

1. Check existing documentation
2. Review troubleshooting guide
3. Submit detailed bug reports
4. Suggest improvements
5. Share usage examples

The Literature Investigation tool represents a significant advancement in automated literature research, providing researchers with powerful capabilities for comprehensive, systematic, and insightful academic investigation.
