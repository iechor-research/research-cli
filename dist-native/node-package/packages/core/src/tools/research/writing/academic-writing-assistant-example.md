# Academic Writing Assistant - Usage Examples

The Academic Writing Assistant provides comprehensive support for academic writing including structure analysis, grammar checking, style improvement, citation verification, readability analysis, and plagiarism detection.

## Operations

### 1. Structure Analysis

Analyzes the organizational structure of academic documents and provides suggestions for improvement.

```typescript
const params = {
  operation: 'analyze_structure',
  content: `
# Abstract
This paper investigates the relationship between X and Y.

# Introduction
The introduction provides background context...

# Methods
We used the following methodology...

# Results
The results show that...

# Conclusion
In conclusion, we found that...

# References
Smith, J. (2021). Research paper. Journal of Science.
  `,
  documentType: 'paper',
};

const result = await tool.execute(params);
```

**Output includes:**

- Section count and structure analysis
- Paragraph and sentence statistics
- Presence of required sections (abstract, introduction, conclusion, references)
- Structure score and improvement suggestions

### 2. Grammar Check

Detects and suggests corrections for various grammar issues.

```typescript
const params = {
  operation: 'check_grammar',
  content:
    'He are going to the store.Without proper spacing.this sentence starts lowercase.',
};

const result = await tool.execute(params);
```

**Detects:**

- Subject-verb agreement errors
- Punctuation issues (missing spaces, double spaces)
- Capitalization errors
- Redundant phrases
- Passive voice usage

### 3. Style Improvement

Analyzes writing style and suggests improvements for academic writing.

```typescript
const params = {
  operation: 'improve_style',
  content:
    "This research doesn't show significant results. A large number of participants were included.",
  writingStyle: 'academic',
  targetAudience: 'experts',
};

const result = await tool.execute(params);
```

**Analyzes:**

- Wordiness and verbose phrases
- Informal contractions in academic writing
- Sentence clarity and length
- Technical term usage
- Transition word usage

### 4. Citation Verification

Verifies citation format and checks for missing references.

```typescript
const params = {
  operation: 'verify_citations',
  content: `
This research builds on previous work (Smith, 2021). Another study (Jones et al., 2020) found similar results.
A third study (Brown, 2019) is also cited.

References
Smith, J. (2021). Research paper. Journal of Science.
Jones, A., Brown, B., & Davis, C. (2020). Another study. Science Journal.
  `,
  citationStyle: 'apa',
};

const result = await tool.execute(params);
```

**Supported citation styles:**

- APA
- IEEE
- MLA
- Chicago
- Harvard

**Checks:**

- Citation format compliance
- Missing references in bibliography
- Inconsistent citation styles

### 5. Readability Analysis

Calculates readability metrics and provides suggestions.

```typescript
const params = {
  operation: 'check_readability',
  content: `
This is a simple sentence. This is another simple sentence.
Here we have a more complex sentence with multiple clauses and longer words.
The text contains various sentence structures to test readability calculations.
  `,
  targetAudience: 'general_academic',
};

const result = await tool.execute(params);
```

**Metrics calculated:**

- Flesch Reading Ease Score
- Flesch-Kincaid Grade Level
- Gunning Fog Index
- Average words per sentence
- Average syllables per word
- Readability level classification

### 6. Plagiarism Detection

Performs basic plagiarism detection by identifying common phrases and potential similarities.

```typescript
const params = {
  operation: 'detect_plagiarism',
  content: `
According to the literature, this study aims to investigate the relationship between variables.
The results show that there is a significant correlation.
In conclusion, future research should continue this investigation.
  `,
};

const result = await tool.execute(params);
```

**Features:**

- Overall similarity score
- Identification of suspicious text passages
- Confidence level assessment
- Potential source identification

### 7. Comprehensive Review

Performs all analyses in a single operation for complete document review.

```typescript
const params = {
  operation: 'comprehensive_review',
  content: `
