// types/agent.ts
import { LucideIcon } from 'lucide-react';

export interface Agent {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AgentStatus {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  message?: string;
}