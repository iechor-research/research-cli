/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Keyword sequence generator for serious academic research
 * Generates weighted keyword sequences based on research topics
 */

export interface KeywordSequence {
  id: string;
  name: string;
  description: string;
  keywords: WeightedKeyword[];
  category: ResearchCategory;
  score: number;
}

export interface WeightedKeyword {
  term: string;
  weight: number;
  synonyms?: string[];
  category: KeywordCategory;
}

export enum ResearchCategory {
  THEORETICAL = 'theoretical',
  EMPIRICAL = 'empirical',
  METHODOLOGICAL = 'methodological',
  APPLIED = 'applied',
  REVIEW = 'review',
  INTERDISCIPLINARY = 'interdisciplinary'
}

export enum KeywordCategory {
  CORE_CONCEPT = 'core_concept',
  METHODOLOGY = 'methodology',
  DOMAIN_SPECIFIC = 'domain_specific',
  TEMPORAL = 'temporal',
  TECHNICAL = 'technical',
  CONTEXTUAL = 'contextual',
  THEORETICAL = 'theoretical',
  APPLIED = 'applied'
}

export interface ResearchTopic {
  title: string;
  description?: string;
  domain: string;
  subdomains?: string[];
  timeframe?: {
    start?: number;
    end?: number;
  };
  methodology?: string[];
  context?: string[];
}

/**
 * Advanced keyword sequence generator that creates multiple research angles
 * for comprehensive literature investigation
 */
