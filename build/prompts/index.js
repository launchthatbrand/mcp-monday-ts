"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPrompts = registerPrompts;
const monday_client_1 = require("../utils/monday-client");
const zod_1 = require("zod");
function registerPrompts(server) {
    server.prompt("analyze-board", "Analyze a board's structure and content", {
        boardId: zod_1.z.string().describe("The ID of the board to analyze"),
    }, async ({ boardId }) => {
        const query = `query {
        boards(ids: [${boardId}]) {
          name
          items_page { items { id name } }
          groups { title items_page { items { id name } } }
        }
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
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
    });
    server.prompt("track-progress", "Track progress of items in a group", {
        boardId: zod_1.z.string().describe("The ID of the board"),
        groupId: zod_1.z.string().describe("The ID of the group"),
    }, async ({ boardId, groupId }) => {
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
        const data = await monday_client_1.mondayClient.makeRequest(query);
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
    });
    server.prompt("create-item", "Parse natural language input to create a new item", {
        boardId: zod_1.z.string().describe("The ID of the board to create the item in"),
        groupId: zod_1.z.string().describe("The ID of the group to create the item in"),
        description: zod_1.z
            .string()
            .describe("Natural language description of the item to create"),
    }, async ({ boardId, groupId, description }) => {
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
        const boardData = await monday_client_1.mondayClient.makeRequest(columnsQuery);
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
    });
}
