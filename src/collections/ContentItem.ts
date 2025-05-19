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
      name: 'bulletPoints',
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
      unique: true,
      required: true,
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
      name: 'isProcessed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'estimatedReadTime',
      type: 'number',
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'philosophyIndex',
      type: 'number',
    },
    {
      name: 'personalIndex',
      type: 'number',
    },
    {
      name: 'historyIndex',
      type: 'number',
    },
    {
      name: 'scienceIndex',
      type: 'number',
    },
    {
      name: 'aiIndex',
      type: 'number',
    },
    {
      name: 'hideFromFeed',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
