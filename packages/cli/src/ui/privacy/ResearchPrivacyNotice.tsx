/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Newline, Text, useInput } from 'ink';
import { Colors } from '../colors.js';

interface ResearchPrivacyNoticeProps {
  onExit: () => void;
}

export const ResearchPrivacyNotice = ({
  onExit,
}: ResearchPrivacyNoticeProps) => {
  useInput((input, key) => {
    if (key.escape) {
      onExit();
    }
  });

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color={Colors.AccentPurple}>
        Research API Key Notice
      </Text>
      <Newline />
      <Text>
        By using the Research API<Text color={Colors.AccentBlue}>[1]</Text>,
        iEchor AI Studio
        <Text color={Colors.AccentRed}>[2]</Text>, and the other iEchor
        developer services that reference these terms (collectively, the
        &quot;APIs&quot; or &quot;Services&quot;), you are agreeing to iEchor
        APIs Terms of Service (the &quot;API Terms&quot;)
        <Text color={Colors.AccentGreen}>[3]</Text>, and the Research API
        Additional Terms of Service (the &quot;Additional Terms&quot;)
        <Text color={Colors.AccentPurple}>[4]</Text>.
      </Text>
      <Newline />
      <Text>
        <Text color={Colors.AccentBlue}>[1]</Text>{' '}
        https://ai.iechor.dev/docs/research_api_overview
      </Text>
      <Text>
        <Text color={Colors.AccentRed}>[2]</Text> https://aistudio.iechor.com/
      </Text>
      <Text>
        <Text color={Colors.AccentGreen}>[3]</Text>{' '}
        https://developers.iechor.com/terms
      </Text>
      <Text>
        <Text color={Colors.AccentPurple}>[4]</Text>{' '}
        https://ai.iechor.dev/research-api/terms
      </Text>
      <Newline />
      <Text color={Colors.Gray}>Press Esc to exit.</Text>
    </Box>
  );
};
