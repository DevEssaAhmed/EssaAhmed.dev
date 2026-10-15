import TagNotFoundPage from "./TagNotFoundPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Tag Not Found",
  description: "The requested tag could not be found.",
  path: "/404-tag-not-found",
});

export default function Page() {
  return <TagNotFoundPage />;
}

