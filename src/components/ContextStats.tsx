import type React from 'react';
import { useMemo, useState } from 'react';
import { Box, Text, useInput } from '../ink.js';
import type { LocalJSXCommandOnDone } from '../types/command.js';
import type { ContextData } from '../utils/analyzeContext.js';
import { renderSegmentedBar, THEME_COLOR_TO_HEX } from '../utils/contextBar.js';
import { getDisplayPath } from '../utils/file.js';
import { formatTokens } from '../utils/format.js';
import { getSourceDisplayName } from '../utils/settings/constants.js';
import { Pane } from './design-system/Pane.js';
import { Tab, Tabs } from './design-system/Tabs.js';

type Props = {
  data: ContextData;
  onClose: LocalJSXCommandOnDone;
};

type TabId = 'Overview' | 'Breakdown';

type BreakdownRow = {
  type: 'header' | 'item' | 'empty';
  label: string;
  value?: string;
  color?: string;
};

const RESERVED_CATEGORY_NAME = 'Autocompact buffer';
const VISIBLE_BREAKDOWN_ROWS = 9;
const BAR_WIDTH = 42;

const DISPLAY_NAMES: Record<string, string> = {
  'System prompt': 'System prompt',
  'System tools': 'Tools',
  '[ANT-ONLY] System tools': 'Tools',
  'MCP tools': 'MCP',
  'MCP tools (deferred)': 'MCP deferred',
  'System tools (deferred)': 'Tools deferred',
  'Custom agents': 'Subagents',
  'Memory files': 'Memory',
  Skills: 'Skills',
  Messages: 'Conversation',
};

function displayName(name: string): string {
  return DISPLAY_NAMES[name] ?? name;
}

function getUsageStatus(percentage: number): {
  label: string;
  color: string;
  hint: string;
} {
  if (percentage >= 90) {
    return {
      label: 'Critical',
      color: 'red',
      hint: 'compact soon',
    };
  }

  if (percentage >= 75) {
    return {
      label: 'High',
      color: 'yellow',
      hint: 'getting full',
    };
  }

  if (percentage >= 50) {
    return {
      label: 'Moderate',
      color: 'cyan',
      hint: 'healthy',
    };
  }

  return {
    label: 'Low',
    color: 'green',
    hint: 'plenty left',
  };
}

function Metric({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}): React.ReactNode {
  return (
    <Box flexDirection="row" gap={1}>
      <Text dimColor>{label}</Text>
      <Text bold color={color}>
        {value}
      </Text>
      {hint ? <Text dimColor>{hint}</Text> : null}
    </Box>
  );
}

function SourceRow({
  marker,
  label,
  value,
  color,
}: {
  marker: string;
  label: string;
  value: string;
  color?: string;
}): React.ReactNode {
  return (
    <Box flexDirection="row" justifyContent="space-between">
      <Box flexDirection="row" gap={1}>
        <Text color={color}>{marker}</Text>
        <Text>{label}</Text>
      </Box>
      <Text dimColor>{value}</Text>
    </Box>
  );
}

