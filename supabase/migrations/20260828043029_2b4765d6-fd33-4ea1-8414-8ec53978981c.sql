INSERT INTO public.books (legacy_id,title,author,publisher,subject,display_class,classes,exams,edition,book_type,cover_url,is_paid,price,description,tags,no_of_chapters,content_mode,collection,status,display_order)
VALUES ('ncert-12-lemh1','NCERT Mathematics Part I — Class 12','NCERT','NCERT','Mathematics','Class 12',ARRAY['Class 12'],ARRAY['IIT-JEE','NEET','School/Board'],'2026 Edition','NCERT','/__l5e/assets-v1/993aa36d-28a1-45a9-92e4-a248ae17fa60/maths12.jpg',false,0,'Official NCERT Class 12 Mathematics textbook, chapter-wise digital edition with notes, highlights and voice notes.',ARRAY['NCERT','Class 12','Mathematics'],6,'chapterwise','NCERT Class 12','ACTIVE',-10)
ON CONFLICT DO NOTHING;
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'1','Relations and Functions','/__l5e/assets-v1/167917e5-d1e2-4d9b-a766-e025486a5029/lemh101.pdf',0 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'2','Inverse Trigonometric Functions','/__l5e/assets-v1/41d7b854-2148-4fd5-81d8-7cebe3ed58f1/lemh102.pdf',1 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'3','Matrices','/__l5e/assets-v1/2aebecc9-9e3b-4783-baaa-e1e0f640f6fe/lemh103.pdf',2 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'4','Determinants','/__l5e/assets-v1/62b96457-244c-43fb-a955-bcea13aa1b70/lemh104.pdf',3 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'5','Continuity and Differentiability','/__l5e/assets-v1/ff9d05d3-9f2c-40cd-8c32-28345453ae1b/lemh105.pdf',4 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'6','Application of Derivatives','/__l5e/assets-v1/e123d724-51a7-4d7f-8d0d-89528c16e55c/lemh106.pdf',5 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'A1','Proofs in Mathematics','/__l5e/assets-v1/0391d73d-a2ec-4e8d-ad99-a00866f770b2/lemh1a1.pdf',6 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'A2','Mathematical Modelling','/__l5e/assets-v1/384a242e-6c11-49b3-aa98-a10923812480/lemh1a2.pdf',7 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'Ans','Answers','/__l5e/assets-v1/6cf40e8b-1492-4b84-8f4c-f0a26f148211/lemh1an.pdf',8 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'Pre','Contents and Preface','/__l5e/assets-v1/ce649b68-a794-4743-81cd-98a197f301c7/lemh1ps.pdf',9 FROM public.books WHERE legacy_id='ncert-12-lemh1';
INSERT INTO public.books (legacy_id,title,author,publisher,subject,display_class,classes,exams,edition,book_type,cover_url,is_paid,price,description,tags,no_of_chapters,content_mode,collection,status,display_order)
VALUES ('ncert-12-leph2','NCERT Physics Part II — Class 12','NCERT','NCERT','Physics','Class 12',ARRAY['Class 12'],ARRAY['IIT-JEE','NEET','School/Board'],'2026 Edition','NCERT','/__l5e/assets-v1/1f494eb7-c07b-451d-89e6-ce1b9fd9a1f0/physics12.jpg',false,0,'Official NCERT Class 12 Physics textbook, chapter-wise digital edition with notes, highlights and voice notes.',ARRAY['NCERT','Class 12','Physics'],6,'chapterwise','NCERT Class 12','ACTIVE',-10)
ON CONFLICT DO NOTHING;
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'9','Ray Optics and Optical Instruments','/__l5e/assets-v1/d5698721-da52-47f1-a2a5-1673dfce2220/leph201.pdf',0 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'10','Wave Optics','/__l5e/assets-v1/82116b22-0c07-4346-b7dc-2ed747da8918/leph202.pdf',1 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'11','Dual Nature of Radiation and Matter','/__l5e/assets-v1/79d1c116-4470-4a2a-bfe8-53a7428eb8fb/leph203.pdf',2 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'12','Atoms','/__l5e/assets-v1/a0aae199-bbf4-4d11-a9cf-b1a2382b1019/leph204.pdf',3 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'13','Nuclei','/__l5e/assets-v1/dab0bde9-ff6f-4692-89c2-d49222670469/leph205.pdf',4 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'14','Semiconductor Electronics','/__l5e/assets-v1/db4afd09-f3c3-49ae-88ce-a677a401668e/leph206.pdf',5 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'Ans','Answers','/__l5e/assets-v1/1daddf8c-6d71-4bcb-bf98-7c2aed7080e8/leph2an.pdf',6 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'Pre','Contents and Preface','/__l5e/assets-v1/05af3896-06e8-4534-9fba-4de529fb5870/leph2ps.pdf',7 FROM public.books WHERE legacy_id='ncert-12-leph2';
INSERT INTO public.books (legacy_id,title,author,publisher,subject,display_class,classes,exams,edition,book_type,cover_url,is_paid,price,description,tags,no_of_chapters,content_mode,collection,status,display_order)
VALUES ('ncert-12-lech2','NCERT Chemistry Part II — Class 12','NCERT','NCERT','Chemistry','Class 12',ARRAY['Class 12'],ARRAY['IIT-JEE','NEET','School/Board'],'2026 Edition','NCERT','/__l5e/assets-v1/892e7f1c-59b9-4dd9-a33e-1ddeffc6adaa/chemistry12.jpg',false,0,'Official NCERT Class 12 Chemistry textbook, chapter-wise digital edition with notes, highlights and voice notes.',ARRAY['NCERT','Class 12','Chemistry'],5,'chapterwise','NCERT Class 12','ACTIVE',-10)
ON CONFLICT DO NOTHING;
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'6','Haloalkanes and Haloarenes','/__l5e/assets-v1/b3971f43-d862-46c8-8118-d37f16aebb39/lech201.pdf',0 FROM public.books WHERE legacy_id='ncert-12-lech2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'7','Alcohols, Phenols and Ethers','/__l5e/assets-v1/b9879ed8-fd47-49e5-b19c-006ff623e7ba/lech202.pdf',1 FROM public.books WHERE legacy_id='ncert-12-lech2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'8','Aldehydes, Ketones and Carboxylic Acids','/__l5e/assets-v1/5478cc50-21ab-41c0-8dc8-feb96c718f23/lech203.pdf',2 FROM public.books WHERE legacy_id='ncert-12-lech2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'9','Amines','/__l5e/assets-v1/d7c0e090-fabd-4a55-ae2a-a834fc86db93/lech204.pdf',3 FROM public.books WHERE legacy_id='ncert-12-lech2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'10','Biomolecules','/__l5e/assets-v1/87ace20e-d5e9-4b35-b500-ad63a0aaa760/lech205.pdf',4 FROM public.books WHERE legacy_id='ncert-12-lech2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'Ans','Answers','/__l5e/assets-v1/432fd56a-14f1-48fd-9ae8-701febec86a0/lech2an.pdf',5 FROM public.books WHERE legacy_id='ncert-12-lech2';
INSERT INTO public.chapters (book_id,ch_no,title,content_url,position) SELECT id,'Pre','Contents and Preface','/__l5e/assets-v1/6596cf3c-ab48-4425-bb6d-25c1aeef56be/lech2ps.pdf',6 FROM public.books WHERE legacy_id='ncert-12-lech2';

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role FROM auth.users u WHERE lower(u.email) = 'studyspacerankers@gmail.com'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_user_admin(p_user_id uuid, p_make_admin boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'admins only'; END IF;
  IF p_make_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin';
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.set_user_admin(uuid, boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_user_admin(uuid, boolean) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='book content read') THEN
    CREATE POLICY "book content read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'book-content');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='book content admin write') THEN
    CREATE POLICY "book content admin write" ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'book-content' AND public.has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (bucket_id = 'book-content' AND public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='voice notes own') THEN
    CREATE POLICY "voice notes own" ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'voice-notes' AND owner = auth.uid())
      WITH CHECK (bucket_id = 'voice-notes' AND owner = auth.uid());
  END IF;
END $$;