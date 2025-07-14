/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const SERVICE_NAME = 'research-cli';

export const EVENT_USER_PROMPT = 'research_cli.user_prompt';
export const EVENT_TOOL_CALL = 'research_cli.tool_call';
export const EVENT_API_REQUEST = 'research_cli.api_request';
export const EVENT_API_ERROR = 'research_cli.api_error';
export const EVENT_API_RESPONSE = 'research_cli.api_response';
export const EVENT_CLI_CONFIG = 'research_cli.config';
export const EVENT_FLASH_FALLBACK = 'research_cli.flash_fallback';

export const METRIC_TOOL_CALL_COUNT = 'research_cli.tool.call.count';
export const METRIC_TOOL_CALL_LATENCY = 'research_cli.tool.call.latency';
export const METRIC_API_REQUEST_COUNT = 'research_cli.api.request.count';
export const METRIC_API_REQUEST_LATENCY = 'research_cli.api.request.latency';
export const METRIC_TOKEN_USAGE = 'research_cli.token.usage';
export const METRIC_SESSION_COUNT = 'research_cli.session.count';
export const METRIC_FILE_OPERATION_COUNT = 'research_cli.file.operation.count';
