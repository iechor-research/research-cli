/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthType,
  UserTierId,
  DEFAULT_RESEARCH_FLASH_MODEL,
  DEFAULT_RESEARCH_MODEL,
  isProQuotaExceededError,
  isGenericQuotaExceededError,
  isApiError,
  isStructuredError,
} from '@iechor/research-cli-core';

// Free Tier message functions
const getRateLimitErrorMessageiEchorFree = (
  fallbackModel: string = DEFAULT_RESEARCH_FLASH_MODEL,
) =>
  `\nPossible quota limitations in place or slow response times detected. Switching to the ${fallbackModel} model for the rest of this session.`;

const getRateLimitErrorMessageiEchorProQuotaFree = (
  currentModel: string = DEFAULT_RESEARCH_MODEL,
  fallbackModel: string = DEFAULT_RESEARCH_FLASH_MODEL,
) =>
  `\nYou have reached your daily ${currentModel} quota limit. You will be switched to the ${fallbackModel} model for the rest of this session. To increase your limits, upgrade to a Research Code Assist Standard or Enterprise plan with higher limits at https://goo.gle/set-up-research-code-assist, or use /auth to switch to using a paid API key from AI Studio at https://aistudio.iechor.com/apikey`;

const getRateLimitErrorMessageiEchorGenericQuotaFree = () =>
  `\nYou have reached your daily quota limit. To increase your limits, upgrade to a Research Code Assist Standard or Enterprise plan with higher limits at https://goo.gle/set-up-research-code-assist, or use /auth to switch to using a paid API key from AI Studio at https://aistudio.iechor.com/apikey`;

// Legacy/Standard Tier message functions
const getRateLimitErrorMessageiEchorPaid = (
  fallbackModel: string = DEFAULT_RESEARCH_FLASH_MODEL,
) =>
  `\nPossible quota limitations in place or slow response times detected. Switching to the ${fallbackModel} model for the rest of this session. We appreciate you for choosing Research Code Assist and the Research CLI.`;

const getRateLimitErrorMessageiEchorProQuotaPaid = (
  currentModel: string = DEFAULT_RESEARCH_MODEL,
  fallbackModel: string = DEFAULT_RESEARCH_FLASH_MODEL,
) =>
  `\nYou have reached your daily ${currentModel} quota limit. You will be switched to the ${fallbackModel} model for the rest of this session. We appreciate you for choosing Research Code Assist and the Research CLI. To continue accessing the ${currentModel} model today, consider using /auth to switch to using a paid API key from AI Studio at https://aistudio.iechor.com/apikey`;

const getRateLimitErrorMessageiEchorGenericQuotaPaid = (
  currentModel: string = DEFAULT_RESEARCH_MODEL,
) =>
  `\nYou have reached your daily quota limit. We appreciate you for choosing Research Code Assist and the Research CLI. To continue accessing the ${currentModel} model today, consider using /auth to switch to using a paid API key from AI Studio at https://aistudio.iechor.com/apikey`;
const RATE_LIMIT_ERROR_MESSAGE_USE_RESEARCH =
  '\nPlease wait and try again later. To increase your limits, request a quota increase through AI Studio, or switch to another /auth method';
const RATE_LIMIT_ERROR_MESSAGE_VERTEX =
  '\nPlease wait and try again later. To increase your limits, request a quota increase through Vertex, or switch to another /auth method';
const getRateLimitErrorMessageDefault = (
  fallbackModel: string = DEFAULT_RESEARCH_FLASH_MODEL,
) =>
  `\nPossible quota limitations in place or slow response times detected. Switching to the ${fallbackModel} model for the rest of this session.`;

function getRateLimitMessage(
  authType?: AuthType,
  error?: unknown,
  userTier?: UserTierId,
  currentModel?: string,
  fallbackModel?: string,
): string {
  switch (authType) {
    case AuthType.LOGIN_WITH_GOOGLE: {
      // Determine if user is on a paid tier (Legacy or Standard) - default to FREE if not specified
      const isPaidTier =
        userTier === UserTierId.LEGACY || userTier === UserTierId.STANDARD;

      if (isProQuotaExceededError(error)) {
        return isPaidTier
          ? getRateLimitErrorMessageiEchorProQuotaPaid(
              currentModel || DEFAULT_RESEARCH_MODEL,
              fallbackModel,
            )
          : getRateLimitErrorMessageiEchorProQuotaFree(
              currentModel || DEFAULT_RESEARCH_MODEL,
              fallbackModel,
            );
      } else if (isGenericQuotaExceededError(error)) {
        return isPaidTier
          ? getRateLimitErrorMessageiEchorGenericQuotaPaid(
              currentModel || DEFAULT_RESEARCH_MODEL,
            )
          : getRateLimitErrorMessageiEchorGenericQuotaFree();
      } else {
        return isPaidTier
          ? getRateLimitErrorMessageiEchorPaid(fallbackModel)
          : getRateLimitErrorMessageiEchorFree(fallbackModel);
      }
    }
    case AuthType.USE_RESEARCH:
      return RATE_LIMIT_ERROR_MESSAGE_USE_RESEARCH;
    case AuthType.USE_VERTEX_AI:
      return RATE_LIMIT_ERROR_MESSAGE_VERTEX;
    default:
      return getRateLimitErrorMessageDefault(fallbackModel);
  }
}

export function parseAndFormatApiError(
  error: unknown,
  authType?: AuthType,
  userTier?: UserTierId,
  currentModel?: string,
  fallbackModel?: string,
): string {
  if (isStructuredError(error)) {
    let text = `[API Error: ${error.message}]`;
    if (error.status === 429) {
      text += getRateLimitMessage(
        authType,
        error,
        userTier,
        currentModel,
        fallbackModel,
      );
    }
    return text;
  }

  // The error message might be a string containing a JSON object.
  if (typeof error === 'string') {
    const jsonStart = error.indexOf('{');
    if (jsonStart === -1) {
      return `[API Error: ${error}]`; // Not a JSON error, return as is.
    }

    const jsonString = error.substring(jsonStart);

    try {
      const parsedError = JSON.parse(jsonString) as unknown;
      if (isApiError(parsedError)) {
        let finalMessage = parsedError.error.message;
        try {
          // See if the message is a stringified JSON with another error
          const nestedError = JSON.parse(finalMessage) as unknown;
          if (isApiError(nestedError)) {
            finalMessage = nestedError.error.message;
          }
        } catch (_e) {
          // It's not a nested JSON error, so we just use the message as is.
        }
        let text = `[API Error: ${finalMessage} (Status: ${parsedError.error.status})]`;
        if (parsedError.error.code === 429) {
          text += getRateLimitMessage(
            authType,
            parsedError,
            userTier,
            currentModel,
            fallbackModel,
          );
        }
        return text;
      }
    } catch (_e) {
      // Not a valid JSON, fall through and return the original message.
    }
    return `[API Error: ${error}]`;
  }

  return '[API Error: An unknown error occurred.]';
}
