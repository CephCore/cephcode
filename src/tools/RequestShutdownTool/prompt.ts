export function getPrompt(): string {
  return `
# RequestShutdown

Request a teammate to gracefully shut down. This sends a shutdown request to the teammate's inbox.

The teammate will receive the request as a message and can approve or reject it. Approved shutdowns trigger pane cleanup and team member removal.

## Parameters
- \`target\` (required): The name of the teammate to request shutdown from
- \`reason\` (optional): Human-readable explanation for why shutdown is requested

Use this to gracefully wind down a teammate before calling TeamDelete. It sends the request and returns immediately — the teammate's response arrives asynchronously via the inbox.
`.trim();
}
