import { CREATE_ITEM_WITH_DEMO_DATA_TOOL, GET_BOARD_WITH_SETTINGS_QUERY, generateDemoValue, } from "../prompts.js";
import { createItem } from "./items.js";
import { z } from "zod";
// Query Definitions
export const LIST_BOARDS_QUERY = `
  query {
    boards (limit: 100) {
      id
      name
      description
      state
      permissions
      board_kind
      workspace {
        id
        name
      }
    }
  }
`;
export const GET_BOARD_QUERY = `
  query ($boardId: ID!) {
    boards (ids: [$boardId]) {
      name
      state
      permissions
      columns {
        id
        title
      }
      items_page {
        items {
          id
          name
          created_at
          creator {
            id
            name
          }
          column_values {
            id
            text
            value
            column {
              id
              title
              type
            }
          }
          group {
            id
            title
          }
        }
      }
    }
  }
`;
export const GET_BOARDS_BY_WORKSPACE_QUERY = `
  query ($workspaceId: ID!) {
    boards(workspace_ids: [$workspaceId], limit: 100) {
      id
      name
      description
      state
      permissions
      board_kind
      workspace {
        id
        name
      }
    }
  }
`;
// Schema Definitions
export const ListBoardsSchema = z.object({});
export const GetBoardSchema = z.object({
    boardId: z.string().or(z.number()),
});
export const GetBoardsByWorkspaceSchema = z.object({
    workspaceId: z.string().or(z.number()),
    limit: z.number().optional(),
});
// Tool Definitions
export const LIST_BOARDS_TOOL = {
    name: "list_boards",
    description: "List all boards in your Monday.com workspace",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};
export const GET_BOARD_TOOL = {
    name: "get_board",
    description: "Get detailed information about a specific board",
    inputSchema: {
        type: "object",
        properties: {
            boardId: {
                type: "number",
                description: "The ID of the board to fetch",
            },
        },
        required: ["boardId"],
    },
};
export const GET_BOARDS_BY_WORKSPACE_TOOL = {
    name: "get_boards",
    description: "Get all boards in a specific workspace",
    inputSchema: {
        type: "object",
        properties: {
            workspaceId: {
                type: "number",
                description: "The ID of the workspace to fetch boards from",
            },
        },
        required: ["workspaceId"],
    },
};
export { CREATE_ITEM_WITH_DEMO_DATA_TOOL };
// Operation Functions
export async function listBoards(monday) {
    try {
        const response = await monday.api(LIST_BOARDS_QUERY);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${JSON.stringify(error)}`,
                },
            ],
            isError: true,
        };
    }
}
export async function getBoard(monday, boardId) {
    try {
        const response = await monday.api(GET_BOARD_QUERY, {
            variables: { boardId: boardId.toString() },
        });
        if (response.errors) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Monday.com API Error: ${JSON.stringify(response.errors)}`,
                    },
                ],
                isError: true,
            };
        }
        if (response.data?.boards?.length > 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data.boards[0], null, 2),
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Board with ID ${boardId} not found`,
                },
            ],
            isError: true,
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to fetch board: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}
export async function getBoardsByWorkspace(monday, workspaceId) {
    try {
        const response = await monday.api(GET_BOARDS_BY_WORKSPACE_QUERY, {
            variables: { workspaceId: workspaceId.toString() },
        });
        if (response.errors) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Monday.com API Error: ${JSON.stringify(response.errors)}`,
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to fetch boards: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}
export async function getBoardWithSettings(monday, boardId) {
    try {
        const response = await monday.api(GET_BOARD_WITH_SETTINGS_QUERY, {
            variables: { boardId: boardId.toString() },
        });
        if (response.errors) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Monday.com API Error: ${JSON.stringify(response.errors)}`,
                    },
                ],
                isError: true,
            };
        }
        if (!response.data?.boards?.[0]) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Board with ID ${boardId} not found`,
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data.boards[0], null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to fetch board: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}
export async function createItemWithDemoData(monday, boardId, columnIds) {
    try {
        // First, fetch the board structure
        const boardResponse = await monday.api(GET_BOARD_WITH_SETTINGS_QUERY, {
            variables: { boardId: boardId.toString() },
        });
        if (boardResponse.errors || !boardResponse.data?.boards?.[0]) {
            throw new Error(boardResponse.errors
                ? JSON.stringify(boardResponse.errors)
                : `Board ${boardId} not found`);
        }
        const board = boardResponse.data.boards[0];
        const columnValues = {};
        // Generate demo data for specified columns or all columns
        const columnsToProcess = columnIds?.length
            ? board.columns.filter((col) => columnIds.includes(col.id))
            : board.columns;
        // Validate that all requested columns exist
        if (columnIds?.length) {
            const foundColumnIds = columnsToProcess.map((col) => col.id);
            const missingColumns = columnIds.filter((id) => !foundColumnIds.includes(id));
            if (missingColumns.length > 0) {
                throw new Error(`Some requested columns were not found: ${missingColumns.join(", ")}`);
            }
        }
        for (const column of columnsToProcess) {
            let settings;
            if (column.settings_str) {
                try {
                    settings = JSON.parse(column.settings_str);
                }
                catch (e) {
                    settings = undefined;
                }
            }
            columnValues[column.id] = generateDemoValue(column.type, settings);
        }
        // Create the item with demo data
        const createResponse = await createItem(monday, boardId, "Demo Item", undefined, columnValues);
        // Check if item creation was successful
        if (createResponse.isError ?? !createResponse.content?.[0]?.text) {
            throw new Error("Failed to create item");
        }
        // Parse the created item data
        const createdItem = JSON.parse(createResponse.content[0].text);
        // Verify the values were set correctly
        const verificationResults = columnsToProcess.map((column) => {
            const columnValue = createdItem.column_values.find((cv) => cv.column.id === column.id);
            const isSet = columnValue && (columnValue.value !== null || columnValue.text !== "");
            return {
                columnId: column.id,
                columnTitle: column.title,
                isSet,
                actualValue: columnValue
                    ? { text: columnValue.text, value: columnValue.value }
                    : null,
            };
        });
        // Check if any columns failed to set
        const failedColumns = verificationResults.filter((result) => !result.isSet);
        if (failedColumns.length > 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            message: "Item created but some columns failed to set properly",
                            item: createdItem,
                            failedColumns: failedColumns,
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
        // All good - return success with verification details
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        message: "Item created successfully with all values set properly",
                        item: createdItem,
                        verificationResults,
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create item with demo data: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}
