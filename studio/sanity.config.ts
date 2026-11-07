import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Prowler Racing',

  projectId: '4ste5ykk',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem().title('Site Content').id('siteSettings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('teamMember').title('Team Members'),
            S.documentTypeListItem('outreachEvent').title('Outreach Events'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (t) => t.filter(({schemaType}) => schemaType !== 'siteSettings'),
  },
})
