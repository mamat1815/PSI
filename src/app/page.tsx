// src/app/page.tsx - Landing Page
"use client";

import Link from "next/link";
import { Search, User, ChevronRight, ChevronLeft, Calendar, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

// Header Component
const Header = () => {
    const { data: session } = useSession();
    
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-gray-800 font-[family-name:var(--font-kodchasan)]">UACAD</h1>
                    <nav className="hidden md:flex gap-6">
                        <Link href="#" className="text-gray-600 hover:text-gray-800 font-[family-name:var(--font-kodchasan)]">Fakultas</Link>
                        <Link href="#" className="text-gray-600 hover:text-gray-800 font-[family-name:var(--font-kodchasan)]">Organisasi</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Search className="h-5 w-5 text-gray-600 cursor-pointer" />
                    {session ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="text-sm text-gray-600 hidden md:block font-[family-name:var(--font-kodchasan)]">{session.user.name}</span>
                            <Link href="/home" className="text-sm text-blue-600 hover:text-blue-800 font-[family-name:var(--font-kodchasan)]">Dashboard</Link>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-600 hover:text-gray-800 font-medium font-[family-name:var(--font-kodchasan)]">
                                Login
                            </Link>
                            <Link href="/register" className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors font-[family-name:var(--font-kodchasan)]">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

// Hero Section Component
const HeroSection = () => {
    return (
        <section className="bg-gradient-to-r from-yellow-400 to-orange-400 py-16">
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight font-[family-name:var(--font-kodchasan)]">
                        Your studies,<br />
                        your way
                    </h1>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed font-[family-name:var(--font-kodchasan)]">
                        Easily browse and register for campus events with a few quick clicks.<br />
                        Our platform offers a simple way to book events online. Plus access to<br />
                        academic journals, and stay track of campus events, and get recommendations that match<br />
                        your academic journey. Experience a simple, flexible way to manage<br />
                        your academic life, designed to support your goals and help you stay ahead.
                    </p>
                    <Link href="/login" className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors inline-block font-[family-name:var(--font-kodchasan)]">
                        Recommend Events
                    </Link>
                </div>
                <div className="relative">
                    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">?</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                <div className="h-2 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-3 bg-gray-100 rounded"></div>
                            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-200 rounded-full opacity-60"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-200 rounded-full opacity-60"></div>
                </div>
            </div>
        </section>
    );
};

// Event Card Component with improved styling
const EventCard = ({ event }: { event: any }) => {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    
    const handleCardClick = () => {
        setShowModal(true);
    };

    return (
        <>
            <div 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                    <img 
                        src={event.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                        <span className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-medium font-[family-name:var(--font-kodchasan)]">
                            {event.organizer?.name || 'Event'}
                        </span>
                    </div>
                </div>
                <div className="p-6 border-2 border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 font-[family-name:var(--font-kodchasan)]">{event.title}</h3>
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-yellow-500" />
                            <span className="font-[family-name:var(--font-kodchasan)]">
                                {new Date(event.date).toLocaleDateString('id-ID', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="font-[family-name:var(--font-kodchasan)]">
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
                            <span className="font-[family-name:var(--font-kodchasan)]">{event.location}</span>
                        </div>
                    </div>
                    <button 
                        className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gray-800 text-white hover:bg-gray-700 font-[family-name:var(--font-kodchasan)]"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick();
                        }}
                    >
                        Lihat Detail
                    </button>
                </div>
            </div>
            
            {/* Event Detail Modal */}
            {showModal && (
                <EventDetailModal 
                    event={event} 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)}
                    session={session}
                />
            )}
        </>
    );
};

// Event Detail Modal Component
const EventDetailModal = ({ event, isOpen, onClose, session }: { event: any; isOpen: boolean; onClose: () => void; session: any }) => {
    const utils = api.useUtils();
    const registerMutation = api.event.register.useMutation({
        onSuccess: () => {
            utils.event.getPublic.invalidate();
            alert('Berhasil mendaftar event!');
            onClose();
        },
        onError: (error) => {
            alert('Gagal mendaftar: ' + error.message);
        }
    });

    const handleRegister = () => {
        if (!session) {
            alert('Silakan login terlebih dahulu untuk mendaftar event!');
            window.location.href = '/login';
            return;
        }
        registerMutation.mutate({ eventId: event.id });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-kodchasan)]">Detail Event</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Event Details */}
                <div className="p-6 space-y-6">
                    {/* Event Image */}
                    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                            src={event.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Event Info */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-kodchasan)]">{event.title}</h3>
                        <p className="text-lg text-yellow-600 font-medium mb-4 font-[family-name:var(--font-kodchasan)]">{event.organizer?.name}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-3 text-gray-700">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-yellow-500" />
                                    <span className="font-[family-name:var(--font-kodchasan)]">
                                        {new Date(event.date).toLocaleDateString('id-ID', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    <span className="font-[family-name:var(--font-kodchasan)]">
                                        {event.timeStart && event.timeEnd 
                                            ? `${event.timeStart} - ${event.timeEnd}`
                                            : new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                        }
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-yellow-500" />
                                    <span className="font-[family-name:var(--font-kodchasan)]">{event.location}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {event.maxParticipants && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600 font-[family-name:var(--font-kodchasan)]">Kapasitas</p>
                                        <p className="text-lg font-semibold text-gray-800 font-[family-name:var(--font-kodchasan)]">
                                            {event._count?.participants || 0} / {event.maxParticipants} peserta
                                        </p>
                                    </div>
                                )}
                                
                                {event.registrationDeadline && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm text-blue-600 font-[family-name:var(--font-kodchasan)]">Batas Pendaftaran</p>
                                        <p className="text-sm text-blue-800 font-[family-name:var(--font-kodchasan)]">
                                            {new Date(event.registrationDeadline).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2 font-[family-name:var(--font-kodchasan)]">Deskripsi Event</h4>
                                <p className="text-gray-600 leading-relaxed font-[family-name:var(--font-kodchasan)]">{event.description}</p>
                            </div>
                        )}

                        {/* Skills Required */}
                        {event.skills && event.skills.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-3 font-[family-name:var(--font-kodchasan)]">Skills yang Dibutuhkan</h4>
                                <div className="flex flex-wrap gap-2">
                                    {event.skills.map((skill: any) => (
                                        <span key={skill.name} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-[family-name:var(--font-kodchasan)]">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Action Buttons */}
                <div className="flex gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors font-[family-name:var(--font-kodchasan)]"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handleRegister}
                        disabled={registerMutation.isPending}
                        className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors bg-yellow-400 hover:bg-yellow-500 text-gray-900 disabled:opacity-50 font-[family-name:var(--font-kodchasan)]"
                    >
                        {registerMutation.isPending ? 'Mendaftar...' : session ? 'Daftar Event' : 'Login untuk Daftar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Events Section Component
// Ongoing Events Section Component
const OngoingEventsSection = () => {
    const [activeCategory, setActiveCategory] = useState("Pendidikan");
    
    const eventCategories = [
        { id: 1, name: "Pendidikan" },
        { id: 2, name: "Akademik" },
        { id: 3, name: "Organisasi" },
        { id: 4, name: "Kompetisi" },
    ];

    // Fetch events from database
    const { data: events, isLoading } = api.event.getPublic.useQuery();

    // Filter events by category if needed
    const filteredEvents = events?.filter(event => {
        // You can add category filtering logic here if your events have categories
        return true;
    }) || [];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 font-[family-name:var(--font-kodchasan)]">Ongoing events</h2>
                    <div className="flex gap-2">
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Category filters */}
                <div className="flex gap-4 mb-8 overflow-x-auto">
                    {eventCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.name)}
                            className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors font-[family-name:var(--font-kodchasan)] ${
                                activeCategory === category.name
                                    ? 'bg-yellow-400 text-gray-800'
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Events grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <div className="p-6">
                                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                                    <div className="h-10 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg font-[family-name:var(--font-kodchasan)]">
                                    Belum ada event tersedia
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

// Academic Vision Section Component
const AcademicVisionSection = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    
    // Fetch events from database
    const { data: events, isLoading } = api.event.getPublic.useQuery();

    // Filter events based on active tab
    const filteredEvents = events?.filter(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        
        switch (activeTab) {
            case 'upcoming':
                return eventDate >= now;
            case 'past':
                return eventDate < now;
            case 'recommend':
                // You can add recommendation logic here
                return eventDate >= now;
            default:
                return true;
        }
    }) || [];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4 font-[family-name:var(--font-kodchasan)]">
                        Where your <span className="text-yellow-500">academic</span> vision<br />
                        becomes a reality
                    </h2>
                </div>

                <div className="mb-8">
                    <div className="flex justify-center gap-4 mb-8">
                        <button 
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors font-[family-name:var(--font-kodchasan)] ${
                                activeTab === 'upcoming' 
                                    ? 'bg-gray-800 text-white' 
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            Upcoming Event ({events?.filter(e => new Date(e.date) >= new Date()).length || 0})
                        </button>
                        <button 
                            onClick={() => setActiveTab('recommend')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors font-[family-name:var(--font-kodchasan)] ${
                                activeTab === 'recommend' 
                                    ? 'bg-gray-800 text-white' 
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            Recommend Event ({events?.filter(e => new Date(e.date) >= new Date()).length || 0})
                        </button>
                        <button 
                            onClick={() => setActiveTab('past')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors font-[family-name:var(--font-kodchasan)] ${
                                activeTab === 'past' 
                                    ? 'bg-gray-800 text-white' 
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            Past Event ({events?.filter(e => new Date(e.date) < new Date()).length || 0})
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div></div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-[family-name:var(--font-kodchasan)]">
                                {filteredEvents.length} / {events?.length || 0}
                            </span>
                            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Events grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                    <div className="h-48 bg-gray-300"></div>
                                    <div className="p-6">
                                        <div className="h-4 bg-gray-300 rounded mb-4"></div>
                                        <div className="h-10 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.slice(0, 4).map((event) => (
                                    <EventCard 
                                        key={event.id}
                                        event={event}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 text-lg font-[family-name:var(--font-kodchasan)]">
                                        Belum ada event tersedia untuk kategori ini
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// Main Landing Page Component
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <HeroSection />
            <OngoingEventsSection />
            <AcademicVisionSection />
            
            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2025 UACAD. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}