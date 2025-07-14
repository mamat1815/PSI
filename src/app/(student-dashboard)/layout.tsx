// src/app/(student-dashboard)/layout.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import StudentSidebar from "~/app/_components/StudentSidebar";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Lindungi rute ini, hanya untuk Mahasiswa
  if (!session || session.user.role !== "Mahasiswa") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-grow bg-[#F8F9FA]">
        {children}
      </main>
    </div>
  );
}
