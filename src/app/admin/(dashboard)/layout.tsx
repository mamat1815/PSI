import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "~/app/_components/AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect this route - only for SuperAdmin
  if (!session || session.user.role !== "SuperAdmin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminSidebar />
      <main className="ml-80 min-h-screen">
        {children}
      </main>
    </div>
  );
}
