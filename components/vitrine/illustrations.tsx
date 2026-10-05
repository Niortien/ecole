/** Illustrations dessinées pour Cartable (SVG, aux couleurs du projet). Aucune photo d'enfant : tout est décoratif et masqué aux lecteurs d'écran. */

export function IllustrationReseau({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" aria-hidden="true" className={className}>
      <rect x="12" y="132" width="216" height="6" rx="3" className="fill-papier-3" />
      {/* Téléphone */}
      <rect x="82" y="16" width="76" height="120" rx="14" className="fill-encre" />
      <rect x="88" y="26" width="64" height="100" rx="8" className="fill-papier" />
      <rect x="104" y="20" width="32" height="4" rx="2" className="fill-encre-doux" />
      {/* Liste d'élèves pointés */}
      <g className="fill-ardoise-pale">
        <rect x="94" y="36" width="52" height="14" rx="4" />
        <rect x="94" y="56" width="52" height="14" rx="4" />
        <rect x="94" y="76" width="52" height="14" rx="4" />
      </g>
      <circle cx="101" cy="43" r="4" className="fill-ardoise" />
      <circle cx="101" cy="63" r="4" className="fill-ardoise" />
      <circle cx="101" cy="83" r="4" className="fill-stylo" />
      <rect x="110" y="41" width="28" height="4" rx="2" className="fill-encre-doux/50" />
      <rect x="110" y="61" width="22" height="4" rx="2" className="fill-encre-doux/50" />
      <rect x="110" y="81" width="26" height="4" rx="2" className="fill-encre-doux/50" />
      <rect x="94" y="98" width="52" height="20" rx="10" className="fill-ardoise" />
      <path d="M110 108l5 5 11-11" className="stroke-papier" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Réseau coupé */}
      <g className="stroke-crayon" strokeWidth="4" strokeLinecap="round">
        <path d="M184 52c10-10 28-10 38 0" />
        <path d="M193 62c5-5 15-5 20 0" />
      </g>
      <circle cx="203" cy="72" r="3.5" className="fill-crayon" />
      <path d="M180 38l46 46" className="stroke-stylo" strokeWidth="4" strokeLinecap="round" />
      {/* Nuage de synchronisation */}
      <path d="M32 74a14 14 0 0 1 14-14c2-8 14-10 19-3 7-2 13 3 13 10a10 10 0 0 1-9 10H40a9 9 0 0 1-8-3z" className="fill-bille-pale" />
      <path d="M46 78l6-6 6 6M52 72v10" className="stroke-bille" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IllustrationBulletin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" aria-hidden="true" className={className}>
      <rect x="12" y="132" width="216" height="6" rx="3" className="fill-papier-3" />
      {/* Feuille de bulletin */}
      <rect x="40" y="14" width="104" height="118" rx="8" className="fill-surface stroke-trait" strokeWidth="2" />
      <rect x="52" y="26" width="48" height="6" rx="3" className="fill-encre" />
      <rect x="52" y="38" width="30" height="4" rx="2" className="fill-encre-doux/50" />
      <g className="fill-papier-2">
        <rect x="52" y="52" width="80" height="10" rx="3" />
        <rect x="52" y="68" width="80" height="10" rx="3" />
        <rect x="52" y="84" width="80" height="10" rx="3" />
      </g>
      <rect x="112" y="55" width="14" height="4" rx="2" className="fill-encre" />
      <rect x="112" y="71" width="14" height="4" rx="2" className="fill-encre" />
      <rect x="112" y="87" width="14" height="4" rx="2" className="fill-encre" />
      <path d="M52 112c8-6 14 4 22-2s12 2 20-3" className="stroke-stylo" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="122" cy="114" r="10" className="fill-crayon" />
      <path d="M117 114l4 4 7-8" className="stroke-encre" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bulle de message */}
      <path d="M150 52h58a12 12 0 0 1 12 12v26a12 12 0 0 1-12 12h-30l-14 12V102h-14a12 12 0 0 1-12-12V64a12 12 0 0 1 12-12z" className="fill-ardoise" />
      <rect x="160" y="68" width="44" height="5" rx="2.5" className="fill-papier" />
      <rect x="160" y="80" width="30" height="5" rx="2.5" className="fill-papier/70" />
    </svg>
  )
}

export function IllustrationPaiement({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" aria-hidden="true" className={className}>
      <rect x="12" y="132" width="216" height="6" rx="3" className="fill-papier-3" />
      {/* Reçu */}
      <path d="M52 14h80v112l-10-7-10 7-10-7-10 7-10-7-10 7-10-7-10 7z" className="fill-surface stroke-trait" strokeWidth="2" />
      <rect x="64" y="28" width="40" height="6" rx="3" className="fill-encre" />
      <g className="fill-encre-doux/45">
        <rect x="64" y="46" width="56" height="4" rx="2" />
        <rect x="64" y="58" width="44" height="4" rx="2" />
        <rect x="64" y="70" width="52" height="4" rx="2" />
      </g>
      <rect x="64" y="84" width="56" height="20" rx="6" className="fill-ardoise-pale" />
      <rect x="70" y="91" width="32" height="6" rx="3" className="fill-ardoise" />
      {/* Pièces */}
      <g>
        <circle cx="176" cy="98" r="26" className="fill-crayon" />
        <circle cx="176" cy="98" r="19" className="stroke-crayon-texte/40" strokeWidth="2" />
        <text x="176" y="105" textAnchor="middle" className="fill-crayon-texte font-display" fontSize="22" fontWeight="700">F</text>
        <circle cx="200" cy="120" r="16" className="fill-ardoise-pale stroke-ardoise/40" strokeWidth="2" />
        <circle cx="152" cy="124" r="12" className="fill-bille-pale stroke-bille/40" strokeWidth="2" />
      </g>
      <path d="M166 54c6-14 24-16 32-4" className="stroke-ardoise" strokeWidth="3" strokeLinecap="round" />
      <path d="M194 44l6 6-9 3z" className="fill-ardoise" />
    </svg>
  )
}
