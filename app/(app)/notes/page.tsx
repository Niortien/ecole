import type { Metadata } from 'next'
import { GrilleNotes } from '@/features/notes/components/grille-notes'

export const metadata: Metadata = { title: 'Notes' }

export default function NotesPage() {
  return <GrilleNotes />
}
