import type React from 'react';
import { App } from '../components/App.js';
import { AgentViewDashboard } from '../components/agents/AgentViewDashboard.js';
import type { StatsStore } from '../context/stats.js';
import type { Root } from '../ink.js';
import { KeybindingSetup } from '../keybindings/KeybindingProviderSetup.js';
import type { AppState } from '../state/AppStateStore.js';
import type { FpsMetrics } from '../utils/fpsTracker.js';

type AgentViewCliOptions = {
  root: Root;
  initialState: AppState;
  getFpsMetrics: () => FpsMetrics | undefined;
  stats?: StatsStore;
  renderAndRun: (root: Root, element: React.ReactNode) => Promise<void>;
  cwd?: string;
};

export async function launchAgentViewCli({
  root,
  initialState,
  getFpsMetrics,
  stats,
  renderAndRun,
  cwd,
}: AgentViewCliOptions): Promise<void> {
  await renderAndRun(
    root,
    <App getFpsMetrics={getFpsMetrics} stats={stats} initialState={initialState}>
      <KeybindingSetup>
        <AgentViewDashboard cwd={cwd} onBack={() => root.unmount()} />
      </KeybindingSetup>
    </App>,
  );
}
