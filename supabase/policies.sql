-- ==============================================================================
-- REMEDIACIÓN DE SEGURIDAD: POLÍTICAS RLS (ROW LEVEL SECURITY)
-- FECHA: 05-DIC-2025
-- AUDITOR: Antigravity
-- ==============================================================================

-- 1. Habilitar RLS en las tablas expuestas
-- Esto bloquea TODO el acceso por defecto hasta que se creen políticas.
ALTER TABLE public.avisos_bora ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_telegram ENABLE ROW LEVEL SECURITY;

-- 2. Política de Lectura Pública (SELECT) para 'avisos_bora'
-- Permite a cualquier usuario (anon o authenticated) LEER todos los registros.
CREATE POLICY "Acceso público de lectura a avisos"
ON public.avisos_bora
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Política de Lectura Pública (SELECT) para 'envios_telegram'
-- Permite a cualquier usuario (anon o authenticated) LEER todos los registros.
CREATE POLICY "Acceso público de lectura a telegram"
ON public.envios_telegram
FOR SELECT
TO anon, authenticated
USING (true);

-- ==============================================================================
-- NOTA DE SEGURIDAD:
-- No se crean políticas para INSERT, UPDATE o DELETE para el rol 'anon'.
-- Esto asegura que la API sea de SOLO LECTURA para el frontend público.
-- ==============================================================================
