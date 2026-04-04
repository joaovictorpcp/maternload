import { differenceInWeeks, differenceInDays, parseISO, isValid } from 'date-fns'

/**
 * Calcula a semana gestacional atual com base na Data Prevista do Parto (DPP).
 * A gestação dura aproximadamente 40 semanas.
 * 
 * @param {string|Date} dueDate - Data Prevista do Parto
 * @returns {{ weeks: number, days: number, trimester: number, label: string }}
 */
export function useGestationalAge(dueDate) {
  if (!dueDate) {
    return { weeks: 0, days: 0, trimester: 0, label: 'DPP não informada', isValid: false }
  }

  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate

  if (!isValid(due)) {
    return { weeks: 0, days: 0, trimester: 0, label: 'Data inválida', isValid: false }
  }

  const today = new Date()
  
  // DPP = conception + 280 dias
  // Semana gestacional = 40 - semanas até a DPP
  const weeksUntilDue = differenceInWeeks(due, today)
  const daysUntilDue = differenceInDays(due, today)
  
  const currentWeek = 40 - weeksUntilDue
  const currentDay = currentWeek * 7 - daysUntilDue + (currentWeek * 7)
  
  // Cálculo mais preciso
  const conceptionDate = new Date(due)
  conceptionDate.setDate(conceptionDate.getDate() - 280)
  
  const totalDaysPregnant = differenceInDays(today, conceptionDate)
  const weeks = Math.floor(totalDaysPregnant / 7)
  const remainingDays = totalDaysPregnant % 7

  const trimester = weeks <= 13 ? 1 : weeks <= 26 ? 2 : 3
  const trimesterLabel = trimester === 1 ? '1º Trimestre' : trimester === 2 ? '2º Trimestre' : '3º Trimestre'

  if (weeks < 0 || weeks > 42) {
    return {
      weeks: Math.max(0, weeks),
      days: remainingDays,
      trimester,
      trimesterLabel,
      label: weeks < 0 ? 'Pré-gestacional' : 'Pós-data',
      isValid: false
    }
  }

  return {
    weeks,
    days: remainingDays,
    trimester,
    trimesterLabel,
    label: `${weeks} semanas e ${remainingDays} dias`,
    isValid: true
  }
}
