import {
  IconBuildingBank,
  IconCalendarWeek,
  IconCash,
  IconCertificate,
  IconChalkboard,
  IconChecklist,
  IconGavel,
  IconHeartHandshake,
  IconHome2,
  IconPencil,
  IconSchool,
  IconSettings,
  IconShieldCheck,
  IconSoup,
  IconUsers,
  IconUsersGroup,
  type Icon,
} from '@tabler/icons-react'
import type { Role } from '@/types/domain'

/** Clés d'icône de lib/roles.ts → composants Tabler. */
export const ICONES_NAVIGATION: Record<string, Icon> = {
  accueil: IconHome2,
  eleves: IconUsers,
  classes: IconUsersGroup,
  notes: IconPencil,
  bulletins: IconCertificate,
  presences: IconChecklist,
  discipline: IconGavel,
  emploi: IconCalendarWeek,
  scolarite: IconCash,
  cantine: IconSoup,
  parametres: IconSettings,
}

export const ICONES_ROLE: Record<Role, Icon> = {
  DIRECTION: IconBuildingBank,
  ENSEIGNANT: IconChalkboard,
  EDUCATEUR: IconShieldCheck,
  ECONOME: IconCash,
  PARENT: IconHeartHandshake,
}

export { IconSchool }
