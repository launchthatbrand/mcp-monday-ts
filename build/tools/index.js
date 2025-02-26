"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTools = registerTools;
const monday_client_1 = require("../utils/monday-client");
const zod_1 = require("zod");
function registerTools(server) {
    server.tool("get-item", "Get a specific item by ID from Monday.com", {
        itemId: zod_1.z.string().describe("The ID of the item to retrieve"),
    }, async ({ itemId }) => {
        const query = `query { 
        items (ids: [${itemId}]) { 
          id 
          name 
          column_values { 
            column {
              id
              title
            }
            value 
            text 
          } 
        } 
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        console.log(data);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.items[0], null, 2),
                },
            ],
        };
    });
    server.tool("get-board", "Get a specific board by ID from Monday.com", {
        boardId: zod_1.z.string().describe("The ID of the board to retrieve"),
    }, async ({ boardId }) => {
        const query = `query { 
        boards (ids: [${boardId}]) { 
          id 
          name 
          items_page {
            items {
              id
              name
            }
          }
        } 
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.boards[0], null, 2),
                },
            ],
        };
    });
    server.tool("get-workspace", "Get a specific workspace by ID from Monday.com", {
        workspaceId: zod_1.z.string().describe("The ID of the workspace to retrieve"),
    }, async ({ workspaceId }) => {
        const query = `query { 
        workspaces (ids: [${workspaceId}]) { 
          id 
          name 
          kind 
          description 
        } 
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.workspaces[0], null, 2),
                },
            ],
        };
    });
    server.tool("get-group", "Get a specific group by ID and board ID from Monday.com", {
        boardId: zod_1.z.string().describe("The ID of the board containing the group"),
        groupId: zod_1.z.string().describe("The ID of the group to retrieve"),
    }, async ({ boardId, groupId }) => {
        const query = `query { 
        boards (ids: [${boardId}]) { 
          groups (ids: ["${groupId}"]) { 
            id 
            title 
            items { 
              id 
              name 
            } 
          } 
        } 
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.boards[0].groups[0], null, 2),
                },
            ],
        };
    });
    server.tool("get-groups", "Get all groups in a board from Monday.com", {
        boardId: zod_1.z.string().describe("The ID of the board to get groups from"),
    }, async ({ boardId }) => {
        const query = `query { 
        boards (ids: [${boardId}]) { 
          groups { 
            id 
            title 
            items { 
              id 
              name 
            } 
          } 
        } 
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.boards[0].groups, null, 2),
                },
            ],
        };
    });
    server.tool("search-items", "Search for items across all boards in Monday.com", {
        term: zod_1.z.string().describe("The search term to look for"),
        limit: zod_1.z
            .number()
            .optional()
            .describe("Maximum number of results to return"),
    }, async ({ term, limit = 10 }) => {
        const query = `query { 
        items_page (limit: ${limit}, query: "${term}") { 
          items { 
            id 
            name 
            board { 
              id 
              name 
            } 
          } 
        } 
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.items_page.items, null, 2),
                },
            ],
        };
    });
    server.tool("create-item", "Create a new item in a Monday.com board", {
        boardId: zod_1.z.string().describe("The ID of the board to create the item in"),
        groupId: zod_1.z
            .string()
            .describe("The ID of the group to create the item in")
            .optional(),
        itemName: zod_1.z.string().describe("The name of the new item"),
        columnValues: zod_1.z
            .record(zod_1.z.string())
            .describe("Key-value pairs of column values")
            .optional(),
    }, async ({ boardId, groupId, itemName, columnValues }) => {
        // Build mutation parameters
        const mutationParams = [
            `board_id: ${boardId}`,
            `item_name: "${itemName}"`,
        ];
        if (groupId) {
            mutationParams.push(`group_id: "${groupId}"`);
        }
        if (columnValues && Object.keys(columnValues).length > 0) {
            const columnValuesJson = JSON.stringify(columnValues);
            mutationParams.push(`column_values: ${JSON.stringify(columnValuesJson)}`);
        }
        const query = `mutation {
        create_item (
          ${mutationParams.join(",\n          ")}
        ) {
          id
          name
          column_values {
            column {
              id
              title
            }
            value
            text
          }
        }
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.create_item, null, 2),
                },
            ],
        };
    });
    server.tool("preview-board-deletion", "Preview all items that will be deleted from a board", {
        boardId: zod_1.z.string().describe("The ID of the board to clear"),
    }, async ({ boardId }) => {
        const query = `query { 
        boards (ids: [${boardId}]) { 
          name
          items_page {
            items {
              id
              name
              column_values {
                column { title }
                text
              }
            }
          }
        } 
      }`;
        const data = await monday_client_1.mondayClient.makeRequest(query);
        const board = data.boards[0];
        const items = board.items_page?.items ?? [];
        // Create a markdown table of items
        const tableRows = items.map((item) => {
            const values = item.column_values
                .map((cv) => cv.text)
                .filter(Boolean)
                .join(", ");
            return `| ${item.id} | ${item.name} | ${values} |`;
        });
        const table = [
            "| ID | Name | Values |",
            "|-----|------|---------|",
            ...tableRows,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: `Here is a snapshot of the records you are about to delete from board "${board.name}":

${table}

Are you sure you want to delete these ${items.length} items? Yes/No (defaults to no)

To proceed with deletion, simply respond with "Yes"`,
                },
            ],
        };
    });
    server.tool("delete-board-items", "Delete all items from a board after confirmation", {
        boardId: zod_1.z.string().describe("The ID of the board to clear"),
        confirmation: zod_1.z.string().describe("Confirmation response (Yes/No)"),
    }, async ({ boardId, confirmation }) => {
        if (confirmation !== "Yes") {
            return {
                content: [
                    {
                        type: "text",
                        text: "Deletion cancelled: Please confirm with exactly 'Yes' to proceed with deletion.",
                    },
                ],
            };
        }
        const queryItems = `query { 
        boards (ids: [${boardId}]) { 
          name
          items_page {
            items { id }
          }
        } 
      }`;
        const boardData = await monday_client_1.mondayClient.makeRequest(queryItems);
        const board = boardData.boards[0];
        const items = board.items_page?.items ?? [];
        // Delete all items
        const itemIds = items.map((item) => item.id);
        const deleteMutation = `mutation {
        delete_items (ids: [${itemIds.join(", ")}]) {
          count
        }
      }`;
        const deleteData = await monday_client_1.mondayClient.makeRequest(deleteMutation);
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully deleted ${deleteData.delete_items.count} items from board "${board.name}"`,
                },
            ],
        };
    });
}
