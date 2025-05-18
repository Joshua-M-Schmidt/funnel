import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Parser from 'rss-parser'

const parser: Parser = new Parser()

export const GET = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const data = await payload.find({
    collection: 'source',
  })

  const rssData: any[] = []

  data.docs.forEach(async (source) => {
    payload.logger.info(`Fetching RSS feed for source ${source.url}`)
    if (source.type === 'rss') {
      try {
        const feed = await parser.parseURL(source.url)
        payload.logger.info(`RSS feed fetched for source ${source.name}`)

        feed.items.forEach(async (item) => {
          try {
            await payload.create({
              collection: 'contentItem',
              data: {
                title: item.title || '',
                content: item.content || '',
                source: source.id,
                originalUrl: item.link || '',
                publishDate: item.pubDate || '',
              },
            })
          } catch (error) {
            payload.logger.error(`Error creating content item for source ${source.url}`)
            payload.logger.error(error)
          }
        })
      } catch (error) {
        payload.logger.error(`Error fetching RSS feed for source ${source.url}`)
        payload.logger.error(error)
      }
    }
  })
  return Response.json(rssData)
}
