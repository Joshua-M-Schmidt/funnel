import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const data = await payload.find({
    collection: 'source',
  })

  data.docs.forEach(async (source) => {
    if (source.type === 'rss') {
      const rssFeed = await fetch(source.url)
      const rssData = await rssFeed.json()
      console.log(rssData)
    }
  })
  return Response.json(data)
}
