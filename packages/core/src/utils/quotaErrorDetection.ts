/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { StructuredError } from '../core/turn.js';

export interface ApiError {
  error: {
    code: number;
    message: string;
    status: string;
    details: unknown[];
  };
}

export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null || !('error' in error)) {
    return false;
  }
  const errorProp = (error as { error: unknown }).error;
  if (typeof errorProp !== 'object' || errorProp === null) {
    return false;
  }

  return (
    'code' in errorProp &&
    typeof errorProp.code === 'number' &&
    'message' in errorProp &&
    typeof errorProp.message === 'string' &&
    'status' in errorProp &&
    typeof errorProp.status === 'string'
  );
}

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') {
    return error;
  }
  if (isApiError(error)) {
    return error.error.message;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return undefined;
}

// Matches a "Pro" model quota metric, e.g.
// "Quota exceeded for quota metric 'Research 2.5 Pro Requests'" or
// "Quota exceeded for quota metric 'Gemini 2.5-preview Pro Requests'".
const PRO_QUOTA_REGEX =
  /Quota exceeded for quota metric '(?:Gemini|Research) [\d.]+(?:-[a-zA-Z]+)? Pro Requests'/;

/**
 * Returns true when the error indicates that a "Pro" model daily quota has been exceeded.
 */
export function isProQuotaExceededError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message !== undefined && PRO_QUOTA_REGEX.test(message);
}

/**
 * Returns true when the error indicates that any quota metric has been exceeded.
 */
export function isGenericQuotaExceededError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    message !== undefined &&
    message.includes('Quota exceeded for quota metric')
  );
}

export function isStructuredError(error: unknown): error is StructuredError {
  if (typeof error !== 'object' || error === null || !('message' in error)) {
    return false;
  }
  if (typeof error.message !== 'string') {
    return false;
  }
  if ('status' in error && typeof error.status !== 'number') {
    return false;
  }
  return true;
}
