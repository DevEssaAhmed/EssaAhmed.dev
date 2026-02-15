"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/gtm";

export default function GTMPageView() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    const query = search?.toString();
    const url = pathname + (query ? `?${query}` : "");
    pageview(url);
  }, [pathname, search]);

  return null;
}
