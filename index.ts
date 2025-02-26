#!/usr/bin/env node

import {
  CREATE_ITEM_TOOL,
  DELETE_ITEM_TOOL,
  GET_ITEMS_TOOL,
  GET_ITEM_TOOL,
  createItem,
  deleteItem,
  getItem,
  getItems,
} from "./operations/items.js";
// Import operations
import {
  CREATE_ITEM_WITH_DEMO_DATA_TOOL,
  GET_BOARDS_BY_WORKSPACE_TOOL,
  GET_BOARD_TOOL,
  LIST_BOARDS_TOOL,
  createItemWithDemoData,
  getBoard,
  getBoardsByWorkspace,
  listBoards,
} from "./operations/boards.js";
import {
  CREATE_MULTIPLE_ITEMS_TOOL,
  CREATE_REMAINING_ITEMS_TOOL,
  createFirstItem,
  createRemainingItems,
  formatItemAsMarkdownTable,
} from "./operations/bulk_items.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  GET_WORKSPACES_TOOL,
  GET_WORKSPACE_TOOL,
  getWorkspace,
  getWorkspaces,
} from "./operations/workspaces.js";

import type { MondaySDKInstance } from "./types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import mondaySdk from "monday-sdk-js";

class MondayServer {
  public monday: MondaySDKInstance;
  private apiKey: string | null = null;

  constructor() {
    this.monday = mondaySdk() as unknown as MondaySDKInstance;
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.monday.setToken(apiKey);
  }

  public async validateAuth(): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please provide a Monday.com API key.");
    }
    try {
      await this.monday.api(`query { me { id name } }`);
      return true;
    } catch (error) {
      throw new Error("Invalid API key or authentication failed");
    }
  }
}

const server = new Server(
  {
    name: "monday-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const mondayServer = new MondayServer();

// Get API key from command line arguments
const apiKey = process.argv[2];
if (apiKey) {
  mondayServer.setApiKey(apiKey);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    LIST_BOARDS_TOOL,
    GET_BOARD_TOOL,
    GET_ITEMS_TOOL,
    GET_WORKSPACES_TOOL,
    GET_WORKSPACE_TOOL,
    GET_ITEM_TOOL,
    GET_BOARDS_BY_WORKSPACE_TOOL,
    CREATE_ITEM_TOOL,
    DELETE_ITEM_TOOL,
    CREATE_ITEM_WITH_DEMO_DATA_TOOL,
    CREATE_MULTIPLE_ITEMS_TOOL,
    CREATE_REMAINING_ITEMS_TOOL,
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  await mondayServer.validateAuth();

  if (
    !request.params.arguments &&
    (request.params.name === "get_board" ||
      request.params.name === "get_items" ||
      request.params.name === "create_item" ||
      request.params.name === "get_item" ||
      request.params.name === "get_workspace" ||
      request.params.name === "get_boards")
  ) {
    return {
      content: [
        {
          type: "text",
          text: "Missing required arguments",
        },
      ],
      isError: true,
    };
  }

  switch (request.params.name) {
    case "list_boards":
      return listBoards(mondayServer.monday);
    case "get_board":
      return getBoard(
        mondayServer.monday,
        request.params.arguments!.boardId as number,
      );
    case "get_items":
      return getItems(
        mondayServer.monday,
        request.params.arguments!.boardId as number,
      );
    case "get_workspaces":
      return getWorkspaces(mondayServer.monday);
    case "get_workspace":
      return getWorkspace(
        mondayServer.monday,
        request.params.arguments!.workspaceId as number,
      );
    case "get_item":
      return getItem(
        mondayServer.monday,
        request.params.arguments!.itemId as number,
      );
    case "get_boards":
      return getBoardsByWorkspace(
        mondayServer.monday,
        request.params.arguments!.workspaceId as number,
      );
    case "create_item":
      return createItem(
        mondayServer.monday,
        request.params.arguments!.boardId as number,
        request.params.arguments!.itemName as string,
        request.params.arguments!.groupId as string | undefined,
        request.params.arguments!.columnValues as
          | Record<string, any>
          | undefined,
      );
    case "delete_item":
      return deleteItem(
        mondayServer.monday,
        request.params.arguments!.itemId as number,
      );
    case "create_item_with_demo":
      return createItemWithDemoData(
        mondayServer.monday,
        request.params.arguments!.boardId as number,
        request.params.arguments!.columnIds as string[] | undefined,
      );
    case "create_multiple_items": {
      const result = await createFirstItem(
        mondayServer.monday,
        request.params.arguments!.boardId as number,
        request.params.arguments!.count as number,
        Boolean(request.params.arguments!.isDemo),
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
        metadata: {
          remainingCount: result.remainingCount,
          boardId: request.params.arguments!.boardId,
          isDemo: Boolean(request.params.arguments!.isDemo),
        },
      };
    }
    case "create_remaining_items": {
      const created = await createRemainingItems(
        mondayServer.monday,
        request.params.arguments!.boardId as number,
        request.params.arguments!.count as number,
        request.params.arguments!.startIndex as number,
        Boolean(request.params.arguments!.isDemo),
      );

      return {
        content: [
          {
            type: "text",
            text: `Successfully created ${created} additional items.`,
          },
        ],
      };
    }
    default:
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${request.params.name}`,
          },
        ],
        isError: true,
      };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Monday.com MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
