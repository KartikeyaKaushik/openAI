// src/app/api/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import OpenAI from 'openai';
// import { pool } from '@/lib/db';  // Ensure you have your database connection setup

const openaiApiKey = 'sk-proj-7RIc3gdXZHXti7SmixGdT3BlbkFJWKgnDEMa0krwULd0q1tb';
// const openaiClient = new openai.OpenAIApi(openaiApiKey);
const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    
    const prompt = (
        `company is related to textile industry`+
        `response must have more than 1000 characters in key dotted list`+
        `output must be like:-
        <p>company overview</p>
        <ul>
          <li>key point 1 </li>
          <li>key point 2 </li>
          <li>key point 3 </li>
        </ul>
        `+
        `and also compile that html received in response`+
      ` Question: "${question}"`
    );

    // Replace this with your actual OpenAI request code
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "tell me about in more" },
        { role: "user", content: prompt },
      ],
      temperature: 1,
    });

    const sqlQuery = openaiResponse.choices[0].message.content;

    console.log(sqlQuery);
    return NextResponse.json(sqlQuery);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
