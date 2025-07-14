// src/app/home/page.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Loader2, Send, Calendar, Clock, MapPin, Award, CheckCircle } from "lucide-react";

// Komponen Card Event
const EventCard = ({ event }: { event: any }) => {
    const utils = api.useUtils();
    const registerMutation = api.event.register.useMutation({
        onSuccess: () => {
            utils.event.getPublic.invalidate(); // Refresh daftar event
        }
    });

    // Cek apakah user sudah terdaftar (ini hanya demo, idealnya ada data dari server)
    const [isRegistered, setIsRegistered] = useState(false);

    const handleRegister = () => {
        setIsRegistered(true); // Optimistic update
        registerMutation.mutate({ eventId: event.id });
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-40 bg-gray-200">
                <img src={`https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`} alt={event.title} className="w-full h-full object-cover"/>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-500">oleh {event.organizer.name}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{new Date(event.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/>{event.location}</p>
                </div>
                <div className="mt-4">
                    {isRegistered || registerMutation.isSuccess ? (
                         <button disabled className="w-full py-2 rounded-md bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5"/> Terdaftar
                         </button>
                    ) : (
                        <button onClick={handleRegister} disabled={registerMutation.isPending} className="w-full py-2 rounded-md bg-yellow-400 text-gray-800 font-semibold hover:bg-yellow-500">
                            {registerMutation.isPending ? <Loader2 className="animate-spin"/> : 'Daftar Event'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Komponen Form Aspirasi
const AspirationForm = () => {
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const mutation = api.aspiration.submit.useMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ category, content });
    };

    if (mutation.isSuccess) {
        return <div className="p-6 bg-green-50 text-green-800 rounded-lg text-center">Terima kasih atas aspirasi Anda!</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 w-full p-2 border rounded-md bg-white">
                    <option value="" disabled>Pilih kategori...</option>
                    <option>Akademik</option>
                    <option>Fasilitas Kampus</option>
                    <option>Kegiatan Mahasiswa</option>
                    <option>Lainnya</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-medium">Sampaikan Aspirasi Anda</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} className="mt-1 w-full p-2 border rounded-md" placeholder="Tuliskan masukan atau ide Anda di sini..."></textarea>
            </div>
            {mutation.isError && <p className="text-sm text-red-600">{mutation.error.message}</p>}
            <button type="submit" disabled={mutation.isPending} className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-gray-800 hover:bg-gray-700">
                {mutation.isPending ? <Loader2 className="animate-spin"/> : <><Send className="h-4 w-4 mr-2"/> Kirim Aspirasi</>}
            </button>
        </form>
    );
};

export default function MahasiswaHomePage() {
    const { data: events, isLoading } = api.event.getPublic.useQuery();

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-yellow-400 p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">UACAD</h1>
                    {/* Placeholder untuk tombol profil/logout */}
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Kiri: Daftar Event */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Event & Kegiatan Terdekat</h2>
                    {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400"/></div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events?.map((event: any) => <EventCard key={event.id} event={event} />)}
                    </div>
                    {!isLoading && events?.length === 0 && <p className="text-gray-500">Belum ada event yang akan datang.</p>}
                </div>

                {/* Kolom Kanan: Jadwal & Aspirasi */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Jadwal Anda Hari Ini</h2>
                        <div className="text-center text-gray-500 py-8">Fitur jadwal akan datang.</div>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Suarakan Aspirasi Anda</h2>
                        <AspirationForm />
                    </div>
                </div>
            </main>
        </div>
    );
}