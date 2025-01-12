// app/api/process-query/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { Task } from '@/types/types';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    const response = await axios.post<Task>(
      'http://127.0.0.1:8000/api/process-query', 
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