export function ContextStats({ data, onClose }: Props): React.ReactNode {
  const [activeTab, setActiveTab] = useState<TabId>('Overview');
  const [scrollOffset, setScrollOffset] = useState(0);

  const {
    categories,
    totalTokens,
    rawMaxTokens,
    percentage,
    memoryFiles,
    mcpTools,
    systemTools = [],
    systemPromptSections = [],
    agents,
    skills,
    messageBreakdown,
  } = data;

  const usageStatus = useMemo(() => getUsageStatus(percentage), [percentage]);

  const freeTokens = useMemo(() => {
    const freeCategory = categories.find(category => category.name === 'Free space');
    return freeCategory?.tokens ?? Math.max(rawMaxTokens - totalTokens, 0);
  }, [categories, rawMaxTokens, totalTokens]);

  const barSegments = useMemo(() => {
    const segments = categories
      .filter(category => category.tokens > 0 && category.name !== 'Free space' && !category.isDeferred)
      .map(category => ({
        tokens: category.tokens,
        colorHex: THEME_COLOR_TO_HEX[category.color] || '#999999',
      }));

    const freeCategory = categories.find(category => category.name === 'Free space');

    if (freeCategory && freeCategory.tokens > 0) {
      segments.push({
        tokens: freeCategory.tokens,
        colorHex: '#2A2A2A',
      });
    }

    return segments;
  }, [categories]);

  const legendCategories = useMemo(() => {
    return categories
      .filter(category => {
        return (
          category.tokens > 0 &&
          category.name !== 'Free space' &&
          category.name !== RESERVED_CATEGORY_NAME &&
          !category.isDeferred
        );
      })
      .slice()
      .sort((a, b) => b.tokens - a.tokens);
  }, [categories]);

  const breakdownRows = useMemo((): BreakdownRow[] => {
    const rows: BreakdownRow[] = [];

    const addSection = (label: string) => {
      if (rows.length > 0) {
        rows.push({ type: 'empty', label: '' });
      }

      rows.push({
        type: 'header',
        label,
      });
    };

    const addItem = (label: string, value?: string, color?: string) => {
      rows.push({
        type: 'item',
        label,
        value,
        color,
      });
    };

    if (systemPromptSections.length > 0) {
      addSection('System prompt');

      for (const section of systemPromptSections) {
        addItem(section.name, formatTokens(section.tokens));
      }
    }

    if (mcpTools.length > 0) {
      addSection('MCP tools');

      const loaded = mcpTools.filter(tool => tool.isLoaded);
      const available = mcpTools.filter(tool => !tool.isLoaded);

      for (const tool of loaded) {
        addItem(`[Loaded] ${tool.name}`, formatTokens(tool.tokens), 'green');
      }

      for (const tool of available) {
        addItem(`[Available] ${tool.name}`, 'not loaded', 'yellow');
      }
    }

    const loadedSystemTools = systemTools.filter(tool => !('isLoaded' in tool) || (tool as any).isLoaded);

    if (loadedSystemTools.length > 0) {
      addSection('System tools');

      for (const tool of loadedSystemTools) {
        addItem(tool.name, formatTokens(tool.tokens));
      }
    }

    if (agents.length > 0) {
      addSection('Custom agents');

      for (const agent of agents) {
        const sourceDisplay = getSourceDisplayName(agent.source);
        addItem(`[${sourceDisplay}] ${agent.agentType}`, formatTokens(agent.tokens));
      }
    }

    if (memoryFiles.length > 0) {
      addSection('Memory files');

      for (const file of memoryFiles) {
        addItem(getDisplayPath(file.path), formatTokens(file.tokens));
      }
    }

    if (skills && skills.tokens > 0) {
      addSection('Skills');

      for (const skill of skills.skillFrontmatter) {
        const sourceDisplay = getSourceDisplayName(skill.source);
        addItem(`[${sourceDisplay}] ${skill.name}`, formatTokens(skill.tokens));
      }
    }

    if (messageBreakdown) {
      addSection('Messages');

      addItem('Tool calls', formatTokens(messageBreakdown.toolCallTokens));
      addItem('Tool results', formatTokens(messageBreakdown.toolResultTokens));
      addItem('Attachments', formatTokens(messageBreakdown.attachmentTokens));
      addItem('Assistant messages', formatTokens(messageBreakdown.assistantMessageTokens));
      addItem('User messages', formatTokens(messageBreakdown.userMessageTokens));

      if (messageBreakdown.toolCallsByType.length > 0) {
        addSection('Top tools');

        for (const tool of messageBreakdown.toolCallsByType.slice(0, 5)) {
          addItem(tool.name, `${formatTokens(tool.callTokens)} calls · ${formatTokens(tool.resultTokens)} results`);
        }
      }

      if (messageBreakdown.attachmentsByType.length > 0) {
        addSection('Top attachments');

        for (const attachment of messageBreakdown.attachmentsByType.slice(0, 5)) {
          addItem(attachment.name, formatTokens(attachment.tokens));
        }
      }
    }

    if (rows.length === 0) {
      rows.push({
        type: 'item',
        label: 'No breakdown data available',
        value: '',
      });
    }

    return rows;
  }, [systemPromptSections, mcpTools, systemTools, agents, memoryFiles, skills, messageBreakdown]);

  const maxScrollOffset = Math.max(0, breakdownRows.length - VISIBLE_BREAKDOWN_ROWS);

  useInput((input, key) => {
    if (key.escape || input === 'q' || (key.ctrl && (input === 'c' || input === 'd'))) {
      onClose('Context stats dismissed', { display: 'system' });
      return;
    }

    if (key.tab) {
      setActiveTab(previous => (previous === 'Overview' ? 'Breakdown' : 'Overview'));
      setScrollOffset(0);
      return;
    }

    if (activeTab !== 'Breakdown') {
      return;
    }

    if (key.downArrow || input === 'j') {
      setScrollOffset(previous => Math.min(previous + 1, maxScrollOffset));
    }

    if (key.upArrow || input === 'k') {
      setScrollOffset(previous => Math.max(previous - 1, 0));
    }
  });

  const visibleBreakdown = useMemo(() => {
    return breakdownRows.slice(scrollOffset, scrollOffset + VISIBLE_BREAKDOWN_ROWS);
  }, [breakdownRows, scrollOffset]);

  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset < maxScrollOffset;
  const bar = renderSegmentedBar(barSegments, BAR_WIDTH);

  return (
    <Pane color="claude">
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
          <Box flexDirection="row" gap={1}>
            <Text bold>Context</Text>
            <Text dimColor>stats</Text>
          </Box>

          <Box flexDirection="row" gap={1}>
            <Text color={usageStatus.color}>{usageStatus.label}</Text>
            <Text dimColor>×</Text>
          </Box>
        </Box>

        <Box flexDirection="column" paddingX={1}>
          <Box flexDirection="row" gap={3}>
            <Metric
              label="Used"
              value={`${formatTokens(totalTokens)} / ${formatTokens(rawMaxTokens)}`}
              color={usageStatus.color}
            />

            <Metric
              label="Free"
              value={formatTokens(freeTokens)}
              hint={usageStatus.hint}
              color={freeTokens > 0 ? 'green' : 'red'}
            />

            <Metric label="Usage" value={`${percentage.toFixed(0)}%`} color={usageStatus.color} />
          </Box>

          <Box marginTop={1}>
            <Text>{bar}</Text>
          </Box>
        </Box>

        <Tabs
          title=""
          color="claude"
          selectedTab={activeTab}
          onTabChange={tabId => {
            setActiveTab(tabId as TabId);
            setScrollOffset(0);
          }}
        >
          <Tab title="Overview">
            <Box flexDirection="column" width={56} paddingX={1} marginTop={1}>
              <Box flexDirection="row" justifyContent="space-between">
                <Text bold>Sources</Text>
                <Text dimColor>{legendCategories.length} active</Text>
              </Box>

              <Box flexDirection="column" marginTop={1}>
                {legendCategories.length === 0 ? (
                  <Text dimColor>No active context sources</Text>
                ) : (
                  legendCategories
                    .slice(0, 8)
                    .map(category => (
                      <SourceRow
                        key={`cat-${category.name}`}
                        marker="■"
                        label={displayName(category.name)}
                        value={formatTokens(category.tokens)}
                        color={category.color}
                      />
                    ))
                )}
              </Box>

              {legendCategories.length > 8 ? (
                <Box marginTop={1}>
                  <Text dimColor>+{legendCategories.length - 8} more in Breakdown</Text>
                </Box>
              ) : null}
            </Box>
          </Tab>

          <Tab title="Breakdown">
            <Box flexDirection="column" width={72} height={VISIBLE_BREAKDOWN_ROWS} paddingX={1} marginTop={1}>
              {visibleBreakdown.map((row, index) => {
                const key = `${scrollOffset + index}-${row.type}-${row.label}`;

                if (row.type === 'empty') {
                  return <Text key={key}> </Text>;
                }

                if (row.type === 'header') {
                  return (
                    <Box key={key} flexDirection="row" gap={1}>
                      <Text color="claude">◆</Text>
                      <Text bold>{row.label}</Text>
                    </Box>
                  );
                }

                return (
                  <Box key={key} flexDirection="row" justifyContent="space-between">
                    <Box flexDirection="row" gap={1}>
                      <Text dimColor>├─</Text>
                      <Text color={row.color}>{row.label}</Text>
                    </Box>

                    {row.value ? <Text dimColor>{row.value}</Text> : null}
                  </Box>
                );
              })}
            </Box>
          </Tab>
        </Tabs>

        <Box
          paddingLeft={1}
          marginTop={1}
          borderStyle="single"
          borderTop={true}
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          borderColor="subtle"
        >
          <Box flexDirection="row" justifyContent="space-between" width="100%">
            <Text dimColor>
              Esc/q close · Tab switch
              {activeTab === 'Breakdown' && breakdownRows.length > VISIBLE_BREAKDOWN_ROWS ? (
                <Text>
                  {' '}
                  · {canScrollUp ? '▲' : ' '} {canScrollDown ? '▼' : ' '} ↑↓/j/k scroll {scrollOffset + 1}-
                  {Math.min(scrollOffset + VISIBLE_BREAKDOWN_ROWS, breakdownRows.length)} of {breakdownRows.length}
                </Text>
              ) : null}
            </Text>
          </Box>
        </Box>
      </Box>
    </Pane>
  );
}
