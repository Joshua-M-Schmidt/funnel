import { GlobalConfig } from 'payload'

export const goals: GlobalConfig = {
  slug: 'goals',
  fields: [
    {
      name: 'goals',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'goal',
          type: 'text',
        },
      ],
    },
  ],
}