export class KeywordSequenceGenerator {
  private domainKnowledge: Map<string, DomainKnowledge> = new Map();
  private synonymDatabase: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDomainKnowledge();
    this.initializeSynonymDatabase();
  }

  /**
   * Generate multiple keyword sequences for a research topic
   */
  async generateSequences(topic: ResearchTopic): Promise<KeywordSequence[]> {
    const sequences: KeywordSequence[] = [];

    // Generate different research perspectives
    const perspectives = this.generateResearchPerspectives(topic);

    for (const perspective of perspectives) {
      const sequence = await this.createKeywordSequence(topic, perspective);
      if (sequence) {
        sequences.push(sequence);
      }
    }

    // Score and rank sequences
    const scoredSequences = this.scoreSequences(sequences, topic);
    
    // Return top 5-10 sequences
    return scoredSequences
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Generate different research perspectives for comprehensive coverage
   */
  private generateResearchPerspectives(topic: ResearchTopic): ResearchPerspective[] {
    const perspectives: ResearchPerspective[] = [];

    // Core theoretical perspective
    perspectives.push({
      type: ResearchCategory.THEORETICAL,
      focus: 'theoretical_foundations',
      weight: 1.0,
      description: 'Theoretical foundations and conceptual frameworks'
    });

    // Empirical research perspective
    perspectives.push({
      type: ResearchCategory.EMPIRICAL,
      focus: 'empirical_studies',
      weight: 0.9,
      description: 'Empirical studies and experimental research'
    });

    // Methodological perspective
    perspectives.push({
      type: ResearchCategory.METHODOLOGICAL,
      focus: 'research_methods',
      weight: 0.8,
      description: 'Research methods and analytical approaches'
    });

    // Applied perspective
    perspectives.push({
      type: ResearchCategory.APPLIED,
      focus: 'practical_applications',
      weight: 0.85,
      description: 'Practical applications and real-world implementations'
    });

    // Review perspective
    perspectives.push({
      type: ResearchCategory.REVIEW,
      focus: 'literature_reviews',
      weight: 0.7,
      description: 'Literature reviews and meta-analyses'
    });

    // Recent developments perspective
    perspectives.push({
      type: ResearchCategory.INTERDISCIPLINARY,
      focus: 'recent_developments',
      weight: 0.9,
      description: 'Recent developments and emerging trends'
    });

    return perspectives;
  }

  /**
   * Create a keyword sequence for a specific research perspective
   */
  private async createKeywordSequence(
    topic: ResearchTopic, 
    perspective: ResearchPerspective
  ): Promise<KeywordSequence | null> {
    const keywords: WeightedKeyword[] = [];

    // Extract core concepts from topic
    const coreKeywords = this.extractCoreKeywords(topic, perspective);
    keywords.push(...coreKeywords);

    // Add domain-specific terms
    const domainKeywords = this.getDomainSpecificKeywords(topic.domain, perspective);
    keywords.push(...domainKeywords);

    // Add methodological keywords
    if (topic.methodology) {
      const methodKeywords = this.getMethodologicalKeywords(topic.methodology, perspective);
      keywords.push(...methodKeywords);
    }

    // Add temporal keywords if timeframe specified
    if (topic.timeframe) {
      const temporalKeywords = this.getTemporalKeywords(topic.timeframe, perspective);
      keywords.push(...temporalKeywords);
    }

    // Add contextual keywords
    if (topic.context) {
      const contextualKeywords = this.getContextualKeywords(topic.context, perspective);
      keywords.push(...contextualKeywords);
    }

    if (keywords.length < 3) {
      return null; // Insufficient keywords for meaningful sequence
    }

    return {
      id: this.generateSequenceId(topic, perspective),
      name: this.generateSequenceName(topic, perspective),
      description: perspective.description,
      keywords: keywords.slice(0, 15), // Limit to top 15 keywords
      category: perspective.type,
      score: 0 // Will be calculated later
    };
  }

  /**
   * Extract core keywords from research topic
   */
  private extractCoreKeywords(topic: ResearchTopic, perspective: ResearchPerspective): WeightedKeyword[] {
    const keywords: WeightedKeyword[] = [];
    
    // Process title
    const titleTerms = this.extractTermsFromText(topic.title);
    titleTerms.forEach(term => {
      keywords.push({
        term,
        weight: this.calculateCoreWeight(term, perspective) * 1.5, // Title terms get higher weight
        synonyms: this.getSynonyms(term),
        category: KeywordCategory.CORE_CONCEPT
      });
    });

    // Process description if available
    if (topic.description) {
      const descriptionTerms = this.extractTermsFromText(topic.description);
      descriptionTerms.forEach(term => {
        keywords.push({
          term,
          weight: this.calculateCoreWeight(term, perspective),
          synonyms: this.getSynonyms(term),
          category: KeywordCategory.CORE_CONCEPT
        });
      });
    }

    return keywords;
  }

  /**
   * Get domain-specific keywords based on research domain
   */
  private getDomainSpecificKeywords(domain: string, perspective: ResearchPerspective): WeightedKeyword[] {
    const domainKnowledge = this.domainKnowledge.get(domain.toLowerCase());
    if (!domainKnowledge) {
      return [];
    }

    const keywords: WeightedKeyword[] = [];
    
    // Get perspective-specific domain terms
    const domainTerms = domainKnowledge.getTermsForPerspective(perspective.type);
    
    domainTerms.forEach(term => {
      keywords.push({
        term: term.term,
        weight: term.weight * perspective.weight,
        synonyms: this.getSynonyms(term.term),
        category: KeywordCategory.DOMAIN_SPECIFIC
      });
    });

    return keywords;
  }

  /**
   * Get methodological keywords
   */
  private getMethodologicalKeywords(methods: string[], perspective: ResearchPerspective): WeightedKeyword[] {
    const keywords: WeightedKeyword[] = [];
    
    methods.forEach(method => {
      const methodTerms = this.getMethodTerms(method, perspective);
      keywords.push(...methodTerms);
    });

    return keywords;
  }

  /**
   * Get temporal keywords based on timeframe
   */
  private getTemporalKeywords(timeframe: { start?: number; end?: number }, perspective: ResearchPerspective): WeightedKeyword[] {
    const keywords: WeightedKeyword[] = [];
    
    if (timeframe.start && timeframe.end) {
      const currentYear = new Date().getFullYear();
      
      if (timeframe.end >= currentYear - 2) {
        keywords.push({
          term: 'recent developments',
          weight: 0.8 * perspective.weight,
          category: KeywordCategory.TEMPORAL
        });
      }
      
      if (timeframe.end - timeframe.start >= 10) {
        keywords.push({
          term: 'longitudinal study',
          weight: 0.7 * perspective.weight,
          category: KeywordCategory.TEMPORAL
        });
      }
    }

    return keywords;
  }

  /**
   * Get contextual keywords
   */
  private getContextualKeywords(context: string[], perspective: ResearchPerspective): WeightedKeyword[] {
    const keywords: WeightedKeyword[] = [];
    
    context.forEach(ctx => {
      keywords.push({
        term: ctx,
        weight: 0.6 * perspective.weight,
        category: KeywordCategory.CONTEXTUAL
      });
    });

    return keywords;
  }

  /**
   * Score keyword sequences based on completeness and relevance
   */
  private scoreSequences(sequences: KeywordSequence[], topic: ResearchTopic): KeywordSequence[] {
    return sequences.map(sequence => {
      let score = 0;

      // Base score from keyword weights
      const keywordScore = sequence.keywords.reduce((sum, kw) => sum + kw.weight, 0);
      score += keywordScore * 0.4;

      // Diversity bonus
      const categories = new Set(sequence.keywords.map(kw => kw.category));
      score += categories.size * 2;

      // Coverage bonus
      const topicTerms = this.extractTermsFromText(topic.title + ' ' + (topic.description || ''));
      const coverage = this.calculateCoverage(sequence.keywords, topicTerms);
      score += coverage * 10;

      // Category-specific bonuses
      if (sequence.category === ResearchCategory.THEORETICAL) {
        score += 5; // Theoretical research is often foundational
      }
      if (sequence.category === ResearchCategory.EMPIRICAL) {
        score += 3; // Empirical studies are highly valuable
      }

      sequence.score = Math.round(score * 100) / 100;
      return sequence;
    });
  }

  /**
   * Calculate coverage of topic terms by keyword sequence
   */
  private calculateCoverage(keywords: WeightedKeyword[], topicTerms: string[]): number {
    if (topicTerms.length === 0) return 0;

    const keywordTerms = new Set(keywords.map(kw => kw.term.toLowerCase()));
    const synonymTerms = new Set();
    
    keywords.forEach(kw => {
      if (kw.synonyms) {
        kw.synonyms.forEach(syn => synonymTerms.add(syn.toLowerCase()));
      }
    });

    let coveredTerms = 0;
    topicTerms.forEach(term => {
      const lowerTerm = term.toLowerCase();
      if (keywordTerms.has(lowerTerm) || synonymTerms.has(lowerTerm)) {
        coveredTerms++;
      }
    });

    return coveredTerms / topicTerms.length;
  }

  /**
   * Extract meaningful terms from text
   */
  private extractTermsFromText(text: string): string[] {
    // Simple term extraction - in a real implementation, this would use NLP
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2 && !stopWords.has(term))
      .filter((term, index, arr) => arr.indexOf(term) === index); // Remove duplicates
  }

  /**
   * Calculate weight for core terms based on perspective
   */
  private calculateCoreWeight(term: string, perspective: ResearchPerspective): number {
    let baseWeight = 1.0;
    
    // Adjust weight based on term characteristics
    if (term.includes('method') || term.includes('approach')) {
      baseWeight *= perspective.type === ResearchCategory.METHODOLOGICAL ? 1.5 : 0.8;
    }
    
    if (term.includes('theory') || term.includes('model')) {
      baseWeight *= perspective.type === ResearchCategory.THEORETICAL ? 1.5 : 0.9;
    }
    
    if (term.includes('study') || term.includes('experiment')) {
      baseWeight *= perspective.type === ResearchCategory.EMPIRICAL ? 1.5 : 0.9;
    }

    return baseWeight * perspective.weight;
  }

  /**
   * Get synonyms for a term
   */
  private getSynonyms(term: string): string[] {
    return this.synonymDatabase.get(term.toLowerCase()) || [];
  }

  /**
   * Generate unique sequence ID
   */
  private generateSequenceId(topic: ResearchTopic, perspective: ResearchPerspective): string {
    const topicHash = topic.title.replace(/\s+/g, '_').toLowerCase();
    const perspectiveHash = perspective.type;
    return `${topicHash}_${perspectiveHash}_${Date.now()}`;
  }

  /**
   * Generate human-readable sequence name
   */
  private generateSequenceName(topic: ResearchTopic, perspective: ResearchPerspective): string {
    const baseTitle = topic.title.length > 30 ? topic.title.substring(0, 30) + '...' : topic.title;
    const perspectiveName = this.getPerspectiveName(perspective.type);
    return `${baseTitle} (${perspectiveName})`;
  }

  /**
   * Get human-readable perspective name
   */
  private getPerspectiveName(category: ResearchCategory): string {
    const names = {
      [ResearchCategory.THEORETICAL]: 'Theoretical',
      [ResearchCategory.EMPIRICAL]: 'Empirical',
      [ResearchCategory.METHODOLOGICAL]: 'Methodological',
      [ResearchCategory.APPLIED]: 'Applied',
      [ResearchCategory.REVIEW]: 'Review',
      [ResearchCategory.INTERDISCIPLINARY]: 'Interdisciplinary'
    };
    return names[category];
  }

  /**
   * Initialize domain knowledge base
   */
  private initializeDomainKnowledge(): void {
    // Computer Science domain
    this.domainKnowledge.set('computer_science', new ComputerScienceDomain());
    this.domainKnowledge.set('machine_learning', new MachineLearningDomain());
    this.domainKnowledge.set('artificial_intelligence', new ArtificialIntelligenceDomain());
    
    // Life Sciences domain
    this.domainKnowledge.set('biology', new BiologyDomain());
    this.domainKnowledge.set('medicine', new MedicineDomain());
    this.domainKnowledge.set('biomedical', new BiomedicalDomain());
    
    // Physical Sciences domain
    this.domainKnowledge.set('physics', new PhysicsDomain());
    this.domainKnowledge.set('chemistry', new ChemistryDomain());
    
    // Social Sciences domain
    this.domainKnowledge.set('psychology', new PsychologyDomain());
    this.domainKnowledge.set('sociology', new SociologyDomain());
    this.domainKnowledge.set('economics', new EconomicsDomain());
  }

  /**
   * Initialize synonym database
   */
  private initializeSynonymDatabase(): void {
    // Common research synonyms
    this.synonymDatabase.set('method', ['approach', 'technique', 'methodology', 'procedure']);
    this.synonymDatabase.set('study', ['research', 'investigation', 'analysis', 'examination']);
    this.synonymDatabase.set('model', ['framework', 'paradigm', 'theory', 'structure']);
    this.synonymDatabase.set('analysis', ['examination', 'evaluation', 'assessment', 'investigation']);
    this.synonymDatabase.set('development', ['advancement', 'progress', 'evolution', 'improvement']);
    this.synonymDatabase.set('application', ['implementation', 'utilization', 'deployment', 'usage']);
    this.synonymDatabase.set('performance', ['efficiency', 'effectiveness', 'capability', 'output']);
    this.synonymDatabase.set('optimization', ['improvement', 'enhancement', 'refinement', 'maximization']);
  }

  /**
   * Get method-specific terms
   */
  private getMethodTerms(method: string, perspective: ResearchPerspective): WeightedKeyword[] {
    const methodMap: { [key: string]: string[] } = {
      'quantitative': ['statistical analysis', 'numerical data', 'measurement', 'survey'],
      'qualitative': ['interview', 'case study', 'ethnography', 'content analysis'],
      'experimental': ['controlled trial', 'randomization', 'hypothesis testing', 'variable'],
      'observational': ['longitudinal study', 'cross-sectional', 'cohort study', 'naturalistic'],
      'computational': ['simulation', 'modeling', 'algorithm', 'numerical method'],
      'meta-analysis': ['systematic review', 'effect size', 'heterogeneity', 'publication bias']
    };

    const terms = methodMap[method.toLowerCase()] || [method];
    return terms.map(term => ({
      term,
      weight: 0.8 * perspective.weight,
      category: KeywordCategory.METHODOLOGY
    }));
  }
}

