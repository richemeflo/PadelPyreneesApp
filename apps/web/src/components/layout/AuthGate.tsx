"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { HeaderNav } from "./HeaderNav";
import { getStoredAuth } from "../../lib/auth";
import { logNavigation } from "../../lib/api";

const publicRoutes = new Set(["/login", "/register"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const isPublicRoute = publicRoutes.has(pathname);
  const isAuthenticated = Boolean(getStoredAuth());
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace("/");
    }
  }, [isAuthenticated, isPublicRoute, router]);

  useEffect(() => {
    if (!isAuthenticated || isPublicRoute) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    logNavigation(pathname).catch(() => null);
  }, [isAuthenticated, isPublicRoute, pathname]);

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return (
    <>
      <HeaderNav />
      {children}
    </>
  );
}
