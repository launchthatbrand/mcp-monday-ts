import {
  validateAndFormatColumnValues,
  validateCreateItemInput,
} from "../types.js";

import type { MondaySDKInstance } from "../types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Query Definitions
export const GET_ITEMS_QUERY = `
  query ($boardId: ID!) {
    boards (ids: [$boardId]) {
      items_page (limit: 100) {
        cursor
        items {
          id
          name
          state
          created_at
          updated_at
          creator {
            id
            name
          }
          column_values {
            column {
              id
              title
              type
            }
            id
            text
            value
          }
          subitems {
            id
            name
            state
          }
        }
      }
    }
  }
`;

export const GET_ITEM_QUERY = `
  query ($itemId: ID!) {
    items(ids: [$itemId]) {
      id
      name
      state
      created_at
      updated_at
      creator {
        id
        name
      }
      board {
        id
        name
      }
      group {
        id
        title
      }
      column_values {
        column {
          id
          title
        }
        type
        text
        value
      }
      subitems {
        id
        name
        state
      }
    }
  }
`;

export const createItemMutation = (
  hasColumnValues: boolean,
  hasGroupId: boolean,
) => `
  mutation ($boardId: ID!, $itemName: String!${hasColumnValues ? ", $columnValues: JSON" : ""}${hasGroupId ? ", $groupId: String" : ""}) {
    create_item (
      board_id: $boardId
      item_name: $itemName${hasColumnValues ? "\n      column_values: $columnValues" : ""}${hasGroupId ? "\n      group_id: $groupId" : ""}\n      create_labels_if_missing: true
    ) {
      id
      name
      column_values {
        column {
          id
          title
        }
        type
        text
        value
      }
    }
  }
`;

export const CREATE_ITEM_MUTATION = createItemMutation(true, true);

export const DELETE_ITEM_MUTATION = `
  mutation ($itemId: ID!) {
    delete_item (
      item_id: $itemId
    ) {
      id
    }
  }
`;

// Schema Definitions
export const GetItemsSchema = z.object({
  boardId: z.string().or(z.number()),
  limit: z.number().optional(),
});

export const GetItemSchema = z.object({
  itemId: z.string().or(z.number()),
});

export const CreateItemSchema = z.object({
  boardId: z.string().or(z.number()),
  itemName: z.string(),
  columnValues: z.record(z.any()).optional(),
  groupId: z.string().optional(),
});

export const DeleteItemSchema = z.object({
  itemId: z.string().or(z.number()),
});

// Tool Definitions
export const GET_ITEMS_TOOL: Tool = {
  name: "get_items",
  description: "Get all items from a specific board",
  inputSchema: {
    type: "object",
    properties: {
      boardId: {
        type: "number",
        description: "The ID of the board to fetch items from",
      },
    },
    required: ["boardId"],
  },
};

export const GET_ITEM_TOOL: Tool = {
  name: "get_item",
  description: "Get detailed information about a specific item",
  inputSchema: {
    type: "object",
    properties: {
      itemId: {
        type: "number",
        description: "The ID of the item to fetch",
      },
    },
    required: ["itemId"],
  },
};

export const CREATE_ITEM_TOOL: Tool = {
  name: "create_item",
  description: "Create a new item in a board",
  inputSchema: {
    type: "object",
    properties: {
      boardId: {
        type: "number",
        description: "The ID of the board to create the item in",
      },
      itemName: {
        type: "string",
        description: "The name of the new item",
      },
      groupId: {
        type: "string",
        description: "Optional group ID to create the item in",
      },
      columnValues: {
        type: "object",
        description:
          "Optional column values for the new item (as key-value pairs)",
        additionalProperties: true,
      },
    },
    required: ["boardId", "itemName"],
  },
};

export const DELETE_ITEM_TOOL: Tool = {
  name: "delete_item",
  description: "Delete an item from a board",
  inputSchema: {
    type: "object",
    properties: {
      itemId: {
        type: "number",
        description: "The ID of the item to delete",
      },
    },
    required: ["itemId"],
  },
};

// Operation Functions
export async function getItems(monday: MondaySDKInstance, boardId: number) {
  try {
    const response = await monday.api(GET_ITEMS_QUERY, {
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
            text: JSON.stringify(
              response.data.boards[0].items_page.items,
              null,
              2,
            ),
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
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to fetch items: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

export async function getItem(monday: MondaySDKInstance, itemId: number) {
  try {
    const response = await monday.api(GET_ITEM_QUERY, {
      variables: { itemId: itemId.toString() },
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

    if (response.data?.items?.length > 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data.items[0], null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Item with ID ${itemId} not found`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to fetch item: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

export async function createItem(
  monday: MondaySDKInstance,
  boardId: number,
  itemName: string,
  groupId?: string,
  columnValues?: Record<string, any>,
) {
  try {
    const validatedInput = validateCreateItemInput({
      boardId,
      itemName,
      groupId,
      columnValues: columnValues
        ? validateAndFormatColumnValues(columnValues)
        : undefined,
    });

    const mutation = createItemMutation(
      !!validatedInput.columnValues,
      !!validatedInput.groupId,
    );

    const response = await monday.api(mutation, {
      variables: {
        boardId: validatedInput.boardId.toString(),
        itemName: validatedInput.itemName,
        ...(validatedInput.groupId && { groupId: validatedInput.groupId }),
        ...(validatedInput.columnValues && {
          columnValues: JSON.stringify(validatedInput.columnValues),
        }),
      },
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
          text: JSON.stringify(response.data.create_item, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create item: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

export async function deleteItem(monday: MondaySDKInstance, itemId: number) {
  try {
    const response = await monday.api(DELETE_ITEM_MUTATION, {
      variables: { itemId: itemId.toString() },
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
          text: JSON.stringify(response.data.delete_item, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to delete item: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