/**
 * Research perspective interface
 */
interface ResearchPerspective {
  type: ResearchCategory;
  focus: string;
  weight: number;
  description: string;
}

/**
 * Base domain knowledge class
 */
abstract class DomainKnowledge {
  abstract getTermsForPerspective(perspective: ResearchCategory): DomainTerm[];
}

interface DomainTerm {
  term: string;
  weight: number;
  categories: KeywordCategory[];
}

/**
 * Computer Science domain knowledge
 */
class ComputerScienceDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    const baseTerms: DomainTerm[] = [
      { term: 'algorithm', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'data structure', weight: 0.9, categories: [KeywordCategory.TECHNICAL] },
      { term: 'computational complexity', weight: 0.8, categories: [KeywordCategory.THEORETICAL] },
      { term: 'software engineering', weight: 0.9, categories: [KeywordCategory.APPLIED] },
      { term: 'distributed systems', weight: 0.8, categories: [KeywordCategory.TECHNICAL] },
      { term: 'database', weight: 0.7, categories: [KeywordCategory.TECHNICAL] }
    ];

    // Filter and adjust based on perspective
    return this.filterTermsByPerspective(baseTerms, perspective);
  }

  private filterTermsByPerspective(terms: DomainTerm[], perspective: ResearchCategory): DomainTerm[] {
    return terms.map(term => {
      let adjustedWeight = term.weight;
      
      if (perspective === ResearchCategory.THEORETICAL && term.categories.includes(KeywordCategory.THEORETICAL)) {
        adjustedWeight *= 1.3;
      }
      if (perspective === ResearchCategory.APPLIED && term.categories.includes(KeywordCategory.APPLIED)) {
        adjustedWeight *= 1.3;
      }
      
      return { ...term, weight: adjustedWeight };
    });
  }
}

