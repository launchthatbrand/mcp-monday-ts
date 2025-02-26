import type { BoardsResponse } from "../types/monday";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mondayClient } from "../utils/monday-client";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "analyze-board",
    "Analyze a board's structure and content",
    {
      boardId: z.string().describe("The ID of the board to analyze"),
    },
    async ({ boardId }) => {
      const query = `query {
        boards(ids: [${boardId}]) {
          name
          items_page { items { id name } }
          groups { title items_page { items { id name } } }
        }
      }`;

      const data = await mondayClient.makeRequest<BoardsResponse>(query);
      console.log(data);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze this Monday.com board data and provide insights:\n${JSON.stringify(data, null, 2)}`,
            },
          },
        ],
      };
    },
  );

  server.prompt(
    "track-progress",
    "Track progress of items in a group",
    {
      boardId: z.string().describe("The ID of the board"),
      groupId: z.string().describe("The ID of the group"),
    },
    async ({ boardId, groupId }) => {
      const query = `query {
        boards(ids: [${boardId}]) {
          groups(ids: ["${groupId}"]) {
            title
            items {
              name
              column_values { title value text }
            }
          }
        }
      }`;

      const data = await mondayClient.makeRequest<BoardsResponse>(query);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze the progress of items in this group:\n${JSON.stringify(data, null, 2)}`,
            },
          },
        ],
      };
    },
  );

  server.prompt(
    "create-item",
    "Parse natural language input to create a new item",
    {
      boardId: z.string().describe("The ID of the board to create the item in"),
      groupId: z.string().describe("The ID of the group to create the item in"),
      description: z
        .string()
        .describe("Natural language description of the item to create"),
    },
    async ({ boardId, groupId, description }) => {
      // First, get the board's columns to understand available fields
      const columnsQuery = `query {
        boards(ids: [${boardId}]) {
          columns {
            id
            title
            type
          }
        }
      }`;

      const boardData =
        await mondayClient.makeRequest<BoardsResponse>(columnsQuery);
      const columns = boardData.boards[0].columns ?? [];

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Parse this item creation request: "${description}"\n\nAvailable columns in the board:\n${JSON.stringify(columns, null, 2)}\n\nExtract the item name and any column values mentioned. Return them in this format:\n{\n  "itemName": "name of item",\n  "columnValues": { "column_id": "value" }\n}`,
            },
          },
        ],
      };
    },
  );
}
