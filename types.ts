import { z } from "zod";

// Monday SDK Instance Type
export interface MondaySDKInstance {
  setToken(token: string): void;
  api(
    query: string,
    options?: { variables?: Record<string, any> },
  ): Promise<any>;
}

// Base schemas for common column types
export const PersonColumnSchema = z.object({
  personsAndTeams: z.array(
    z.object({
      id: z.number(),
      kind: z.enum(["person", "team"]),
    }),
  ),
});

export const StatusColumnSchema = z.object({
  label: z.string(),
  index: z.number().optional(),
});

export const DateColumnSchema = z.object({
  date: z.string(),
  time: z.string().optional(),
  timezone: z.string().optional(),
});

// Enhanced column type schemas
export const TextColumnSchema = z.object({
  text: z.string(),
});

export const NumberColumnSchema = z.object({
  number: z.number(),
});

export const TimelineColumnSchema = z.object({
  from: z.string(), // ISO date string
  to: z.string(), // ISO date string
});

export const CheckboxColumnSchema = z.object({
  checked: z.boolean(),
});

export const DropdownColumnSchema = z.object({
  labels: z.array(z.string()),
});

export const EmailColumnSchema = z.object({
  email: z.string().email(),
  text: z.string().optional(),
});

export const PhoneColumnSchema = z.object({
  phone: z.string(),
  countryShortName: z.string().optional(),
});

export const LinkColumnSchema = z.object({
  url: z.string().url(),
  text: z.string().optional(),
});

export const LongTextColumnSchema = z.object({
  text: z.string(),
});

export const ColorColumnSchema = z.object({
  color: z.string(),
});

export const RatingColumnSchema = z.object({
  rating: z.number().min(0).max(5),
});

// Column values schema
export const ColumnValuesSchema = z.record(
  z.union([
    TextColumnSchema,
    NumberColumnSchema,
    DateColumnSchema,
    StatusColumnSchema,
    PersonColumnSchema,
    TimelineColumnSchema,
    CheckboxColumnSchema,
    DropdownColumnSchema,
    EmailColumnSchema,
    PhoneColumnSchema,
    LinkColumnSchema,
    LongTextColumnSchema,
    ColorColumnSchema,
    RatingColumnSchema,
  ]),
);

// Create item input schema
export const CreateItemInputSchema = z.object({
  boardId: z.union([z.string(), z.number()]),
  itemName: z.string(),
  columnValues: ColumnValuesSchema.optional(),
  groupId: z.string().optional(),
});

// Types inferred from schemas
export type PersonColumn = z.infer<typeof PersonColumnSchema>;
export type StatusColumn = z.infer<typeof StatusColumnSchema>;
export type DateColumn = z.infer<typeof DateColumnSchema>;
export type ColumnValues = z.infer<typeof ColumnValuesSchema>;
export type CreateItemInput = z.infer<typeof CreateItemInputSchema>;

// Helper function to format column values based on type
export function formatColumnValue(
  columnId: string,
  value: any,
  columnType: string,
): any {
  switch (columnType.toLowerCase()) {
    case "text":
      return { text: String(value) };
    case "numeric":
      return { number: Number(value) };
    case "date":
      if (typeof value === "string") {
        return { date: value };
      }
      if (typeof value === "object") {
        return {
          date: value.date,
          time: value.time,
          timezone: value.timezone,
        };
      }
      throw new Error("Invalid date value format");
    case "status":
      return { label: String(value) };
    case "people":
      if (!Array.isArray(value)) {
        value = [value];
      }
      return {
        personsAndTeams: value.map((v: number | { id: number }) => ({
          id: typeof v === "number" ? v : v.id,
          kind: "person",
        })),
      };
    case "checkbox":
      return { checked: Boolean(value) };
    case "timeline":
      return {
        from: value.from,
        to: value.to,
      };
    case "dropdown":
      return {
        labels: Array.isArray(value) ? value : [String(value)],
      };
    case "email":
      return typeof value === "string"
        ? { email: value }
        : { email: value.email, text: value.text };
    case "phone":
      return typeof value === "string"
        ? { phone: value }
        : { phone: value.phone, countryShortName: value.countryShortName };
    case "link":
      return typeof value === "string"
        ? { url: value }
        : { url: value.url, text: value.text };
    case "long-text":
      return { text: String(value) };
    case "color":
      return { color: String(value) };
    case "rating":
      return { rating: Number(value) };
    default:
      // For unknown column types, pass through the value as is
      return value;
  }
}

// Helper function to validate and format column values
export function validateAndFormatColumnValues(
  values: Record<string, any>,
  columnTypes?: Record<string, string>,
): ColumnValues {
  const formattedValues: Record<string, any> = {};

  for (const [columnId, value] of Object.entries(values)) {
    const columnType = columnTypes?.[columnId] ?? "text"; // default to text if type unknown
    formattedValues[columnId] = formatColumnValue(columnId, value, columnType);
  }

  const parsed = ColumnValuesSchema.safeParse(formattedValues);
  if (!parsed.success) {
    throw new Error(`Invalid column values: ${parsed.error.message}`);
  }

  return parsed.data;
}

// Helper function to validate create item input
export function validateCreateItemInput(
  input: Record<string, any>,
): CreateItemInput {
  const parsed = CreateItemInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid create item input: ${parsed.error.message}`);
  }
  return parsed.data;
}

// Response Type
export interface MondayResponse {
  data?: any;
  error?: any;
}
