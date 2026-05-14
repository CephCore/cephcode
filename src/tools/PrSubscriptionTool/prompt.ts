export function getSubscribePrompt(): string {
  return `
# subscribe_pr_activity

Subscribe to GitHub pull request activity. The coordinator will receive PR events (review comments, CI results, merge status changes) as user messages.

## Parameters
- \`pr_url\` (required): Full URL of the GitHub pull request to watch (e.g., \`https://github.com/owner/repo/pull/123\`)

Events arrive as user messages. Merge conflict transitions may not arrive — poll \`gh pr view N --json mergeable\` if tracking conflict status.

Call this directly — do not delegate subscription management to workers.
`.trim()
}

export function getUnsubscribePrompt(): string {
  return `
# unsubscribe_pr_activity

Stop watching a GitHub pull request for activity.

## Parameters
- \`pr_url\` (required): Full URL of the GitHub pull request to stop watching
`.trim()
}
