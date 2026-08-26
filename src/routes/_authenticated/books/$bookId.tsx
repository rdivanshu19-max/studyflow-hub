import { createFileRoute } from "@tanstack/react-router";
import { BookDetailView } from "@/components/app/LibraryViews";
export const Route = createFileRoute("/_authenticated/books/$bookId")({ head: () => ({ meta: [{ title: "Book Details | BookFlux" }, { name: "description", content: "View chapters and read this digital study book on BookFlux." }, { property: "og:title", content: "Book Details | BookFlux" }, { property: "og:description", content: "Read chapters, save notes and use AI study support." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Page });
function Page() { const { bookId } = Route.useParams(); return <BookDetailView bookId={bookId} />; }
