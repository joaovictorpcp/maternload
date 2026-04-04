-- Remover a política recursiva
DROP POLICY IF EXISTS "personal_can_read_all_profiles" ON public.profiles;

-- Permitir que qualquer usuário autenticado leia os perfis
-- (Este aplicativo é fechado, não há problema em usuários lerem nomes)
CREATE POLICY "anyone_can_read_profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);
