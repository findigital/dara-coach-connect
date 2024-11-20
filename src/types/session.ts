export interface Session {
  id: string;
  title: string;
  started_at: string;
  summary: string;
}

export interface ActionItem {
  id: string;
  content: string;
  completed: boolean;
}