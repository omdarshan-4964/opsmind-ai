import { NextRequest, NextResponse } from 'next/server'

interface StreamChunk {
  type: 'content' | 'sources' | 'done'
  data?: string
  sources?: Array<{ title: string; reference: string }>
}

async function streamResponse(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      )
    }

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Simulate streaming response character by character
          const responseText =
            'This is a sample response from the document assistant. It demonstrates streaming responses with real-time character-by-character updates.'

          // Stream the content
          for (const char of responseText) {
            const chunk: StreamChunk = {
              type: 'content',
              data: char,
            }
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify(chunk)}\n\n`,
              ),
            )
            // Add small delay for realistic streaming effect
            await new Promise((resolve) => setTimeout(resolve, 10))
          }

          // Send sample sources
          const sources: StreamChunk = {
            type: 'sources',
            sources: [
              {
                title: 'Company HR Policy',
                reference: 'HR Manual, Section 3.2, Page 42',
              },
              {
                title: 'Employee Handbook',
                reference: 'Handbook Edition 2024, Chapter 5',
              },
            ],
          }
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(sources)}\n\n`),
          )

          // Send completion signal
          const done: StreamChunk = { type: 'done' }
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(done)}\n\n`),
          )

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return streamResponse(request)
}
