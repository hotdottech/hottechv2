import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  return (
    <div className="flex min-h-screen bg-hot-black">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
