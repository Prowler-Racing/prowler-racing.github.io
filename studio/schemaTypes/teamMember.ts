import {defineField, defineType} from 'sanity'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'role', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'Wrap text in **double asterisks** to make it bold.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'portrait',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Lower numbers appear first.',
      validation: (r) => r.required().integer().min(0),
    }),
  ],
  orderings: [{title: 'Display order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'role', media: 'portrait'}},
})
