import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "../_components/SideBar";
import { TopNav } from "../_components/TopNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(), // ← Added headers
  });

  if (!session) {
    redirect("/login");
  }
    return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — persists across all pages */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar — persists too */}
        <TopNav />

        {/* Page content — changes on navigation */}
        <main className="flex-1 overflow-y-auto p-6 pt-[36px]">
          {children}
        </main>
      </div>
    </div>
  );}
