// src/app/(org-dashboard)/dashboard/manajemen/page.tsx
"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { Plus, Loader2, Star } from "lucide-react";
import ManagementModal from "~/app/_components/ManagementModal";

const EventListItem = ({ event, onSelect, isSelected }: { event: any, onSelect: () => void, isSelected: boolean }) => (
    <button onClick={onSelect} className={`w-full p-4 text-left border rounded-lg transition-all ${isSelected ? 'bg-yellow-100 border-yellow-400 shadow-md' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
        <p className="font-bold text-gray-800">{event.title}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>{new Date(event.date).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
        </div>
    </button>
);

const EventDetailPanel = ({ eventId }: { eventId: string }) => {
    if (!eventId) return <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center text-gray-500">Pilih event untuk melihat detail</div>;
    return <div className="bg-white rounded-lg shadow-lg h-full p-6">Detail untuk event ID: {eventId}</div>;
}

export default function ManajemenPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('draf');
    
    const { data: allEvents, isLoading } = api.event.getAll.useQuery();

    const { draftEvents, activeEvents, archivedEvents } = useMemo<{ draftEvents: any[], activeEvents: any[], archivedEvents: any[] }>(() => {
        const now = new Date();
        const draftEvents = allEvents?.filter((e: any) => e.status === 'DRAFT' && new Date(e.date) >= now) ?? [];
        const activeEvents = allEvents?.filter((e: any) => e.status === 'PUBLISHED' && new Date(e.date) >= now) ?? [];
        const archivedEvents = allEvents?.filter((e: any) => new Date(e.date) < now) ?? [];
        return { draftEvents, activeEvents, archivedEvents };
    }, [allEvents]);

    const lists = { draf: draftEvents, aktif: activeEvents, arsip: archivedEvents };
    const currentList = lists[activeTab as keyof typeof lists];

    return (
        <>
            <ManagementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={null} />
            <div className="p-4 sm:p-6 md:p-8 h-screen flex flex-col">
                <header className="flex-shrink-0 flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Aktivitas Anda</h1>
                    <button onClick={() => setIsModalOpen(true)} className="p-3 rounded-full bg-white shadow-md transition-transform hover:scale-110" aria-label="Tambah Baru">
                        <Plus className="h-6 w-6 text-gray-800"/>
                    </button>
                </header>

                <div className="flex-shrink-0 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button onClick={() => setActiveTab('draf')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'draf' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Draf ({draftEvents.length})</button>
                        <button onClick={() => setActiveTab('aktif')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'aktif' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Aktif ({activeEvents.length})</button>
                        <button onClick={() => setActiveTab('arsip')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'arsip' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Arsip ({archivedEvents.length})</button>
                    </nav>
                </div>
                
                <div className="flex-grow mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    <div className="lg:col-span-1 flex flex-col bg-white p-4 rounded-lg shadow">
                        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                            {isLoading && <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-gray-400"/></div>}
                            {!isLoading && currentList.length > 0 ? (
                                currentList.map((event: any) => (
                                    <EventListItem key={event.id} event={event} onSelect={() => setSelectedEventId(event.id)} isSelected={selectedEventId === event.id}/>
                                ))
                            ) : (
                                !isLoading && <p className="text-center text-gray-500 pt-10">Tidak ada event di kategori ini.</p>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-2 overflow-y-auto">
                        <EventDetailPanel eventId={selectedEventId ?? ''    } />
                    </div>
                </div>
            </div>
        </>
    );
}
