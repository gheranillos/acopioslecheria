-- =============================================================================
-- Lectura pública para el home de donantes (ejecutar una vez en Supabase)
-- Permite ver centros activos, zonas y necesidades abiertas sin login.
-- =============================================================================

create policy "centros_select_anon"
  on public.centros_acopio for select
  to anon
  using (estado = 'activo');

create policy "zonas_select_anon"
  on public.zonas_refugio for select
  to anon
  using (true);

create policy "necesidades_select_anon"
  on public.necesidades for select
  to anon
  using (estado in ('abierta', 'en_proceso'));
