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
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      role: 'gestante',
    }
  })
  if (error) throw error

  // Atualiza o perfil criado pelo trigger com os dados adicionais
  if (data?.user?.id) {
    await supabase.from('profiles').update({
      full_name: fullName,
      due_date: dueDate,
      role: 'gestante',
    }).eq('id', data.user.id)
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
