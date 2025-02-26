import { createItem } from "./items.js";
// Tool Definitions
export const CREATE_MULTIPLE_ITEMS_TOOL = {
    name: "create_multiple_items",
    description: "Create multiple items in a board, showing the first one as an example",
    inputSchema: {
        type: "object",
        properties: {
            boardId: {
                type: "number",
                description: "The ID of the board to create items in",
            },
            count: {
                type: "number",
                description: "Number of items to create",
            },
            isDemo: {
                type: "boolean",
                description: "Whether to create items with demo data",
                default: false,
            },
        },
        required: ["boardId", "count"],
    },
};
export const CREATE_REMAINING_ITEMS_TOOL = {
    name: "create_remaining_items",
    description: "Create the remaining items after showing the example",
    inputSchema: {
        type: "object",
        properties: {
            boardId: {
                type: "number",
                description: "The ID of the board to create items in",
            },
            count: {
                type: "number",
                description: "Number of remaining items to create",
            },
            isDemo: {
                type: "boolean",
                description: "Whether to create items with demo data",
                default: false,
            },
            startIndex: {
                type: "number",
                description: "Starting index for item numbering",
            },
        },
        required: ["boardId", "count", "startIndex"],
    },
};
// Helper Functions
function generateDemoColumnValues() {
    const now = new Date();
    const statuses = ["Working on it", "Done", "Stuck"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return {
        status: { index: statuses.indexOf(randomStatus) },
        date4: now.toISOString().split("T")[0],
        person: { personsAndTeams: [{ id: 54566689, kind: "person" }] },
        color_mkngxq0v: { index: statuses.indexOf(randomStatus) },
    };
}
function generateDefaultColumnValues() {
    const now = new Date();
    return {
        status: { index: 0 }, // "Working on it"
        date4: now.toISOString().split("T")[0],
        person: { personsAndTeams: [{ id: 54566689, kind: "person" }] },
        color_mkngxq0v: { index: 0 }, // "Working on it"
    };
}
function parseItemResponse(response) {
    if (response.isError || !response.content?.[0]?.text) {
        throw new Error("Failed to create item");
    }
    const item = JSON.parse(response.content[0].text);
    // Validate that required column values are set
    const columnValues = item.column_values || [];
    const status = columnValues.find((cv) => cv.column.id === "status");
    const date = columnValues.find((cv) => cv.column.id === "date4");
    const person = columnValues.find((cv) => cv.column.id === "person");
    const showOnFrontend = columnValues.find((cv) => cv.column.id === "color_mkngxq0v");
    // Check if any required columns are missing or have empty values
    const missingColumns = [];
    if (!status?.text)
        missingColumns.push("status");
    if (!date?.text)
        missingColumns.push("date");
    if (!person?.text)
        missingColumns.push("person");
    if (!showOnFrontend?.text)
        missingColumns.push("showOnFrontend");
    if (missingColumns.length > 0) {
        throw new Error(`Failed to set values for columns: ${missingColumns.join(", ")}`);
    }
    return {
        id: item.id,
        name: item.name,
        status: status.text,
        date: date.text,
        person: person.text,
        showOnFrontend: showOnFrontend.text,
    };
}
// Main Functions
export async function createFirstItem(monday, boardId, count, isDemo = false) {
    const itemName = isDemo ? "Demo Item 1" : "Task 1";
    const columnValues = isDemo
        ? generateDemoColumnValues()
        : generateDefaultColumnValues();
    const response = await createItem(monday, boardId, itemName, undefined, columnValues);
    const firstItem = parseItemResponse(response);
    return {
        firstItem,
        remainingCount: count - 1,
        boardId,
        isDemo,
    };
}
export async function createRemainingItems(monday, boardId, count, startIndex, isDemo = false) {
    let created = 0;
    for (let i = 0; i < count; i++) {
        const itemName = isDemo
            ? `Demo Item ${startIndex + i + 1}`
            : `Task ${startIndex + i + 1}`;
        const columnValues = isDemo
            ? generateDemoColumnValues()
            : generateDefaultColumnValues();
        try {
            await createItem(monday, boardId, itemName, undefined, columnValues);
            created++;
        }
        catch (error) {
            console.error(`Failed to create item ${itemName}:`, error);
        }
    }
    return created;
}
// Format Functions
export function formatItemAsMarkdownTable(item) {
    return `
| Field | Value |
|-------|-------|
| ID | ${item.id} |
| Name | ${item.name} |
| Status | ${item.status} |
| Date | ${item.date ?? "Not set"} |
| Person | ${item.person ?? "Not set"} |
| Show on Frontend | ${item.showOnFrontend ?? "Not set"} |
`;
}
