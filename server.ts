
import { handleBrowserAction } from "./src/tools/BrowserTool/handler.js";

const PORT = 3000;

console.log(`🚀 Browser Agent Server starting on http://localhost:${PORT}...`);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    if (req.method === "POST") {
      try {
        const body = await req.json();
        console.log(`📡 Received action: ${body.action}`);
        
        const result = await handleBrowserAction(body);
        
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return new Response("Agent Server is Running 🤖");
  },
});

console.log("✅ Server Ready! สั่งงานผ่าน curl ได้เลย เช่น:");
console.log(`curl -X POST http://localhost:${PORT} -d '{"action": "navigate", "url": "https://google.com"}'`);
