REVOKE ALL ON FUNCTION public.activate_pass(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.activate_pass(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_profile(text, text, text, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.bootstrap_profile(text, text, text, text, text) TO authenticated;
