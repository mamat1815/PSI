// src/app/(org-dashboard)/layout.tsx
// import { getServerAuthSession } from "~/server/auth";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import OrganizationSidebar from "~/app/_components/OrganizationSidebar";

export default async function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Lindungi rute ini
  if (!session || session.user.role !== "Organisasi") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <OrganizationSidebar />
      <main className="flex-grow bg-[#F8F9FA]">
        {children}
      </main>
    </div>
  );
}
