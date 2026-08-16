
-- Fix existing SECURITY DEFINER functions from initial setup
REVOKE ALL ON FUNCTION public.get_my_empresa_id() FROM public;
REVOKE ALL ON FUNCTION public.get_my_empresa_id() FROM authenticated;
ALTER FUNCTION public.get_my_empresa_id() SET search_path = public;

REVOKE ALL ON FUNCTION public.is_gestor() FROM public;
REVOKE ALL ON FUNCTION public.is_gestor() FROM authenticated;
ALTER FUNCTION public.is_gestor() SET search_path = public;
