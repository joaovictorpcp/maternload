import { startOfWeek, endOfWeek, format, parseISO, eachWeekOfInterval, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Calcula todas as métricas de carga de treinamento a partir dos registros diários.
 */
export function useMetrics(records = []) {
  if (!records.length) return getEmptyMetrics()

  // ─── sRPE por registro ────────────────────────────────────
  const recordsWithSRPE = records.map(r => ({
    ...r,
    // srpe é calculado no banco, mas garantimos aqui também
    srpe: r.srpe ?? (r.total_minutes ?? (r.cardio_minutes + r.strength_minutes)) * r.rpe
  }))

  // ─── Meta ACOG Semanal (150 min/semana) ──────────────────
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  const thisWeekRecords = recordsWithSRPE.filter(r => {
    const date = typeof r.workout_date === 'string' ? parseISO(r.workout_date) : r.workout_date
    return date >= thisWeekStart && date <= thisWeekEnd
  })

  const weeklyVolume = thisWeekRecords.reduce((sum, r) => sum + (r.total_minutes || 0), 0)
  const weeklyCardio = thisWeekRecords.reduce((sum, r) => sum + (r.cardio_minutes || 0), 0)
  const weeklyStrength = thisWeekRecords.reduce((sum, r) => sum + (r.strength_minutes || 0), 0)
  const acogGoal = 150
  const acogPercent = Math.min(Math.round((weeklyVolume / acogGoal) * 100), 100)

  // ─── Dados por semana (últimas 12 semanas) ────────────────
  const weeklyData = getWeeklyBreakdown(recordsWithSRPE, 12)

  // ─── Monotonia e Strain (últimas 7 sessões) ───────────────
  const last7 = recordsWithSRPE.slice(0, 7)
  const loads = last7.map(r => r.srpe)
  const avgLoad = loads.length ? loads.reduce((a, b) => a + b, 0) / loads.length : 0
  const variance = loads.length > 1
    ? loads.reduce((sum, l) => sum + Math.pow(l - avgLoad, 2), 0) / loads.length
    : 0
  const stdDev = Math.sqrt(variance)
  const monotony = stdDev > 0 ? +(avgLoad / stdDev).toFixed(2) : 0
  const strain = +(avgLoad * loads.length).toFixed(0)

  // ─── Hooper médio ────────────────────────────────────────
  const hoopers = recordsWithSRPE.slice(0, 7).filter(r => r.hooper_total)
  const avgHooper = hoopers.length
    ? +(hoopers.reduce((sum, r) => sum + r.hooper_total, 0) / hoopers.length).toFixed(1)
    : null

  // Componentes do Hooper
  const hooperComponents = hoopers.length ? {
    sleep: +(hoopers.reduce((s, r) => s + r.hooper_sleep, 0) / hoopers.length).toFixed(1),
    fatigue: +(hoopers.reduce((s, r) => s + r.hooper_fatigue, 0) / hoopers.length).toFixed(1),
    stress: +(hoopers.reduce((s, r) => s + r.hooper_stress, 0) / hoopers.length).toFixed(1),
    musclePain: +(hoopers.reduce((s, r) => s + r.hooper_muscle_pain, 0) / hoopers.length).toFixed(1),
  } : null

  // ─── RPE médio ───────────────────────────────────────────
  const avgRPE = recordsWithSRPE.length
    ? +(recordsWithSRPE.slice(0, 7).reduce((s, r) => s + r.rpe, 0) / Math.min(recordsWithSRPE.length, 7)).toFixed(1)
    : null

  // ─── Alertas recentes ─────────────────────────────────────
  const recentAlerts = recordsWithSRPE.slice(0, 7).filter(r => r.has_alert)
  const hasRecentAlert = recentAlerts.length > 0

  return {
    weeklyVolume,
    weeklyCardio,
    weeklyStrength,
    acogGoal,
    acogPercent,
    weeklyData,
    avgLoad: +avgLoad.toFixed(0),
    monotony,
    strain,
    avgHooper,
    hooperComponents,
    avgRPE,
    hasRecentAlert,
    recentAlerts,
    totalSessions: recordsWithSRPE.length,
  }
}

function getWeeklyBreakdown(records, numWeeks = 12) {
  const result = []
  const today = new Date()

  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 })

    const weekRecords = records.filter(r => {
      const date = typeof r.workout_date === 'string' ? parseISO(r.workout_date) : r.workout_date
      return date >= weekStart && date <= weekEnd
    })

    const cardio = weekRecords.reduce((s, r) => s + (r.cardio_minutes || 0), 0)
    const strength = weekRecords.reduce((s, r) => s + (r.strength_minutes || 0), 0)
    const total = cardio + strength
    const srpeSum = weekRecords.reduce((s, r) => s + (r.srpe || 0), 0)
    const avgRPE = weekRecords.length
      ? +(weekRecords.reduce((s, r) => s + r.rpe, 0) / weekRecords.length).toFixed(1)
      : null
    const avgHooper = weekRecords.length
      ? +(weekRecords.reduce((s, r) => s + (r.hooper_total || 0), 0) / weekRecords.length).toFixed(1)
      : null

    result.push({
      week: format(weekStart, 'dd/MM', { locale: ptBR }),
      weekStart: weekStart.toISOString(),
      weekLabel: `Sem. ${format(weekStart, 'dd/MM', { locale: ptBR })}`,
      cardio,
      strength,
      total,
      srpe: srpeSum,
      avgRPE,
      avgHooper,
      sessions: weekRecords.length,
    })
  }

  return result
}

function getEmptyMetrics() {
  return {
    weeklyVolume: 0,
    weeklyCardio: 0,
    weeklyStrength: 0,
    acogGoal: 150,
    acogPercent: 0,
    weeklyData: [],
    avgLoad: 0,
    monotony: 0,
    strain: 0,
    avgHooper: null,
    hooperComponents: null,
    avgRPE: null,
    hasRecentAlert: false,
    recentAlerts: [],
    totalSessions: 0,
  }
}
