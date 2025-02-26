import type { MondaySDKInstance } from "../types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Query Definitions
export const GET_WORKSPACES_QUERY = `
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

export const GET_WORKSPACE_QUERY = `
  query ($workspaceId: ID!) {
    workspaces(ids: [$workspaceId]) {
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

// Schema Definitions
export const GetWorkspacesSchema = z.object({});

export const GetWorkspaceSchema = z.object({
  workspaceId: z.string().or(z.number()),
});

// Tool Definitions
export const GET_WORKSPACES_TOOL: Tool = {
  name: "get_workspaces",
  description: "List all workspaces in your Monday.com account",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export const GET_WORKSPACE_TOOL: Tool = {
  name: "get_workspace",
  description: "Get detailed information about a specific workspace",
  inputSchema: {
    type: "object",
    properties: {
      workspaceId: {
        type: "number",
        description: "The ID of the workspace to fetch",
      },
    },
    required: ["workspaceId"],
  },
};

// Operation Functions
export async function getWorkspaces(monday: MondaySDKInstance) {
  try {
    const response = await monday.api(GET_WORKSPACES_QUERY);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error) {
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

export async function getWorkspace(
  monday: MondaySDKInstance,
  workspaceId: number,
) {
  try {
    const response = await monday.api(GET_WORKSPACE_QUERY, {
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

    if (response.data?.workspaces?.length > 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data.workspaces[0], null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Workspace with ID ${workspaceId} not found`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to fetch workspace: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
