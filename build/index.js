"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const monday_client_1 = require("./utils/monday-client");
const prompts_1 = require("./prompts");
const tools_1 = require("./tools");
// Get token from command line arguments
const token = process.argv[2];
if (!token) {
    console.error("Error: Monday.com API token is required");
    console.error("Usage: node build/index.js <monday_token>");
    process.exit(1);
}
// Set token in the Monday.com client
monday_client_1.mondayClient.setToken(token);
// Create server instance
const server = new mcp_js_1.McpServer({
    name: "monday-mcp",
    version: "1.0.0",
    init: async () => {
        return {};
    },
});
// Register tools and prompts
(0, tools_1.registerTools)(server);
(0, prompts_1.registerPrompts)(server);
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Monday.com MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
