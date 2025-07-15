"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import ManagementModal from "~/app/_components/ManagementModal";
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Users, 
    Search, 
    Filter, 
    Check, 
    X, 
    Eye, 
    UserCheck, 
    UserX,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Edit
} from "lucide-react";

interface Participant {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    user: {
        id: string;
        name: string | null;
        email: string | null;
        nim: string | null;
        skills: { name: string }[];
    };
}

interface EventWithParticipants {
    id: string;
    title: string;
    description: string;
    date: Date;
    timeStart: string;
    timeEnd: string;
    location: string;
    image?: string | null;
    maxParticipants?: number | null;
    registrationDeadline?: Date | null;
    participants: Participant[];
    _count: { participants: number };
}

const ParticipantCard = ({ participant, eventId }: { participant: Participant; eventId: string }) => {
    const utils = api.useUtils();
    const updateStatusMutation = api.event.updateParticipantStatus.useMutation({
        onSuccess: () => {
            // Refresh the events data
            utils.event.getOrgEvents.invalidate();
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        }
    });
    
    const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>(
        participant.status === 'PENDING' ? 'pending' :
        participant.status === 'ACCEPTED' ? 'accepted' : 'rejected'
    );

    const handleStatusUpdate = (newStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED') => {
        updateStatusMutation.mutate({
            eventId,
            userId: participant.user.id,
            status: newStatus
        });
        
        // Update local state
        if (newStatus === 'ACCEPTED') setStatus('accepted');
        else if (newStatus === 'REJECTED') setStatus('rejected');
        else setStatus('pending');
    };

    return (
        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 font-semibold text-sm">
                                {participant.user.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">{participant.user.name}</h4>
                            <p className="text-sm text-gray-600">{participant.user.nim}</p>
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <p className="text-sm text-gray-700 mb-1">Email: {participant.user.email}</p>
                        {participant.user.skills && participant.user.skills.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Skills:</p>
                                <div className="flex flex-wrap gap-1">
                                    {participant.user.skills.map((skill) => (
                                        <span 
                                            key={skill.name} 
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                    {status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate('ACCEPTED')}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                                <Check className="h-3 w-3" />
                                {updateStatusMutation.isPending ? 'Loading...' : 'Terima'}
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('REJECTED')}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                <X className="h-3 w-3" />
                                {updateStatusMutation.isPending ? 'Loading...' : 'Tolak'}
                            </button>
                        </>
                    )}
                    {status === 'accepted' && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                            <UserCheck className="h-3 w-3" />
                            Diterima
                        </div>
                    )}
                    {status === 'rejected' && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md">
                            <UserX className="h-3 w-3" />
                            Ditolak
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EventCard = ({ event }: { event: EventWithParticipants }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);

    const filteredParticipants = useMemo(() => {
        if (!searchQuery) return event.participants;
        
        return event.participants.filter(participant =>
            participant.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            participant.user.nim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            participant.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [event.participants, searchQuery]);

    const eventDate = new Date(event.date);
    const isEventPast = eventDate < new Date();
    const registrationDeadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden border">
            {/* Event Header */}
            <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {event.image && (
                            <div className="w-full h-48 mb-4 bg-gray-200 rounded-lg overflow-hidden">
                                <img 
                                    src={event.image} 
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`;
                                    }}
                                />
                            </div>
                        )}
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        
                        {/* Event Action Buttons */}
                        <div className="flex items-center gap-2 mb-4">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                            >
                                <Edit className="h-3 w-3" />
                                Edit & Kelola Event
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-yellow-500" />
                                <span>{eventDate.toLocaleDateString('id-ID', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span>{event.timeStart} - {event.timeEnd}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-yellow-500" />
                                <span>{event.location}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-yellow-500" />
                                <span>
                                    {event._count.participants} peserta
                                    {event.maxParticipants && ` / ${event.maxParticipants} maksimal`}
                                </span>
                            </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {isEventPast && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                    Event Selesai
                                </span>
                            )}
                            {registrationDeadlinePassed && !isEventPast && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                                    Pendaftaran Ditutup
                                </span>
                            )}
                            {event.maxParticipants && event._count.participants >= event.maxParticipants && (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                                    Kuota Penuh
                                </span>
                            )}
                        </div>

                        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                            {event.description}
                        </p>
                    </div>
                </div>

                {/* Toggle Button untuk Participants */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <span className="font-medium text-gray-900">
                        Daftar Peserta ({event._count.participants})
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </button>
            </div>

            {/* Participants Section */}
            {isExpanded && (
                <div className="p-6 bg-gray-50">
                    {event.participants.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Belum ada peserta
                            </h3>
                            <p className="text-gray-500">
                                Belum ada yang mendaftar untuk event ini.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Search Bar */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari peserta berdasarkan nama, NIM, atau email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Participants List */}
                            <div className="space-y-3">
                                {filteredParticipants.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">Tidak ada peserta yang sesuai dengan pencarian.</p>
                                    </div>
                                ) : (
                                    filteredParticipants.map((participant) => (
                                        <ParticipantCard
                                            key={participant.id}
                                            participant={participant}
                                            eventId={event.id}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
        
        <ManagementModal 
            isOpen={showEditModal} 
            onClose={() => setShowEditModal(false)} 
            initialData={event} 
        />
        </>
    );
};

export default function OrganizationEventsPage() {
    const { data: events, isLoading, error } = api.event.getOrgEvents.useQuery();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        
        let filtered = events.filter((event: any) => {
            const matchesSearch = searchQuery === '' || 
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesSearch;
        });

        // Filter by status
        if (statusFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter((event: any) => {
                const eventDate = new Date(event.date);
                if (statusFilter === 'upcoming') {
                    return eventDate >= now;
                } else if (statusFilter === 'past') {
                    return eventDate < now;
                }
                return true;
            });
        }

        return filtered;
    }, [events, searchQuery, statusFilter]);

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-yellow-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-red-900 mb-2">
                        Terjadi Kesalahan
                    </h3>
                    <p className="text-red-700">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Manajemen Event & Peserta
                </h1>
                <p className="text-gray-600">
                    Kelola event organisasi Anda dan proses pendaftaran peserta
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari event berdasarkan nama, deskripsi, atau lokasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="min-w-[200px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'upcoming' | 'past')}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                        >
                            <option value="all">Semua Event</option>
                            <option value="upcoming">Event Mendatang</option>
                            <option value="past">Event Selesai</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Events Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Total Event</p>
                            <p className="text-2xl font-bold text-gray-900">{events?.length || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Total Peserta</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {events?.reduce((sum: number, event: any) => sum + event._count.participants, 0) || 0}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                        <Clock className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Event Aktif</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {events?.filter((event: any) => new Date(event.date) >= new Date()).length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? 'Tidak ada event ditemukan' : 'Belum ada event'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery 
                            ? 'Coba ubah kata kunci pencarian atau filter yang digunakan'
                            : 'Buat event pertama Anda untuk mulai mengelola peserta'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredEvents.map((event: any) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
