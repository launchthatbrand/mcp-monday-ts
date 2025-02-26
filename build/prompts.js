export const CREATE_ITEM_WITH_DEMO_DATA_PROMPT = `
Given a Monday.com board ID, this tool will:
1. First fetch the board structure to understand all columns and their types
2. Generate appropriate demo data for each column based on its type
3. Create a new item with the generated demo data

The tool will handle all Monday.com column types appropriately:
- Text/Long Text: Generate meaningful sample text
- Number: Generate appropriate numeric values
- Date: Use current or future dates
- Status: Use valid status labels from the column settings
- People: Use existing user IDs if available
- Timeline: Generate reasonable date ranges
- Checkbox: Set boolean values
- Dropdown: Use valid options from the column settings
- Email: Generate valid email addresses
- Phone: Generate valid phone numbers
- Link: Generate valid URLs
- Color: Use valid color values
- Rating: Generate values within the valid range (0-5)

The tool ensures all data is properly formatted according to Monday.com's API requirements.
`;
// Function to generate demo data based on column type
export function generateDemoValue(columnType, columnSettings) {
    const now = new Date();
    switch (columnType.toLowerCase()) {
        case "text":
            return { text: "Sample Text" };
        case "long_text":
            return {
                text: "This is a longer sample text for demonstration purposes.",
            };
        case "numeric":
            return { number: Math.floor(Math.random() * 100) };
        case "date":
            return {
                date: now.toISOString().split("T")[0],
                time: "09:00:00",
            };
        case "status":
            // Use first status if settings available, otherwise use "Done"
            return {
                label: columnSettings?.labels?.[0] || "Done",
            };
        case "people":
            return {
                personsAndTeams: [
                    {
                        id: 1234567, // This should be a valid user ID
                        kind: "person",
                    },
                ],
            };
        case "timeline":
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + 7);
            return {
                from: now.toISOString().split("T")[0],
                to: endDate.toISOString().split("T")[0],
            };
        case "checkbox":
            return { checked: true };
        case "dropdown":
            // Use first option if settings available, otherwise use "Option 1"
            return {
                labels: [columnSettings?.labels?.[0] || "Option 1"],
            };
        case "email":
            return { email: "demo@example.com" };
        case "phone":
            return { phone: "+1-555-0123", countryShortName: "US" };
        case "link":
            return { url: "https://monday.com", text: "Monday.com" };
        case "color":
            return { color: "#0086c0" };
        case "rating":
            return { rating: 4 };
        default:
            return { text: "Default Value" };
    }
}
// Enhanced board query to include column settings
export const GET_BOARD_WITH_SETTINGS_QUERY = `
  query ($boardId: ID!) {
    boards (ids: [$boardId]) {
      name
      columns {
        id
        title
        type
        settings_str
      }
      items_page {
        items {
          id
          name
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
        }
      }
    }
  }
`;
// Tool definition for creating items with demo data
export const CREATE_ITEM_WITH_DEMO_DATA_TOOL = {
    name: "create_item_with_demo",
    description: "Create a new item on a Monday.com board with demo data for specified columns or all columns",
    inputSchema: {
        type: "object",
        properties: {
            boardId: {
                type: "number",
                description: "The ID of the board to create the item in",
            },
            columnIds: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "Optional: Array of column IDs to fill with demo data. If not provided, all columns will be filled.",
            },
        },
        required: ["boardId"],
    },
};
