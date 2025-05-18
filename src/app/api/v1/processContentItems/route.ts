import { getPayload } from 'payload'
import configPromise from '@payload-config'
import OpenAI from 'openai'
import { optimizeHtmlForAI } from './optimizeHtml'

const client = new OpenAI()

export const GET = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const data = await payload.find({
    collection: 'contentItem',
    where: {
      isProcessed: {
        equals: false,
      },
    },
    limit: 100,
  })

  for (const item of data.docs) {
    // check if item has content

    let content = ''

    if (!item.content) {
      // fetch the content from the link
      const response = await fetch(item.originalUrl)
      const html = await response.text()

      const optimized1 = optimizeHtmlForAI(html, {
        removeMetaTags: true,
        removeScriptTags: true,
        removeStyleTags: true,
        removeEmptyTags: true,
        removeAttributes: true,
        preserveAttributes: ['href', 'src', 'alt'],
        minifyWhitespace: true,
      })

      console.log('optimized1', optimized1)

      content = optimized1
    } else {
      content = item.content
    }

    const prompt = `
    Analyze the following article and provide:
    1. A concise summary (200)
    2. 5-7 relevant keywords
    3. Category classification
    4. Priority level (high/medium/low) based on general interest and urgency
    5. Estimated read time in minutes
    6. 5-10 bullet points

    Title: ${item.title}
    Content: ${item.content}

    Please respond in the following JSON format:
    {
      "summary": "Brief summary here (200 Words)",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "category": "category name",
      "priority": "medium",
      "estimatedReadTime": 5,
      "bulletPoints": ["bullet point 1", "bullet point 2", "bullet point 3"],
    }
  `

    const response = await client.responses.create({
      model: 'gpt-3.5-turbo',
      input: [
        {
          role: 'system',
          content:
            'You are an expert content analyst. Provide accurate, concise summaries and relevant keywords for articles.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    console.log(response)

    const analysis = JSON.parse(response.output_text)

    await payload.update({
      collection: 'contentItem',
      id: item.id,
      data: {
        summary: analysis.summary,
        keywords: analysis.keywords,
        category: analysis.category,
        priority: analysis.priority,
        estimatedReadTime: analysis.estimatedReadTime,
        isProcessed: true,
        content: content,
        bulletPoints: analysis.bulletPoints,
      },
    })
  }

  return new Response(JSON.stringify({ message: 'Sources fetched and processed' }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
