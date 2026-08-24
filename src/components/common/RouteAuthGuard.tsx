"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const PROTECTED_PREFIXES = [
  "/profile",
  "/bookmarks",
  "/history",
  "/transactions",
  "/dashboard",
  "/stripe-sandbox",
];

export function RouteAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Only evaluate once initial auth status resolves
    if (isPending) return;

    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (isProtected && !session?.user) {
      window.location.href = "/";
    }
  }, [pathname, session, isPending, router]);

  return null;
}
