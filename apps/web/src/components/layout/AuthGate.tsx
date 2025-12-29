"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { HeaderNav } from "./HeaderNav";
import { logNavigation } from "../../lib/api";
import { useAuthState } from "../../lib/useAuthState";

const publicRoutes = new Set(["/login", "/register"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const isPublicRoute = publicRoutes.has(pathname);
  const { isAuthenticated, isReady } = useAuthState();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace("/");
    }
  }, [isAuthenticated, isPublicRoute, isReady, router]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || isPublicRoute) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    logNavigation(pathname).catch(() => null);
  }, [isAuthenticated, isPublicRoute, isReady, pathname]);

  if (!isReady && !isPublicRoute) {
    return null;
  }

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
