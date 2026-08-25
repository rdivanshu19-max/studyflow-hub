import { Link } from "@tanstack/react-router";
import type { Book } from "@/lib/catalog";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to="/books/$bookId"
      params={{ bookId: book.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={`${book.title} cover`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center px-2 text-center text-xs text-muted-foreground">
            {book.title}
          </div>
        )}
        {!book.is_paid && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-success px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Free
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        {book.edition && (
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {book.edition}
          </p>
        )}
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">
          {book.title}
        </p>
        <p className="mt-auto truncate pt-1 text-[11px] text-muted-foreground">
          {book.author || book.publisher || book.subject}
        </p>
      </div>
    </Link>
  );
}

export function BookGrid({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No books match these filters yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}
