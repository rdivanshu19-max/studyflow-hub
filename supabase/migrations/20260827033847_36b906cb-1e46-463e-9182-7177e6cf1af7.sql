CREATE TABLE public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  quote text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'yellow',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.highlights TO authenticated;
GRANT ALL ON public.highlights TO service_role;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "highlights own" ON public.highlights FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.user_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pass_id uuid NOT NULL REFERENCES public.passes(id) ON DELETE CASCADE,
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pass_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_passes TO authenticated;
GRANT ALL ON public.user_passes TO service_role;
ALTER TABLE public.user_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_passes own" ON public.user_passes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_passes admin read" ON public.user_passes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.activate_pass(p_pass_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_pass public.passes;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO v_pass FROM public.passes WHERE id = p_pass_id AND status = 'ACTIVE';
  IF v_pass.id IS NULL THEN RAISE EXCEPTION 'pass not available'; END IF;

  INSERT INTO public.user_passes (user_id, pass_id, expires_at, status)
  VALUES (v_uid, p_pass_id, now() + make_interval(months => greatest(v_pass.validity_months, 1)), 'ACTIVE')
  ON CONFLICT (user_id, pass_id) DO UPDATE SET
    status = 'ACTIVE',
    activated_at = now(),
    expires_at = now() + make_interval(months => greatest(v_pass.validity_months, 1));

  INSERT INTO public.library_items (user_id, book_id)
  SELECT v_uid, pb.book_id FROM public.pass_books pb WHERE pb.pass_id = p_pass_id
  ON CONFLICT DO NOTHING;
END;
$$;
