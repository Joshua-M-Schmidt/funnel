import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Parser from 'rss-parser'

const parser: Parser = new Parser()

export const GET = async () => {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const data = await payload.find({
      collection: 'source',
    })

    let totalProcessed = 0
    let totalSkipped = 0
    let totalErrors = 0

    for (const source of data.docs) {
      payload.logger.info(`Fetching RSS feed for source ${source.url}`)

      if (source.type === 'rss') {
        try {
          const feed = await parser.parseURL(source.url)
          payload.logger.info(`RSS feed fetched for source ${source.name}`)
          payload.logger.info(`Feed items: ${feed.items.length}`)

          for (const item of feed.items) {
            try {
              // Check if item is already in the database
              const existingItem = await payload.find({
                collection: 'contentItem',
                where: {
                  originalUrl: {
                    equals: item.link,
                  },
                },
                limit: 1, // Only need to check if one exists
              })

              if (existingItem.docs.length > 0) {
                payload.logger.info(`Item already exists in the database: ${item.title}`)
                totalSkipped++
                continue // ✅ Use continue instead of return
              }

              payload.logger.info(`Creating content item for source ${item.title}`)

              await payload.create({
                collection: 'contentItem',
                data: {
                  title: item.title || '',
                  content: item.content || item.contentSnippet || '',
                  source: source.id,
                  originalUrl: item.link || '',
                  publishDate: item.pubDate || new Date().toISOString(),
                  isProcessed: false, // Add this if you have this field
                },
              })

              totalProcessed++
              payload.logger.info(`Successfully created content item: ${item.title}`)
            } catch (itemError) {
              totalErrors++
              payload.logger.error(`Error creating content item for ${item.title}:`, itemError)
              // Continue processing other items
            }
          }
        } catch (feedError) {
          totalErrors++
          payload.logger.error(`Error fetching RSS feed for source ${source.url}:`, feedError)
          // Continue processing other sources
        }
      } else {
        payload.logger.info(`Skipping source ${source.name} - not RSS type`)
      }
    }

    // Always return a response
    const responseData = {
      success: true,
      message: 'Sources fetched and processed',
      statistics: {
        totalSources: data.docs.length,
        totalProcessed,
        totalSkipped,
        totalErrors,
      },
    }

    payload.logger.info('Processing complete:', responseData.statistics)

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // Always return a response, even on error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Critical error in RSS processing:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        message: 'Failed to process RSS sources',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
