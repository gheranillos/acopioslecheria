-- =============================================================================
-- Acopios Lechería — Corregir coordenadas de centros y zonas (ejecutar una vez)
-- Fuentes: OpenStreetMap / Nominatim (Lechería y Barcelona, Anzoátegui)
-- =============================================================================

update public.centros_acopio set lat = 10.19616, lng = -64.68603 where slug = 'puerto-principe';
update public.centros_acopio set lat = 10.20368, lng = -64.70235 where slug = 'playa-mansa';
update public.centros_acopio set lat = 10.18679, lng = -64.68912 where slug = 'forum';
update public.centros_acopio set lat = 10.13707, lng = -64.68628 where slug = 'gestion-social';

update public.zonas_refugio set lat = 10.19020, lng = -64.69450 where nombre = 'Aldea de Pescadores';
update public.zonas_refugio set lat = 10.19080, lng = -64.69520 where nombre = 'Capilla Aldea de Pescadores';
update public.zonas_refugio set lat = 10.17065, lng = -64.67364 where nombre = 'Troconal 5to';

-- Verificación rápida:
select nombre, lat, lng from public.centros_acopio order by nombre;
select nombre, lat, lng from public.zonas_refugio order by nombre;
