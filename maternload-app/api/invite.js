import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { email, fullName, dueDate } = req.body
  
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ 
      error: 'A chave SUPABASE_SERVICE_ROLE_KEY não está configurada no painel da Vercel.' 
    })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Convida o usuário usando a API Admin (que tem permissão para ignorar travas de segurança)
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: 'gestante'
      }
    })

    if (error) {
      console.error("Erro no invite:", error)
      return res.status(400).json({ error: error.message })
    }

    // Atualiza a tabela profiles com os dados extras (DPP)
    if (data?.user?.id) {
      await supabaseAdmin.from('profiles').update({
        full_name: fullName,
        due_date: dueDate,
        role: 'gestante',
      }).eq('id', data.user.id)
    }

    return res.status(200).json({ data })
  } catch (err) {
    console.error("Erro interno do servidor:", err)
    return res.status(500).json({ error: 'Erro interno ao processar cadastro' })
  }
}
