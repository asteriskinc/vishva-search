// types.ts
import { LucideIcon } from "lucide-react";

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface Agent {
  name: string;
  model: string;
  instructions: string;
  tools: Record<string, any>;
  tool_choice?: string | null;
  parallel_tool_calls: boolean;
  response_format?: any;
}

export interface TaskResult {
  status: TaskStatus;
  data: Record<string, any>;
  message: string;
  timestamp: string;
}

export interface TaskDependency {
  task_id: string;
  subtask_id: string;
}

export interface SubTask {
  subtask_id: string;
  task_id: string;
  agent: Agent;
  dependencies: TaskDependency[];
  title: string;
  detail: string;
  status: TaskStatus;
  result?: TaskResult;
  start_time?: string;
  end_time?: string;
  // Frontend-specific fields
  icon?: string;
  category: 1 | 2; // 1: Direct task, 2: Optional task
  approved?: boolean;
  userContext?: string;
}

export interface SubtaskActivity {
  taskId: string;
  subtaskId: string;
  message: string;
  timestamp: string;
}

export interface Task {
  task_id: string;
  query: string;
  subtasks: SubTask[];
  status: TaskStatus;
  result?: TaskResult;
  start_time?: string;
  end_time?: string;
  // Frontend-specific fields
  domain: string;
  needsClarification: boolean;
  clarificationPrompt?: string;
  clarificationResponse?: string;
  timestamp: string;
}

// Component Props
export interface SearchBarProps {
  onSearch: (query: string) => void;
}

export interface TaskListProps {
  tasks?: Task[];
  onTaskUpdate?: (updatedTask: Task) => void;
  onTaskExecute?: (taskId: string) => void;
  isLoading?: boolean;
}

// Icon mapping type
export interface IconMap {
  [key: string]: LucideIcon;
}

// Editing state type
export interface EditingSubtask {
  taskId: string;
  subtaskIndex: number;
}

// TaskList update handlers
export interface TaskUpdateHandlers {
  handleClarificationSubmit: (taskId: string, response: string) => void;
  handleSubtaskContextSubmit: (taskId: string, subtaskIndex: number, context: string) => void;
  promoteToDirectTask: (taskId: string, subtaskIndex: number) => void;
  removeOptionalTask: (taskId: string, subtaskIndex: number) => void;
}

export interface BaseWebSocketMessage {
  type: string;
  payload: {
    subtask_id: string | null;
    status: TaskStatus;
    message: string;
    timestamp: string;
    content?: any;  // Additional content based on message type
  };
}

// Tool call start message
export interface ToolCallStartContent {
  type: 'tool_call_start';
  data: {
    tool: string;
    arguments: Record<string, any>;
  };
}

// Tool result message
export interface ToolResultContent {
  type: 'tool_result';
  data: {
    tool: string;
    result: {
      title?: string;
      url?: string;
      summary?: string;
      content?: string;
      source?: string;
      metadata?: {
        status_code?: number;
        redirected_url?: string;
      };
    };
    error?: string;
  };
}

// Agent thinking/response message
export interface AgentResponseContent {
  type: 'agent_response';
  data: {
    role: string;
    content: string;
  };
}

// Tool call error message
export interface ToolCallErrorContent {
  type: 'tool_call_error';
  data: {
    tool: string;
    error: string;
  };
}

// Union type for all possible content types
export type WebSocketMessageContent = 
  | ToolCallStartContent 
  | ToolResultContent 
  | AgentResponseContent 
  | ToolCallErrorContent;

// Update SubtaskActivity to match actual websocket messages
export interface SubtaskActivity {
  subtask_id: string | null;
  status: TaskStatus;
  message: string;
  timestamp: string;
  content?: WebSocketMessageContent;
}