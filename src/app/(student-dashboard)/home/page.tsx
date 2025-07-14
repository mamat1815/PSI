// src/app/(student-dashboard)/home/page.tsx
"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Award, Building, Search, Loader2, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

const dayNameToIndex: Record<string, number> = { "senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5, "sabtu": 6, "minggu": 0 };

const CalendarWidget = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<number | null>(null);

    const { data: jadwalKuliah } = api.jadwal.getMine.useQuery();
    const { data: events } = api.event.getPublic.useQuery();

    const monthSchedules = useMemo(() => {
        const schedules = new Map<number, any[]>();
        if (!jadwalKuliah && !events) return schedules;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const dailySchedules: any[] = [];

            jadwalKuliah?.forEach(j => {
                if (dayNameToIndex[j.hari.toLowerCase()] === dayOfWeek) {
                    dailySchedules.push({ type: 'kuliah', title: j.mataKuliah, time: `${j.jamMulai} - ${j.jamSelesai}` });
                }
            });

            events?.forEach(e => {
                const eventDate = new Date(e.date);
                if (eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year) {
                    dailySchedules.push({ type: 'event', title: e.title, time: eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
                }
            });

            if (dailySchedules.length > 0) {
                schedules.set(day, dailySchedules);
            }
        }
        return schedules;
    }, [currentDate, jadwalKuliah, events]);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
    const year = currentDate.getFullYear();
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft/></button>
                <h3 className="font-bold text-lg">{monthName} {year}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight/></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-500">
                {dayNames.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const date = day + 1;
                    const schedules = monthSchedules.get(date);
                    return (
                        <div key={date} className="relative" onMouseEnter={() => schedules && setHoveredDate(date)} onMouseLeave={() => setHoveredDate(null)}>
                            <div className={`p-2 rounded-full flex items-center justify-center cursor-pointer ${schedules ? 'bg-yellow-400 text-slate-800 font-bold' : 'hover:bg-gray-100'}`}>
                                {date}
                            </div>
                            {hoveredDate === date && schedules && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-slate-800 text-white p-3 rounded-lg shadow-xl z-10 pointer-events-none">
                                    <p className="font-bold mb-2 border-b border-b-gray-600 pb-1">Jadwal untuk tanggal {hoveredDate}</p>
                                    <ul className="space-y-1 text-xs">
                                        {schedules.map((s, i) => (
                                            <li key={i} className={`p-1.5 rounded flex items-center gap-2 ${s.type === 'kuliah' ? 'bg-blue-500/80' : 'bg-green-500/80'}`}>
                                                <span className="font-semibold">{s.title}</span>
                                                <span>({s.time})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const EventCard = ({ event }: { event: any }) => {
    const utils = api.useUtils();
    const registerMutation = api.event.register.useMutation({
        onSuccess: () => { utils.event.getPublic.invalidate(); }
    });
    const [isRegistered, setIsRegistered] = useState(false);
    const handleRegister = () => { setIsRegistered(true); registerMutation.mutate({ eventId: event.id }); };

    return (
        <div className="p-3 rounded-lg border bg-white flex flex-col gap-4">
            <div className="w-full h-32 bg-gray-200 rounded-md">
                <img src={`https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`} alt={event.title} className="w-full h-full object-cover rounded-md"/>
            </div>
            <div className="flex-grow">
                <p className="font-bold text-sm text-yellow-500">{event.title}</p>
                <p className="text-xs text-gray-500">{event.organizer.name}</p>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p className="flex items-center gap-2"><Clock className="h-3 w-3"/>{new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="flex items-center gap-2"><Calendar className="h-3 w-3"/>{new Date(event.date).toLocaleDateString()}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-3 w-3"/>{event.location}</p>
                </div>
            </div>
            <div className="flex-shrink-0">
                {isRegistered || registerMutation.isSuccess ? (
                    <button disabled className="w-full py-2 rounded-md bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5"/> Terdaftar</button>
                ) : (
                    <button onClick={handleRegister} disabled={registerMutation.isPending} className="w-full py-2 rounded-md bg-gray-800 text-white font-semibold hover:bg-gray-700">{registerMutation.isPending ? <Loader2 className="animate-spin"/> : 'Detail'}</button>
                )}
            </div>
        </div>
    );
};

const SkillWidget = () => {
    const { data } = api.user.getSkills.useQuery();
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Soft Skill Anda</h2>
            <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex flex-wrap gap-2">
                    {data?.skills.map(skill => <span key={skill.name} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">{skill.name}</span>)}
                </div>
            </div>
        </div>
    );
}

const AspirationForm = () => {
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const mutation = api.aspiration.submit.useMutation();
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ category, content }); };
    if (mutation.isSuccess) return <div className="p-6 bg-green-50 text-green-800 rounded-lg text-center">Terima kasih atas aspirasi Anda!</div>
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm font-medium">Kategori</label><select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 w-full p-2 border rounded-md bg-white"><option value="" disabled>Pilih kategori...</option><option>Akademik</option><option>Fasilitas Kampus</option><option>Kegiatan Mahasiswa</option><option>Lainnya</option></select></div>
            <div><label className="text-sm font-medium">Sampaikan Aspirasi Anda</label><textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} className="mt-1 w-full p-2 border rounded-md" placeholder="Tuliskan masukan atau ide Anda di sini..."></textarea></div>
            {mutation.isError && <p className="text-sm text-red-600">{mutation.error.message}</p>}
            <button type="submit" disabled={mutation.isPending} className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-gray-800 hover:bg-gray-700">{mutation.isPending ? <Loader2 className="animate-spin"/> : <><Send className="h-4 w-4 mr-2"/> Kirim Aspirasi</>}</button>
        </form>
    );
};

export default function HomePage() {
    const { data: sessionData } = api.auth.getSession.useQuery();
    const { data: events, isLoading } = api.event.getPublic.useQuery();

    const session = sessionData?.session;

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Selamat Pagi, {session?.user?.name?.split(' ')[0] || 'Mahasiswa'}!
                </h1>
                <div className="flex items-center gap-4">
                    <button className="p-3 rounded-full bg-white shadow-md"><Building className="h-6 w-6 text-gray-600"/></button>
                    <button className="p-3 rounded-full bg-white shadow-md"><Search className="h-6 w-6 text-gray-600"/></button>
                </div>
            </header>
            
            <div>
                <h2 className="text-xl font-semibold mb-4">Acara Terdekat Anda</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {isLoading ? <Loader2 className="animate-spin"/> : events?.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <CalendarWidget />
                </div>
                <div className="space-y-8">
                    <SkillWidget />
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Aspirasi Mahasiswa</h2>
                        <div className="p-4 bg-white rounded-lg shadow-md">
                            <AspirationForm />
                        </div>
                    </div>
                    <div>
                       <h2 className="text-xl font-semibold mb-4">Dibuat Untuk Anda</h2>
                        <div className="text-center p-10 bg-white rounded-lg shadow-md">
                           <p className="text-gray-500">Fitur Rekomendasi akan datang.</p>
                       </div>
                   </div>
                </div>
            </div>
        </div>
    );
}
