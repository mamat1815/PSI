// src/app/(org-dashboard)/dashboard/page.tsx
import { api } from "~/trpc/server";
import { Plus, CalendarDays } from "lucide-react";
import Link from "next/link";
import { auth } from "~/server/auth";

const EventCard = ({ event }: { event: { id: string, title: string, date: Date, location: string } }) => (
    <div className="p-4 rounded-lg border flex flex-col bg-white border-gray-200">
       <div className="flex-grow mb-4">
           <p className="font-bold text-sm text-yellow-500">{event.title}</p>
           <p className="text-xs text-gray-500">Organized by Your Org</p>
           <div className="mt-3 space-y-2 text-xs text-gray-600">
               <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
               <p className="flex items-center gap-2">📍 {event.location}</p>
           </div>
       </div>
       <button className="w-full text-center py-2 rounded-md text-sm font-semibold bg-gray-800 text-white hover:bg-gray-700">Detail</button>
    </div>
);

const SummaryChart = () => (
    <div className="p-4 rounded-lg border bg-white border-gray-200">
       <h3 className="font-semibold mb-2 text-gray-700">Ringkasan Partisipasi</h3>
       <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-md">
        <p className="text-gray-400">Placeholder untuk Grafik</p>
       </div>
    </div>
);

export default async function DashboardPage() {
    const session = await auth();
    // PERBAIKAN: Panggil prosedur langsung dari `api` dan gunakan `.query()`
    const allEvents = await api.event.getAll.query();
    const activeEvents = allEvents.filter(e => new Date(e.date) >= new Date());
    
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Selamat Pagi, {session?.user?.name?.split(' ')[0] ?? 'Organisasi'}
                </h1>
                <Link href="/dashboard/manajemen" className="p-3 rounded-full bg-white shadow-md transition-transform hover:scale-110" aria-label="Buka Manajemen">
                    <Plus className="h-6 w-6 text-gray-800"/>
                </Link>
            </header>
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Event Aktif</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {activeEvents.length > 0 ? (
                        activeEvents.map(event => <EventCard key={event.id} event={event} />)
                    ) : (
                        <p className="text-gray-500 col-span-full">Tidak ada event aktif saat ini.</p>
                    )}
                </div>
            </section>
            <section className="mt-8">
                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Ringkasan</h2>
                 <SummaryChart />
            </section>
        </div>
    );
}
