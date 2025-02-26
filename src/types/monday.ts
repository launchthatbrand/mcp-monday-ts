export interface ColumnValue {
  id: string;
  title: string;
  value: string;
  text: string;
}

export interface Item {
  id: string;
  name: string;
  column_values: ColumnValue[];
  board?: {
    id: string;
    name: string;
  };
}

export interface Group {
  id: string;
  title: string;
  items: Item[];
  items_count?: number;
}

export interface Board {
  id: string;
  name: string;
  items: Item[];
  groups: Group[];
  columns?: {
    title: string;
    type: string;
  }[];
  items_page?: {
    items: Item[];
  };
}

export interface Workspace {
  id: string;
  name: string;
  kind: string;
  description: string;
}

export interface MondayResponse<T> {
  data: T;
}

export interface ItemsResponse {
  items: Item[];
}

export interface BoardsResponse {
  boards: Board[];
}

export interface WorkspacesResponse {
  workspaces: Workspace[];
}

export interface ItemsPageResponse {
  items_page: {
    items: Item[];
  };
}
