-- ============================================================
-- MaternLoad — Schema SQL Completo para Supabase
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Tabela de Perfis (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'gestante' CHECK (role IN ('personal', 'gestante')),
  due_date DATE,           -- Data Prevista do Parto (DPP) — apenas gestantes
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  cref TEXT,               -- CREF do Personal (editável nas configurações)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Registros Diários de Treino
CREATE TABLE IF NOT EXISTS public.daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('Cardio', 'Força', 'Misto')),
  
  -- Volume
  cardio_minutes INT NOT NULL DEFAULT 0,
  cardio_description TEXT,
  strength_minutes INT NOT NULL DEFAULT 0,
  
  -- Métricas de Esforço
  avg_heart_rate INT CHECK (avg_heart_rate BETWEEN 60 AND 220),
  rpe INT NOT NULL CHECK (rpe BETWEEN 0 AND 10),
  talk_test BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Hooper Index (componentes individuais, escala 1-7)
  hooper_sleep INT NOT NULL CHECK (hooper_sleep BETWEEN 1 AND 7),
  hooper_fatigue INT NOT NULL CHECK (hooper_fatigue BETWEEN 1 AND 7),
  hooper_stress INT NOT NULL CHECK (hooper_stress BETWEEN 1 AND 7),
  hooper_muscle_pain INT NOT NULL CHECK (hooper_muscle_pain BETWEEN 1 AND 7),
  
  -- Sinais de Alerta (booleanos)
  alert_bleeding BOOLEAN NOT NULL DEFAULT FALSE,
  alert_dizziness BOOLEAN NOT NULL DEFAULT FALSE,
  alert_fluid_loss BOOLEAN NOT NULL DEFAULT FALSE,
  alert_pelvic_pain BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Notas adicionais
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Campos calculados (gerados automaticamente pelo banco)
  total_minutes INT GENERATED ALWAYS AS (cardio_minutes + strength_minutes) STORED,
  srpe INT GENERATED ALWAYS AS ((cardio_minutes + strength_minutes) * rpe) STORED,
  hooper_total INT GENERATED ALWAYS AS (hooper_sleep + hooper_fatigue + hooper_stress + hooper_muscle_pain) STORED,
  has_alert BOOLEAN GENERATED ALWAYS AS (alert_bleeding OR alert_dizziness OR alert_fluid_loss OR alert_pelvic_pain) STORED,
  
  -- Garante um registro por aluna por dia
  UNIQUE (student_id, workout_date)
);

-- ============================================================
-- 3. FUNÇÕES E TRIGGERS
-- ============================================================

-- Trigger: cria perfil automaticamente quando um usuário é criado no auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'gestante')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles:
-- Personal pode ler todos os perfis
CREATE POLICY "personal_can_read_all_profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'personal'
    OR id = auth.uid()
  );

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "users_can_update_own_profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Personal pode inserir perfis (para cadastrar alunas)
CREATE POLICY "personal_can_insert_profiles" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'personal'
  );

-- Trigger insere perfil, então precisamos de policy para INSERT via trigger
CREATE POLICY "trigger_can_insert_profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Políticas para daily_records:
-- Personal pode ler todos os registros
CREATE POLICY "personal_can_read_all_records" ON public.daily_records
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'personal'
    OR student_id = auth.uid()
  );

-- Gestante pode inserir e atualizar seus próprios registros
CREATE POLICY "student_can_insert_own_records" ON public.daily_records
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "student_can_update_own_records" ON public.daily_records
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

-- Personal pode inserir registros (para registrar no lugar da aluna)
CREATE POLICY "personal_can_insert_records" ON public.daily_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'personal'
  );

-- ============================================================
-- 5. DADOS INICIAIS — Personal Master
-- ATENÇÃO: Execute DEPOIS de criar sua conta no Supabase Auth.
-- Substitua o UUID pelo seu auth.users.id real.
-- Exemplo:
-- UPDATE public.profiles SET role = 'personal', full_name = 'João Victor Pinheiro Coelho Pedrosa'
-- WHERE id = 'SEU-UUID-AQUI';
-- ============================================================
