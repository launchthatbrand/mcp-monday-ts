# Monday.com MCP Server

MCP Server for the Monday.com API, enabling board management, item creation, workspace organization, and bulk operations.

[![smithery badge](https://smithery.ai/badge/@launchthatbrand/mcp-monday-ts)](https://smithery.ai/server/@launchthatbrand/mcp-monday-ts)

### Features

- **Intelligent Item Creation**: Support for both standard and demo data item creation
- **Bulk Operations**: Create multiple items efficiently with a single command
- **Workspace Management**: List and manage workspaces and boards
- **Comprehensive Error Handling**: Clear error messages for common API issues
- **Type Safety**: Built with TypeScript for reliable operations

## Tools

1. `list_boards`

   - List all boards in your Monday.com workspace
   - Returns: List of boards with details

2. `get_board`

   - Get detailed information about a specific board
   - Inputs:
     - `boardId` (number): The ID of the board to fetch
   - Returns: Board details including columns and items

3. `get_items`

   - Get all items from a specific board
   - Inputs:
     - `boardId` (number): The ID of the board to fetch items from
   - Returns: List of items with their column values

4. `get_workspaces`

   - List all workspaces in your Monday.com account
   - Returns: List of workspaces

5. `get_workspace`

   - Get detailed information about a specific workspace
   - Inputs:
     - `workspaceId` (number): The ID of the workspace to fetch
   - Returns: Workspace details

6. `get_item`

   - Get detailed information about a specific item
   - Inputs:
     - `itemId` (number): The ID of the item to fetch
   - Returns: Item details with column values

7. `get_boards`

   - Get all boards in a specific workspace
   - Inputs:
     - `workspaceId` (number): The ID of the workspace
   - Returns: List of boards in the workspace

8. `create_item`

   - Create a new item in a board
   - Inputs:
     - `boardId` (number): The ID of the board
     - `itemName` (string): Name of the new item
     - `groupId` (optional string): Group to create the item in
     - `columnValues` (optional object): Values for item columns
   - Returns: Created item details

9. `delete_item`

   - Delete an item from a board
   - Inputs:
     - `itemId` (number): The ID of the item to delete
   - Returns: Deletion confirmation

10. `create_item_with_demo`

    - Create a new item with demo data
    - Inputs:
      - `boardId` (number): The ID of the board
      - `columnIds` (optional string[]): Specific columns to fill
    - Returns: Created item with demo data

11. `create_multiple_items`

    - Create multiple items in a board
    - Inputs:
      - `boardId` (number): The ID of the board
      - `count` (number): Number of items to create
      - `isDemo` (optional boolean): Use demo data
    - Returns: First item details and creation status

12. `create_remaining_items`
    - Complete bulk item creation
    - Inputs:
      - `boardId` (number): The ID of the board
      - `count` (number): Number of remaining items
      - `startIndex` (number): Starting index for numbering
      - `isDemo` (optional boolean): Use demo data
    - Returns: Creation confirmation

## Setup

### Monday.com API Token

1. Go to your Monday.com account settings
2. Navigate to the 'Developer' section
3. Generate a new API token with appropriate permissions
4. Copy the generated token

### Installing via Smithery

To install Monday.com MCP - Typescript for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@launchthatbrand/mcp-monday-ts):

```bash
npx -y @smithery/cli install @launchthatbrand/mcp-monday-ts --client claude
```

### Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "monday": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "MONDAY_API_TOKEN", "mcp/monday"],
      "env": {
        "MONDAY_API_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

## Build

Docker build:

```bash
docker build -t mcp/monday .
```

## Testing

Test the server locally:

```bash
docker run -it --rm -e MONDAY_API_TOKEN=<your_token> mcp/monday
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License.