/**
 * Machine Learning domain knowledge
 */
class MachineLearningDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    const baseTerms: DomainTerm[] = [
      { term: 'neural network', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'deep learning', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'supervised learning', weight: 0.9, categories: [KeywordCategory.METHODOLOGY] },
      { term: 'unsupervised learning', weight: 0.9, categories: [KeywordCategory.METHODOLOGY] },
      { term: 'reinforcement learning', weight: 0.9, categories: [KeywordCategory.METHODOLOGY] },
      { term: 'feature extraction', weight: 0.8, categories: [KeywordCategory.TECHNICAL] },
      { term: 'model evaluation', weight: 0.8, categories: [KeywordCategory.METHODOLOGY] },
      { term: 'overfitting', weight: 0.7, categories: [KeywordCategory.TECHNICAL] }
    ];

    return this.filterTermsByPerspective(baseTerms, perspective);
  }

  private filterTermsByPerspective(terms: DomainTerm[], perspective: ResearchCategory): DomainTerm[] {
    return terms.map(term => {
      let adjustedWeight = term.weight;
      
      if (perspective === ResearchCategory.METHODOLOGICAL && term.categories.includes(KeywordCategory.METHODOLOGY)) {
        adjustedWeight *= 1.4;
      }
      
      return { ...term, weight: adjustedWeight };
    });
  }
}

