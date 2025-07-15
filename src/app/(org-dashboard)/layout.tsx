// src/app/(org-dashboard)/layout.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import OrganizationSidebar from "~/app/_components/OrganizationSidebar";
//ini di update raffi
// OKE ACC KANG
//TES BRANCH
export default async function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Lindungi rute ini, hanya untuk Organisasi
  if (!session || session.user.role !== "Organisasi") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <OrganizationSidebar />
      <main className="ml-80 min-h-screen">
        {children}
      </main>
    </div>
  );
}