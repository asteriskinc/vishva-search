// app/api/process-query/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export interface Agent {
  id: string;
  name: string;
  capabilities: string[];
}

export interface SubTask {
  title: string;
  status: 'pending' | 'active' | 'complete';
  agent: string;
  detail: string;
  icon?: string;
  category: 1 | 2;  // 1: Direct, 2: Optional
  approved?: boolean;
}

export interface TaskResponse {
  id: string;
  query: string;
  timestamp: string;
  domain: string;
  needsClarification: boolean;
  clarificationPrompt?: string;
  subtasks: SubTask[];
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    const response = await axios.post('http://127.0.0.1:8000/api/process-query', 
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}