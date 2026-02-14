"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type HashLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  smooth?: boolean;
};

const scrollToHash = (hash: string, smooth: boolean) => {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
};

export const HashLink: React.FC<HashLinkProps> = ({ to, smooth = false, onClick, children, ...props }) => {
  const pathname = usePathname() || "/";
  const [pathPart, hashPart] = to.split("#");
  const targetPath = pathPart || pathname;
  const hash = hashPart ? `#${hashPart}` : "";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !hash) return;

    if (targetPath === pathname) {
      e.preventDefault();
      scrollToHash(hash, smooth);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `${pathname}${hash}`);
      }
    }
  };

  return (
    <Link href={`${targetPath}${hash}`} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export const NavHashLink = HashLink;
