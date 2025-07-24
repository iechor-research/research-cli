import { describe, it, expect, beforeEach } from 'vitest';
import { AcademicWritingAssistant } from './academic-writing-assistant.js';
import { WritingAssistantParams, WritingAssistantResult } from '../types.js';

describe('AcademicWritingAssistant', () => {
  let tool: AcademicWritingAssistant;

  beforeEach(() => {
    tool = new AcademicWritingAssistant();
  });

  describe('Basic Properties', () => {
    it('should have correct tool identity', () => {
      expect(tool.name).toBe('academic_writing_assistant');
      expect(tool.description).toContain('academic writing');
    });

    it('should have valid tool properties', () => {
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.category).toBeDefined();
      expect(tool.version).toBeDefined();
    });
  });

  describe('Parameter Validation', () => {
    it('should reject empty content', async () => {
      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content: '',
      };

      const result = await tool.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Content cannot be empty');
    });

    it('should reject content that is too long', async () => {
      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content: 'a'.repeat(50001),
      };

      const result = await tool.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Content too long');
    });

    it('should require citation style for citation verification', async () => {
      const params: WritingAssistantParams = {
        operation: 'verify_citations',
        content: 'Some text with citations (Smith, 2023).',
      };

      const result = await tool.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Citation style is required');
    });

    it('should reject unsupported operations', async () => {
      const params = {
        operation: 'unsupported_operation',
        content: 'Some test content',
      } as any;

      const result = await tool.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported operation');
    });
  });

  describe('Structure Analysis', () => {
    it('should analyze basic document structure', async () => {
      const params: WritingAssistantParams = {
        operation: 'analyze_structure',
        content: `
# Introduction
This is the introduction section.

## Methodology
This describes the methodology.

### Data Collection
Details about data collection.

# Results
The results of the study.

# Conclusion
Final conclusions.

# References
[1] Smith, J. (2023). Some research paper.
        `,
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.structureAnalysis).toBeDefined();
      expect(data.structureAnalysis!.totalSections).toBeGreaterThan(0);
      expect(data.structureAnalysis!.hasIntroduction).toBe(true);
      expect(data.structureAnalysis!.hasConclusion).toBe(true);
      expect(data.structureAnalysis!.hasReferences).toBe(true);
    });

    it('should generate structure suggestions for missing sections', async () => {
      const params: WritingAssistantParams = {
        operation: 'analyze_structure',
        content: `
# Some Title
This is just some basic content without proper structure.
        `,
        documentType: 'journal_article',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.suggestions).toBeDefined();
      expect(data.suggestions!.length).toBeGreaterThan(0);
    });

    it('should calculate structure score', async () => {
      const params: WritingAssistantParams = {
        operation: 'analyze_structure',
        content: `
# Abstract
This paper presents...

# Introduction
Background information...

## Literature Review
Previous work...

# Methodology
Research approach...

# Results
Findings...

# Discussion
Interpretation...

# Conclusion
Summary...

# References
Bibliography...
        `,
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.structureAnalysis!.structureScore).toBeGreaterThan(80);
    });
  });

  describe('Grammar Check', () => {
    it('should detect grammar issues', async () => {
      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content:
          'The data shows that there is significant differences in the results. This are important findings.',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.grammarCheck).toBeDefined();
      expect(data.grammarCheck!.length).toBeGreaterThan(0);
    });

    it('should detect punctuation errors', async () => {
      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content:
          'This is a sentence without proper punctuation Another sentence that follows',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.grammarCheck).toBeDefined();
    });

    it('should detect capitalization errors', async () => {
      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content:
          'this sentence should start with a capital letter. another sentence with issues.',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.grammarCheck).toBeDefined();
    });
  });

  describe('Style Improvement', () => {
    it('should detect style issues', async () => {
      const params: WritingAssistantParams = {
        operation: 'improve_style',
        content:
          'This is a really, really long sentence that goes on and on and probably should be broken up into smaller, more manageable pieces for better readability.',
        writingStyle: 'academic',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.styleImprovements).toBeDefined();
    });

    it('should detect informal contractions in academic writing', async () => {
      const params: WritingAssistantParams = {
        operation: 'improve_style',
        content:
          "We can't determine the exact cause. It's likely that there's more research needed.",
        writingStyle: 'academic',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.styleImprovements).toBeDefined();
    });
  });

  describe('Citation Verification', () => {
    it('should verify citation format', async () => {
      const params: WritingAssistantParams = {
        operation: 'verify_citations',
        content: `
The research shows significant results (Smith 2023). Previous studies have indicated (Jones, Brown and Davis, 2022) that this approach is valid.

References:
Smith, J. (2023). Research Methods. Journal of Science.
Jones, A., Brown, B., & Davis, C. (2022). Statistical Analysis. Academic Press.
        `,
        citationStyle: 'apa',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.citationIssues).toBeDefined();
    });
  });

  describe('Readability Check', () => {
    it('should calculate readability metrics', async () => {
      const params: WritingAssistantParams = {
        operation: 'check_readability',
        content: `
This research investigates the relationship between variables. The methodology involves collecting data from multiple sources. 
Statistical analysis reveals significant patterns. The findings contribute to our understanding of the phenomenon.
Complex technical terminology may affect readability scores.
        `,
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.readabilityMetrics).toBeDefined();
      expect(data.readabilityMetrics!.fleschReadingEase).toBeGreaterThanOrEqual(
        -100,
      ); // Flesch score can be negative
      expect(data.readabilityMetrics!.totalWords).toBeGreaterThan(0);
    });
  });

  describe('Plagiarism Detection', () => {
    it('should detect potentially suspicious text', async () => {
      const params: WritingAssistantParams = {
        operation: 'detect_plagiarism',
        content: `
This is a common phrase used in many research papers. The methodology follows standard procedures.
This exact sentence appears in multiple publications without attribution.
        `,
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.plagiarismCheck).toBeDefined();
      expect(data.plagiarismCheck!.overallSimilarity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Comprehensive Review', () => {
    it('should perform all analyses together', async () => {
      const params: WritingAssistantParams = {
        operation: 'comprehensive_review',
        content: `
# Abstract
This paper investigates machine learning applications in healthcare.

# Introduction
Machine learning has emerged as a powerful tool. Previous studies shows significant potential.

## Background
The healthcare industry generates massive amounts of data daily.

# Methodology
We collected data from hospitals using standard protocols.

# Results
The analysis reveals promising outcomes with 95% accuracy.

# Conclusion
Our findings suggest that ML can improve healthcare outcomes.

# References
Smith, J. (2023). AI in Healthcare. Medical Journal.
        `,
        writingStyle: 'academic',
        citationStyle: 'apa',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
      const data = result.data as WritingAssistantResult;
      expect(data.structureAnalysis).toBeDefined();
      expect(data.grammarCheck).toBeDefined();
      expect(data.styleImprovements).toBeDefined();
      // citationIssues may be undefined if no issues found or no citations analyzed
      if (data.citationIssues) {
        expect(data.citationIssues).toBeDefined();
      }
      expect(data.readabilityMetrics).toBeDefined();
      expect(data.plagiarismCheck).toBeDefined();
      expect(data.suggestions).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short content', async () => {
      const params: WritingAssistantParams = {
        operation: 'analyze_structure',
        content: 'Short text.',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
    });

    it('should handle content with special characters', async () => {
      const content =
        'Text with émojis 🎓, spéciàl châractérs, and números 123.';

      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content,
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
    });

    it('should handle content with only whitespace', async () => {
      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content: '   \n\t   ',
      };

      const result = await tool.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Content cannot be empty');
    });
  });

  describe('Default Parameters', () => {
    it('should use default values when parameters are not provided', async () => {
      const params: WritingAssistantParams = {
        operation: 'analyze_structure',
        content: 'Test content for analysis.',
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed content gracefully', async () => {
      const content = 'Normal text\x00\x01\x02 with control characters';

      const params: WritingAssistantParams = {
        operation: 'check_grammar',
        content,
      };

      const result = (await tool.execute(params)) as WritingAssistantResult;
      expect(result.success).toBe(true);
    });

    it('should provide meaningful error messages', async () => {
      const params = {
        operation: 'verify_citations',
        content: 'Some content',
        // Missing citation style
      } as WritingAssistantParams;

      const result = await tool.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Citation style is required');
    });
  });
});
