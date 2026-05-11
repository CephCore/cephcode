
import { handleBrowserAction } from "./src/tools/BrowserTool/handler.js";

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: bun run turbo.ts <action> [options]");
    process.exit(1);
  }

  const action = args[0];
  const options = JSON.parse(args[1] || "{}");

  try {
    const result = await handleBrowserAction({ action, ...options });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

run();
