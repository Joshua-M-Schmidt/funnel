import { getPayload } from 'payload'
import configPromise from '@payload-config'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Lightweight HTML optimizer function
function optimizeHtmlForAI(html: string, options: any = {}): string {
  let optimized = html

  // Remove DOCTYPE, meta tags, scripts, styles
  optimized = optimized.replace(/<!DOCTYPE[^>]*>/gi, '')
  optimized = optimized.replace(/<meta[^>]*>/gi, '')
  optimized = optimized.replace(/<link[^>]*>/gi, '')
  optimized = optimized.replace(/<title[^>]*>.*?<\/title>/gis, '')
  optimized = optimized.replace(/<script[^>]*>.*?<\/script>/gis, '')
  optimized = optimized.replace(/<style[^>]*>.*?<\/style>/gis, '')
  optimized = optimized.replace(/<noscript[^>]*>.*?<\/noscript>/gis, '')

  // Remove HTML comments
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')

  // Remove template tags and their content
  optimized = optimized.replace(/<template[^>]*>.*?<\/template>/gis, '')

  // Extract text content from body if present
  const bodyMatch = optimized.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    optimized = bodyMatch[1]
  }

  // Remove HTML tags, keeping only text content
  optimized = optimized.replace(/<[^>]*>/g, ' ')

  // Clean up whitespace
  optimized = optimized.replace(/\s+/g, ' ').trim()

  // Limit length to prevent token overflow
  return optimized.substring(0, 8000)
}

export const GET = async () => {
  try {
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
      limit: 10, // Reduced to prevent timeout
    })

    if (data.docs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No unprocessed items found',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    let processedCount = 0
    let errorCount = 0

    for (const item of data.docs) {
      try {
        payload.logger.info(`Processing item: ${item.title}`)

        let content = ''

        if (!item.content && item.originalUrl) {
          try {
            // Fetch content from URL with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

            const response = await fetch(item.originalUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ContentProcessor/1.0)',
              },
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const html = await response.text()
            content = optimizeHtmlForAI(html)

            payload.logger.info(`Fetched and optimized content for: ${item.title}`)
          } catch (fetchError) {
            payload.logger.error(`Failed to fetch content for ${item.title}:`, fetchError)
            content = item.title || '' // Fallback to title
          }
        } else {
          content = item.content || item.title || ''
        }

        // Ensure content isn't too long for OpenAI
        const contentForAnalysis = content.substring(0, 4000)

        const prompt = `
Analyze the following article and provide:
1. A concise summary (max 200 words)
2. 5-7 relevant keywords
3. Category classification
4. Priority level (high/medium/low) based on general interest and urgency
5. Estimated read time in minutes
6. 5-10 bullet points

Title: ${item.title}
Content: ${contentForAnalysis}

Please respond in valid JSON format:
{
  "summary": "Brief summary here",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "category name",
  "priority": "medium",
  "estimatedReadTime": 5,
  "bulletPoints": ["bullet point 1", "bullet point 2", "bullet point 3"]
}
        `

        const completion = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert content analyst. Provide accurate, concise summaries and relevant keywords for articles. Always respond with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        })

        const responseText = completion.choices[0]?.message?.content

        if (!responseText) {
          throw new Error('No response from OpenAI')
        }

        // Parse JSON response
        let analysis
        try {
          // Clean up the response text (remove code block markers if present)
          const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
          analysis = JSON.parse(cleanedResponse)
        } catch (parseError) {
          payload.logger.error(`Failed to parse OpenAI response for ${item.title}:`, parseError)
          throw new Error('Invalid JSON response from OpenAI')
        }

        // Update the item with analysis results
        await payload.update({
          collection: 'contentItem',
          id: item.id,
          data: {
            summary: analysis.summary || '',
            keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
            category: analysis.category || 'general',
            priority: analysis.priority || 'medium',
            estimatedReadTime: parseInt(analysis.estimatedReadTime) || 5,
            isProcessed: true,
            content: content, // Store the processed content
            bulletPoints: Array.isArray(analysis.bulletPoints) ? analysis.bulletPoints : [],
          },
        })

        processedCount++
        payload.logger.info(`Successfully processed: ${item.title}`)
      } catch (itemError) {
        errorCount++
        payload.logger.error(`Error processing item ${item.title}:`, itemError)

        // Mark as processed even if failed, to prevent retry loops
        try {
          await payload.update({
            collection: 'contentItem',
            id: item.id,
            data: {
              isProcessed: true,
            },
          })
        } catch (updateError) {
          payload.logger.error(`Failed to update error status for ${item.title}:`, updateError)
        }
      }
    }

    const responseData = {
      success: true,
      message: 'Content processing completed',
      statistics: {
        totalItems: data.docs.length,
        processed: processedCount,
        errors: errorCount,
      },
    }

    payload.logger.info('Processing batch completed:', responseData.statistics)

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Critical error in content processing:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to process content items',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
