// Contrôle des liens : chaque lien interne écrit dans le code doit mener à une page qui existe.
// (Un des projets existants avait des liens morts : /eleves/:id, /notifications…)
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const racine = process.cwd()

function fichiers(dossier, filtre) {
  const resultat = []
  for (const nom of readdirSync(dossier)) {
    if (['node_modules', '.next', '.git', '.shots', '.tmp-tests'].includes(nom)) continue
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) resultat.push(...fichiers(chemin, filtre))
    else if (filtre(chemin)) resultat.push(chemin)
  }
  return resultat
}

// 1. Routes existantes, déduites des fichiers page.tsx (groupes retirés, [param] → joker)
const pages = fichiers(join(racine, 'app'), (f) => /page\.tsx$/.test(f))
const routes = pages.map((f) => {
  const segments = relative(join(racine, 'app'), f).split(sep).slice(0, -1).filter((s) => !/^\(.*\)$/.test(s))
  return '/' + segments.join('/')
})
const motifs = routes.map((r) => new RegExp('^' + r.replace(/\[[^\]]+\]/g, '[^/]+').replace(/\//g, '\\/') + '$'))
const routeExiste = (chemin) => chemin === '/' || motifs.some((m) => m.test(chemin))

// 2. Liens internes trouvés dans le code
const sources = fichiers(racine, (f) => /\.(tsx|ts)$/.test(f) && !f.includes(`${sep}scripts${sep}`) && !f.includes(`${sep}tests${sep}`))
const liens = []
const regex = /(?:href|push|replace|redirect)(?:=\{?|\()\s*(["'`])(\/[^"'`]*)\1/g
for (const f of sources) {
  const texte = readFileSync(f, 'utf8')
  for (const m of texte.matchAll(regex)) liens.push({ fichier: relative(racine, f), lien: m[2] })
}

// 3. Entrées du menu (lib/roles.ts)
const roles = readFileSync(join(racine, 'lib', 'roles.ts'), 'utf8')
for (const m of roles.matchAll(/href: '(\/[^']*)'/g)) liens.push({ fichier: 'lib/roles.ts', lien: m[1] })

const manquants = []
for (const { fichier, lien } of liens) {
  const propre = lien.split(/[?#]/)[0].replace(/\$\{[^}]*\}/g, 'x').replace(/\/$/, '') || '/'
  if (/^\/(api|_next)\b/.test(propre) || /\.(png|jpg|svg|ico|xml|txt)$/.test(propre)) continue
  if (!routeExiste(propre)) manquants.push(`${fichier} → ${lien}`)
}

console.log(`${routes.length} pages, ${liens.length} liens contrôlés.`)
if (manquants.length > 0) {
  console.error('\nLiens vers des pages inexistantes :\n- ' + [...new Set(manquants)].join('\n- '))
  process.exit(1)
}
console.log('Aucun lien mort.')
