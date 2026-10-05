import type { MetadataRoute } from 'next'
import { appConfig } from '@/config/app.config'

const PAGES = ['', '/fonctionnalites', '/tarifs', '/contact']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return PAGES.map((page) => ({
    url: `${appConfig.url}${page}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: page === '' ? 1 : 0.7,
  }))
}
