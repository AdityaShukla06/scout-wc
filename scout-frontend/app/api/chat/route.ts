import { NextResponse } from 'next/server';
import { sendMessage } from '@/lib/vertex';
import { ChatRequest } from '@/lib/types';

const ipRequests = new Map<string, number>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const currentRequests = ipRequests.get(ip) || 0;
  
  if (currentRequests > 20) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  
  ipRequests.set(ip, currentRequests + 1);
  setTimeout(() => {
    const count = ipRequests.get(ip) || 1;
    if (count <= 1) {
      ipRequests.delete(ip);
    } else {
      ipRequests.set(ip, count - 1);
    }
  }, 60000);

  try {
    const body: ChatRequest = await req.json();
    const { message, sessionId, history } = body;

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing message or sessionId' }, { status: 400 });
    }

    const { reply, toolCalls } = await sendMessage(message, sessionId, history);

    return NextResponse.json({ message: reply, toolCalls }, { status: 200 });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
