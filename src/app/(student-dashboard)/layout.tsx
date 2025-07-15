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
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <main className="flex-grow bg-gray-50 relative z-0 overflow-y-auto ml-0 md:ml-80">
        <div className="pl-6 pr-8 py-6 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