// Additional domain classes would be implemented similarly...
class ArtificialIntelligenceDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'artificial intelligence', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'cognitive computing', weight: 0.8, categories: [KeywordCategory.THEORETICAL] },
      { term: 'expert system', weight: 0.7, categories: [KeywordCategory.APPLIED] }
    ];
  }
}

class BiologyDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'molecular biology', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'genetics', weight: 0.9, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'cell biology', weight: 0.9, categories: [KeywordCategory.CORE_CONCEPT] }
    ];
  }
}

class MedicineDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'clinical trial', weight: 1.0, categories: [KeywordCategory.METHODOLOGY] },
      { term: 'diagnosis', weight: 0.9, categories: [KeywordCategory.APPLIED] },
      { term: 'treatment', weight: 0.9, categories: [KeywordCategory.APPLIED] }
    ];
  }
}

class BiomedicalDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'biomedical engineering', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'medical device', weight: 0.8, categories: [KeywordCategory.APPLIED] },
      { term: 'biomarker', weight: 0.9, categories: [KeywordCategory.TECHNICAL] }
    ];
  }
}

class PhysicsDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'quantum mechanics', weight: 1.0, categories: [KeywordCategory.THEORETICAL] },
      { term: 'thermodynamics', weight: 0.9, categories: [KeywordCategory.THEORETICAL] },
      { term: 'particle physics', weight: 0.9, categories: [KeywordCategory.THEORETICAL] }
    ];
  }
}

class ChemistryDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'organic chemistry', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'chemical reaction', weight: 0.9, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'spectroscopy', weight: 0.8, categories: [KeywordCategory.METHODOLOGY] }
    ];
  }
}

class PsychologyDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'cognitive psychology', weight: 1.0, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'behavioral analysis', weight: 0.9, categories: [KeywordCategory.METHODOLOGY] },
      { term: 'psychological assessment', weight: 0.8, categories: [KeywordCategory.METHODOLOGY] }
    ];
  }
}

class SociologyDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'social theory', weight: 1.0, categories: [KeywordCategory.THEORETICAL] },
      { term: 'social network', weight: 0.9, categories: [KeywordCategory.CORE_CONCEPT] },
      { term: 'ethnography', weight: 0.8, categories: [KeywordCategory.METHODOLOGY] }
    ];
  }
}

class EconomicsDomain extends DomainKnowledge {
  getTermsForPerspective(perspective: ResearchCategory): DomainTerm[] {
    return [
      { term: 'economic theory', weight: 1.0, categories: [KeywordCategory.THEORETICAL] },
      { term: 'econometrics', weight: 0.9, categories: [KeywordCategory.METHODOLOGY] },
      { term: 'market analysis', weight: 0.8, categories: [KeywordCategory.APPLIED] }
    ];
  }
}
