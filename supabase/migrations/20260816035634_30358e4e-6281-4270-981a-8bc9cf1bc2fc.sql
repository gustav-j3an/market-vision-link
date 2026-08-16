
-- 1. 0011_function_search_path_mutable & 0028/0029_security_definer_function_executable
-- Revoke all access from public, grant to service_role, and set search_path
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;

REVOKE ALL ON FUNCTION public.handle_updated_at() FROM public;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM authenticated;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
