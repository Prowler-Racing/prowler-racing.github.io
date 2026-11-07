import {defineArrayMember, defineField, defineType} from 'sanity'

const str = (name: string, title?: string, required = true) =>
  defineField({name, title, type: 'string', validation: required ? (r) => r.required() : undefined})

const image = (name: string, title?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    options: {hotspot: true},
    fields: [defineField({name: 'alt', type: 'string', title: 'Alt text', description: 'Describe the image for screen readers.'})],
  })

const body = defineField({
  name: 'body',
  type: 'array',
  of: [defineArrayMember({type: 'block', styles: [], lists: [], marks: {decorators: [{title: 'Bold', value: 'strong'}, {title: 'Italic', value: 'em'}], annotations: []}})],
})

const group = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineField({name, title, type: 'object', options: {collapsible: true, collapsed: true}, fields})

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Content',
  type: 'document',
  fields: [
    group('site', 'Site & SEO', [
      str('name', 'Team name'),
      str('title', 'Browser tab / search title'),
      defineField({name: 'metaDescription', type: 'text', rows: 3, title: 'Search description'}),
      defineField({name: 'ogDescription', type: 'text', rows: 2, title: 'Link-preview description'}),
    ]),
    group('nav', 'Navigation labels', [str('home'), str('story'), str('outreach'), str('team'), str('socials'), str('contact')]),
    group('hero', 'Hero', [
      image('image', 'Background photo (full-bleed, ~2400px wide)'),
      str('kicker'),
      str('titleLine1', 'Title, line 1'),
      str('titleLine2', 'Title, line 2'),
      str('tagline'),
      str('primaryCta', 'Primary button label'),
      str('secondaryCta', 'Secondary button label'),
    ]),
    group('story', 'Our Story', [str('kicker'), str('heading'), body, image('image')]),
    group('tiger', 'Bengal Tiger', [str('kicker'), str('heading'), body, image('image'), str('credit', 'Photo credit', false)]),
    group('outreach', 'Outreach section', [
      str('heading'),
      defineField({name: 'showUpcoming', type: 'boolean', title: 'Show "coming soon" card', initialValue: true}),
      image('upcomingImage', 'Coming-soon card image'),
      str('upcomingDate', 'Coming-soon card date label', false),
      str('upcomingTitle', 'Coming-soon card title', false),
      defineField({name: 'upcomingText', type: 'text', rows: 2, title: 'Coming-soon card text'}),
    ]),
    group('socials', 'Socials', [
      str('heading'),
      str('intro', 'Intro line', false),
      defineField({
        name: 'links',
        type: 'array',
        of: [defineArrayMember({type: 'object', fields: [str('label', 'Platform'), defineField({name: 'url', type: 'url', validation: (r) => r.required().uri({scheme: ['https']})})], preview: {select: {title: 'label', subtitle: 'url'}}})],
      }),
    ]),
    group('team', 'Team section', [str('heading'), image('groupPhoto', 'Group photo')]),
    group('contact', 'Contact', [
      str('heading'),
      defineField({name: 'intro', type: 'text', rows: 2}),
      str('instagramHandle', 'Instagram handle', false),
      defineField({name: 'instagramUrl', type: 'url'}),
      defineField({name: 'email', type: 'string'}),
    ]),
    group('footer', 'Footer', [str('text', 'Text after the © year')]),
  ],
  preview: {prepare: () => ({title: 'Site Content'})},
})
