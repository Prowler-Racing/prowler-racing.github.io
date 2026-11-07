// Fetches content from Sanity and injects it into index.html between
// <!-- cms:NAME:start --> and <!-- cms:NAME:end --> markers.
// If the fetch fails or returns nothing, the hand-written HTML is left as is.
import {readFileSync, writeFileSync} from 'node:fs'

const PROJECT = process.env.SANITY_PROJECT_ID || '4ste5ykk'
const DATASET = process.env.SANITY_DATASET || 'production'
const FILE = process.argv[2] || 'index.html'

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const rich = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
const img = (ref, w) => {
  const m = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(ref || '')
  return m ? `https://cdn.sanity.io/images/${PROJECT}/${DATASET}/${m[1]}-${m[2]}.${m[3]}?w=${w}&auto=format` : null
}

async function query(groq) {
  const url = `https://${PROJECT}.apicdn.sanity.io/v2025-01-01/data/query/${DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity ${res.status}`)
  return (await res.json()).result
}

const renderers = {
  team: {
    groq: `*[_type=="teamMember"]|order(order asc){name,role,description,"ref":portrait.asset._ref,"alt":portrait.alt}`,
    html: (items) =>
      items.map((p) => {
        const src = img(p.ref, 600)
        const portrait = src
          ? `<img src="${src}" alt="${esc(p.alt || p.name)}" loading="lazy">`
          : `<span>Portrait</span>`
        return `      <li><article class="card">
        <div class="card__portrait"><div class="ph">${portrait}</div></div>
        <div class="card__body">
          <p class="card__role">${esc(p.role)}</p>
          <h3 class="card__name">${esc(p.name)}</h3>
          <p>${rich(p.description)}</p>
        </div>
      </article></li>`
      }).join('\n'),
  },
  outreach: {
    groq: `*[_type=="outreachEvent"]|order(date desc){title,date,description,"ref":photo.asset._ref,"alt":photo.alt}`,
    html: (items) =>
      items.map((e) => {
        const src = img(e.ref, 1200)
        const media = src
          ? `<img src="${src}" alt="${esc(e.alt || e.title)}" loading="lazy">`
          : `<span>Event photo</span>`
        const date = e.date
          ? `<time class="event__date" datetime="${esc(e.date)}">${new Date(e.date + 'T12:00:00Z').toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'})}</time>`
          : `<time class="event__date">Date to be added</time>`
        return `      <article class="event">
        <figure class="media"><div class="ph">${media}</div></figure>
        <div class="event__body">
          ${date}
          <h3 class="h3">${esc(e.title)}</h3>
          <p>${rich(e.description)}</p>
        </div>
      </article>`
      }).join('\n'),
  },
}

let html = readFileSync(FILE, 'utf8')
for (const [name, r] of Object.entries(renderers)) {
  const re = new RegExp(`(<!-- cms:${name}:start -->)[\\s\\S]*?(<!-- cms:${name}:end -->)`)
  if (!re.test(html)) continue
  try {
    const items = await query(r.groq)
    if (!items?.length) { console.log(`cms:${name}: no documents, keeping static HTML`); continue }
    html = html.replace(re, (_, a, b) => `${a}\n${r.html(items)}\n      ${b}`)
    console.log(`cms:${name}: rendered ${items.length}`)
  } catch (err) {
    console.warn(`cms:${name}: ${err.message}, keeping static HTML`)
  }
}
writeFileSync(FILE, html)
