import { z } from "zod";
// Column value schemas
const PersonColumnSchema = z.object({
    personsAndTeams: z.array(z.object({
        id: z.number(),
        kind: z.literal("person"),
    })),
});
const StatusColumnSchema = z.object({
    label: z.string(),
});
const DateColumnSchema = z.object({
    date: z.string(),
});
// API Functions with their schemas
export const ListBoardsSchema = z.object({
    limit: z.number().optional(),
});
export async function listBoards(limit) {
    const query = `
    query {
      boards (limit: ${limit ?? 100}) {
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
    return mondayRequest(query);
}
export const GetBoardSchema = z.object({
    boardId: z.string().or(z.number()),
});
export async function getBoard(boardId) {
    const query = `
    query {
      boards (ids: [${boardId}]) {
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
    return mondayRequest(query);
}
export const GetItemsSchema = z.object({
    boardId: z.string().or(z.number()),
    limit: z.number().optional(),
});
export async function getItems(boardId, limit) {
    const query = `
    query {
      boards (ids: [${boardId}]) {
        items_page (limit: ${limit ?? 100}) {
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
    return mondayRequest(query);
}
export const GetWorkspacesSchema = z.object({});
export async function getWorkspaces() {
    const query = `
    query {
      workspaces {
        id
        name
        kind
        description
        state
      }
    }
  `;
    return mondayRequest(query);
}
export const GetWorkspaceSchema = z.object({
    workspaceId: z.string().or(z.number()),
});
export async function getWorkspace(workspaceId) {
    const query = `
    query {
      workspaces(ids: [${workspaceId}]) {
        id
        name
        kind
        description
        state
        teams {
          id
          name
        }
        users {
          id
          name
          email
        }
      }
    }
  `;
    return mondayRequest(query);
}
export const GetItemSchema = z.object({
    itemId: z.string().or(z.number()),
});
export async function getItem(itemId) {
    const query = `
    query {
      items(ids: [${itemId}]) {
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
    return mondayRequest(query);
}
export const GetBoardsByWorkspaceSchema = z.object({
    workspaceId: z.string().or(z.number()),
    limit: z.number().optional(),
});
export async function getBoardsByWorkspace(workspaceId, limit) {
    const query = `
    query {
      boards(workspace_ids: [${workspaceId}], limit: ${limit ?? 100}) {
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
    return mondayRequest(query);
}
export const CreateItemSchema = z.object({
    boardId: z.string().or(z.number()),
    itemName: z.string(),
    columnValues: z
        .object({
        person: PersonColumnSchema,
        status: StatusColumnSchema,
        date4: DateColumnSchema,
        color_mkngxq0v: StatusColumnSchema,
    })
        .optional(),
    groupId: z.string().optional(),
});
export async function createItem(boardId, itemName, columnValues, groupId) {
    const mutation = `
    mutation {
      create_item (
        board_id: ${boardId}
        item_name: "${itemName}"
        ${columnValues ? `column_values: ${JSON.stringify(columnValues)}` : ""}
        ${groupId ? `group_id: "${groupId}"` : ""}
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
    return mondayRequest(mutation);
}
export const DeleteItemSchema = z.object({
    itemId: z.string().or(z.number()),
});
export async function deleteItem(itemId) {
    const mutation = `
    mutation {
      delete_item (
        item_id: ${itemId}
      ) {
        id
      }
    }
  `;
    return mondayRequest(mutation);
}
// Helper function for making requests to Monday.com API
async function mondayRequest(query) {
    // Implementation of the actual request would go here
    // This would handle the API token, headers, etc.
    return Promise.resolve(query);
}
