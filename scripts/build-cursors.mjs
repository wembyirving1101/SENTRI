import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

// Native 32px pixel cursors; SVG sources keep the set editable.
const outline = '#202729', cream = '#c0bba8', shadow = '#999584', olive = '#89966d'
const arrow = `<path fill="${outline}" d="M2 1h2v2h2v2h2v2h2v2h2v2h2v2h2v2h2v2h2v2h2v2h-9l7 10h-6l-6-9-6 6z"/><path fill="${cream}" d="M4 5v19l5-5 7 10h2l-7-11h7z"/><path fill="${shadow}" d="M4 5h1v17H4z"/><path fill="${olive}" d="m13 23 4 6h-2l-4-6z"/>`
const hand = (pressed = false) => `<path fill="${outline}" d="M12 1h5v2h1v9h4v2h4v2h4v11h-2v3H9v-3H7v-3H5v-4H3v-6h5v2h4z"/><path fill="${cream}" d="M14 3h2v16h2v-5h3v6h2v-4h2v5h2v-3h1v8h-2v3H11v-3H9v-3H7v-4H5v-3h2v3h7z"/><path fill="${olive}" d="M11 27h15v3H11z"/>${pressed ? `<path fill="${olive}" d="M7 2h2v2H7zM21 2h2v2h-2zM10 5h2v2h-2zM19 5h2v2h-2z"/>` : ''}`
const states = {
  default: arrow,
  hover: hand(),
  pressed: hand(true),
  text: `<path fill="${outline}" d="M9 2h14v5h-5v18h5v5H9v-5h5V7H9z"/><path fill="${cream}" d="M11 4h10v1h-5v22h5v1H11v-1h4V5h-4z"/>`,
  loading: `<path fill="${outline}" d="M6 2h20v5h-2v5l-5 4 5 4v5h2v5H6v-5h2v-5l5-4-5-4V7H6z"/><path fill="${cream}" d="M8 4h16v1H8zM10 7h12v4l-6 5 6 5v4H10v-4l6-5-6-5zM8 27h16v1H8z"/><path fill="${olive}" d="M11 9h10v2l-5 4-5-4zM11 24l5-5 5 5z"/>`,
  unavailable: arrow + `<path fill="${outline}" d="M19 14h8v2h3v3h2v8h-2v3h-3v2h-8v-2h-3v-3h-2v-8h2v-3h3z"/><path fill="#a45c4c" d="M19 17h8v2h2v8h-2v2h-8v-2h-2v-8h2z"/><path fill="${cream}" d="M20 19h2v2h2v2h2v2h2v2h-4v-2h-2v-2h-2v-2h-2v-2z"/>`,
}
for (const [name, content] of Object.entries(states)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">${content}</svg>`
  await writeFile(`public/cursors/${name}.svg`, svg)
  await sharp(Buffer.from(svg)).png().toFile(`public/cursors/${name}.png`)
}
