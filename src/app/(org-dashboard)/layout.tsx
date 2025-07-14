// src/app/(org-dashboard)/layout.tsx
import OrganizationSidebar from "~/app/_components/OrganizationSidebar";

export default function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <OrganizationSidebar />
      <main className="flex-grow bg-[#F8F9FA]">
        {children}
      </main>
    </div>
  );
}