# Abstract
This is the abstract of the research paper.

# Introduction
This study don't investigate the relationship between variables. According to the literature, this is important.

# Methods
The methodology was conducted by researchers. A large number of participants were included.

# Results  
The results show significant findings (Smith, 2021). The data analysis revealed important patterns.

# Conclusion
In conclusion, this research demonstrates important findings.

# References
Smith, J. (2021). Research paper. Journal of Science.
  `,
  writingStyle: 'academic',
  documentType: 'paper',
  targetAudience: 'experts',
  citationStyle: 'apa',
  includeStatistics: true,
};

const result = await tool.execute(params);
```

**Includes all analyses:**

- Structure analysis
- Grammar checking
- Style improvements
- Citation verification
- Readability metrics
- Plagiarism detection
- Combined suggestions list

## Configuration Options

### Writing Styles

- `academic`: Formal academic writing style
- `formal`: General formal writing
- `technical`: Technical documentation style
- `scientific`: Scientific paper style

### Document Types

- `paper`: Research paper
- `thesis`: Thesis document
- `dissertation`: Dissertation
- `proposal`: Research proposal
- `review`: Literature review

### Target Audiences

- `experts`: Subject matter experts
- `general_academic`: General academic audience
- `students`: Student audience
- `practitioners`: Industry practitioners

### Citation Styles

- `apa`: APA Style
- `ieee`: IEEE Style
- `mla`: MLA Style
- `chicago`: Chicago Style
- `harvard`: Harvard Style

## Output Structure

All operations return a `WritingAssistantResult` with the following structure:

```typescript
interface WritingAssistantResult {
  success: boolean;
  data?: {
    operation: string;
    structureAnalysis?: StructureAnalysis;
    grammarCheck?: GrammarCheck[];
    styleImprovements?: StyleImprovement[];
    citationIssues?: CitationIssue[];
    readabilityMetrics?: ReadabilityMetrics;
    plagiarismCheck?: PlagiarismCheck;
    suggestions?: WritingSuggestion[];
    timestamp: string;
  };
  // Direct access fields for convenience
  operation: string;
  structureAnalysis?: StructureAnalysis;
  grammarCheck?: GrammarCheck[];
  styleImprovements?: StyleImprovement[];
  citationIssues?: CitationIssue[];
  readabilityMetrics?: ReadabilityMetrics;
  plagiarismCheck?: PlagiarismCheck;
  suggestions?: WritingSuggestion[];
}
```

## Suggestions Format

All suggestions follow a common format:

```typescript
interface WritingSuggestion {
  type:
    | 'grammar'
    | 'style'
    | 'structure'
    | 'citation'
    | 'readability'
    | 'plagiarism'
    | 'transitions'
    | 'technical_terms';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  location?: {
    start: number;
    end: number;
    line: number;
  };
}
```

## Best Practices

1. **Start with structure analysis** to ensure your document is well-organized
2. **Use comprehensive review** for final document checking
3. **Adjust target audience** based on your intended readers
4. **Specify citation style** early in the writing process
5. **Review readability** to ensure appropriate complexity for your audience
6. **Check plagiarism** before submission

## Integration Example

```typescript
import { AcademicWritingAssistant } from './academic-writing-assistant.js';

const assistant = new AcademicWritingAssistant();

// Quick grammar check
const grammarResult = await assistant.execute({
  operation: 'check_grammar',
  content: documentText,
});

// Full document review
const fullReview = await assistant.execute({
  operation: 'comprehensive_review',
  content: documentText,
  writingStyle: 'academic',
  documentType: 'paper',
  targetAudience: 'experts',
  citationStyle: 'apa',
});

// Process suggestions
if (fullReview.success && fullReview.suggestions) {
  fullReview.suggestions.forEach((suggestion) => {
    console.log(`${suggestion.severity}: ${suggestion.message}`);
    console.log(`Suggestion: ${suggestion.suggestion}`);
  });
}
```
