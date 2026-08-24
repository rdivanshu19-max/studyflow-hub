# BookFlux by Rankers — Digital Library Platform

A premium, light-themed digital book library for JEE / NEET / Boards students, with an admin panel for publishing books and passes. Built in phases so each stage is usable and reviewable.

## Brand and visual system

- Name: **BookFlux by Rankers**, tagline "Your Digital Library", secondary "JEE • NEET • BEYOND".
- Original minimal geometric book wordmark (no copying of the reference app's identity).
- Light academic palette exactly as specified: brand `#5B4FE9`, light `#EEEAFE`, accent `#6C63FF`, soft `#F3F1FF`, bg `#F8F9FB`, surfaces `#FFFFFF` / `#F4F5F7`, text `#171A21` / `#626873` / `#9298A3`, borders `#E5E7EB` / `#ECEEF1`, success/warning/error `#16834B` / `#D99A00` / `#D64545`.
- Inter, white cards, 10–16px radii, hairline borders, very subtle shadows, ~90% neutral surfaces. No neon, glow, dark hero, or heavy glassmorphism.
- Responsive: mobile 2-column grid + bottom nav, tablet 4–6 columns (primary target), desktop max-width containers with more columns.

## Phase 1 — Foundation (this build)

1. **Landing page** — composition inspired by the reference landing structure (badge, big split-weight headline, product mockup cards, feature sections), rewritten with BookFlux copy and the light purple theme. Sections: hero + CTA, digital reader mockup, AI Tutor, annotations & voice notes, capture-and-solve, Book Pass value, footer.
2. **Auth** — Lovable Cloud email/password login and signup. Signup collects name, username, email, password, coaching institute (optional), category (School/Board, Medical, Engineering, UPSC, Others) + class. No email verification (auto-confirm), session remembered. `profiles` table + role table; `studyspacerankers@gmail.com` is granted admin on signup and can grant admin to others.
3. **Catalogue import** — the uploaded books JSON is mapped into database rows (id, title, author, class, subject, exam, edition, publisher, cover URL, book type, free/paid, description, tags) and seeded via migration, so it can be edited from the admin panel later.
4. **App shell** — top bar (menu, rotating-placeholder search, notifications, profile), bottom nav (Home, Explore, Book Pass, My Books), preference chips (Change / School-Board / IIT-JEE / NEET) and the "Change Your Preferences" modal with exam + class selection and "Save Details".
5. **Explore** — light Book Pass banner, "All Books" with Exam / Class / Subject / Access Type / Collection filter chips, dense lazy-loaded book grid with FREE badge, edition line, title, author, access state, three-dot menu.
6. **My Books** — user's own library with Subject / Access Type filters, add/remove.
7. **Home** — featured pass, Continue Reading rows (chapter no., name, progress bar), recommended books.
8. **Book Pass page** — hero collage, price comparison (Without Pass / With Pass / Save), "What You'll Get" tabs (All, Modules, Question Banks, Handwritten Notes, NCERT), benefit trio, purple CTA.
9. **Book details + chapter list** — cover, edition, publisher, author, added-status, share; clean chapter rows with page ranges; chapter action sheet (Read Chapter, Practice Questions, NCERT Solutions, Your Highlights & Notes).
10. **Reader v1** — full-screen light reader with tabs (Read, Practice, NCERT Solutions, Highlights & Notes, Bookmarks); embedded Drive/PDF viewer for the admin-supplied link, page/chapter bookmarks, notes, jump-to-page, share.
11. **Admin panel v1** — book upload/edit (all metadata, cover poster upload, PDF file or Drive link, complete-book vs chapter-wise with chapter list + page ranges, free/paid), user list with ban/unban, admin role management.

## Phase 2

- Digital Pass builder in admin (poster, price, validity, select included books, free or paid), reflected on the Book Pass page.
- Optional per-book/per-chapter extras: practice questions, PYQs, NCERT solutions, video solutions (link or embed).
- Notes, voice notes (recorded audio stored in Cloud), bookmarks list, and a dedicated Highlights & Notes screen.
- AI Tutor: subtle "Ask AI" entry in the reader, chat about the current page/chapter, simpler explanation and step-by-step modes.
- Capture question flow: crop/upload a question from the reader → preview → AI solves step by step.
- Reading progress tracking that returns Continue Reading to the last position.

## Phase 3

- Global search across books, authors/teachers, subjects, chapters, categories with instant result cards.
- Batches / recommendations section with batch cards per exam category.
- Payments for paid books and passes.
- Polish: microinteractions, accessibility pass (contrast, focus states, touch targets, keyboard nav), performance pass (lazy covers, pagination, caching).

## Technical notes

- TanStack Start + Tailwind v4 tokens in `src/styles.css`; Lovable Cloud for auth, database, storage (covers, PDFs, voice notes).
- Tables: `profiles`, `user_roles` (separate table + `has_role` security-definer function), `books`, `chapters`, `chapter_resources`, `passes`, `pass_books`, `library_items`, `reading_progress`, `notes`, `bookmarks`, `voice_notes`. RLS on all: users see only their own library/annotation rows; catalogue readable by authenticated users; writes to catalogue restricted to admins.
- Reader is an abstraction over a content source (Drive iframe today, direct PDF or a content API later) so swapping in real eBook content needs no UI rebuild.
- Known limitation from your choice: inside an embedded Drive viewer, text-level highlighting is not possible; notes, voice notes, bookmarks and Ask AI attach to the page/chapter, and the capture tool covers "highlight this bit and ask".
