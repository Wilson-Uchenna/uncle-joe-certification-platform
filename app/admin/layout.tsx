import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import AdminSideBar from "../_components/AdminSideBar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(), // ← Added headers
  });

  if (!session) {
    redirect("/login");
  }
  return (
    <div className="flex h-screen bg-gray-50 ">
      <AdminSideBar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content — changes on navigation */}
        <main className="flex-1 overflow-y-auto p-6 pt-[36px]">{children}</main>
      </div>
    </div>
  );
}
