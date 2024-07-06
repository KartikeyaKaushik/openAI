// src/app/api/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import OpenAI from 'openai';
import  {GoogleGenerativeAI}  from '@google/generative-ai';
// import { pool } from '@/lib/db';  // Ensure you have your database connection setup

const geminiClient =  new GoogleGenerativeAI('AIzaSyCXwE0HHsl8InXw9RbRhl5YQ8ETSe2ShxQ');
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = (
        `company is related to textile industry so provide its profile`+
        // ` and give the reponse in well formatted html, just those tags used inside body tag` +
      ` Question: "${question}"`
    );
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
      console.log('Chat completion response:', text);

    return NextResponse.json(text);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
