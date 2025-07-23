import { BaseResearchTool } from '../base-tool.js';
import {
  WritingAssistantParams,
  WritingAssistantResult,
  WritingStyle,
  WritingOperation,
  WritingSuggestion,
  GrammarCheck,
  StyleImprovement,
  CitationIssue,
  StructureAnalysis,
  ReadabilityMetrics,
  PlagiarismCheck,
  ResearchToolCategory,
  ResearchToolParams
} from '../types.js';

/**
 * Academic Writing Assistant Tool
 * 
 * Provides comprehensive support for academic writing including:
 * - Structure analysis and suggestions
 * - Language and style optimization
 * - Grammar and readability checks
 * - Citation management and verification
 * - Plagiarism detection
 * - Writing feedback and improvement suggestions
 */
export class AcademicWritingAssistant extends BaseResearchTool<WritingAssistantParams, WritingAssistantResult> {
  constructor() {
    super(
      'academic_writing_assistant',
      'Provides comprehensive support for academic writing including structure analysis, language optimization, and citation management',
      ResearchToolCategory.WRITING
    );
  }

  protected getParameterSchema() {
    return {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['analyze_structure', 'check_grammar', 'improve_style', 'verify_citations', 'check_readability', 'detect_plagiarism', 'comprehensive_review'],
          description: 'Type of writing assistance operation to perform'
        },
        content: {
          type: 'string',
          description: 'Text content to analyze or improve'
        },
        writingStyle: {
          type: 'string',
          enum: ['academic', 'formal', 'technical', 'scientific'],
          description: 'Target writing style for analysis and suggestions',
          default: 'academic'
        },
        documentType: {
          type: 'string',
          enum: ['paper', 'thesis', 'dissertation', 'proposal', 'review'],
          description: 'Type of academic document',
          default: 'paper'
        },
        targetAudience: {
          type: 'string',
          enum: ['experts', 'general_academic', 'students', 'practitioners'],
          description: 'Target audience for the writing',
          default: 'experts'
        },
        citationStyle: {
          type: 'string',
          enum: ['APA', 'MLA', 'Chicago', 'IEEE', 'Harvard'],
          description: 'Citation style to check against',
          default: 'APA'
        },
        language: {
          type: 'string',
          description: 'Language of the content',
          default: 'en'
        },
        includeStatistics: {
          type: 'boolean',
          description: 'Include detailed writing statistics',
          default: true
        }
      },
      required: ['operation', 'content']
    };
  }

  protected async executeImpl(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    // 验证在preProcess中进行，这里直接执行
    switch (params.operation) {
      case 'analyze_structure':
        return this.analyzeStructure(params);
      case 'check_grammar':
        return this.checkGrammar(params);
      case 'improve_style':
        return this.improveStyle(params);
      case 'verify_citations':
        return this.verifyCitations(params);
      case 'check_readability':
        return this.checkReadability(params);
      case 'detect_plagiarism':
        return this.detectPlagiarism(params);
      case 'comprehensive_review':
        return this.comprehensiveReview(params);
      default:
        throw new Error(`Unsupported operation: ${params.operation}`);
    }
  }

  protected async preProcess(params: WritingAssistantParams): Promise<void> {
    // 调用验证逻辑
    this.validateParams(params);
  }

  public validate(params: ResearchToolParams): boolean {
    try {
      this.validateParams(params as WritingAssistantParams);
      return true;
    } catch (error) {
      return false;
    }
  }

  public getHelp(): string {
    return this.formatHelp(
      'Provides comprehensive academic writing assistance including structure analysis, grammar checking, style improvement, citation verification, readability analysis, and plagiarism detection',
      [
        { name: 'operation', type: 'string', required: true, description: 'Type of writing assistance operation' },
        { name: 'content', type: 'string', required: true, description: 'Text content to analyze' },
        { name: 'writingStyle', type: 'string', required: false, description: 'Target writing style (academic, formal, technical, scientific)' },
        { name: 'documentType', type: 'string', required: false, description: 'Type of academic document' },
        { name: 'targetAudience', type: 'string', required: false, description: 'Target audience for the writing' },
        { name: 'citationStyle', type: 'string', required: false, description: 'Citation style for verification' },
        { name: 'language', type: 'string', required: false, description: 'Language of the content' },
        { name: 'includeStatistics', type: 'boolean', required: false, description: 'Include detailed statistics' }
      ],
      [
        {
          description: 'Analyze document structure',
          params: { operation: 'analyze_structure', content: 'Your academic text here...' }
        },
        {
          description: 'Check grammar',
          params: { operation: 'check_grammar', content: 'Text to check for grammar issues...' }
        },
        {
          description: 'Comprehensive review',
          params: { 
            operation: 'comprehensive_review', 
            content: 'Complete academic text...', 
            writingStyle: 'academic',
            citationStyle: 'apa' 
          }
        }
      ]
    );
  }

  private validateParams(params: WritingAssistantParams): void {
    // 验证内容不为空
    if (!params.content || params.content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    // 验证内容长度
    if (params.content.length > 50000) {
      throw new Error('Content too long (max 50,000 characters)');
    }

    // 验证引用格式检查需要引用样式
    if (params.operation === 'verify_citations' && !params.citationStyle) {
      throw new Error('Citation style is required for citation verification');
    }
  }

  private async analyzeStructure(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    const analysis = this.performStructureAnalysis(params.content, params.documentType || 'paper');
    const suggestions = this.generateStructureSuggestions(analysis, params.documentType || 'paper');

    return {
      success: true,
      operation: params.operation,
      structureAnalysis: analysis,
      suggestions,
      metadata: {
        timestamp: new Date().toISOString(),
        toolName: this.name,
        version: this.version,
      }
    };
  }

  private async checkGrammar(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    const grammarIssues = this.performGrammarCheck(params.content);
    const suggestions = grammarIssues.map(issue => ({
      type: 'grammar' as const,
      severity: issue.severity,
      message: issue.message,
      suggestion: issue.suggestion,
      location: {
        start: issue.position.start,
        end: issue.position.end,
        line: issue.position.line
      }
    }));

    return {
      success: true,
      operation: params.operation,
      grammarCheck: grammarIssues,
      suggestions
    };
  }

  private async improveStyle(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    const style = params.writingStyle || 'academic';
    const audience = params.targetAudience || 'general_academic';
    const styleIssues = this.performStyleAnalysis(params.content, style, audience);

    return {
      success: true,
      operation: params.operation,
      styleImprovements: styleIssues
    };
  }

  private async verifyCitations(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    if (!params.citationStyle) {
      throw new Error('Citation style is required for citation verification');
    }

    const citationIssues = this.performCitationCheck(params.content, params.citationStyle);

    return {
      success: true,
      operation: params.operation,
      citationIssues
    };
  }

  private async checkReadability(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    const metrics = this.calculateReadabilityMetrics(params.content);
    const audience = params.targetAudience || 'general_academic';
    const suggestions = this.generateReadabilitySuggestions(metrics, audience);

    return {
      success: true,
      operation: params.operation,
      readabilityMetrics: metrics,
      suggestions
    };
  }

  private async detectPlagiarism(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    const plagiarismCheck = this.performPlagiarismCheck(params.content);

    return {
      success: true,
      operation: params.operation,
      plagiarismCheck
    };
  }

  private async comprehensiveReview(params: WritingAssistantParams): Promise<WritingAssistantResult> {
    // 执行所有分析
    const structureAnalysis = this.performStructureAnalysis(params.content, params.documentType || 'paper');
    const grammarCheck = this.performGrammarCheck(params.content);
    const styleImprovements = this.performStyleAnalysis(
      params.content, 
      params.writingStyle || 'academic', 
      params.targetAudience || 'general_academic'
    );
    
    let citationIssues: CitationIssue[] = [];
    if (params.citationStyle) {
      citationIssues = this.performCitationCheck(params.content, params.citationStyle);
    }

    const readabilityMetrics = this.calculateReadabilityMetrics(params.content);
    const plagiarismCheck = this.performPlagiarismCheck(params.content);

    // 生成综合建议
    const structureSuggestions = this.generateStructureSuggestions(structureAnalysis, params.documentType || 'paper');
    const readabilitySuggestions = this.generateReadabilitySuggestions(readabilityMetrics, params.targetAudience || 'general_academic');
    
    const grammarSuggestions = grammarCheck.map(issue => ({
      type: 'grammar' as const,
      severity: issue.severity,
      message: issue.message,
      suggestion: issue.suggestion,
      location: {
        start: issue.position.start,
        end: issue.position.end,
        line: issue.position.line
      }
    }));

    const allSuggestions = [
      ...structureSuggestions,
      ...readabilitySuggestions,
      ...grammarSuggestions,
      ...styleImprovements.map(improvement => ({
        type: 'style' as const,
        severity: improvement.severity,
        message: improvement.message,
        suggestion: improvement.suggestion,
        location: improvement.location
      }))
    ];

    return {
      success: true,
      operation: params.operation,
      structureAnalysis,
      grammarCheck,
      styleImprovements,
      citationIssues: citationIssues.length > 0 ? citationIssues : undefined,
      readabilityMetrics,
      plagiarismCheck,
      suggestions: allSuggestions
    };
  }

  private performStructureAnalysis(content: string, documentType: string): StructureAnalysis {
    const sentences = this.splitIntoSentences(content);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    const sections = this.identifySections(content);

    // Analyze paragraph structure
    const avgSentencesPerParagraph = sentences.length / Math.max(paragraphs.length, 1);
    const avgWordsPerSentence = this.countWords(content) / Math.max(sentences.length, 1);

    // Check for typical academic structure
    const hasAbstract = /abstract/i.test(content);
    const hasIntroduction = /introduction/i.test(content);
    const hasConclusion = /conclusion|summary/i.test(content);
    const hasReferences = /references|bibliography/i.test(content);

    return {
      totalSections: sections.length,
      totalParagraphs: paragraphs.length,
      totalSentences: sentences.length,
      averageSentencesPerParagraph: Number(avgSentencesPerParagraph.toFixed(1)),
      averageWordsPerSentence: Number(avgWordsPerSentence.toFixed(1)),
      hasAbstract,
      hasIntroduction,
      hasConclusion,
      hasReferences,
      sections: sections.map(section => ({
        title: section.title,
        level: section.level,
        wordCount: this.countWords(section.content),
        position: section.position
      })),
      structureScore: this.calculateStructureScore({
        hasAbstract,
        hasIntroduction,
        hasConclusion,
        hasReferences,
        sectionsCount: sections.length,
        documentType
      })
    };
  }

  private performGrammarCheck(content: string): GrammarCheck[] {
    const issues: GrammarCheck[] = [];
    const sentences = this.splitIntoSentences(content);
    
    sentences.forEach((sentence, index) => {
      const sentenceStart = content.indexOf(sentence);
      
      // Check for common grammar issues
      this.checkSubjectVerbAgreement(sentence, sentenceStart, issues);
      this.checkPunctuationErrors(sentence, sentenceStart, issues);
      this.checkCapitalization(sentence, sentenceStart, issues);
      this.checkRedundancy(sentence, sentenceStart, issues);
      this.checkPassiveVoice(sentence, sentenceStart, issues);
    });

    return issues;
  }

  private performStyleAnalysis(content: string, style: string, audience: string): StyleImprovement[] {
    const improvements: StyleImprovement[] = [];
    const sentences = this.splitIntoSentences(content);

    sentences.forEach((sentence, index) => {
      const sentenceStart = content.indexOf(sentence);
      
      // Check for style issues based on academic writing standards
      this.checkWordiness(sentence, sentenceStart, improvements);
      this.checkFormality(sentence, sentenceStart, style, improvements);
      this.checkClarity(sentence, sentenceStart, improvements);
      this.checkTransitions(sentence, sentenceStart, index, sentences, improvements);
      this.checkTechnicalTerms(sentence, sentenceStart, audience, improvements);
    });

    return improvements;
  }

  private performCitationCheck(content: string, style: string): CitationIssue[] {
    const issues: CitationIssue[] = [];
    
    // Find in-text citations
    const inTextCitations = this.findInTextCitations(content, style);
    // Find reference list
    const references = this.findReferences(content);
    
    // Check citation format
    inTextCitations.forEach(citation => {
      if (!this.isValidCitationFormat(citation.text, style)) {
        issues.push({
          type: 'format',
          severity: 'medium',
          message: `Citation format doesn't match ${style} style`,
          suggestion: this.suggestCitationFormat(citation.text, style),
          location: citation.location,
          citationText: citation.text
        });
      }
    });

    // Check for missing references
    const citedAuthors = inTextCitations.map(c => this.extractAuthor(c.text));
    const referencedAuthors = references.map(r => this.extractAuthor(r.text));
    
    citedAuthors.forEach((author, index) => {
      if (author && !referencedAuthors.includes(author)) {
        const citation = inTextCitations[citedAuthors.indexOf(author)];
        issues.push({
          type: 'missing_reference',
          severity: 'high',
          message: `Citation "${author}" not found in reference list`,
          suggestion: `Add reference for ${author} to the reference list`,
          location: citation.location,
          citationText: citation.text
        });
      }
    });

    return issues;
  }

  private calculateReadabilityMetrics(content: string): ReadabilityMetrics {
    const words = this.countWords(content);
    const sentences = this.splitIntoSentences(content).length;
    const syllables = this.countSyllables(content);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length;

    // Calculate various readability scores
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    const avgSyllablesPerWord = syllables / Math.max(words, 1);

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Flesch-Kincaid Grade Level
    const gradeLevel = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;

    // Gunning Fog Index
    const complexWords = this.countComplexWords(content);
    const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / Math.max(words, 1)));

    return {
      fleschReadingEase: Number(fleschScore.toFixed(1)),
      fleschKincaidGrade: Number(gradeLevel.toFixed(1)),
      gunningFogIndex: Number(gunningFog.toFixed(1)),
      averageWordsPerSentence: Number(avgWordsPerSentence.toFixed(1)),
      averageSyllablesPerWord: Number(avgSyllablesPerWord.toFixed(2)),
      totalWords: words,
      totalSentences: sentences,
      totalParagraphs: paragraphs,
      readabilityLevel: this.determineReadabilityLevel(fleschScore)
    };
  }

  private performPlagiarismCheck(content: string): PlagiarismCheck {
    // This is a basic implementation - in practice, you'd use external APIs
    const suspiciousTexts = this.findSuspiciousTexts(content);
    const overallSimilarity = this.calculateOverallSimilarity(content);

    return {
      overallSimilarity,
      suspiciousTexts,
      sources: this.findPotentialSources(suspiciousTexts),
      confidence: overallSimilarity > 30 ? 'high' : overallSimilarity > 15 ? 'medium' : 'low'
    };
  }

  // Helper methods for structure analysis
  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private identifySections(content: string): Array<{title: string, level: number, content: string, position: number}> {
    const sections: Array<{title: string, level: number, content: string, position: number}> = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Look for section headers (# headers or numbered sections)
      const hashMatch = line.match(/^(#{1,6})\s+(.+)$/);
      const numberedMatch = line.match(/^(\d+\.?\s+)(.+)$/);
      
      if (hashMatch) {
        sections.push({
          title: hashMatch[2].trim(),
          level: hashMatch[1].length,
          content: line,
          position: index
        });
      } else if (numberedMatch && line.length < 100) {
        sections.push({
          title: numberedMatch[2].trim(),
          level: 1,
          content: line,
          position: index
        });
      }
    });
    
    return sections;
  }

  private calculateStructureScore(analysis: {
    hasAbstract: boolean,
    hasIntroduction: boolean,
    hasConclusion: boolean,
    hasReferences: boolean,
    sectionsCount: number,
    documentType: string
  }): number {
    let score = 0;
    
    // Basic structure elements (40 points)
    if (analysis.hasAbstract) score += 10;
    if (analysis.hasIntroduction) score += 10;
    if (analysis.hasConclusion) score += 10;
    if (analysis.hasReferences) score += 10;
    
    // Section organization (30 points)
    if (analysis.sectionsCount >= 3) score += 15;
    else if (analysis.sectionsCount >= 2) score += 10;
    else if (analysis.sectionsCount >= 1) score += 5;
    
    if (analysis.sectionsCount <= 8) score += 15; // Not too many sections
    
    // Document type specific (30 points)
    if (analysis.documentType === 'thesis' || analysis.documentType === 'dissertation') {
      if (analysis.sectionsCount >= 5) score += 30;
      else score += 15;
    } else {
      if (analysis.sectionsCount >= 3 && analysis.sectionsCount <= 6) score += 30;
      else score += 15;
    }
    
    return Math.min(100, score);
  }

  // Helper methods for grammar checking
  private checkSubjectVerbAgreement(sentence: string, start: number, issues: GrammarCheck[]): void {
    // Simple subject-verb agreement check
    const singularSubjects = ['he', 'she', 'it', 'this', 'that'];
    const pluralSubjects = ['they', 'these', 'those', 'we'];
    
    singularSubjects.forEach(subject => {
      const regex = new RegExp(`\\b${subject}\\s+(are|were)\\b`, 'i');
      const match = sentence.match(regex);
      if (match) {
        const position = sentence.indexOf(match[0]);
        issues.push({
          type: 'subject_verb_agreement',
          severity: 'high',
          message: 'Subject-verb disagreement',
          suggestion: match[0].replace(match[1], match[1] === 'are' ? 'is' : 'was'),
          position: {
            start: start + position,
            end: start + position + match[0].length,
            line: 0
          }
        });
      }
    });
  }

  private checkPunctuationErrors(sentence: string, start: number, issues: GrammarCheck[]): void {
    // Check for double spaces
    const doubleSpaceMatch = sentence.match(/\s{2,}/);
    if (doubleSpaceMatch) {
      const position = sentence.indexOf(doubleSpaceMatch[0]);
      issues.push({
        type: 'punctuation',
        severity: 'low',
        message: 'Multiple consecutive spaces',
        suggestion: doubleSpaceMatch[0].replace(/\s+/, ' '),
        position: {
          start: start + position,
          end: start + position + doubleSpaceMatch[0].length,
          line: 0
        }
      });
    }

    // Check for missing space after punctuation
    const missingSpaceMatch = sentence.match(/[.!?][a-zA-Z]/);
    if (missingSpaceMatch) {
      const position = sentence.indexOf(missingSpaceMatch[0]);
      issues.push({
        type: 'punctuation',
        severity: 'medium',
        message: 'Missing space after punctuation',
        suggestion: missingSpaceMatch[0].charAt(0) + ' ' + missingSpaceMatch[0].charAt(1),
        position: {
          start: start + position,
          end: start + position + missingSpaceMatch[0].length,
          line: 0
        }
      });
    }
  }

  private checkCapitalization(sentence: string, start: number, issues: GrammarCheck[]): void {
    // Check if sentence starts with lowercase (except for special cases)
    if (sentence.trim().length > 0 && /^[a-z]/.test(sentence.trim()) && !/^[a-z]+:/.test(sentence.trim())) {
      issues.push({
        type: 'capitalization',
        severity: 'medium',
        message: 'Sentence should start with capital letter',
        suggestion: sentence.charAt(0).toUpperCase() + sentence.slice(1),
        position: {
          start: start,
          end: start + 1,
          line: 0
        }
      });
    }
  }

  private checkRedundancy(sentence: string, start: number, issues: GrammarCheck[]): void {
    const redundantPhrases = [
      'in order to',
      'due to the fact that',
      'it is important to note that',
      'it should be noted that'
    ];

    redundantPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'i');
      const match = sentence.match(regex);
      if (match) {
        const position = sentence.indexOf(match[0]);
        let suggestion = '';
        switch (phrase) {
          case 'in order to':
            suggestion = 'to';
            break;
          case 'due to the fact that':
            suggestion = 'because';
            break;
          case 'it is important to note that':
          case 'it should be noted that':
            suggestion = '';
            break;
        }
        
        issues.push({
          type: 'redundancy',
          severity: 'low',
          message: 'Redundant phrase detected',
          suggestion: `Replace "${match[0]}" with "${suggestion}"`,
          position: {
            start: start + position,
            end: start + position + match[0].length,
            line: 0
          }
        });
      }
    });
  }

  private checkPassiveVoice(sentence: string, start: number, issues: GrammarCheck[]): void {
    // Simple passive voice detection
    const passivePattern = /\b(is|are|was|were|been|being)\s+\w+ed\b/i;
    const match = sentence.match(passivePattern);
    
    if (match) {
      const position = sentence.indexOf(match[0]);
      issues.push({
        type: 'passive_voice',
        severity: 'low',
        message: 'Consider using active voice',
        suggestion: 'Rewrite in active voice for clarity',
        position: {
          start: start + position,
          end: start + position + match[0].length,
          line: 0
        }
      });
    }
  }

  // Helper methods for style analysis
  private checkWordiness(sentence: string, start: number, improvements: StyleImprovement[]): void {
    const wordyPhrases = {
      'a large number of': 'many',
      'a great deal of': 'much',
      'in the event that': 'if',
      'with regard to': 'regarding',
      'in terms of': 'for',
      'for the purpose of': 'to'
    };

    Object.entries(wordyPhrases).forEach(([wordy, concise]) => {
      const regex = new RegExp(`\\b${wordy}\\b`, 'i');
      const match = sentence.match(regex);
      if (match) {
        const position = sentence.indexOf(match[0]);
        improvements.push({
          type: 'wordiness',
          severity: 'medium',
          message: 'Wordy phrase detected',
          suggestion: `Replace "${match[0]}" with "${concise}"`,
          originalText: match[0],
          improvedText: concise,
          location: {
            start: start + position,
            end: start + position + match[0].length,
            line: 0
          }
        });
      }
    });
  }

  private checkFormality(sentence: string, start: number, style: string, improvements: StyleImprovement[]): void {
    if (style === 'academic' || style === 'formal') {
      const informalWords = {
        "don't": "do not",
        "won't": "will not",
        "can't": "cannot",
        "isn't": "is not",
        "aren't": "are not",
        "doesn't": "does not",
        "didn't": "did not",
        "wouldn't": "would not",
        "couldn't": "could not",
        "shouldn't": "should not"
      };

      Object.entries(informalWords).forEach(([informal, formal]) => {
        const regex = new RegExp(`\\b${informal}\\b`, 'i');
        const match = sentence.match(regex);
        if (match) {
          const position = sentence.indexOf(match[0]);
          improvements.push({
            type: 'formality',
            severity: 'medium',
            message: 'Informal contraction in academic writing',
            suggestion: `Replace "${match[0]}" with "${formal}"`,
            originalText: match[0],
            improvedText: formal,
            location: {
              start: start + position,
              end: start + position + match[0].length,
              line: 0
            }
          });
        }
      });
    }
  }

  private checkClarity(sentence: string, start: number, improvements: StyleImprovement[]): void {
    // Check for overly long sentences
    const words = sentence.split(/\s+/).length;
    if (words > 25) {
      improvements.push({
        type: 'clarity',
        severity: 'medium',
        message: 'Sentence may be too long',
        suggestion: 'Consider breaking into shorter sentences for clarity',
        originalText: sentence,
        improvedText: sentence, // Would need more sophisticated processing
        location: {
          start: start,
          end: start + sentence.length,
          line: 0
        }
      });
    }

    // Check for jargon without explanation
    const jargonPattern = /\b[A-Z]{2,}\b/g;
    const matches = Array.from(sentence.matchAll(jargonPattern));
    matches.forEach(match => {
      if (match[0].length > 2 && !this.isCommonAcronym(match[0])) {
        const position = sentence.indexOf(match[0]);
        improvements.push({
          type: 'clarity',
          severity: 'low',
          message: 'Acronym may need explanation',
          suggestion: `Consider explaining "${match[0]}" on first use`,
          originalText: match[0],
          improvedText: match[0],
          location: {
            start: start + position,
            end: start + position + match[0].length,
            line: 0
          }
        });
      }
    });
  }

  private checkTransitions(
    sentence: string, 
    start: number, 
    index: number, 
    sentences: string[], 
    improvements: StyleImprovement[]
  ): void {
    const transitionWords = [
      'however', 'therefore', 'furthermore', 'moreover', 'consequently',
      'nevertheless', 'additionally', 'subsequently', 'similarly', 'conversely'
    ];

    const hasTransition = transitionWords.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(sentence)
    );

    // Check if sentence needs a transition (simple heuristic)
    if (index > 0 && !hasTransition && sentence.length > 50) {
      const prevSentence = sentences[index - 1];
      if (this.seemsUnconnected(prevSentence, sentence)) {
        improvements.push({
          type: 'transitions',
          severity: 'low',
          message: 'Sentence may benefit from a transition',
          suggestion: 'Consider adding a transition word to connect ideas',
          originalText: sentence,
          improvedText: sentence,
          location: {
            start: start,
            end: start + sentence.length,
            line: 0
          }
        });
      }
    }
  }

  private checkTechnicalTerms(sentence: string, start: number, audience: string, improvements: StyleImprovement[]): void {
    if (audience === 'general_academic' || audience === 'students') {
      // Check for technical terms that might need explanation
      const technicalPattern = /\b[a-z]+(tion|ism|ity|ness|ment|ance|ence)\b/gi;
      const matches = Array.from(sentence.matchAll(technicalPattern));
      
      matches.forEach(match => {
        if (match[0].length > 8 && this.isTechnicalTerm(match[0])) {
          const position = sentence.indexOf(match[0]);
          improvements.push({
            type: 'technical_terms',
            severity: 'low',
            message: 'Technical term may need explanation',
            suggestion: `Consider explaining or simplifying "${match[0]}" for the target audience`,
            originalText: match[0],
            improvedText: match[0],
            location: {
              start: start + position,
              end: start + position + match[0].length,
              line: 0
            }
          });
        }
      });
    }
  }

  // Helper methods for citation checking
  private findInTextCitations(content: string, style: string): Array<{text: string, location: {start: number, end: number, line: number}}> {
    const citations: Array<{text: string, location: {start: number, end: number, line: number}}> = [];
    let regex: RegExp;

    switch (style) {
      case 'APA':
        regex = /\([^)]*\d{4}[^)]*\)/g;
        break;
      case 'MLA':
        regex = /\([^)]*\d+[^)]*\)/g;
        break;
      case 'Chicago':
        regex = /\([^)]*\d{4}[^)]*\)|:\s*\d+/g;
        break;
      case 'IEEE':
        regex = /\[\d+\]/g;
        break;
      default:
        regex = /\([^)]*\d{4}[^)]*\)/g;
    }

    const matches = Array.from(content.matchAll(regex));
    matches.forEach(match => {
      if (match.index !== undefined) {
        citations.push({
          text: match[0],
          location: {
            start: match.index,
            end: match.index + match[0].length,
            line: content.substring(0, match.index).split('\n').length
          }
        });
      }
    });

    return citations;
  }

  private findReferences(content: string): Array<{text: string, location: {start: number, end: number, line: number}}> {
    const references: Array<{text: string, location: {start: number, end: number, line: number}}> = [];
    
    // Find references section
    const referencesMatch = content.match(/(references|bibliography)\s*\n([\s\S]*?)(\n\n|\n#|$)/i);
    if (referencesMatch && referencesMatch.index !== undefined) {
      const referencesText = referencesMatch[2];
      const referencesStart = referencesMatch.index + referencesMatch[1].length;
      
      // Split references by line or empty line
      const refLines = referencesText.split(/\n(?=\S)/).filter(line => line.trim());
      
      let currentPos = referencesStart;
      refLines.forEach(line => {
        const refStart = content.indexOf(line.trim(), currentPos);
        if (refStart !== -1) {
          references.push({
            text: line.trim(),
            location: {
              start: refStart,
              end: refStart + line.trim().length,
              line: content.substring(0, refStart).split('\n').length
            }
          });
          currentPos = refStart + line.length;
        }
      });
    }

    return references;
  }

  private isValidCitationFormat(citation: string, style: string): boolean {
    switch (style) {
      case 'APA':
        return /\([^)]*[A-Za-z]+,?\s*\d{4}[^)]*\)/.test(citation);
      case 'MLA':
        return /\([^)]*[A-Za-z]+\s+\d+[^)]*\)/.test(citation);
      case 'Chicago':
        return /\([^)]*[A-Za-z]+.*\d{4}[^)]*\)|:\s*\d+/.test(citation);
      case 'IEEE':
        return /\[\d+\]/.test(citation);
      default:
        return true;
    }
  }

  private suggestCitationFormat(citation: string, style: string): string {
    // This would be more sophisticated in practice
    switch (style) {
      case 'APA':
        return '(Author, Year)';
      case 'MLA':
        return '(Author Page)';
      case 'Chicago':
        return '(Author Year)';
      case 'IEEE':
        return '[1]';
      default:
        return citation;
    }
  }

  private extractAuthor(text: string): string | null {
    // Simple author extraction
    const match = text.match(/([A-Za-z]+)/);
    return match ? match[1] : null;
  }

  // Helper methods for readability
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;

    words.forEach(word => {
      // Simple syllable counting heuristic
      const vowels = word.match(/[aeiouy]+/g);
      const count = vowels ? vowels.length : 1;
      syllableCount += Math.max(1, count);
    });

    return syllableCount;
  }

  private countComplexWords(text: string): number {
    const words = text.split(/\s+/);
    let complexCount = 0;

    words.forEach(word => {
      const syllables = this.countSyllables(word);
      if (syllables >= 3) {
        complexCount++;
      }
    });

    return complexCount;
  }

  private determineReadabilityLevel(fleschScore: number): string {
    if (fleschScore >= 90) return 'Very Easy';
    if (fleschScore >= 80) return 'Easy';
    if (fleschScore >= 70) return 'Fairly Easy';
    if (fleschScore >= 60) return 'Standard';
    if (fleschScore >= 50) return 'Fairly Difficult';
    if (fleschScore >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  // Helper methods for plagiarism detection
  private findSuspiciousTexts(content: string): Array<{
    text: string,
    similarity: number,
    reason: string,
    location: {start: number, end: number, line: number}
  }> {
    const suspicious: Array<{
      text: string,
      similarity: number,
      reason: string,
      location: {start: number, end: number, line: number}
    }> = [];

    // Look for long identical phrases (basic heuristic)
    const sentences = this.splitIntoSentences(content);
    sentences.forEach((sentence, index) => {
      if (sentence.length > 100 && this.seemsCommonPhrase(sentence)) {
        const position = content.indexOf(sentence);
        suspicious.push({
          text: sentence,
          similarity: 75,
          reason: 'Common academic phrase that might be overused',
          location: {
            start: position,
            end: position + sentence.length,
            line: content.substring(0, position).split('\n').length
          }
        });
      }
    });

    return suspicious;
  }

  private calculateOverallSimilarity(content: string): number {
    // Simple heuristic - in practice would use external services
    const commonPhrases = [
      'according to the literature',
      'this study aims to',
      'the results show that',
      'in conclusion',
      'future research should'
    ];

    let matches = 0;
    const sentences = this.splitIntoSentences(content);
    
    sentences.forEach(sentence => {
      commonPhrases.forEach(phrase => {
        if (sentence.toLowerCase().includes(phrase)) {
          matches++;
        }
      });
    });

    return Math.min(100, (matches / sentences.length) * 100);
  }

  private findPotentialSources(suspiciousTexts: Array<{text: string}>): string[] {
    // This would query external databases in practice
    return [
      'Generic academic sources',
      'Common textbooks',
      'Wikipedia articles'
    ];
  }

  // Utility helper methods
  private generateStructureSuggestions(analysis: StructureAnalysis, documentType: string): WritingSuggestion[] {
    const suggestions: WritingSuggestion[] = [];

    if (!analysis.hasAbstract && documentType === 'paper') {
      suggestions.push({
        type: 'structure',
        severity: 'high',
        message: 'Missing abstract',
        suggestion: 'Add an abstract summarizing your research findings'
      });
    }

    if (!analysis.hasIntroduction) {
      suggestions.push({
        type: 'structure',
        severity: 'high',
        message: 'Missing introduction',
        suggestion: 'Add an introduction to set context for your research'
      });
    }

    if (!analysis.hasConclusion) {
      suggestions.push({
        type: 'structure',
        severity: 'high',
        message: 'Missing conclusion',
        suggestion: 'Add a conclusion to summarize your findings and implications'
      });
    }

    if (analysis.averageSentencesPerParagraph > 8) {
      suggestions.push({
        type: 'structure',
        severity: 'medium',
        message: 'Paragraphs may be too long',
        suggestion: 'Consider breaking long paragraphs into smaller, focused ones'
      });
    }

    if (analysis.averageWordsPerSentence > 25) {
      suggestions.push({
        type: 'structure',
        severity: 'medium',
        message: 'Sentences may be too long',
        suggestion: 'Consider shortening sentences for better readability'
      });
    }

    return suggestions;
  }

  private generateReadabilitySuggestions(metrics: ReadabilityMetrics, audience: string): WritingSuggestion[] {
    const suggestions: WritingSuggestion[] = [];

    // Adjust suggestions based on audience
    const targetGrade = audience === 'experts' ? 16 : audience === 'general_academic' ? 14 : 12;

    if (metrics.fleschKincaidGrade > targetGrade + 2) {
      suggestions.push({
        type: 'readability',
        severity: 'medium',
        message: 'Text may be too complex for target audience',
        suggestion: 'Consider simplifying sentence structure and vocabulary'
      });
    }

    if (metrics.averageWordsPerSentence > 25) {
      suggestions.push({
        type: 'readability',
        severity: 'medium',
        message: 'Sentences are too long',
        suggestion: 'Break long sentences into shorter ones for better readability'
      });
    }

    if (metrics.fleschReadingEase < 30) {
      suggestions.push({
        type: 'readability',
        severity: 'high',
        message: 'Text is very difficult to read',
        suggestion: 'Significantly simplify language and sentence structure'
      });
    }

    return suggestions;
  }

  private isCommonAcronym(acronym: string): boolean {
    const common = ['USA', 'UK', 'EU', 'UN', 'WHO', 'NASA', 'FBI', 'CIA', 'CEO', 'CFO', 'CTO', 'AI', 'ML', 'IT', 'API', 'URL', 'HTTP', 'HTML', 'CSS', 'SQL'];
    return common.includes(acronym.toUpperCase());
  }

  private seemsUnconnected(prev: string, current: string): boolean {
    // Simple heuristic to check if sentences seem disconnected
    const prevWords = prev.toLowerCase().split(/\s+/);
    const currentWords = current.toLowerCase().split(/\s+/).slice(0, 5);
    
    const sharedWords = prevWords.filter(word => currentWords.includes(word));
    return sharedWords.length === 0 && current.length > 50;
  }

  private isTechnicalTerm(word: string): boolean {
    // Simple heuristic for technical terms
    const technicalSuffixes = ['tion', 'ism', 'ity', 'ness', 'ment', 'ance', 'ence'];
    return technicalSuffixes.some(suffix => word.toLowerCase().endsWith(suffix)) && word.length > 8;
  }

  private seemsCommonPhrase(sentence: string): boolean {
    const common = [
      'according to',
      'this study',
      'the results',
      'in conclusion',
      'it is important',
      'the purpose of',
      'the findings'
    ];
    
    return common.some(phrase => sentence.toLowerCase().includes(phrase));
  }
} 