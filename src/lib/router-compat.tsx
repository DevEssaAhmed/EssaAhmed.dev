"use client";

import Link from "next/link";
import { useParams as useNextParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

type NavigateOptions = { replace?: boolean };

type Params = Record<string, string>;

type RouteMatch = {
  matched: boolean;
  params: Params;
};

type RouteProps = {
  path: string;
  element: ReactNode;
};

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
};

type LocationShape = {
  pathname: string;
  search: string;
  hash: string;
};

const ParamsContext = createContext<Params>({});
const EMPTY_PARAMS: Params = {};

const normalizePath = (path: string): string => {
  if (!path) return "/";
  if (path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

const splitPath = (path: string): string[] => {
  const normalized = normalizePath(path);
  if (normalized === "/") return [];
  return normalized.slice(1).split("/");
};

const matchRoute = (pattern: string, pathname: string): RouteMatch => {
  if (pattern === "*") {
    return { matched: true, params: {} };
  }

  const patternParts = splitPath(pattern);
  const pathParts = splitPath(pathname);
  const params: Params = {};

  let i = 0;
  while (i < patternParts.length) {
    const part = patternParts[i];
    const value = pathParts[i];

    if (part === "*") {
      return { matched: true, params };
    }

    if (value === undefined) {
      return { matched: false, params: {} };
    }

    if (part.startsWith(":")) {
      params[part.slice(1)] = decodeURIComponent(value);
      i += 1;
      continue;
    }

    if (part !== value) {
      return { matched: false, params: {} };
    }

    i += 1;
  }

  if (pathParts.length !== patternParts.length) {
    return { matched: false, params: {} };
  }

  return { matched: true, params };
};

export const BrowserRouter = ({ children }: { children: ReactNode }) => <>{children}</>;

export const Route = (_props: RouteProps) => null;

export const Routes = ({ children }: { children: ReactNode }) => {
  const pathname = normalizePath(usePathname() || "/");

  const result = useMemo(() => {
    const routeElements = React.Children.toArray(children) as ReactElement<RouteProps>[];
    for (const element of routeElements) {
      if (React.isValidElement<RouteProps>(element) && element.props?.path) {
        const match = matchRoute(element.props.path, pathname);
        if (match.matched) {
          return {
            element: element.props.element,
            params: match.params,
          };
        }
      }
    }

    return {
      element: null,
      params: EMPTY_PARAMS,
    };
  }, [children, pathname]);

  return <ParamsContext.Provider value={result.params}>{result.element}</ParamsContext.Provider>;
};

export const useParams = <T extends Params = Params>(): T => {
  const contextParams = useContext(ParamsContext) as T;
  const nextParams = (useNextParams() || {}) as T;

  if (Object.keys(contextParams || {}).length > 0) {
    return contextParams;
  }

  return nextParams;
};

export const useNavigate = () => {
  const router = useRouter();

  return useCallback((to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") {
        window.history.go(to);
      }
      return;
    }

    if (options?.replace) {
      router.replace(to);
      return;
    }

    router.push(to);
  }, [router]);
};

export const useLocation = (): LocationShape => {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");
  const [fallbackSearch, setFallbackSearch] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncLocation = () => {
      setHash(window.location.hash || "");
      setFallbackSearch(window.location.search || "");
    };

    syncLocation();
    window.addEventListener("popstate", syncLocation);
    window.addEventListener("hashchange", syncLocation);

    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("hashchange", syncLocation);
    };
  }, []);

  const search = useMemo(() => {
    if (searchParams) {
      const searchString = searchParams.toString();
      return searchString ? `?${searchString}` : "";
    }
    return fallbackSearch;
  }, [searchParams, fallbackSearch]);

  return useMemo(() => ({
    pathname,
    search,
    hash,
  }), [pathname, search, hash]);
};

export const LinkAdapter = ({ to, replace, children, ...props }: LinkProps) => {
  return (
    <Link href={to} replace={replace} {...props}>
      {children}
    </Link>
  );
};

export const LinkComponent = LinkAdapter;
export { LinkComponent as Link };

export const Navigate = ({
  to,
  replace,
}: {
  to: string;
  replace?: boolean;
  state?: unknown;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
};

export { HashLink, NavHashLink } from "./hash-link-compat";

