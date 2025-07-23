/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { lightTheme, Theme, type ColorsTheme } from './theme.js';

const iechorCodeColors: ColorsTheme = {
  type: 'light',
  Background: 'white',
  Foreground: 'black',
  LightBlue: '#066',
  AccentBlue: '#008',
  AccentPurple: '#606',
  AccentCyan: '#066',
  AccentGreen: '#080',
  AccentYellow: '#660',
  AccentRed: '#800',
  Comment: '#5f6368',
  Gray: lightTheme.Gray,
  GradientColors: ['#066', '#606'],
};

export const iEchorCode: Theme = new Theme(
  'iEchor Code',
  'light',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: iechorCodeColors.Background,
      color: iechorCodeColors.Foreground,
    },
    'hljs-comment': {
      color: iechorCodeColors.AccentRed,
    },
    'hljs-quote': {
      color: iechorCodeColors.AccentRed,
    },
    'hljs-keyword': {
      color: iechorCodeColors.AccentBlue,
    },
    'hljs-selector-tag': {
      color: iechorCodeColors.AccentBlue,
    },
    'hljs-section': {
      color: iechorCodeColors.AccentBlue,
    },
    'hljs-title': {
      color: iechorCodeColors.AccentPurple,
    },
    'hljs-name': {
      color: iechorCodeColors.AccentBlue,
    },
    'hljs-variable': {
      color: iechorCodeColors.AccentYellow,
    },
    'hljs-template-variable': {
      color: iechorCodeColors.AccentYellow,
    },
    'hljs-string': {
      color: iechorCodeColors.AccentGreen,
    },
    'hljs-selector-attr': {
      color: iechorCodeColors.AccentGreen,
    },
    'hljs-selector-pseudo': {
      color: iechorCodeColors.AccentGreen,
    },
    'hljs-regexp': {
      color: iechorCodeColors.AccentGreen,
    },
    'hljs-literal': {
      color: iechorCodeColors.AccentCyan,
    },
    'hljs-symbol': {
      color: iechorCodeColors.AccentCyan,
    },
    'hljs-bullet': {
      color: iechorCodeColors.AccentCyan,
    },
    'hljs-meta': {
      color: iechorCodeColors.AccentCyan,
    },
    'hljs-number': {
      color: iechorCodeColors.AccentCyan,
    },
    'hljs-link': {
      color: iechorCodeColors.AccentCyan,
    },
    'hljs-doctag': {
      color: iechorCodeColors.AccentPurple,
      fontWeight: 'bold',
    },
    'hljs-type': {
      color: iechorCodeColors.AccentPurple,
    },
    'hljs-attr': {
      color: iechorCodeColors.AccentPurple,
    },
    'hljs-built_in': {
      color: iechorCodeColors.AccentPurple,
    },
    'hljs-builtin-name': {
      color: iechorCodeColors.AccentPurple,
    },
    'hljs-params': {
      color: iechorCodeColors.AccentPurple,
    },
    'hljs-attribute': {
      color: iechorCodeColors.Foreground,
    },
    'hljs-subst': {
      color: iechorCodeColors.Foreground,
    },
    'hljs-formula': {
      backgroundColor: '#eee',
      fontStyle: 'italic',
    },
    'hljs-selector-id': {
      color: iechorCodeColors.AccentYellow,
    },
    'hljs-selector-class': {
      color: iechorCodeColors.AccentYellow,
    },
    'hljs-addition': {
      backgroundColor: '#baeeba',
    },
    'hljs-deletion': {
      backgroundColor: '#ffc8bd',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
  },
  iechorCodeColors,
);
