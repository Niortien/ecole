import type { MetadataRoute } from 'next'
import { appConfig } from '@/config/app.config'

// Le site vitrine est référencé ; l'application (démo ou réelle) reste hors des moteurs de recherche.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/connexion', '/accueil', '/eleves', '/classes', '/notes', '/bulletins', '/presences', '/discipline', '/emplois-du-temps', '/scolarite', '/cantine', '/parametres', '/api/'],
      },
    ],
    sitemap: `${appConfig.url}/sitemap.xml`,
    host: appConfig.url,
  }
}
