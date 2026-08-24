-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  username text UNIQUE,
  email text,
  coaching_institute text,
  exam_category text,
  class_level text,
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.bootstrap_profile(
  p_full_name text, p_username text, p_coaching text,
  p_category text, p_class text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO public.profiles (id, full_name, username, email, coaching_institute, exam_category, class_level)
  VALUES (v_uid, coalesce(p_full_name,''), nullif(p_username,''), v_email,
          nullif(p_coaching,''), nullif(p_category,''), nullif(p_class,''))
  ON CONFLICT (id) DO UPDATE SET
    full_name = coalesce(nullif(excluded.full_name,''), public.profiles.full_name),
    username = coalesce(excluded.username, public.profiles.username),
    email = excluded.email,
    coaching_institute = coalesce(excluded.coaching_institute, public.profiles.coaching_institute),
    exam_category = coalesce(excluded.exam_category, public.profiles.exam_category),
    class_level = coalesce(excluded.class_level, public.profiles.class_level),
    updated_at = now();

  IF v_email = 'studyspacerankers@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid,'admin') ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid,'user') ON CONFLICT DO NOTHING;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bootstrap_profile(text,text,text,text,text) TO authenticated;

-- Catalogue
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  title text NOT NULL,
  author text NOT NULL DEFAULT '',
  publisher text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  display_class text NOT NULL DEFAULT '',
  classes text[] NOT NULL DEFAULT '{}',
  exams text[] NOT NULL DEFAULT '{}',
  edition text NOT NULL DEFAULT '',
  book_type text NOT NULL DEFAULT 'NCERT',
  cover_url text NOT NULL DEFAULT '',
  is_paid boolean NOT NULL DEFAULT false,
  price numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  no_of_chapters integer NOT NULL DEFAULT 0,
  content_mode text NOT NULL DEFAULT 'chapterwise',
  content_url text,
  collection text,
  status text NOT NULL DEFAULT 'ACTIVE',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "books public read" ON public.books FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "books admin write" ON public.books FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  ch_no text NOT NULL DEFAULT '',
  title text NOT NULL,
  page_start integer,
  page_end integer,
  content_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chapters_book_idx ON public.chapters(book_id, position);
GRANT SELECT ON public.chapters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chapters public read" ON public.chapters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "chapters admin write" ON public.chapters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.chapter_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'practice',
  title text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chapter_resources_book_idx ON public.chapter_resources(book_id);
GRANT SELECT ON public.chapter_resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chapter_resources TO authenticated;
GRANT ALL ON public.chapter_resources TO service_role;
ALTER TABLE public.chapter_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resources public read" ON public.chapter_resources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "resources admin write" ON public.chapter_resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  poster_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  exam text NOT NULL DEFAULT 'IIT-JEE',
  original_price numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  validity_months integer NOT NULL DEFAULT 12,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.passes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.passes TO authenticated;
GRANT ALL ON public.passes TO service_role;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passes public read" ON public.passes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "passes admin write" ON public.passes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.pass_books (
  pass_id uuid NOT NULL REFERENCES public.passes(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  PRIMARY KEY (pass_id, book_id)
);
GRANT SELECT ON public.pass_books TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pass_books TO authenticated;
GRANT ALL ON public.pass_books TO service_role;
ALTER TABLE public.pass_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pass_books public read" ON public.pass_books FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pass_books admin write" ON public.pass_books FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- User data
CREATE TABLE public.library_items (
  user_id uuid NOT NULL,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);
GRANT SELECT, INSERT, DELETE ON public.library_items TO authenticated;
GRANT ALL ON public.library_items TO service_role;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library own" ON public.library_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  page integer NOT NULL DEFAULT 1,
  percent integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id, chapter_id)
);
CREATE INDEX reading_progress_user_idx ON public.reading_progress(user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_progress TO service_role;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress own" ON public.reading_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  page integer,
  kind text NOT NULL DEFAULT 'note',
  body text NOT NULL DEFAULT '',
  audio_url text,
  color text NOT NULL DEFAULT 'yellow',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notes_user_book_idx ON public.notes(user_id, book_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes own" ON public.notes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  page integer,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookmarks_user_book_idx ON public.bookmarks(user_id, book_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks own" ON public.bookmarks FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());