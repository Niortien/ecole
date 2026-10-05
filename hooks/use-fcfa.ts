import { useMemo } from 'react'

interface FormatFCFAOptions {
  showSymbol?: boolean
}

export function formatFCFA(
  amount: number | string | null | undefined,
  { showSymbol = true }: FormatFCFAOptions = {},
) {
  const value = typeof amount === 'string' ? Number(amount) : amount

  if (value === null || value === undefined || Number.isNaN(value)) {
    return showSymbol ? '0 FCFA' : '0'
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value)

  if (!showSymbol) return formatted

  return `${formatted} FCFA`
}

export function useFCFA(
  amount: number | string | null | undefined,
  options?: FormatFCFAOptions,
) {
  return useMemo(() => formatFCFA(amount, options), [amount, options])
}
