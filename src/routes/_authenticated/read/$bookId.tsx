import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ReaderView } from "@/components/app/Reader";

const searchSchema = z.object({ chapter: z.string().optional() });

export const Route = createFileRoute("/_authenticated/read/$bookId")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Digital Reader | BookFlux" },
      {
        name: "description",
        content: "Read, highlight, take notes and ask the BookFlux AI Tutor.",
      },
      { property: "og:title", content: "BookFlux Digital Reader" },
      {
        property: "og:description",
        content: "A focused digital study reader with notes and AI Tutor support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { bookId } = Route.useParams();
  const { chapter } = Route.useSearch();
  return <ReaderView bookId={bookId} chapterId={chapter} />;
}
