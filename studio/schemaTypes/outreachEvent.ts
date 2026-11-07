import {defineField, defineType} from 'sanity'

export const outreachEvent = defineType({
  name: 'outreachEvent',
  title: 'Outreach Event',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'date',
      type: 'date',
      description: 'Leave empty to show "Date to be added".',
    }),
    defineField({name: 'description', type: 'text', rows: 4, validation: (r) => r.required()}),
    defineField({
      name: 'photo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
  ],
  orderings: [{title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'date', media: 'photo'}},
})
