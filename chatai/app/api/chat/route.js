import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = "An AI-powered customer support tool for HeadStartAI, a platform that provides AI-driven interviews for software engineers.";

export async function POST(req) {
  try {
    const openai = new OpenAI()
    const data = await req.json()
    
    const completionStream = openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...data.messages,
      ],
      model: "gpt-4o-mini",
      stream: true,
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of completionStream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              const text = encoder.encode(content)
              controller.enqueue(text)
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    })

    return new NextResponse(stream);
  } catch (err) {
    console.error('Error in POST request:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
