import { describe, expect, test } from 'bun:test';
import { getSwarmSocketName, SWARM_SESSION_NAME, TEAM_LEAD_NAME, TMUX_COMMAND } from './constants.js';

describe('swarm constants', () => {
  test('TEAM_LEAD_NAME is team-lead', () => {
    expect(TEAM_LEAD_NAME).toBe('team-lead');
  });

  test('SWARM_SESSION_NAME is claude-swarm', () => {
    expect(SWARM_SESSION_NAME).toBe('claude-swarm');
  });

  test('TMUX_COMMAND is tmux', () => {
    expect(TMUX_COMMAND).toBe('tmux');
  });

  test('getSwarmSocketName includes PID', () => {
    const socketName = getSwarmSocketName();
    expect(socketName).toMatch(/claude-swarm-\d+/);
  });
});
