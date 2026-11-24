import {defineField, defineType} from 'sanity'

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'logo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text', description: 'Describe the sponsor logo for screen readers.'})],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url',
      type: 'url',
      validation: (r) => r.required().uri({scheme: ['https', 'http']}),
    }),
    defineField({
      name: 'tier',
      type: 'string',
      description: 'Sponsor level for display grouping.',
      options: {
        list: [
          {title: 'Platinum', value: 'platinum'},
          {title: 'Gold', value: 'gold'},
          {title: 'Silver', value: 'silver'},
          {title: 'Bronze', value: 'bronze'},
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Lower numbers appear first within their tier.',
      validation: (r) => r.required().integer().min(0),
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'byOrder', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Tier then order', name: 'byTier', by: [{field: 'tier', direction: 'asc'}, {field: 'order', direction: 'asc'}]},
  ],
  preview: {select: {title: 'name', subtitle: 'tier', media: 'logo'}},
})
