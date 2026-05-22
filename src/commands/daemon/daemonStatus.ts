import type { getAutonomousStatus } from '../../services/autonomous/supervisorIntegration.js';

export type DaemonStatus = Awaited<ReturnType<typeof getAutonomousStatus>>;

export function formatDaemonStatus(status: DaemonStatus, includeCommands = true): string {
  const lines: string[] = ['=== 24/7 Autonomous Daemon Status ==='];

  lines.push(`Daemon: ${status.enabled ? 'Enabled' : 'Disabled'}`);
  lines.push(`Auto-start: ${status.autoStart ? 'Yes' : 'No'}`);
  lines.push(`Process: ${status.running ? 'Running' : 'Not running'}`);

  if (status.agent) {
    const a = status.agent;
    const uptime = a.running ? Math.round((Date.now() - a.startedAt) / 1000) : 0;
    lines.push(`PID: ${a.workerPid ?? 'N/A'}`);
    lines.push(`Uptime: ${uptime}s`);
    lines.push(`Tasks processed: ${a.tasksProcessed}`);
    lines.push(`Tasks failed: ${a.tasksFailed}`);
    lines.push(`Dead-lettered: ${a.tasksDeadLettered}`);
    if (a.lastErrorMessage) {
      lines.push(`Last error: ${a.lastErrorMessage}`);
    }
    if (a.currentTaskTitle) {
      lines.push(`Current task: ${a.currentTaskTitle}`);
    }
  }

  if (status.tasks) {
    const t = status.tasks;
    lines.push('');
    lines.push('=== Task Queue ===');
    lines.push(`Total: ${t.total}`);
    lines.push(`Pending: ${t.pending}`);
    lines.push(`In Progress: ${t.inProgress}`);
    lines.push(`Completed: ${t.completed}`);
    lines.push(`Failed: ${t.failed}`);
    lines.push(`Dead-letter: ${t.deadLetter}`);
  }

  if (includeCommands) {
    lines.push('');
    lines.push('Commands:');
    lines.push('  /daemon start     Start autonomous agent');
    lines.push('  /daemon stop      Stop autonomous agent');
    lines.push('  /daemon status    Show status');
    lines.push('  /daemon restart   Restart agent');
    lines.push('  /task             Create a scheduled task');
    lines.push('  /task list        List tasks');
  }

  return lines.join('\n');
}
