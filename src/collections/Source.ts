import { CollectionConfig } from 'payload'

export const Source: CollectionConfig = {
  slug: 'source',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: ['rss'],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'categories',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
    },
  ],
}
