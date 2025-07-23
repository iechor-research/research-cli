import { BaseResearchTool } from '../base-tool.js';
import {
  ResearchToolResult,
  ResearchToolParams,
  PaperOutline,
  PaperType,
  ResearchField,
  JournalStyle,
  OutlineSection,
  OutlineSubsection,
  ResearchToolCategory
} from '../types.js';

export interface PaperOutlineParams extends ResearchToolParams {
  title: string;
  researchTopic: string;
  paperType: PaperType;
  researchField: ResearchField;
  targetJournal?: string;
  journalStyle?: JournalStyle;
  includeTimeline?: boolean;
  customSections?: string[];
  maxSections?: number;
}

export class PaperOutlineGenerator extends BaseResearchTool<PaperOutlineParams, PaperOutline> {
  constructor() {
    super(
      'generate_paper_outline',
      'Generate structured paper outline',
      ResearchToolCategory.WRITING
    );
  }

  public validate(params: ResearchToolParams): boolean {
    const typedParams = params as PaperOutlineParams;
    return !!(
      typedParams.title?.trim() &&
      typedParams.researchTopic?.trim() &&
      typedParams.paperType &&
      typedParams.researchField &&
      (!typedParams.maxSections || typedParams.maxSections >= 3)
    );
  }

  public getHelp(): string {
    return this.formatHelp(
      'Generate a structured paper outline based on research topic and requirements',
      [
        { name: 'title', type: 'string', required: true, description: 'Paper title' },
        { name: 'researchTopic', type: 'string', required: true, description: 'Research topic description' },
        { name: 'paperType', type: 'PaperType', required: true, description: 'Type of paper (survey, experimental, etc.)' },
        { name: 'researchField', type: 'ResearchField', required: true, description: 'Research field' },
        { name: 'targetJournal', type: 'string', required: false, description: 'Target journal name' },
        { name: 'journalStyle', type: 'JournalStyle', required: false, description: 'Citation style preference' },
        { name: 'includeTimeline', type: 'boolean', required: false, description: 'Include research timeline' },
        { name: 'customSections', type: 'string[]', required: false, description: 'Additional custom sections' },
        { name: 'maxSections', type: 'number', required: false, description: 'Maximum number of sections' }
      ],
      [
        {
          description: 'Generate outline for an experimental computer science paper',
          params: {
            title: 'Novel Machine Learning Approach for Data Analysis',
            researchTopic: 'Machine learning optimization',
            paperType: 'experimental',
            researchField: 'computer_science',
            includeTimeline: true
          }
        }
      ]
    );
  }

  protected validateInput(params: PaperOutlineParams): void {
    if (!params.title?.trim()) {
      throw new Error('Paper title is required');
    }
    if (!params.researchTopic?.trim()) {
      throw new Error('Research topic is required');
    }
    if (!params.paperType) {
      throw new Error('Paper type is required');
    }
    if (!params.researchField) {
      throw new Error('Research field is required');
    }
    if (params.maxSections && params.maxSections < 3) {
      throw new Error('Maximum sections must be at least 3');
    }
  }

