/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SandboxConfig } from '@iechor/research-cli-core';

export function createMockSandboxConfig(
  overrides?: Partial<SandboxConfig>,
): SandboxConfig {
  return {
    enabled: true,
    allowedPaths: [],
    networkAccess: false,
    ...overrides,
  };
}
