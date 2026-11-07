// Builds the site into _site/ from src/template.html and Sanity content.
// Usage: node scripts/build.mjs   (fails loudly if Sanity content is missing)
import {cpSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'

const PROJECT = process.env.SANITY_PROJECT_ID || '4ste5ykk'
const DATASET = process.env.SANITY_DATASET || 'production'
const OUT = '_site'

const esc = (s = '') => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function query(groq) {
  const url = `https://${PROJECT}.apicdn.sanity.io/v2025-01-01/data/query/${DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`)
  return (await res.json()).result
}

// ---- GROQ ----
const IMG = `{alt,"url":asset->url,"width":asset->metadata.dimensions.width,"height":asset->metadata.dimensions.height}`
const SETTINGS = `*[_id=="siteSettings"][0]{
  site, nav,
  hero{..., image${IMG}},
  story{..., image${IMG}},
  tiger{..., image${IMG}},
  outreach{..., upcomingImage${IMG}},
  socials, contact, footer,
  team{..., groupPhoto${IMG}}
}`
const TEAM = `*[_type=="teamMember"]|order(order asc){name,role,description,portrait${IMG}}`
const EVENTS = `*[_type=="outreachEvent"]|order(date desc){title,date,description,photo${IMG}}`

// ---- renderers ----
const img = (i, {w = 1200, cls = '', lazy = true, fallbackAlt = ''} = {}) => {
  if (!i?.url) return ''
  const dims = i.width && i.height ? ` width="${i.width}" height="${i.height}"` : ''
  return `<img${cls ? ` class="${cls}"` : ''} src="${i.url}?w=${w}&auto=format" alt="${esc(i.alt || fallbackAlt)}"${dims}${lazy ? ' loading="lazy"' : ''}>`
}

const spans = (children = [], defs = []) =>
  children.map((c) => {
    let t = esc(c.text)
    for (const m of c.marks || []) {
      if (m === 'strong') t = `<strong>${t}</strong>`
      else if (m === 'em') t = `<em>${t}</em>`
      else {
        const d = defs.find((x) => x._key === m)
        if (d?.href) t = `<a href="${esc(d.href)}">${t}</a>`
      }
    }
    return t
  }).join('')

const paragraphs = (blocks = [], cls = 'lead') =>
  blocks.filter((b) => b._type === 'block').map((b) => `<p class="${cls}">${spans(b.children, b.markDefs)}</p>`).join('\n      ')

const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

const fmtDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'})

function render(tpl, data) {
  const get = (path) => path.split('.').reduce((o, k) => o?.[k], data.settings)
  const special = {
    jsonld: () => JSON.stringify({'@context': 'https://schema.org', '@type': 'SportsTeam', name: get('site.name'), description: get('site.metaDescription'), sport: 'STEM Racing'}),
    'hero.image': () => img(get('hero.image'), {w: 2400, lazy: false}),
    'story.body': () => paragraphs(get('story.body')),
    'story.image': () => img(get('story.image'), {w: 800, cls: 'img--contain img--logo'}),
    'tiger.body': () => paragraphs(get('tiger.body')),
    'tiger.image': () => img(get('tiger.image'), {w: 1400}),
    'tiger.credit': () => (get('tiger.credit') ? `<figcaption class="credit">${esc(get('tiger.credit'))}</figcaption>` : ''),
    events: () =>
      data.events.map((e) => `      <article class="event">
        <figure class="media"><div class="ph">${img(e.photo, {w: 1200, fallbackAlt: e.title})}</div></figure>
        <div class="event__body">
          ${e.date ? `<time class="event__date" datetime="${esc(e.date)}">${fmtDate(e.date)}</time>` : '<time class="event__date">Date to be added</time>'}
          <h3 class="h3">${esc(e.title)}</h3>
          <p>${inline(e.description)}</p>
        </div>
      </article>`).join('\n'),
    upcoming: () => {
      const o = get('outreach')
      if (!o?.showUpcoming) return ''
      return `      <article class="event event--next">
        <figure class="media"><div class="ph ph--empty">${img(o.upcomingImage, {w: 800, cls: 'img--contain'})}</div></figure>
        <div class="event__body">
          <time class="event__date">${esc(o.upcomingDate)}</time>
          <h3 class="h3">${esc(o.upcomingTitle)}</h3>
          <p>${esc(o.upcomingText)}</p>
        </div>
      </article>`
    },
    'socials.links': () =>
      (get('socials.links') || []).map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener"><span>${esc(l.label)}</span></a></li>`).join(''),
    'team.photo': () => {
      const p = get('team.groupPhoto')
      return p?.url ? `<figure class="team__photo">${img(p, {w: 1800})}</figure>` : ''
    },
    roster: () =>
      data.team.map((p) => `      <li><article class="card">
        <div class="card__portrait"><div class="ph">${img(p.portrait, {w: 600, fallbackAlt: p.name}) || '<span>Portrait</span>'}</div></div>
        <div class="card__body">
          <p class="card__role">${esc(p.role)}</p>
          <h3 class="card__name">${esc(p.name)}</h3>
          <p>${inline(p.description)}</p>
        </div>
      </article></li>`).join('\n'),
    'contact.links': () => {
      const c = get('contact') || {}
      const lines = []
      if (c.instagramUrl) lines.push(`Instagram: <a href="${esc(c.instagramUrl)}" target="_blank" rel="noopener">${esc(c.instagramHandle || c.instagramUrl)}</a>`)
      if (c.email) lines.push(`Email: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`)
      return lines.length ? `<p class="lead contact__links">${lines.join('<br>')}</p>` : ''
    },
  }
  return tpl
    .replace(/\{\{@([\w.]+)\}\}/g, (_, k) => {
      if (!special[k]) throw new Error(`Template slot {{@${k}}} has no renderer`)
      return special[k]()
    })
    .replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
      if (k === 'year') return String(new Date().getFullYear())
      const v = get(k)
      if (v == null || v === '') throw new Error(`Missing content for "${k}" in Site Content`)
      return esc(v)
    })
}

const [settings, team, events] = await Promise.all([query(SETTINGS), query(TEAM), query(EVENTS)])
if (!settings) throw new Error('No siteSettings document found in Sanity (is it published?)')

rmSync(OUT, {recursive: true, force: true})
mkdirSync(OUT)
for (const d of ['css', 'js', 'assets']) cpSync(d, `${OUT}/${d}`, {recursive: true})
writeFileSync(`${OUT}/index.html`, render(readFileSync('src/template.html', 'utf8'), {settings, team, events}))
writeFileSync(`${OUT}/.nojekyll`, '')
console.log(`Built ${OUT}/ — ${team.length} team members, ${events.length} events`)
