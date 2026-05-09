"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

// ── Page Name ↔ Path Mapping ──────────────────────────────────────────

export type PageName =
  | "home"
  | "products"
  | "apps"
  | "ai-tools"
  | "academy"
  | "earning"
  | "services"
  | "trading"
  | "faq"
  | "cart"
  | "orders"
  | "profile"
  | "dashboard"
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "return-policy"
  | "shipping-policy"
  | "login"
  | "register"
  | "forgot-password"
  | "values"
  | "criticism"
  | "zero-protocols"
  | "wishlist"
  | "product-detail"
  | "not-found";

export const PAGE_PATHS: Record<PageName, string> = {
  home: "/",
  products: "/products",
  "product-detail": "/product",
  apps: "/apps",
  "ai-tools": "/ai-tools",
  academy: "/academy",
  earning: "/earning",
  services: "/services",
  trading: "/trading",
  faq: "/faq",
  cart: "/cart",
  orders: "/orders",
  profile: "/profile",
  dashboard: "/dashboard",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  "return-policy": "/return-policy",
  "shipping-policy": "/shipping-policy",
  login: "/login",
  register: "/register",
  "forgot-password": "/forgot-password",
  values: "/values",
  criticism: "/criticism",
  "zero-protocols": "/zero-protocols",
  wishlist: "/wishlist",
  "not-found": "/not-found",
};

// Reverse mapping: path prefix → PageName
const PATH_PREFIX_TO_PAGE: [string, PageName][] = [
  ["/product/", "product-detail"],
  ["/products", "products"],
  ["/apps", "apps"],
  ["/ai-tools", "ai-tools"],
  ["/academy", "academy"],
  ["/earning", "earning"],
  ["/services", "services"],
  ["/trading", "trading"],
  ["/faq", "faq"],
  ["/cart", "cart"],
  ["/orders", "orders"],
  ["/profile", "profile"],
  ["/dashboard", "dashboard"],
  ["/about", "about"],
  ["/contact", "contact"],
  ["/privacy", "privacy"],
  ["/terms", "terms"],
  ["/return-policy", "return-policy"],
  ["/shipping-policy", "shipping-policy"],
  ["/login", "login"],
  ["/register", "register"],
  ["/forgot-password", "forgot-password"],
  ["/values", "values"],
  ["/criticism", "criticism"],
  ["/zero-protocols", "zero-protocols"],
  ["/wishlist", "wishlist"],
  ["/not-found", "not-found"],
];

/** Get page name from current pathname */
export function getPageFromPath(pathname: string): PageName {
  if (pathname === "/") return "home";
  for (const [prefix, page] of PATH_PREFIX_TO_PAGE) {
    if (pathname.startsWith(prefix)) return page;
  }
  return "home";
}

/** Get product ID from pathname like /product/123 */
export function getProductIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/product\/(.+)$/);
  return match ? match[1] : null;
}

/** Build product URL */
export function getProductUrl(productId: string | number): string {
  return `/product/${productId}`;
}

// ── Navigation Hook ───────────────────────────────────────────────────

interface UseNavigationReturn {
  /** Current page name derived from pathname */
  currentPage: PageName;
  /** Current pathname from Next.js */
  pathname: string;
  /** Product ID extracted from /product/[id] */
  productId: string | null;
  /** Navigate to a page by name */
  navigateTo: (page: PageName) => void;
  /** Navigate to a product detail page */
  navigateToProduct: (productId: string | number) => void;
  /** Go back in history */
  goBack: () => void;
  /** Check if a page is currently active */
  isActive: (page: PageName) => boolean;
  /** Map a PageName to its path */
  getPath: (page: PageName) => string;
}

export function useNavigation(): UseNavigationReturn {
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = useMemo(() => getPageFromPath(pathname), [pathname]);
  const productId = useMemo(() => getProductIdFromPath(pathname), [pathname]);

  const navigateTo = useCallback(
    (page: PageName) => {
      const path = PAGE_PATHS[page];
      if (path) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        router.push(path);
      }
    },
    [router]
  );

  const navigateToProduct = useCallback(
    (id: string | number) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(getProductUrl(id));
    },
    [router]
  );

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const isActive = useCallback(
    (page: PageName) => {
      if (page === "home") return pathname === "/";
      if (page === "product-detail") return pathname.startsWith("/product/");
      const path = PAGE_PATHS[page];
      return path ? pathname.startsWith(path) : false;
    },
    [pathname]
  );

  const getPath = useCallback((page: PageName) => PAGE_PATHS[page], []);

  return {
    currentPage,
    pathname,
    productId,
    navigateTo,
    navigateToProduct,
    goBack,
    isActive,
    getPath,
  };
}
