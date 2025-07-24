/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getModelTokenLimit } from './model-providers/model-utils.js';

type Model = string;
type TokenCount = number;

export const DEFAULT_TOKEN_LIMIT = 1_048_576;

export function tokenLimit(model: Model): TokenCount {
  // 使用新的模型工具来获取 token 限制
  return getModelTokenLimit(model);
}
