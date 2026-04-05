import { supabase } from '../supabaseClient'

// ─── PROFILES ───────────────────────────────────────────────

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getAllStudents = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'gestante')
    .order('full_name')
  if (error) throw error
  return data
}

export const getStudentById = async (studentId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single()
  if (error) throw error
  return data
}

export const updateStudentStatus = async (studentId, status) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', studentId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateStudentInfo = async (studentId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', studentId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── AUTH / INVITE ───────────────────────────────────────────

export const inviteStudent = async (email, fullName, dueDate) => {
  const response = await fetch('/api/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, fullName, dueDate })
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao enviar convite')
  }

  return data
}

// ─── DAILY RECORDS ────────────────────────────────────────────

export const getStudentRecords = async (studentId, { from, to } = {}) => {
  let query = supabase
    .from('daily_records')
    .select('*')
    .eq('student_id', studentId)
    .order('workout_date', { ascending: false })

  if (from) query = query.gte('workout_date', from)
  if (to) query = query.lte('workout_date', to)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const insertDailyRecord = async (record) => {
  const { data, error } = await supabase
    .from('daily_records')
    .insert(record)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateDailyRecord = async (recordId, updates) => {
  const { data, error } = await supabase
    .from('daily_records')
    .update(updates)
    .eq('id', recordId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteDailyRecord = async (recordId) => {
  const { error } = await supabase
    .from('daily_records')
    .delete()
    .eq('id', recordId)
  if (error) throw error
}

export const getAllStudentsWithAlerts = async () => {
  const { data, error } = await supabase
    .from('daily_records')
    .select('student_id, has_alert, workout_date')
    .eq('has_alert', true)
    .gte('workout_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  if (error) throw error
  return data
}

// ─── BODY MEASUREMENTS HISTORY ────────────────────────────────

export const insertBodyMeasurement = async (measurement) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .insert(measurement)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getBodyMeasurements = async (studentId) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('student_id', studentId)
    .order('measured_at', { ascending: false })
  if (error) throw error
  return data
}
