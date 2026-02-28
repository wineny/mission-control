// Gateway types matching actual OpenClaw data structures

export interface CronSchedule {
  kind: string;
  expr: string;
  tz: string;
}

export interface CronPayload {
  kind: string;
  message: string;
}

export interface CronDelivery {
  mode: string;
  channel?: string;
  to?: string;
  bestEffort?: boolean;
}

export interface CronJobState {
  nextRunAtMs?: number;
  lastRunAtMs?: number;
  lastStatus?: string;  // "ok" | "error" | "timeout"
  lastDurationMs?: number;
  lastError?: string;
  consecutiveErrors?: number;
}

export interface CronJob {
  id: string;
  name: string;
  description?: string;
  agent?: string;
  enabled: boolean;
  schedule: CronSchedule;
  payload?: CronPayload;
  delivery?: CronDelivery;
  sessionTarget?: string;
  wakeMode?: string;
  state: CronJobState;
  createdAtMs?: number;
  updatedAtMs?: number;
}

export interface CronListResponse {
  jobs: CronJob[];
}

export interface CronRunEntry {
  id: string;
  jobId: string;
  startedAt: string;
  finishedAt?: string;
  status: string;
  error?: string;
  duration?: number;
}

export interface SessionEntry {
  id: string;
  agentId?: string;
  startedAt?: string;
  timestamp?: string;
  lastActiveAt?: string;
  topic?: string;
  messageCount?: number;
  status?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  model?: string;
  status?: string;
}
