/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ANSI颜色代码
 */
export const Colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',

  // 前景色
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m',
  White: '\x1b[37m',

  // 背景色
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
} as const;

/**
 * 表格列定义
 */
export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  color?: string;
}

/**
 * 表格配置
 */
export interface TableConfig {
  showHeaders: boolean;
  showBorders: boolean;
  maxWidth?: number;
  colorScheme: 'default' | 'accent' | 'muted';
}

/**
 * 格式化表格数据
 */
export function formatTable(
  data: Record<string, any>[],
  columns: TableColumn[],
  config: TableConfig = {
    showHeaders: true,
    showBorders: true,
    colorScheme: 'default',
  },
): string {
  if (data.length === 0) {
    return colorize('No data to display.', Colors.Dim);
  }

  // 计算列宽
  const columnWidths = columns.map((col) => {
    if (col.width) return col.width;

    const headerWidth = col.title.length;
    const maxDataWidth = Math.max(
      ...data.map((row) => String(row[col.key] || '').length),
    );
    return Math.max(headerWidth, maxDataWidth);
  });

  const borderColor = getColorByScheme(config.colorScheme, 'border');
  const headerColor = getColorByScheme(config.colorScheme, 'header');

  let result = '';

  // 顶部边框
  if (config.showBorders) {
    result +=
      colorize(createBorderRow(columnWidths, '┌', '┬', '┐'), borderColor) +
      '\n';
  }

  // 表头
  if (config.showHeaders) {
    const headerRow = columns
      .map((col, i) =>
        colorize(padString(col.title, columnWidths[i], col.align), headerColor),
      )
      .join(colorize(' │ ', borderColor));

    result +=
      colorize('│ ', borderColor) +
      headerRow +
      colorize(' │', borderColor) +
      '\n';

    if (config.showBorders) {
      result +=
        colorize(createBorderRow(columnWidths, '├', '┼', '┤'), borderColor) +
        '\n';
    }
  }

  // 数据行
  for (const row of data) {
    const dataRow = columns
      .map((col, i) => {
        const value = String(row[col.key] || '');
        const color = col.color || getColorByScheme(config.colorScheme, 'data');
        return colorize(padString(value, columnWidths[i], col.align), color);
      })
      .join(colorize(' │ ', borderColor));

    result +=
      colorize('│ ', borderColor) +
      dataRow +
      colorize(' │', borderColor) +
      '\n';
  }

  // 底部边框
  if (config.showBorders) {
    result += colorize(
      createBorderRow(columnWidths, '└', '┴', '┘'),
      borderColor,
    );
  }

  return result;
}

/**
 * 格式化列表
 */
export function formatList(
  items: string[],
  style: 'bullet' | 'numbered' | 'dash' = 'bullet',
  color = Colors.Reset,
): string {
  return items
    .map((item, index) => {
      let prefix = '';
      switch (style) {
        case 'bullet':
          prefix = '• ';
          break;
        case 'numbered':
          prefix = `${index + 1}. `;
          break;
        case 'dash':
          prefix = '- ';
          break;
      }
      return colorize(prefix + item, color);
    })
    .join('\n');
}

/**
 * 格式化进度条
 */
export function formatProgressBar(
  current: number,
  total: number,
  width = 20,
  showPercentage = true,
): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;

  const bar =
    Colors.Green +
    '█'.repeat(filled) +
    Colors.Dim +
    '░'.repeat(empty) +
    Colors.Reset;
  const percentText = showPercentage ? ` ${percentage}%` : '';

  return `[${bar}]${percentText}`;
}

/**
 * 格式化键值对
 */
export function formatKeyValue(
  data: Record<string, any>,
  keyColor = Colors.Cyan,
  valueColor = Colors.Reset,
): string {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        colorize(key + ':', keyColor) +
        ' ' +
        colorize(String(value), valueColor),
    )
    .join('\n');
}

/**
 * 格式化成功消息
 */
export function formatSuccess(message: string): string {
  return colorize('✓ ', Colors.Green) + colorize(message, Colors.Reset);
}

/**
 * 格式化错误消息
 */
export function formatError(message: string): string {
  return colorize('✗ ', Colors.Red) + colorize(message, Colors.Red);
}

/**
 * 格式化警告消息
 */
export function formatWarning(message: string): string {
  return colorize('⚠ ', Colors.Yellow) + colorize(message, Colors.Yellow);
}

/**
 * 格式化信息消息
 */
export function formatInfo(message: string): string {
  return colorize('ℹ ', Colors.Blue) + colorize(message, Colors.Reset);
}

/**
 * 辅助函数：添加颜色
 */
function colorize(text: string, color: string): string {
  return color + text + Colors.Reset;
}

/**
 * 辅助函数：填充字符串到指定宽度
 */
function padString(
  str: string,
  width: number,
  align: 'left' | 'center' | 'right' = 'left',
): string {
  if (str.length >= width) return str.substring(0, width);

  const padding = width - str.length;
  switch (align) {
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
    case 'right':
      return ' '.repeat(padding) + str;
    default:
      return str + ' '.repeat(padding);
  }
}

/**
 * 辅助函数：创建边框行
 */
function createBorderRow(
  widths: number[],
  left: string,
  middle: string,
  right: string,
): string {
  return left + widths.map((w) => '─'.repeat(w + 2)).join(middle) + right;
}

/**
 * 辅助函数：根据配色方案获取颜色
 */
function getColorByScheme(
  scheme: 'default' | 'accent' | 'muted',
  type: 'border' | 'header' | 'data',
): string {
  switch (scheme) {
    case 'accent':
      return type === 'header'
        ? Colors.Cyan
        : type === 'border'
          ? Colors.Blue
          : Colors.Reset;
    case 'muted':
      return Colors.Dim;
    default:
      return type === 'header' ? Colors.Bright : Colors.Reset;
  }
}
