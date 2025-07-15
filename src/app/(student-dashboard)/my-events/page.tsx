"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Users, 
    Search, 
    Star,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Send,
    CheckCircle,
    XCircle,
    Clock3
} from "lucide-react";

interface EventParticipant {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    event: {
        id: string;
        title: string;
        description: string;
        date: string; // ISO string
        timeStart: string;
        timeEnd: string;
        location: string;
        image?: string | null;
        maxParticipants?: number | null;
        registrationDeadline?: string | null; // ISO string
        createdAt: string; // ISO string
        updatedAt: string; // ISO string
        organizer: {
            name: string | null;
        };
        skills: { name: string }[];
        _count: { participants: number };
        feedback?: {
            id: string;
            rating: number;
            comment: string | null;
            createdAt: string;
        }[];
    };
}

const FeedbackModal = ({ isOpen, onClose, event }: { 
    isOpen: boolean; 
    onClose: () => void; 
    event: EventParticipant['event'] | null;
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const utils = api.useUtils();
    const submitFeedback = api.feedback.create.useMutation({
        onSuccess: () => {
            onClose();
            setRating(0);
            setComment('');
            // Refresh the events data
            utils.event.getStudentEvents.invalidate();
        }
    });

    const handleSubmit = async () => {
        if (!event || rating === 0) return;
        
        setIsSubmitting(true);
        try {
            await submitFeedback.mutateAsync({
                eventId: event.id,
                rating,
                comment: comment.trim() || undefined
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Berikan Feedback</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="font-medium text-gray-800 mb-2">{event.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(event.date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating *
                        </label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-1 ${
                                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                    } hover:text-yellow-400 transition-colors`}
                                >
                                    <Star className="h-6 w-6 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Komentar (Opsional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Bagikan pengalaman Anda mengikuti event ini..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className="px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
                        >
                            {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                            <Send className="h-4 w-4 mr-2" />
                            Kirim Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventCard = ({ 
    event, 
    participation, 
    onOpenFeedback 
}: { 
    event: EventParticipant['event']; 
    participation: EventParticipant;
    onOpenFeedback: (event: EventParticipant['event']) => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate >= new Date();
    
    // Check if user has already given feedback
    const userFeedback = event.feedback?.find(f => f.id);
    const hasGivenFeedback = !!userFeedback;

    const getStatusBadge = () => {
        if (participation.status === 'PENDING') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock3 className="h-3 w-3 mr-1" />
                    Menunggu
                </span>
            );
        } else if (participation.status === 'ACCEPTED') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Diterima
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Ditolak
                </span>
            );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            {getStatusBadge()}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                            Oleh {event.organizer.name}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {eventDate.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {event.timeStart} - {event.timeEnd}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        {event._count.participants} peserta
                        {event.maxParticipants && ` / ${event.maxParticipants} maksimal`}
                    </div>
                </div>

                {event.skills.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                            {event.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-sm text-yellow-600 hover:text-yellow-700 mb-3 transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Sembunyikan Detail
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Lihat Detail
                        </>
                    )}
                </button>

                {isExpanded && (
                    <div className="border-t pt-4 mb-4 border-gray-100">
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {event.description}
                        </p>
                    </div>
                )}

                {!isUpcoming && participation.status === 'ACCEPTED' && (
                    <div className="border-t pt-4 border-gray-100">
                        {hasGivenFeedback ? (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-gray-700">Feedback Anda</h4>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${
                                                    star <= userFeedback!.rating
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            ({userFeedback!.rating}/5)
                                        </span>
                                    </div>
                                </div>
                                {userFeedback!.comment && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        "{userFeedback!.comment}"
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Diberikan pada {new Date(userFeedback!.createdAt).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={() => onOpenFeedback(event)}
                                className="w-full bg-yellow-500 text-white py-2.5 px-4 rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center font-medium"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Berikan Feedback
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function StudentEventsPage() {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        event: EventParticipant['event'] | null;
    }>({
        isOpen: false,
        event: null
    });

    const { data: studentEvents, isLoading: eventsLoading } = api.event.getStudentEvents.useQuery();

    const { activeEvents, historyEvents } = useMemo(() => {
        if (!studentEvents) return { activeEvents: [], historyEvents: [] };
        
        const now = new Date();
        const active: EventParticipant[] = [];
        const history: EventParticipant[] = [];
        
        studentEvents.forEach((participation: any) => {
            // Check if the participation has event data
            if (!participation.event || !participation.event.date) {
                console.warn('Invalid participation data:', participation);
                return;
            }
            
            const eventDate = new Date(participation.event.date);
            if (eventDate >= now) {
                active.push(participation);
            } else {
                history.push(participation);
            }
        });
        
        return { activeEvents: active, historyEvents: history };
    }, [studentEvents]);

    const filteredEvents = useMemo(() => {
        let events: EventParticipant[] = [];
        
        switch (activeTab) {
            case 'active':
                events = activeEvents;
                break;
            case 'history':
                events = historyEvents;
                break;
        }
        
        if (searchQuery) {
            events = events.filter(event => {
                const eventData = event.event;
                // Safety check for eventData
                if (!eventData || !eventData.title || !eventData.description || !eventData.location) {
                    console.warn('Invalid event data for search:', event);
                    return false;
                }
                return eventData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       eventData.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       eventData.location.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }
        
        return events;
    }, [activeTab, activeEvents, historyEvents, searchQuery]);

    const handleOpenFeedback = (event: EventParticipant['event']) => {
        setFeedbackModal({ isOpen: true, event });
    };

    const handleCloseFeedback = () => {
        setFeedbackModal({ isOpen: false, event: null });
    };

    if (eventsLoading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Saya</h1>
                <p className="text-gray-600">Kelola event yang Anda ikuti dan berikan feedback</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Event Aktif</p>
                            <p className="text-2xl font-bold text-gray-900">{activeEvents.length}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Event Selesai</p>
                            <p className="text-2xl font-bold text-gray-900">{historyEvents.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Event</p>
                            <p className="text-2xl font-bold text-gray-900">{(activeEvents.length + historyEvents.length)}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Star className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="bg-white rounded-xl shadow-md mb-6 border border-gray-100">
                <div className="p-5 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === 'active'
                                        ? 'bg-white text-yellow-600 shadow-sm'
                                        : 'text-gray-600 hover:text-yellow-600'
                                }`}
                            >
                                Event Aktif ({activeEvents.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === 'history'
                                        ? 'bg-white text-yellow-600 shadow-sm'
                                        : 'text-gray-600 hover:text-yellow-600'
                                }`}
                            >
                                Riwayat ({historyEvents.length})
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Cari event..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                        <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ? 'Tidak ada event yang ditemukan' : 'Belum ada event'}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery 
                                ? 'Coba kata kunci yang berbeda atau hapus filter pencarian.'
                                : activeTab === 'active' 
                                    ? 'Anda belum terdaftar di event yang sedang berlangsung.'
                                    : 'Anda belum memiliki riwayat event.'
                            }
                        </p>
                    </div>
                ) : (
                    filteredEvents.map((participation) => (
                        <EventCard
                            key={participation.id}
                            event={participation.event}
                            participation={participation}
                            onOpenFeedback={handleOpenFeedback}
                        />
                    ))
                )}
            </div>

            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={handleCloseFeedback}
                event={feedbackModal.event}
            />
        </div>
    );
}
