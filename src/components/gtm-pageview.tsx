"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/gtm";

export default function GTMPageView() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    pageview(pathname || "/", search?.toString() ?? "");
  }, [pathname, search]);

  return null;
}
