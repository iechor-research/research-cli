/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PaperOutlineGenerator,
  PaperOutlineParams,
} from './paper-outline-generator.js';
import { PaperType, ResearchField, JournalStyle } from '../types.js';

describe('PaperOutlineGenerator', () => {
  let generator: PaperOutlineGenerator;

  beforeEach(() => {
    generator = new PaperOutlineGenerator();
  });

  describe('基本属性', () => {
    it('应该有正确的工具属性', () => {
      expect(generator.name).toBe('generate_paper_outline');
      expect(generator.description).toBe('Generate structured paper outline');
      expect(generator.category).toBe('writing');
      expect(generator.version).toBe('1.0.0');
    });
  });

  describe('参数验证', () => {
    it('应该验证必需参数', () => {
      const validParams: PaperOutlineParams = {
        title: 'Test Paper',
        researchTopic: 'Machine Learning',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      expect(generator.validate(validParams)).toBe(true);
    });

    it('应该拒绝缺少标题的参数', () => {
      const invalidParams = {
        title: '',
        researchTopic: 'Machine Learning',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      expect(generator.validate(invalidParams)).toBe(false);
    });

    it('应该拒绝缺少研究主题的参数', () => {
      const invalidParams = {
        title: 'Test Paper',
        researchTopic: '',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      expect(generator.validate(invalidParams)).toBe(false);
    });

    it('应该拒绝无效的最大章节数', () => {
      const invalidParams = {
        title: 'Test Paper',
        researchTopic: 'Machine Learning',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxSections: 2,
      };

      expect(generator.validate(invalidParams)).toBe(false);
    });
  });

  describe('大纲生成', () => {
    it('应该生成实验性论文的完整大纲', async () => {
      const params: PaperOutlineParams = {
        title: 'Novel Machine Learning Approach for Data Analysis',
        researchTopic: 'Deep learning optimization for large datasets',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
        targetJournal: 'IEEE Transactions on Neural Networks',
        journalStyle: JournalStyle.IEEE,
        includeTimeline: true,
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const outline = result.data as any;
      expect(outline.title).toBe(params.title);
      expect(outline.paperType).toBe(params.paperType);
      expect(outline.researchField).toBe(params.researchField);
      expect(outline.sections).toBeInstanceOf(Array);
      expect(outline.sections.length).toBeGreaterThan(0);
      expect(outline.abstractStructure).toBeInstanceOf(Array);
      expect(outline.bibliographyRequirements).toBeDefined();
      expect(outline.timeline).toBeDefined();
      expect(outline.estimatedLength).toBeDefined();
    });

    it('应该生成调查论文的大纲', async () => {
      const params: PaperOutlineParams = {
        title: 'A Survey of Machine Learning Techniques',
        researchTopic: 'Comprehensive review of ML methods',
        paperType: PaperType.SURVEY,
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const outline = result.data as any;

      // 调查论文应该有不同的章节结构
      const relatedWorkSection = outline.sections.find(
        (s: any) => s.id === 'related_work',
      );
      expect(relatedWorkSection?.title).toBe('Literature Survey');

      // 调查论文应该有更多的文献要求
      expect(
        outline.bibliographyRequirements.minReferences,
      ).toBeGreaterThanOrEqual(80);
    });

    it('应该生成理论论文的大纲', async () => {
      const params: PaperOutlineParams = {
        title: 'Theoretical Framework for Optimization',
        researchTopic: 'Mathematical optimization theory',
        paperType: PaperType.THEORETICAL,
        researchField: ResearchField.MATHEMATICS,
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const outline = result.data as any;

      // 理论论文应该有评估章节而不是实验章节
      const evaluationSection = outline.sections.find(
        (s: any) => s.id === 'evaluation',
      );
      expect(evaluationSection).toBeDefined();

      const experimentSection = outline.sections.find(
        (s: any) => s.id === 'experiments',
      );
      expect(experimentSection).toBeUndefined();
    });

    it('应该处理自定义章节', async () => {
      const params: PaperOutlineParams = {
        title: 'Test Paper',
        researchTopic: 'Test Topic',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
        customSections: ['Custom Section 1', 'Custom Section 2'],
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const outline = result.data as any;

      const customSection1 = outline.sections.find(
        (s: any) => s.title === 'Custom Section 1',
      );
      const customSection2 = outline.sections.find(
        (s: any) => s.title === 'Custom Section 2',
      );

      expect(customSection1).toBeDefined();
      expect(customSection2).toBeDefined();
      expect(customSection1.required).toBe(false);
      expect(customSection2.required).toBe(false);
    });

    it('应该限制章节数量', async () => {
      const params: PaperOutlineParams = {
        title: 'Test Paper',
        researchTopic: 'Test Topic',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxSections: 5,
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const outline = result.data as any;
      expect(outline.sections.length).toBeLessThanOrEqual(5);
    });

    it('应该在没有时间线时不包含时间线', async () => {
      const params: PaperOutlineParams = {
        title: 'Test Paper',
        researchTopic: 'Test Topic',
        paperType: PaperType.EXPERIMENTAL,
        researchField: ResearchField.COMPUTER_SCIENCE,
        includeTimeline: false,
      };

      const result = await generator.execute(params);

      expect(result.success).toBe(true);
      const outline = result.data as any;
      expect(outline.timeline).toBeUndefined();
    });
  });

  describe('帮助信息', () => {
    it('应该提供详细的帮助信息', () => {
      const help = generator.getHelp();

      expect(help).toContain('Generate a structured paper outline');
      expect(help).toContain('title');
      expect(help).toContain('researchTopic');
      expect(help).toContain('paperType');
      expect(help).toContain('researchField');
    });
  });

  describe('错误处理', () => {
    it('应该处理无效参数', async () => {
      const invalidParams = {
        title: '',
        researchTopic: '',
        paperType: undefined,
        researchField: undefined,
      };

      const result = await generator.execute(invalidParams as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
