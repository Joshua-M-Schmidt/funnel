import { CollectionConfig } from 'payload'

export const ContentItem: CollectionConfig = {
  slug: 'contentItem',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'keywords',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'source',
    },
    {
      name: 'originalUrl',
      type: 'text',
    },
    {
      name: 'publishDate',
      type: 'date',
    },
    {
      name: 'priority',
      type: 'select',
      options: ['high', 'medium', 'low'],
      defaultValue: 'medium',
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'estimatedReadTime',
      type: 'number',
    },
  ],
}
