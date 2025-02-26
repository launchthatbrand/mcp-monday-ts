import type {
  Board,
  BoardsResponse,
  ColumnValue,
  Group,
  Item,
  ItemsResponse,
  MondayResponse,
  Workspace,
  WorkspacesResponse,
} from "./types/monday";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mondayClient } from "./utils/monday-client";
import { registerPrompts } from "./prompts";
import { registerTools } from "./tools";

// Get token from command line arguments
const token = process.argv[2];
if (!token) {
  console.error("Error: Monday.com API token is required");
  console.error("Usage: node build/index.js <monday_token>");
  process.exit(1);
}

// Set token in the Monday.com client
mondayClient.setToken(token);

// Create server instance
const server = new McpServer({
  name: "monday-mcp",
  version: "1.0.0",
  init: async () => {
    return {};
  },
});

// Register tools and prompts
registerTools(server);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Monday.com MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