  protected async executeImpl(params: PaperOutlineParams): Promise<PaperOutline> {
    // Generate sections based on paper type and journal requirements
    const sections = this.generateSections(params);
    
    // Create timeline if requested
    const timeline = params.includeTimeline ? this.generateTimeline(sections.length) : undefined;
    
    // Generate abstract structure
    const abstractStructure = this.generateAbstractStructure(params.paperType);
    
    // Create bibliography requirements
    const bibliographyRequirements = this.generateBibliographyRequirements(
      params.paperType,
      params.researchField,
      params.journalStyle
    );

    return {
      title: params.title,
      paperType: params.paperType,
      researchField: params.researchField,
      targetJournal: params.targetJournal,
      journalStyle: params.journalStyle || JournalStyle.APA,
      sections,
      abstractStructure,
      bibliographyRequirements,
      timeline,
      estimatedLength: this.estimateLength(sections, params.paperType),
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  private generateSections(params: PaperOutlineParams): OutlineSection[] {
    const baseSections = this.getBaseSections(params.paperType, params.researchField);
    
    // Add custom sections if provided
    if (params.customSections?.length) {
      const customSecs: OutlineSection[] = params.customSections.map((title, index) => ({
        id: `custom_${index + 1}`,
        title,
        description: `Custom section: ${title}`,
        subsections: [],
        estimatedPages: 2,
        keyPoints: [],
        required: false
      }));
      baseSections.push(...customSecs);
    }

    // Apply max sections limit
    if (params.maxSections && baseSections.length > params.maxSections) {
      return baseSections.slice(0, params.maxSections);
    }

    return baseSections;
  }

  private getBaseSections(paperType: PaperType, field: ResearchField): OutlineSection[] {
    const sections: OutlineSection[] = [];

    // Introduction (always required)
    sections.push({
      id: 'introduction',
      title: 'Introduction',
      description: 'Problem statement, motivation, and research objectives',
      subsections: [
        {
          id: 'background',
          title: 'Background',
          description: 'Context and motivation for the research'
        },
        {
          id: 'problem_statement',
          title: 'Problem Statement',
          description: 'Clear definition of the research problem'
        },
        {
          id: 'objectives',
          title: 'Research Objectives',
          description: 'Specific goals and research questions'
        },
        {
          id: 'contributions',
          title: 'Contributions',
          description: 'Main contributions of this work'
        }
      ],
      estimatedPages: 3,
      keyPoints: [
        'Clear problem statement',
        'Research motivation',
        'Specific objectives',
        'Paper organization'
      ],
      required: true
    });

    // Literature Review/Related Work
    sections.push({
      id: 'related_work',
      title: paperType === PaperType.SURVEY ? 'Literature Survey' : 'Related Work',
      description: 'Review of existing literature and related research',
      subsections: this.getRelatedWorkSubsections(paperType, field),
      estimatedPages: paperType === PaperType.SURVEY ? 8 : 4,
      keyPoints: [
        'Comprehensive literature review',
        'Gap identification',
        'Comparative analysis',
        'Positioning of current work'
      ],
      required: true
    });

    // Add methodology/approach section based on paper type
    if (paperType !== PaperType.SURVEY) {
      sections.push({
        id: 'methodology',
        title: this.getMethodologyTitle(paperType),
        description: 'Research methodology and proposed approach',
        subsections: this.getMethodologySubsections(paperType, field),
        estimatedPages: paperType === PaperType.EXPERIMENTAL ? 5 : 4,
        keyPoints: this.getMethodologyKeyPoints(paperType),
        required: true
      });
    }

    // Experimental/Results section
    if ([PaperType.EXPERIMENTAL, PaperType.EMPIRICAL].includes(paperType)) {
      sections.push({
        id: 'experiments',
        title: 'Experiments and Results',
        description: 'Experimental setup, results, and analysis',
        subsections: [
          {
            id: 'experimental_setup',
            title: 'Experimental Setup',
            description: 'Description of experimental configuration'
          },
          {
            id: 'results',
            title: 'Results',
            description: 'Presentation of experimental results'
          },
          {
            id: 'analysis',
            title: 'Analysis and Discussion',
            description: 'Analysis and interpretation of results'
          }
        ],
        estimatedPages: 6,
        keyPoints: [
          'Clear experimental design',
          'Comprehensive results',
          'Statistical analysis',
          'Discussion of findings'
        ],
        required: true
      });
    }

    // Evaluation section for theoretical papers
    if ([PaperType.THEORETICAL, PaperType.CONCEPTUAL].includes(paperType)) {
      sections.push({
        id: 'evaluation',
        title: 'Evaluation',
        description: 'Validation and evaluation of the proposed approach',
        subsections: [
          {
            id: 'validation_method',
            title: 'Validation Method',
            description: 'Approach for validating the theoretical work'
          },
          {
            id: 'case_studies',
            title: 'Case Studies',
            description: 'Application examples and case studies'
          },
          {
            id: 'comparison',
            title: 'Comparison',
            description: 'Comparison with existing approaches'
          }
        ],
        estimatedPages: 4,
        keyPoints: [
          'Validation methodology',
          'Concrete examples',
          'Comparative analysis',
          'Limitations discussion'
        ],
        required: true
      });
    }

    // Discussion (for most paper types)
    if (paperType !== PaperType.SURVEY) {
      sections.push({
        id: 'discussion',
        title: 'Discussion',
        description: 'Implications, limitations, and future work',
        subsections: [
          {
            id: 'implications',
            title: 'Implications',
            description: 'Theoretical and practical implications'
          },
          {
            id: 'limitations',
            title: 'Limitations',
            description: 'Study limitations and constraints'
          },
          {
            id: 'future_work',
            title: 'Future Work',
            description: 'Directions for future research'
          }
        ],
        estimatedPages: 2,
        keyPoints: [
          'Research implications',
          'Honest limitations',
          'Future directions',
          'Broader impact'
        ],
        required: true
      });
    }

    // Conclusion
    sections.push({
      id: 'conclusion',
      title: 'Conclusion',
      description: 'Summary of contributions and final remarks',
      subsections: [
        {
          id: 'summary',
          title: 'Summary',
          description: 'Summary of main findings and contributions'
        },
        {
          id: 'final_remarks',
          title: 'Final Remarks',
          description: 'Concluding thoughts and recommendations'
        }
      ],
      estimatedPages: 1,
      keyPoints: [
        'Clear summary',
        'Key contributions',
        'Final thoughts',
        'Call to action'
      ],
      required: true
    });

    return sections;
  }

  private getRelatedWorkSubsections(paperType: PaperType, field: ResearchField): OutlineSubsection[] {
    const base: OutlineSubsection[] = [
      {
        id: 'background_theory',
        title: 'Background and Theory',
        description: 'Fundamental concepts and theoretical background'
      },
      {
        id: 'existing_approaches',
        title: 'Existing Approaches',
        description: 'Review of current state-of-the-art methods'
      }
    ];

    if (paperType === PaperType.SURVEY) {
      base.push(
        {
          id: 'classification',
          title: 'Classification and Taxonomy',
          description: 'Classification of existing approaches'
        },
        {
          id: 'comparative_analysis',
          title: 'Comparative Analysis',
          description: 'Detailed comparison of different methods'
        },
        {
          id: 'open_challenges',
          title: 'Open Challenges',
          description: 'Identification of current challenges and gaps'
        }
      );
    } else {
      base.push({
        id: 'gap_analysis',
        title: 'Gap Analysis',
        description: 'Identification of research gaps and opportunities'
      });
    }

    return base;
  }

  private getMethodologyTitle(paperType: PaperType): string {
    switch (paperType) {
      case PaperType.THEORETICAL:
        return 'Theoretical Framework';
      case PaperType.EXPERIMENTAL:
        return 'Methodology';
      case PaperType.EMPIRICAL:
        return 'Research Method';
      case PaperType.CONCEPTUAL:
        return 'Conceptual Framework';
      default:
        return 'Approach';
    }
  }

  private getMethodologySubsections(paperType: PaperType, field: ResearchField): OutlineSubsection[] {
    const base: OutlineSubsection[] = [];

    switch (paperType) {
      case PaperType.THEORETICAL:
        base.push(
          {
            id: 'theoretical_foundation',
            title: 'Theoretical Foundation',
            description: 'Mathematical or theoretical basis'
          },
          {
            id: 'formal_model',
            title: 'Formal Model',
            description: 'Formal representation and model definition'
          },
          {
            id: 'properties',
            title: 'Properties and Analysis',
            description: 'Analysis of model properties and characteristics'
          }
        );
        break;

      case PaperType.EXPERIMENTAL:
        base.push(
          {
            id: 'research_design',
            title: 'Research Design',
            description: 'Overall experimental design and approach'
          },
          {
            id: 'data_collection',
            title: 'Data Collection',
            description: 'Data sources and collection methodology'
          },
          {
            id: 'analysis_methods',
            title: 'Analysis Methods',
            description: 'Statistical and analytical methods'
          }
        );
        break;

      case PaperType.EMPIRICAL:
        base.push(
          {
            id: 'study_design',
            title: 'Study Design',
            description: 'Empirical study design and methodology'
          },
          {
            id: 'participants',
            title: 'Participants and Setting',
            description: 'Study participants and environmental setup'
          },
          {
            id: 'measures',
            title: 'Measures and Procedures',
            description: 'Measurement instruments and procedures'
          }
        );
        break;

      default:
        base.push(
          {
            id: 'approach_overview',
            title: 'Approach Overview',
            description: 'High-level description of the proposed approach'
          },
          {
            id: 'detailed_method',
            title: 'Detailed Method',
            description: 'Step-by-step description of the method'
          }
        );
    }

    return base;
  }

  private getMethodologyKeyPoints(paperType: PaperType): string[] {
    const base = ['Clear methodology', 'Reproducible approach', 'Justified decisions'];

    switch (paperType) {
      case PaperType.THEORETICAL:
        return [...base, 'Mathematical rigor', 'Formal proofs'];
      case PaperType.EXPERIMENTAL:
        return [...base, 'Controlled variables', 'Statistical validity'];
      case PaperType.EMPIRICAL:
        return [...base, 'Ethical considerations', 'Sample representativeness'];
      default:
        return [...base, 'Implementation details'];
    }
  }

  private generateAbstractStructure(paperType: PaperType): string[] {
    const base = ['Background and motivation', 'Problem statement'];

    switch (paperType) {
      case PaperType.SURVEY:
        return [
          ...base,
          'Survey scope and methodology',
          'Key findings and classifications',
          'Open challenges and future directions'
        ];
      case PaperType.THEORETICAL:
        return [
          ...base,
          'Theoretical approach and contributions',
          'Key results and properties',
          'Implications and applications'
        ];
      case PaperType.EXPERIMENTAL:
        return [
          ...base,
          'Methodology and experimental design',
          'Key results and findings',
          'Conclusions and implications'
        ];
      default:
        return [
          ...base,
          'Proposed approach and method',
          'Evaluation and results',
          'Main contributions and conclusions'
        ];
    }
  }

  private generateBibliographyRequirements(
    paperType: PaperType,
    field: ResearchField,
    style?: JournalStyle
  ): { minReferences: number; recommendedTypes: string[]; citationStyle: JournalStyle } {
    let minReferences: number;
    let recommendedTypes: string[];

    // Set minimum references based on paper type
    switch (paperType) {
      case PaperType.SURVEY:
        minReferences = 80;
        recommendedTypes = ['journal articles', 'conference papers', 'technical reports', 'books'];
        break;
      case PaperType.THEORETICAL:
        minReferences = 30;
        recommendedTypes = ['journal articles', 'conference papers', 'books', 'technical reports'];
        break;
      case PaperType.EXPERIMENTAL:
        minReferences = 40;
        recommendedTypes = ['journal articles', 'conference papers', 'datasets', 'software'];
        break;
      case PaperType.EMPIRICAL:
        minReferences = 50;
        recommendedTypes = ['journal articles', 'conference papers', 'reports', 'datasets'];
        break;
      default:
        minReferences = 25;
        recommendedTypes = ['journal articles', 'conference papers'];
    }

    // Adjust based on research field
    if ([ResearchField.COMPUTER_SCIENCE, ResearchField.ENGINEERING].includes(field)) {
      recommendedTypes.push('software repositories', 'technical standards');
    }

    return {
      minReferences,
      recommendedTypes,
      citationStyle: style || JournalStyle.IEEE
    };
  }

  private generateTimeline(sectionCount: number): { phase: string; duration: string; description: string }[] {
    const baseWeeks = Math.max(8, sectionCount * 2);
    const phases = [
      {
        phase: 'Literature Review',
        duration: `${Math.ceil(baseWeeks * 0.25)} weeks`,
        description: 'Comprehensive review of existing literature'
      },
      {
        phase: 'Research and Development',
        duration: `${Math.ceil(baseWeeks * 0.4)} weeks`,
        description: 'Core research work and methodology development'
      },
      {
        phase: 'Experimentation/Validation',
        duration: `${Math.ceil(baseWeeks * 0.2)} weeks`,
        description: 'Experiments, validation, and result analysis'
      },
      {
        phase: 'Writing and Review',
        duration: `${Math.ceil(baseWeeks * 0.15)} weeks`,
        description: 'Paper writing and internal review'
      }
    ];

    return phases;
  }

  private estimateLength(sections: OutlineSection[], paperType: PaperType): { pages: number; words: number } {
    const totalPages = sections.reduce((sum, section) => sum + section.estimatedPages, 0);
    
    // Add pages for references, appendices, etc.
    const additionalPages = paperType === PaperType.SURVEY ? 8 : 4;
    const finalPages = totalPages + additionalPages;
    
    // Estimate words (approximately 300-400 words per page for academic papers)
    const wordsPerPage = 350;
    const estimatedWords = finalPages * wordsPerPage;

    return {
      pages: finalPages,
      words: estimatedWords
    };
  }
} 