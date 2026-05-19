import type React from 'react';
import { Box, Text, useTheme } from 'src/ink.js';
import { env } from '../../utils/env.js';

const WELCOME_V2_WIDTH = 58;
const CLAWD_PREFIX = '      ';

export function WelcomeV2(): React.ReactNode {
  const [theme] = useTheme();
  const welcomeMessage = 'Welcome to Claude Code';

  if (env.terminal === 'Apple_Terminal') {
    return <AppleTerminalWelcomeV2 theme={theme} welcomeMessage={welcomeMessage} />;
  }

  return <WelcomeScene theme={theme} welcomeMessage={welcomeMessage} />;
}

type AppleTerminalWelcomeV2Props = {
  theme: string;
  welcomeMessage: string;
};

function AppleTerminalWelcomeV2({ theme, welcomeMessage }: AppleTerminalWelcomeV2Props): React.ReactNode {
  return <WelcomeScene theme={theme} welcomeMessage={welcomeMessage} />;
}

type WelcomeSceneProps = {
  theme: string;
  welcomeMessage: string;
};

function WelcomeScene({ theme, welcomeMessage }: WelcomeSceneProps): React.ReactNode {
  const isLightTheme = ['light', 'light-daltonized', 'light-ansi'].includes(theme);

  if (isLightTheme) {
    return (
      <Box width={WELCOME_V2_WIDTH}>
        <Text>
          <WelcomeHeader welcomeMessage={welcomeMessage} />
          <Text>{'…………………………………………………………………………………………………………………………………………………………'}</Text>
          <Text>{'                                                          '}</Text>
          <Text>{'                                                          '}</Text>
          <Text>{'            ░░░░░░                                        '}</Text>
          <Text>{'    ░░░   ░░░░░░░░░░                                      '}</Text>
          <Text>{'   ░░░░░░░░░░░░░░░░░░░                                    '}</Text>
          <Text>{'                                                          '}</Text>

          <Text>
            <Text dimColor>{'                           ░░░░'}</Text>
            <Text>{'                     ██    '}</Text>
          </Text>

          <Text>
            <Text dimColor>{'                         ░░░░░░░░░░'}</Text>
            <Text>{'               ██▒▒██  '}</Text>
          </Text>

          <Text>{'                                            ▒▒      ██   ▒'}</Text>

          <ClawdTop suffix="                         ▒▒░░▒▒      ▒ ▒▒" />
          <ClawdBody suffix="                           ▒▒         ▒▒ " />
          <ClawdEyeEmpty suffix="                          ░          ▒   " />
          <ClawdEyePupil suffix="                                                          " />
          <ClawdBody suffix="                                                          " />

          <Text>
            {'…………………'}
            <Text color="clawd_body">{'▗▞▜ ▟▛ ▙▚▖'}</Text>
            {'……………………………………………………………………░…………………………▒…………'}
          </Text>
        </Text>
      </Box>
    );
  }

  return (
    <Box width={WELCOME_V2_WIDTH}>
      <Text>
        <WelcomeHeader welcomeMessage={welcomeMessage} />
        <Text>{'…………………………………………………………………………………………………………………………………………………………'}</Text>
        <Text>{'                                                          '}</Text>
        <Text>{'     *                                       █████▓▓░     '}</Text>
        <Text>{'                                 *         ███▓░     ░░   '}</Text>
        <Text>{'            ░░░░░░                        ███▓░           '}</Text>
        <Text>{'    ░░░   ░░░░░░░░░░                      ███▓░           '}</Text>

        <Text>
          <Text>{'   ░░░░░░░░░░░░░░░░░░░    '}</Text>
          <Text bold>*</Text>
          <Text>{'                ██▓░░      ▓   '}</Text>
        </Text>

        <Text>{'                                             ░▓▓███▓▓░    '}</Text>
        <Text dimColor>{' *                                 ░░░░                   '}</Text>
        <Text dimColor>{'                                 ░░░░░░░░                 '}</Text>
        <Text dimColor>{'                               ░░░░░░░░░░░░░░░░           '}</Text>

        <ClawdTop
          suffix={
            <>
              {'                                       '}
              <Text dimColor>*</Text>
              <Text> </Text>
            </>
          }
        />

        <ClawdBody
          suffix={
            <>
              {'                        '}
              <Text bold>*</Text>
              <Text>{'                '}</Text>
            </>
          }
        />

        <ClawdEyeEmpty suffix="     *                                   " />
        <ClawdEyePupil suffix="                                                          " />
        <ClawdBody suffix="                                                          " />

        <Text>
          {'…………………'}
          <Text color="clawd_body">{'▗▞▜ ▟▛ ▙▚▖'}</Text>
          {'………………………………………………………………………………………………………………'}
        </Text>
      </Text>
    </Box>
  );
}

function WelcomeHeader({ welcomeMessage }: { welcomeMessage: string }): React.ReactNode {
  return (
    <Text>
      <Text color="claude">{welcomeMessage} </Text>
      <Text dimColor>v{MACRO.VERSION} </Text>
    </Text>
  );
}

function ClawdTop({ suffix }: { suffix?: React.ReactNode }): React.ReactNode {
  return (
    <Text>
      {CLAWD_PREFIX}
      <Text color="clawd_body">{'  ▄▄▄▄▄  '}</Text>
      {suffix}
    </Text>
  );
}

function ClawdBody({ suffix }: { suffix?: React.ReactNode }): React.ReactNode {
  return (
    <Text>
      {CLAWD_PREFIX}
      <Text color="clawd_body">{'▐'}</Text>
      <Text color="clawd_body" backgroundColor="clawd_body">
        {'███████'}
      </Text>
      <Text color="clawd_body">{'▌'}</Text>
      {suffix}
    </Text>
  );
}

function ClawdEyeEmpty({ suffix }: { suffix?: React.ReactNode }): React.ReactNode {
  return (
    <Text>
      {CLAWD_PREFIX}
      <Text color="clawd_body">{'▐'}</Text>
      <Text color="clawd_body" backgroundColor="clawd_body">
        {'██'}
      </Text>
      <Text backgroundColor="clawd_background">{'   '}</Text>
      <Text color="clawd_body" backgroundColor="clawd_body">
        {'██'}
      </Text>
      <Text color="clawd_body">{'▌'}</Text>
      {suffix}
    </Text>
  );
}

function ClawdEyePupil({ suffix }: { suffix?: React.ReactNode }): React.ReactNode {
  return (
    <Text>
      {CLAWD_PREFIX}
      <Text color="clawd_body">{'▐'}</Text>
      <Text color="clawd_body" backgroundColor="clawd_body">
        {'██'}
      </Text>
      <Text color="clawd_eye" backgroundColor="clawd_background">
        {' ■ '}
      </Text>
      <Text color="clawd_body" backgroundColor="clawd_body">
        {'██'}
      </Text>
      <Text color="clawd_body">{'▌'}</Text>
      {suffix}
    </Text>
  );
}
