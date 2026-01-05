"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isShopkeeper, isAdmin } = useAuth();

  useEffect(() => {
    if (user && isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [user, isAdmin, router]);

  if (!isShopkeeper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
