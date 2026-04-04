import { subDays, format } from 'date-fns'

// ─── Demo Users ───────────────────────────────────────────────────
export const DEMO_PERSONAL = {
  id: 'demo-personal-001',
  full_name: 'João Victor Pinheiro Coelho Pedrosa',
  role: 'personal',
  cref: '123456-G/SP',
  status: 'ativa',
  created_at: new Date().toISOString(),
}

export const DEMO_STUDENT_1 = {
  id: 'demo-student-001',
  full_name: 'Ana Clara Oliveira',
  role: 'gestante',
  due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +60 dias
  status: 'ativa',
  created_at: subDays(new Date(), 60).toISOString(),
}

export const DEMO_STUDENT_2 = {
  id: 'demo-student-002',
  full_name: 'Maria Fernanda Santos',
  role: 'gestante',
  due_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +120 dias
  status: 'ativa',
  created_at: subDays(new Date(), 30).toISOString(),
}

export const DEMO_STUDENT_3 = {
  id: 'demo-student-003',
  full_name: 'Juliana Costa Pereira',
  role: 'gestante',
  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 dias
  status: 'ativa',
  created_at: subDays(new Date(), 90).toISOString(),
}

export const DEMO_STUDENTS = [DEMO_STUDENT_1, DEMO_STUDENT_2, DEMO_STUDENT_3]

// ─── Gerador de Registros Realistas ───────────────────────────────
function makeRecord(studentId, daysAgo, overrides = {}) {
  const rpe = overrides.rpe ?? (3 + Math.floor(Math.random() * 5))
  const cardio = overrides.cardio_minutes ?? (Math.floor(Math.random() * 3) * 15) // 0, 15 ou 30
  const strength = overrides.strength_minutes ?? (30 + Math.floor(Math.random() * 3) * 15) // 30, 45 ou 60
  const total = cardio + strength
  const hoopSleep = overrides.hooper_sleep ?? (1 + Math.floor(Math.random() * 4))
  const hoopFatigue = overrides.hooper_fatigue ?? (1 + Math.floor(Math.random() * 4))
  const hoopStress = overrides.hooper_stress ?? (1 + Math.floor(Math.random() * 4))
  const hoopMuscle = overrides.hooper_muscle_pain ?? (1 + Math.floor(Math.random() * 4))
  const hasAlert = overrides.has_alert ?? false

  return {
    id: `demo-rec-${studentId}-${daysAgo}`,
    student_id: studentId,
    workout_date: subDays(new Date(), daysAgo).toISOString().split('T')[0],
    workout_type: total <= 30 ? 'Cardio' : cardio === 0 ? 'Força' : 'Misto',
    cardio_minutes: cardio,
    cardio_description: cardio > 0 ? 'Caminhada leve' : null,
    strength_minutes: strength,
    avg_heart_rate: 120 + Math.floor(Math.random() * 25),
    rpe,
    talk_test: rpe <= 6,
    hooper_sleep: hoopSleep,
    hooper_fatigue: hoopFatigue,
    hooper_stress: hoopStress,
    hooper_muscle_pain: hoopMuscle,
    alert_bleeding: hasAlert && overrides.alert_bleeding,
    alert_dizziness: hasAlert && overrides.alert_dizziness,
    alert_fluid_loss: false,
    alert_pelvic_pain: hasAlert && overrides.alert_pelvic_pain,
    notes: overrides.notes ?? null,
    total_minutes: total,
    srpe: total * rpe,
    hooper_total: hoopSleep + hoopFatigue + hoopStress + hoopMuscle,
    has_alert: hasAlert,
    created_at: subDays(new Date(), daysAgo).toISOString(),
  }
}

// Registros para Ana Clara (aluna com alerta recente)
export const DEMO_RECORDS_STUDENT_1 = [
  makeRecord('demo-student-001', 0, { rpe: 7, cardio_minutes: 20, strength_minutes: 40, hooper_sleep: 4, hooper_fatigue: 5, alert_dizziness: true, has_alert: true, notes: 'Senti uma leve tontura no final da sessão.' }),
  makeRecord('demo-student-001', 2, { rpe: 5, cardio_minutes: 0, strength_minutes: 45 }),
  makeRecord('demo-student-001', 4, { rpe: 4, cardio_minutes: 30, strength_minutes: 30 }),
  makeRecord('demo-student-001', 7, { rpe: 6, cardio_minutes: 15, strength_minutes: 45 }),
  makeRecord('demo-student-001', 9, { rpe: 5, cardio_minutes: 0, strength_minutes: 60 }),
  makeRecord('demo-student-001', 11, { rpe: 4, cardio_minutes: 30, strength_minutes: 30 }),
  makeRecord('demo-student-001', 14, { rpe: 6, cardio_minutes: 20, strength_minutes: 40 }),
  makeRecord('demo-student-001', 16, { rpe: 5, cardio_minutes: 0, strength_minutes: 50 }),
  makeRecord('demo-student-001', 18, { rpe: 3, cardio_minutes: 30, strength_minutes: 0 }),
  makeRecord('demo-student-001', 21, { rpe: 5, cardio_minutes: 15, strength_minutes: 45 }),
  makeRecord('demo-student-001', 23, { rpe: 4, cardio_minutes: 0, strength_minutes: 45 }),
  makeRecord('demo-student-001', 25, { rpe: 6, cardio_minutes: 30, strength_minutes: 30 }),
]

// Registros para Maria Fernanda (bem regular, sem alertas)
export const DEMO_RECORDS_STUDENT_2 = [
  makeRecord('demo-student-002', 1, { rpe: 4, cardio_minutes: 30, strength_minutes: 30 }),
  makeRecord('demo-student-002', 3, { rpe: 5, cardio_minutes: 0, strength_minutes: 45 }),
  makeRecord('demo-student-002', 6, { rpe: 5, cardio_minutes: 20, strength_minutes: 40 }),
  makeRecord('demo-student-002', 8, { rpe: 4, cardio_minutes: 30, strength_minutes: 30 }),
  makeRecord('demo-student-002', 10, { rpe: 3, cardio_minutes: 30, strength_minutes: 0 }),
  makeRecord('demo-student-002', 13, { rpe: 5, cardio_minutes: 15, strength_minutes: 45 }),
  makeRecord('demo-student-002', 15, { rpe: 4, cardio_minutes: 0, strength_minutes: 45 }),
]

// Registros para Juliana (poucos, perto do parto)
export const DEMO_RECORDS_STUDENT_3 = [
  makeRecord('demo-student-003', 1, { rpe: 3, cardio_minutes: 20, strength_minutes: 20, hooper_fatigue: 5 }),
  makeRecord('demo-student-003', 5, { rpe: 3, cardio_minutes: 15, strength_minutes: 15 }),
  makeRecord('demo-student-003', 10, { rpe: 4, cardio_minutes: 20, strength_minutes: 25 }),
]

export const DEMO_ALERTS = [
  { student_id: 'demo-student-001', has_alert: true, workout_date: new Date().toISOString().split('T')[0] }
]

// Mapa studentId → records
export const DEMO_RECORDS_MAP = {
  'demo-student-001': DEMO_RECORDS_STUDENT_1,
  'demo-student-002': DEMO_RECORDS_STUDENT_2,
  'demo-student-003': DEMO_RECORDS_STUDENT_3,
}

// O usuário demo gestante é sempre a Ana Clara
export const DEMO_STUDENT_SELF = DEMO_STUDENT_1
export const DEMO_STUDENT_SELF_RECORDS = DEMO_RECORDS_STUDENT_1
