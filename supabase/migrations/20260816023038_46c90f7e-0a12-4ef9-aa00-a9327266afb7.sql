-- Revoke execution from public and anon
revoke execute on function public.get_my_empresa_id() from public, anon;
revoke execute on function public.is_gestor() from public, anon;

-- Explicitly allow authenticated to execute
grant execute on function public.get_my_empresa_id() to authenticated;
grant execute on function public.is_gestor() to authenticated;
