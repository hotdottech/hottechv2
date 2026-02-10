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
    <div className="flex h-screen w-full overflow-hidden bg-hot-black">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
