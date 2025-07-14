/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from 'ink-testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthDialog } from './AuthDialog.js';
import { LoadedSettings, SettingScope } from '../../config/settings.js';
import { AuthType } from '@iechor/research-cli-core';

describe('AuthDialog', () => {
  const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.RESEARCH_API_KEY = '';
    process.env.RESEARCH_DEFAULT_AUTH_TYPE = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should show an error if the initial auth type is invalid', () => {
    process.env.RESEARCH_API_KEY = '';

    const settings: LoadedSettings = new LoadedSettings(
      {
        settings: {},
        path: '',
      },
      {
        settings: {
          selectedAuthType: AuthType.USE_RESEARCH,
        },
        path: '',
      },
      {
        settings: {},
        path: '',
      },
      [],
    );

    const { lastFrame } = render(
      <AuthDialog
        onSelect={() => {}}
        settings={settings}
        initialErrorMessage="RESEARCH_API_KEY  environment variable not found"
      />,
    );

    expect(lastFrame()).toContain(
      'RESEARCH_API_KEY  environment variable not found',
    );
  });

  describe('RESEARCH_API_KEY environment variable', () => {
    it('should detect RESEARCH_API_KEY environment variable', () => {
      process.env.RESEARCH_API_KEY = 'foobar';

      const settings: LoadedSettings = new LoadedSettings(
        {
          settings: {
            selectedAuthType: undefined,
          },
          path: '',
        },
        {
          settings: {},
          path: '',
        },
        [],
      );

      const { lastFrame } = render(
        <AuthDialog onSelect={() => {}} settings={settings} />,
      );

      expect(lastFrame()).toContain(
        'Existing API key detected (RESEARCH_API_KEY)',
      );
    });

    it('should not show the RESEARCH_API_KEY message if RESEARCH_DEFAULT_AUTH_TYPE is set to something else', () => {
      process.env.RESEARCH_API_KEY = 'foobar';
      process.env.RESEARCH_DEFAULT_AUTH_TYPE = AuthType.LOGIN_WITH_GOOGLE;

      const settings: LoadedSettings = new LoadedSettings(
        {
          settings: {
            selectedAuthType: undefined,
          },
          path: '',
        },
        {
          settings: {},
          path: '',
        },
        [],
      );

      const { lastFrame } = render(
        <AuthDialog onSelect={() => {}} settings={settings} />,
      );

      expect(lastFrame()).not.toContain(
        'Existing API key detected (RESEARCH_API_KEY)',
      );
    });

    it('should show the RESEARCH_API_KEY message if RESEARCH_DEFAULT_AUTH_TYPE is set to use api key', () => {
      process.env.RESEARCH_API_KEY = 'foobar';
      process.env.RESEARCH_DEFAULT_AUTH_TYPE = AuthType.USE_RESEARCH;

      const settings: LoadedSettings = new LoadedSettings(
        {
          settings: {
            selectedAuthType: undefined,
          },
          path: '',
        },
        {
          settings: {},
          path: '',
        },
        [],
      );

      const { lastFrame } = render(
        <AuthDialog onSelect={() => {}} settings={settings} />,
      );

      expect(lastFrame()).toContain(
        'Existing API key detected (RESEARCH_API_KEY)',
      );
    });
  });

  describe('RESEARCH_DEFAULT_AUTH_TYPE environment variable', () => {
    it('should select the auth type specified by RESEARCH_DEFAULT_AUTH_TYPE', () => {
      process.env.RESEARCH_DEFAULT_AUTH_TYPE = AuthType.LOGIN_WITH_GOOGLE;

      const settings: LoadedSettings = new LoadedSettings(
        {
          settings: {
            selectedAuthType: undefined,
          },
          path: '',
        },
        {
          settings: {},
          path: '',
        },
        [],
      );

      const { lastFrame } = render(
        <AuthDialog onSelect={() => {}} settings={settings} />,
      );

      // This is a bit brittle, but it's the best way to check which item is selected.
      expect(lastFrame()).toContain('● Login with iEchor');
    });

    it('should fall back to default if RESEARCH_DEFAULT_AUTH_TYPE is not set', () => {
      const settings: LoadedSettings = new LoadedSettings(
        {
          settings: {
            selectedAuthType: undefined,
          },
          path: '',
        },
        {
          settings: {},
          path: '',
        },
        [],
      );

      const { lastFrame } = render(
        <AuthDialog onSelect={() => {}} settings={settings} />,
      );

      // Default is LOGIN_WITH_GOOGLE
      expect(lastFrame()).toContain('● Login with iEchor');
    });

    it('should show an error and fall back to default if RESEARCH_DEFAULT_AUTH_TYPE is invalid', () => {
      process.env.RESEARCH_DEFAULT_AUTH_TYPE = 'invalid-auth-type';

      const settings: LoadedSettings = new LoadedSettings(
        {
          settings: {
            selectedAuthType: undefined,
          },
          path: '',
        },
        {
          settings: {},
          path: '',
        },
        [],
      );

      const { lastFrame } = render(
        <AuthDialog onSelect={() => {}} settings={settings} />,
      );

      expect(lastFrame()).toContain(
        'Invalid value for RESEARCH_DEFAULT_AUTH_TYPE: "invalid-auth-type"',
      );

      // Default is LOGIN_WITH_GOOGLE
      expect(lastFrame()).toContain('● Login with iEchor');
    });
  });

  it('should prevent exiting when no auth method is selected and show error message', async () => {
    const onSelect = vi.fn();
    const settings: LoadedSettings = new LoadedSettings(
      {
        settings: {},
        path: '',
      },
      {
        settings: {
          selectedAuthType: undefined,
        },
        path: '',
      },
      {
        settings: {},
        path: '',
      },
      [],
    );

    const { lastFrame, stdin, unmount } = render(
      <AuthDialog onSelect={onSelect} settings={settings} />,
    );
    await wait();

    // Simulate pressing escape key
    stdin.write('\u001b'); // ESC key
    await wait();

    // Should show error message instead of calling onSelect
    expect(lastFrame()).toContain(
      'You must select an auth method to proceed. Press Ctrl+C twice to exit.',
    );
    expect(onSelect).not.toHaveBeenCalled();
    unmount();
  });

  it('should not exit if there is already an error message', async () => {
    const onSelect = vi.fn();
    const settings: LoadedSettings = new LoadedSettings(
      {
        settings: {},
        path: '',
      },
      {
        settings: {},
        path: '',
      },
      [],
    );

    const { lastFrame, stdin, unmount } = render(
      <AuthDialog
        onSelect={onSelect}
        settings={settings}
        initialErrorMessage="Initial error"
      />,
    );
    await wait();

    expect(lastFrame()).toContain('Initial error');

    // Simulate pressing escape key
    stdin.write('\u001b'); // ESC key
    await wait();

    // Should not call onSelect
    expect(onSelect).not.toHaveBeenCalled();
    unmount();
  });

  it('should allow exiting when auth method is already selected', async () => {
    const onSelect = vi.fn();
    const settings: LoadedSettings = new LoadedSettings(
      {
        settings: {},
        path: '',
      },
      {
        settings: {
          selectedAuthType: AuthType.USE_RESEARCH,
        },
        path: '',
      },
      {
        settings: {},
        path: '',
      },
      [],
    );

    const { stdin, unmount } = render(
      <AuthDialog onSelect={onSelect} settings={settings} />,
    );
    await wait();

    // Simulate pressing escape key
    stdin.write('\u001b'); // ESC key
    await wait();

    // Should call onSelect with undefined to exit
    expect(onSelect).toHaveBeenCalledWith(undefined, SettingScope.User);
    unmount();
  });
});
