// src/app/(student-dashboard)/home/page.tsx
"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Award, Building, Search, Loader2, Send, CheckCircle, Filter, Users, Star, AlertTriangle, Info, X, ExternalLink, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import Link from "next/link";
import { checkEventConflict, formatConflictMessage, type ScheduleItem } from "~/utils/scheduleConflict";

const dayNameToIndex: Record<string, number> = { "senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5, "sabtu": 6, "minggu": 0 };

// Utility function to generate Google Calendar URL
const generateGoogleCalendarUrl = (event: any, startTime?: string, endTime?: string) => {
    const eventDate = new Date(event.date);
    
    // If we have specific times, use them; otherwise use the event date
    let startDateTime: Date;
    let endDateTime: Date;
    
    if (startTime && endTime) {
        const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number);
        const [endHour = 0, endMinute = 0] = endTime.split(':').map(Number);
        
        startDateTime = new Date(eventDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);

        endDateTime = new Date(eventDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
    } else {
        startDateTime = new Date(eventDate);
        endDateTime = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration
    }
    
    // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
    const formatDateForGoogle = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const startFormatted = formatDateForGoogle(startDateTime);
    const endFormatted = formatDateForGoogle(endDateTime);
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${startFormatted}/${endFormatted}`,
        details: event.description || '',
        location: event.location || '',
        ctz: 'Asia/Jakarta'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Event Registration Confirmation Modal
const EventRegistrationModal = ({ 
    event, 
    isOpen, 
    onClose, 
    onConfirm, 
    isLoading = false,
    scheduleConflict = null,
    error = null
}: {
    event: any;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    scheduleConflict?: any;
    error?: string | null;
}) => {
    if (!isOpen) return null;

    const currentParticipants = event.registrations?.length || 0;
    const isNearCapacity = event.maxParticipants && currentParticipants >= event.maxParticipants * 0.8;
    const isFull = event.maxParticipants && currentParticipants >= event.maxParticipants;
    
    const registrationDeadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
    const eventDate = new Date(event.date);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Konfirmasi Pendaftaran Event</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Event Details */}
                <div className="p-6 space-y-4">
                    {/* Event Image */}
                    <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                            src={event.image || `https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = `https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`;
                            }}
                        />
                    </div>

                    {/* Event Info */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{event.organizer.name}</p>
                        
                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{eventDate.toLocaleDateString('id-ID', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>
                                    {event.timeStart && event.timeEnd 
                                        ? `${event.timeStart} - ${event.timeEnd}`
                                        : eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                    }
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{event.location}</span>
                            </div>

                            {event.maxParticipants && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span>
                                        {currentParticipants} / {event.maxParticipants} peserta
                                        {isNearCapacity && !isFull && (
                                            <span className="ml-1 text-orange-600 font-medium">(Hampir penuh)</span>
                                        )}
                                        {isFull && (
                                            <span className="ml-1 text-red-600 font-medium">(Penuh)</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-600">{event.description}</p>
                            </div>
                        )}

                        {/* Skills Required */}
                        {event.skills && event.skills.length > 0 && (
                            <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Skills yang dibutuhkan:</p>
                                <div className="flex flex-wrap gap-1">
                                    {event.skills.map((skill: any) => (
                                        <span key={skill.name} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Warnings and Info */}
                    <div className="space-y-3">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">Pendaftaran Gagal</p>
                                        <p className="text-xs text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Schedule Conflict Warning */}
                        {scheduleConflict?.hasConflict && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">Konflik Jadwal Terdeteksi</p>
                                        <p className="text-xs text-red-700 mt-1">
                                            Event ini bertabrakan dengan jadwal kuliah Anda. Pastikan Anda dapat mengatur waktu dengan baik.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Registration Deadline Warning */}
                        {event.registrationDeadline && (
                            <div className={`p-3 rounded-lg border ${
                                registrationDeadlinePassed 
                                    ? 'bg-red-50 border-red-200' 
                                    : daysUntilEvent <= 2 
                                        ? 'bg-orange-50 border-orange-200' 
                                        : 'bg-blue-50 border-blue-200'
                            }`}>
                                <div className="flex items-start gap-2">
                                    <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                                        registrationDeadlinePassed 
                                            ? 'text-red-500' 
                                            : daysUntilEvent <= 2 
                                                ? 'text-orange-500' 
                                                : 'text-blue-500'
                                    }`} />
                                    <div>
                                        <p className={`text-sm font-medium ${
                                            registrationDeadlinePassed 
                                                ? 'text-red-800' 
                                                : daysUntilEvent <= 2 
                                                    ? 'text-orange-800' 
                                                    : 'text-blue-800'
                                        }`}>
                                            Batas Pendaftaran
                                        </p>
                                        <p className={`text-xs mt-1 ${
                                            registrationDeadlinePassed 
                                                ? 'text-red-700' 
                                                : daysUntilEvent <= 2 
                                                    ? 'text-orange-700' 
                                                    : 'text-blue-700'
                                        }`}>
                                            {registrationDeadlinePassed 
                                                ? 'Batas pendaftaran telah lewat'
                                                : `Hingga ${new Date(event.registrationDeadline).toLocaleDateString('id-ID')}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Capacity Warning */}
                        {isNearCapacity && !isFull && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-orange-800">Kapasitas Hampir Penuh</p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            Tersisa {event.maxParticipants - currentParticipants} slot pendaftaran.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Action Buttons */}
                <div className="flex gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading || isFull || registrationDeadlinePassed}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                            scheduleConflict?.hasConflict 
                                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                Mendaftarkan...
                            </div>
                        ) : (
                            isFull ? 'Event Penuh' :
                            registrationDeadlinePassed ? 'Batas Waktu Lewat' :
                            scheduleConflict?.hasConflict ? 'Daftar (Ada Konflik)' : 'Konfirmasi Daftar'
                        )}
                    </button>
                </div>
                
                {/* Add to Google Calendar button after successful registration */}
                {event.isRegistered && (
                    <div className="p-4 border-t bg-blue-50">
                        <button
                            onClick={() => window.open(generateGoogleCalendarUrl(event, event.timeStart, event.timeEnd), '_blank')}
                            className="w-full py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Tambah ke Google Calendar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CalendarWidget = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<number | null>(null);

    const { data: jadwalKuliah } = api.jadwal.getMine.useQuery();
    const { data: myEvents } = api.event.getStudentEvents.useQuery();

    const monthSchedules = useMemo(() => {
        const schedules = new Map<number, any[]>();
        if (!jadwalKuliah && !myEvents) return schedules;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const dailySchedules: any[] = [];

            // Add jadwal kuliah
            jadwalKuliah?.forEach(j => {
                if (dayNameToIndex[j.hari.toLowerCase()] === dayOfWeek) {
                    dailySchedules.push({ 
                        type: 'kuliah', 
                        title: j.mataKuliah, 
                        time: `${j.jamMulai} - ${j.jamSelesai}`,
                        color: 'bg-blue-500/80'
                    });
                }
            });

            // Add only my registered events (tidak termasuk event publik yang belum didaftarkan)
            myEvents?.forEach(participation => {
                const eventDate = new Date(participation.event.date);
                if (eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year) {
                    const statusColor = participation.status === 'ACCEPTED' ? 'bg-green-500/80' : 
                                      participation.status === 'PENDING' ? 'bg-yellow-500/80' : 'bg-red-500/80';
                    
                    dailySchedules.push({ 
                        type: 'my-event', 
                        title: participation.event.title, 
                        time: participation.event.timeStart && participation.event.timeEnd ? 
                              `${participation.event.timeStart} - ${participation.event.timeEnd}` : 
                              eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        color: statusColor,
                        status: participation.status,
                        event: participation.event,
                        location: participation.event.location
                    });
                }
            });

            if (dailySchedules.length > 0) {
                schedules.set(day, dailySchedules);
            }
        }
        return schedules;
    }, [currentDate, jadwalKuliah, myEvents]);

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
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-slate-800 text-white p-3 rounded-lg shadow-xl z-10 pointer-events-auto">
                                    <p className="font-bold mb-2 border-b border-b-gray-600 pb-1">Jadwal untuk tanggal {hoveredDate}</p>
                                    <ul className="space-y-2 text-xs max-h-40 overflow-y-auto">
                                        {schedules.map((s, i) => (
                                            <li key={i} className={`p-2 rounded flex items-center justify-between gap-2 ${s.color}`}>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{s.title}</span>
                                                        {s.status && (
                                                            <span className={`px-1 py-0.5 rounded text-xs ${
                                                                s.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' :
                                                                s.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                                                'bg-red-200 text-red-800'
                                                            }`}>
                                                                {s.status === 'ACCEPTED' ? 'Diterima' : 
                                                                 s.status === 'PENDING' ? 'Menunggu' : 'Ditolak'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-200 text-xs">
                                                        {s.time}
                                                        {s.location && (
                                                            <span className="ml-2">📍 {s.location}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {s.type === 'my-event' && s.status === 'ACCEPTED' && (
                                                    <button
                                                        onClick={() => window.open(generateGoogleCalendarUrl(s.event, s.event.timeStart, s.event.timeEnd), '_blank')}
                                                        className="ml-2 p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                                        title="Tambah ke Google Calendar"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300">
                                        <div className="flex gap-3 text-xs">
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded"></div>
                                                Kuliah
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded"></div>
                                                Event Diterima
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                                                Event Pending
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-red-500 rounded"></div>
                                                Event Ditolak
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const EventSearchTab = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { data: events, isLoading } = api.event.getPublic.useQuery();

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        
        return events.filter(event => {
            const matchesSearch = searchQuery === '' || 
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesCategory = selectedCategory === '' || 
                (event.organizer as any).category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
    }, [events, searchQuery, selectedCategory]);

    const categories = useMemo(() => {
        if (!events) return [];
        const cats = events.map(e => (e.organizer as any).category).filter(Boolean);
        return [...new Set(cats)];
    }, [events]);

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari event berdasarkan nama, organizer, atau lokasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 p-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori Organisasi
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('');
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
                <p className="text-gray-600">
                    Menampilkan {filteredEvents.length} dari {events?.length || 0} event
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="h-4 w-4" />
                    Event yang tersedia untuk pendaftaran
                </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-yellow-500" />
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tidak ada event ditemukan
                    </h3>
                    <p className="text-gray-500">
                        Coba ubah kata kunci pencarian atau filter yang digunakan
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <DetailedEventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
};

const DetailedEventCard = ({ event }: { event: any }) => {
    const utils = api.useUtils();
    const { data: jadwalKuliah } = api.jadwal.getMine.useQuery();
    
    const registerMutation = api.event.register.useMutation({
        onSuccess: () => { 
            utils.event.getPublic.invalidate();
            setShowModal(false);
        },
        onError: (error) => {
            // Handle error dari server
            console.error("Registration error:", error.message);
        }
    });
    const [showModal, setShowModal] = useState(false);
    
    // Gunakan isRegistered dari API response
    const isRegistered = event.isRegistered || registerMutation.isSuccess;
    
    // Check for schedule conflicts
    const scheduleConflict = useMemo(() => {
        if (!jadwalKuliah || !event.timeStart || !event.timeEnd) return null;
        
        const scheduleItems: ScheduleItem[] = jadwalKuliah.map(j => ({
            hari: j.hari,
            jamMulai: j.jamMulai,
            jamSelesai: j.jamSelesai,
            mataKuliah: j.mataKuliah,
            type: 'kuliah' as const
        }));

        return checkEventConflict({
            date: new Date(event.date),
            timeStart: event.timeStart,
            timeEnd: event.timeEnd,
            title: event.title
        }, scheduleItems);
    }, [jadwalKuliah, event]);
    
    const handleRegisterClick = () => { 
        setShowModal(true);
    };

    const handleConfirmRegister = () => {
        registerMutation.mutate({ eventId: event.id });
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200">
                    <img 
                        src={event.image || `https://placehold.co/400x300/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/400x300/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`;
                        }}
                    />
                </div>
                
                <div className="p-4">
                    <div className="mb-3">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-yellow-600 font-medium">{event.organizer.name}</p>
                        {(event.organizer as any).category && (
                            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {(event.organizer as any).category}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-yellow-500" />
                            <span>{new Date(event.date).toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span>
                                {event.timeStart && event.timeEnd 
                                    ? `${event.timeStart} - ${event.timeEnd}`
                                    : new Date(event.date).toLocaleTimeString('id-ID', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })
                                }
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-yellow-500" />
                            <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-yellow-500" />
                            <span>
                                {event._count?.participants || 0} peserta terdaftar
                                {event.maxParticipants && ` / ${event.maxParticipants} maksimal`}
                            </span>
                        </div>
                        
                        {/* Schedule Conflict Warning */}
                        {scheduleConflict?.hasConflict && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                    <div className="text-red-700">
                                        <p className="font-medium text-xs">Konflik Jadwal!</p>
                                        <p className="text-xs">{formatConflictMessage(scheduleConflict.conflicts)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Registration Deadline */}
                        {event.registrationDeadline && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-blue-500" />
                                    <span className="text-blue-700 text-xs">
                                        Batas pendaftaran: {new Date(event.registrationDeadline).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                        {event.description}
                    </p>

                    <div className="space-y-2">
                        {event.skills && event.skills.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Skills yang dibutuhkan:</p>
                                <div className="flex flex-wrap gap-1">
                                    {event.skills.slice(0, 3).map((skill: any) => (
                                        <span key={skill.name} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                            {skill.name}
                                        </span>
                                    ))}
                                    {event.skills.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                            +{event.skills.length - 3} lainnya
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {isRegistered || registerMutation.isSuccess ? (
                            <div className="space-y-2">
                                <button 
                                    disabled 
                                    className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    Berhasil Terdaftar
                                </button>
                                <button
                                    onClick={() => window.open(generateGoogleCalendarUrl(event, event.timeStart, event.timeEnd), '_blank')}
                                    className="w-full py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Tambah ke Google Calendar
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleRegisterClick} 
                                disabled={registerMutation.isPending}
                                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                                    scheduleConflict?.hasConflict 
                                        ? 'bg-orange-400 hover:bg-orange-500 text-white' 
                                        : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                                }`}
                            >
                                {scheduleConflict?.hasConflict ? 'Daftar (Ada Konflik)' : 'Daftar Event'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Registration Confirmation Modal */}
            <EventRegistrationModal
                event={event}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmRegister}
                isLoading={registerMutation.isPending}
                scheduleConflict={scheduleConflict}
                error={registerMutation.error?.message || null}
            />
        </>
    );
};

// Component untuk menampilkan event yang sudah didaftarkan mahasiswa
const MyEventCard = ({ participation }: { participation: any }) => {
    const event = participation.event;
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };
    
    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'Diterima';
            case 'PENDING': return 'Menunggu';
            case 'REJECTED': return 'Ditolak';
            default: return status;
        }
    };

    return (
        <div className="p-3 rounded-lg border bg-white flex flex-col gap-4">
            <div className="w-full h-32 bg-gray-200 rounded-md overflow-hidden">
                <img 
                    src={event.image || `https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`} 
                    alt={event.title} 
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`;
                    }}
                />
            </div>
            <div className="flex-grow">
                <p className="font-bold text-sm text-yellow-500">{event.title}</p>
                <p className="text-xs text-gray-500">{event.organizer.name}</p>
                
                {/* Status Badge */}
                <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium border inline-block ${getStatusColor(participation.status)}`}>
                    {getStatusText(participation.status)}
                </div>
                
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p className="flex items-center gap-2">
                        <Clock className="h-3 w-3"/>
                        {event.timeStart && event.timeEnd 
                            ? `${event.timeStart} - ${event.timeEnd}`
                            : new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        }
                    </p>
                    <p className="flex items-center gap-2">
                        <Calendar className="h-3 w-3"/>
                        {new Date(event.date).toLocaleDateString('id-ID', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}
                    </p>
                    <p className="flex items-center gap-2"><MapPin className="h-3 w-3"/>{event.location}</p>
                </div>
            </div>
            <div className="flex-shrink-0">
                {participation.status === 'ACCEPTED' && (
                    <button
                        onClick={() => window.open(generateGoogleCalendarUrl(event, event.timeStart, event.timeEnd), '_blank')}
                        className="w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                        <ExternalLink className="h-3 w-3"/> Google Calendar
                    </button>
                )}
                {participation.status === 'PENDING' && (
                    <div className="w-full py-2 rounded-md bg-yellow-100 text-yellow-700 text-sm text-center border border-yellow-200">
                        Menunggu Konfirmasi
                    </div>
                )}
                {participation.status === 'REJECTED' && (
                    <div className="w-full py-2 rounded-md bg-red-100 text-red-700 text-sm text-center border border-red-200">
                        Pendaftaran Ditolak
                    </div>
                )}
            </div>
        </div>
    );
};

const EventCard = ({ event }: { event: any }) => {
    const utils = api.useUtils();
    const { data: jadwalKuliah } = api.jadwal.getMine.useQuery();
    
    const registerMutation = api.event.register.useMutation({
        onSuccess: () => { 
            utils.event.getPublic.invalidate();
            setShowModal(false);
        },
        onError: (error) => {
            // Handle error dari server
            console.error("Registration error:", error.message);
        }
    });
    const [showModal, setShowModal] = useState(false);
    
    // Gunakan isRegistered dari API response
    const isRegistered = event.isRegistered || registerMutation.isSuccess;
    
    // Check for schedule conflicts for this simple card too
    const scheduleConflict = useMemo(() => {
        if (!jadwalKuliah || !event.timeStart || !event.timeEnd) return null;
        
        const scheduleItems: ScheduleItem[] = jadwalKuliah.map(j => ({
            hari: j.hari,
            jamMulai: j.jamMulai,
            jamSelesai: j.jamSelesai,
            mataKuliah: j.mataKuliah,
            type: 'kuliah' as const
        }));

        return checkEventConflict({
            date: new Date(event.date),
            timeStart: event.timeStart,
            timeEnd: event.timeEnd,
            title: event.title
        }, scheduleItems);
    }, [jadwalKuliah, event]);

    const handleRegisterClick = () => { 
        setShowModal(true);
    };

    const handleConfirmRegister = () => {
        registerMutation.mutate({ eventId: event.id });
    };

    return (
        <>
            <div className="p-3 rounded-lg border bg-white flex flex-col gap-4">
                <div className="w-full h-32 bg-gray-200 rounded-md overflow-hidden">
                    <img 
                        src={event.image || `https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`} 
                        alt={event.title} 
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`;
                        }}
                    />
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-sm text-yellow-500">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.organizer.name}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <p className="flex items-center gap-2">
                            <Clock className="h-3 w-3"/>
                            {event.timeStart && event.timeEnd 
                                ? `${event.timeStart} - ${event.timeEnd}`
                                : new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            }
                        </p>
                        <p className="flex items-center gap-2"><Calendar className="h-3 w-3"/>{new Date(event.date).toLocaleDateString()}</p>
                        <p className="flex items-center gap-2"><MapPin className="h-3 w-3"/>{event.location}</p>
                        
                        {/* Show conflict indicator for simple cards too */}
                        {scheduleConflict?.hasConflict && (
                            <p className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-3 w-3"/>
                                Konflik jadwal
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {isRegistered || registerMutation.isSuccess ? (
                        <div className="space-y-2">
                            <button disabled className="w-full py-2 rounded-md bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2">
                                <CheckCircle className="h-5 w-5"/> Terdaftar
                            </button>
                            <button
                                onClick={() => window.open(generateGoogleCalendarUrl(event, event.timeStart, event.timeEnd), '_blank')}
                                className="w-full py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center justify-center gap-1 transition-colors"
                            >
                                <ExternalLink className="h-3 w-3"/> Google Calendar
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleRegisterClick} 
                            disabled={registerMutation.isPending} 
                            className={`w-full py-2 rounded-md font-semibold hover:opacity-90 transition-colors ${
                                scheduleConflict?.hasConflict 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-gray-800 text-white hover:bg-gray-700'
                            }`}
                        >
                            {registerMutation.isPending ? <Loader2 className="animate-spin"/> : 'Daftar'}
                        </button>
                    )}
                </div>
            </div>

            {/* Registration Confirmation Modal */}
            <EventRegistrationModal
                event={event}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmRegister}
                isLoading={registerMutation.isPending}
                scheduleConflict={scheduleConflict}
                error={registerMutation.error?.message || null}
            />
        </>
    );
};

const EventStatsWidget = () => {
    const { data: myEvents } = api.event.getStudentEvents.useQuery();
    
    const stats = useMemo(() => {
        if (!myEvents) return {
            total: 0,
            accepted: 0,
            pending: 0,
            rejected: 0,
            completed: 0,
            upcoming: 0
        };
        
        const now = new Date();
        const completed = myEvents.filter(p => new Date(p.event.date) < now && p.status === 'ACCEPTED');
        const upcoming = myEvents.filter(p => new Date(p.event.date) >= now && p.status === 'ACCEPTED');
        
        return {
            total: myEvents.length,
            accepted: myEvents.filter(p => p.status === 'ACCEPTED').length,
            pending: myEvents.filter(p => p.status === 'PENDING').length,
            rejected: myEvents.filter(p => p.status === 'REJECTED').length,
            completed: completed.length,
            upcoming: upcoming.length
        };
    }, [myEvents]);

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Statistik Event Anda</h3>
                <BarChart3 className="h-5 w-5 text-yellow-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-blue-700">Total Event</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                    <div className="text-sm text-green-700">Diterima</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Event Selesai</span>
                    <span className="font-medium">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Event Mendatang</span>
                    <span className="font-medium">{stats.upcoming}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Menunggu Konfirmasi</span>
                    <span className="font-medium text-yellow-600">{stats.pending}</span>
                </div>
            </div>
        </div>
    );
};

const ActivityChart = () => {
    const { data: myEvents } = api.event.getStudentEvents.useQuery();
    
    const monthlyData = useMemo(() => {
        if (!myEvents) return [];
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const currentYear = new Date().getFullYear();
        const data = months.map(month => ({ month, events: 0 }));
        
        myEvents.forEach(participation => {
            const eventDate = new Date(participation.event.date);
            const monthIndex = eventDate.getMonth();
            if (eventDate.getFullYear() === currentYear && 
                participation.status === 'ACCEPTED' && 
                monthIndex >= 0 && 
                monthIndex < data.length) {
                const monthData = data[monthIndex];
                if (monthData) {
                    monthData.events++;
                }
            }
        });
        
        return data;
    }, [myEvents]);

    const maxEvents = Math.max(...monthlyData.map(d => d.events), 1);

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Aktivitas Tahunan</h3>
                <Activity className="h-5 w-5 text-yellow-500" />
            </div>
            
            <div className="flex items-end justify-between h-32 space-x-1">
                {monthlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                            className="w-full bg-yellow-400 rounded-t-sm min-h-[4px] transition-all duration-300 hover:bg-yellow-500"
                            style={{ height: `${(data.events / maxEvents) * 100}%` }}
                            title={`${data.month}: ${data.events} event`}
                        />
                        <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 text-center">
                    Total event diterima tahun ini: <span className="font-medium">{monthlyData.reduce((sum, d) => sum + d.events, 0)}</span>
                </div>
            </div>
        </div>
    );
};

const SkillProgressWidget = () => {
    const { data: userSkills } = api.user.getSkills.useQuery();
    const { data: myEvents } = api.event.getStudentEvents.useQuery();
    
    const skillProgress = useMemo(() => {
        if (!userSkills || !myEvents) return [];
        
        const completedEvents = myEvents.filter(p => 
            new Date(p.event.date) < new Date() && p.status === 'ACCEPTED'
        );
        
        return userSkills.skills.map(skill => {
            const relatedEvents = completedEvents.filter(p => 
                p.event.skills?.some((s: any) => s.name === skill.name)
            );
            
            return {
                name: skill.name,
                events: relatedEvents.length,
                progress: Math.min((relatedEvents.length / 5) * 100, 100) // Max 5 events = 100%
            };
        }).sort((a, b) => b.events - a.events);
    }, [userSkills, myEvents]);

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progress Skill</h3>
                <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            
            {skillProgress.length > 0 ? (
                <div className="space-y-4">
                    {skillProgress.slice(0, 4).map((skill, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                <span className="text-xs text-gray-500">{skill.events} event</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${skill.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    
                    {skillProgress.length === 0 && (
                        <div className="text-center py-6">
                            <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Belum ada skill yang terdaftar</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-6">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Belum ada data skill</p>
                </div>
            )}
        </div>
    );
};

const ParticipationChart = () => {
    const { data: myEvents } = api.event.getStudentEvents.useQuery();
    
    const participationData = useMemo(() => {
        if (!myEvents) return { accepted: 0, pending: 0, rejected: 0 };
        
        return {
            accepted: myEvents.filter(p => p.status === 'ACCEPTED').length,
            pending: myEvents.filter(p => p.status === 'PENDING').length,
            rejected: myEvents.filter(p => p.status === 'REJECTED').length
        };
    }, [myEvents]);

    const total = participationData.accepted + participationData.pending + participationData.rejected;
    
    if (total === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Status Partisipasi</h3>
                    <PieChart className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-center py-6">
                    <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Belum ada event yang didaftarkan</p>
                </div>
            </div>
        );
    }

    const acceptedPercentage = (participationData.accepted / total) * 100;
    const pendingPercentage = (participationData.pending / total) * 100;
    const rejectedPercentage = (participationData.rejected / total) * 100;

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Status Partisipasi</h3>
                <PieChart className="h-5 w-5 text-yellow-500" />
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Diterima</span>
                    </div>
                    <span className="text-sm font-medium">{acceptedPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${acceptedPercentage}%` }} />
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Menunggu</span>
                    </div>
                    <span className="text-sm font-medium">{pendingPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${pendingPercentage}%` }} />
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Ditolak</span>
                    </div>
                    <span className="text-sm font-medium">{rejectedPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${rejectedPercentage}%` }} />
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="text-sm text-gray-600">Total: {total} event</span>
            </div>
        </div>
    );
};

export default function HomePage() {
    const { data: sessionData } = api.auth.getSession.useQuery();
    const { data: events, isLoading: eventsLoading } = api.event.getPublic.useQuery();
    const { data: myEvents, isLoading: myEventsLoading } = api.event.getStudentEvents.useQuery();
    const [activeTab, setActiveTab] = useState<'home' | 'search'>('home');

    const session = sessionData?.session;

    // Filter untuk event yang akan datang dan sudah diterima
    const upcomingMyEvents = useMemo(() => {
        if (!myEvents) return [];
        
        const now = new Date();
        return myEvents
            .filter(participation => {
                const eventDate = new Date(participation.event.date);
                return eventDate >= now && participation.status === 'ACCEPTED';
            })
            .sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime())
            .slice(0, 5); // Ambil maksimal 5 event terdekat
    }, [myEvents]);

    // Dashboard statistics
    const dashboardStats = useMemo(() => {
        if (!myEvents) return {
            totalEvents: 0,
            acceptedEvents: 0,
            upcomingEvents: 0,
            completedEvents: 0
        };
        
        const now = new Date();
        const accepted = myEvents.filter(p => p.status === 'ACCEPTED');
        const upcoming = accepted.filter(p => new Date(p.event.date) >= now);
        const completed = accepted.filter(p => new Date(p.event.date) < now);
        
        return {
            totalEvents: myEvents.length,
            acceptedEvents: accepted.length,
            upcomingEvents: upcoming.length,
            completedEvents: completed.length
        };
    }, [myEvents]);

    const tabs = [
        { id: 'home' as const, name: 'Beranda', icon: Building },
        { id: 'search' as const, name: 'Cari Event', icon: Search },
    ];

    return (
        <div className="p-6">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Selamat Pagi, {session?.user?.name?.split(' ')[0] || 'Mahasiswa'}!
                    </h1>
                    <div className="flex items-center gap-4">
                        <button className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                            <Building className="h-6 w-6 text-gray-600"/>
                        </button>
                        <button className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                            <Search className="h-6 w-6 text-gray-600"/>
                        </button>
                    </div>
                </div>

                {/* Dashboard Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Event</p>
                                <p className="text-2xl font-bold">{dashboardStats.totalEvents}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-200" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Event Diterima</p>
                                <p className="text-2xl font-bold">{dashboardStats.acceptedEvents}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-200" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Event Mendatang</p>
                                <p className="text-2xl font-bold">{dashboardStats.upcomingEvents}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-200" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Event Selesai</p>
                                <p className="text-2xl font-bold">{dashboardStats.completedEvents}</p>
                            </div>
                            <Award className="h-8 w-8 text-purple-200" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-yellow-500 text-yellow-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon
                                        className={`-ml-0.5 mr-2 h-5 w-5 ${
                                            activeTab === tab.id ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'home' && (
                <div>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Acara Aktif Anda</h2>
                            <Link 
                                href="/my-events" 
                                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                            >
                                Lihat Semua
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {myEventsLoading ? (
                                <Loader2 className="animate-spin"/>
                            ) : upcomingMyEvents.length > 0 ? (
                                upcomingMyEvents.map(participation => (
                                    <MyEventCard key={participation.event.id} participation={participation} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Belum ada event aktif</h3>
                                    <p className="text-gray-500 mb-4">Anda belum mendaftar atau belum memiliki event yang diterima.</p>
                                    <Link 
                                        href="#" 
                                        onClick={() => setActiveTab('search')}
                                        className="inline-flex items-center px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        Cari Event
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <CalendarWidget />
                        </div>
                        <div className="space-y-6">
                            <EventStatsWidget />
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Analytics & Progress</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <ActivityChart />
                            <SkillProgressWidget />
                            <ParticipationChart />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'search' && <EventSearchTab />}
        </div>
    );
}
