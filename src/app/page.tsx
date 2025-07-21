// src/app/page.tsx - Enhanced Interactive Landing Page
"use client";

import Link from "next/link";
import { Search, User, ChevronRight, ChevronLeft, Calendar, MapPin, Clock, Star, Users, ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

// Enhanced Header Component with glassmorphism effect
const Header = () => {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
                : 'bg-white shadow-sm border-b'
        }`}>
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="group cursor-pointer">
                        <h1 className="text-2xl font-bold text-gray-800 font-[family-name:var(--font-kodchasan)] transition-all duration-300 group-hover:text-yellow-500 group-hover:scale-105">
                            UACAD
                        </h1>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link href="#" className="text-gray-600 hover:text-yellow-500 font-[family-name:var(--font-kodchasan)] transition-all duration-300 hover:scale-105 relative group">
                            Fakultas
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link href="#" className="text-gray-600 hover:text-yellow-500 font-[family-name:var(--font-kodchasan)] transition-all duration-300 hover:scale-105 relative group">
                            Organisasi
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="h-5 w-5 text-gray-600 cursor-pointer transition-all duration-300 hover:text-yellow-500 hover:scale-110" />
                        <div className="absolute -inset-2 bg-yellow-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </div>
                    {session ? (
                        <div className="flex items-center gap-3 animate-fadeIn">
                            <div className="relative group">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                            </div>
                            <span className="text-sm text-gray-600 hidden md:block font-[family-name:var(--font-kodchasan)]">{session.user.name}</span>
                            <Link href="/home" className="text-sm text-blue-600 hover:text-blue-800 font-[family-name:var(--font-kodchasan)] transition-all duration-300 hover:scale-105">
                                Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 animate-fadeIn">
                            <Link href="/login" className="text-gray-600 hover:text-yellow-500 font-medium font-[family-name:var(--font-kodchasan)] transition-all duration-300 hover:scale-105">
                                Login
                            </Link>
                            <Link href="/register" className="relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-6 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                                <span className="relative z-10 font-[family-name:var(--font-kodchasan)]">Register</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

// Enhanced Hero Section with particle animation and parallax effect
const HeroSection = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    
    return (
        <section className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 py-20 mt-16 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
                <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delay-1"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float-delay-2"></div>
                <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-white/10 rounded-full animate-float"></div>
            </div>
            
            {/* Parallax mouse effect */}
            <div 
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`
                }}
            ></div>
            
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="text-left space-y-6 animate-slideInLeft">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight font-[family-name:var(--font-kodchasan)]">
                        Your studies,<br />
                        <span className="text-white drop-shadow-lg">your way</span>
                    </h1>
                    <p className="text-lg text-gray-700 leading-relaxed font-[family-name:var(--font-kodchasan)] max-w-lg">
                        Easily browse and register for campus events with a few quick clicks.
                        Our platform offers a simple way to book events online. Plus access to
                        academic journals, and stay track of campus events, and get recommendations that match
                        your academic journey.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/login" className="group relative overflow-hidden bg-gray-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center justify-center">
                            <span className="relative z-10 flex items-center gap-2 font-[family-name:var(--font-kodchasan)]">
                                <Play className="h-5 w-5" />
                                Recommend Events
                                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        </Link>
                        <button className="group border-2 border-white/30 text-gray-800 px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 hover:scale-105 backdrop-blur-sm">
                            <span className="font-[family-name:var(--font-kodchasan)] flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Learn More
                            </span>
                        </button>
                    </div>
                </div>
                <div className="relative animate-slideInRight">
                    <div className="relative">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-auto transform hover:scale-105 transition-all duration-300 border border-white/20">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                    <Star className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-2/3 animate-pulse delay-100"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse delay-200"></div>
                                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-3/4 animate-pulse delay-300"></div>
                                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-1/2 animate-pulse delay-400"></div>
                            </div>
                        </div>
                        
                        {/* Floating decorative elements */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-70 animate-bounce-slow"></div>
                        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-70 animate-bounce-slow delay-500"></div>
                        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-60 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Enhanced Event Card with hover effects and animations
const EventCard = ({ event, index }: { event: any; index?: number }) => {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    const handleCardClick = () => {
        setShowModal(true);
    };

    return (
        <>
            <div 
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:-translate-y-2 animate-fadeInUp`}
                style={{ animationDelay: `${(index || 0) * 100}ms` }}
                onClick={handleCardClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                    <img 
                        src={event.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} 
                        alt={event.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4 transform group-hover:scale-110 transition-transform duration-300">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-[family-name:var(--font-kodchasan)] shadow-lg">
                            {event.organizer?.name || 'Event'}
                        </span>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <h3 className="font-bold text-xl text-gray-800 font-[family-name:var(--font-kodchasan)] group-hover:text-yellow-600 transition-colors duration-300">
                        {event.title}
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3 group-hover:text-yellow-600 transition-colors duration-300">
                            <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center group-hover:bg-yellow-100 transition-colors duration-300">
                                <Calendar className="h-4 w-4 text-yellow-500" />
                            </div>
                            <span className="font-[family-name:var(--font-kodchasan)]">
                                {new Date(event.date).toLocaleDateString('id-ID', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 group-hover:text-yellow-600 transition-colors duration-300">
                            <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center group-hover:bg-yellow-100 transition-colors duration-300">
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </div>
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
                        <div className="flex items-center gap-3 group-hover:text-yellow-600 transition-colors duration-300">
                            <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center group-hover:bg-yellow-100 transition-colors duration-300">
                                <MapPin className="h-4 w-4 text-yellow-500" />
                            </div>
                            <span className="font-[family-name:var(--font-kodchasan)]">{event.location}</span>
                        </div>
                    </div>
                    <button 
                        className="w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-yellow-400 hover:to-orange-400 hover:text-gray-800 transform hover:scale-105 shadow-lg hover:shadow-xl font-[family-name:var(--font-kodchasan)] group/button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick();
                        }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            Lihat Detail
                            <ArrowRight className="h-4 w-4 transform group-hover/button:translate-x-1 transition-transform duration-300" />
                        </span>
                    </button>
                </div>
            </div>
            
            {/* Enhanced Modal */}
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

// Enhanced Event Detail Modal with smooth animations
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideInUp">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-kodchasan)]">Detail Event</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Event Details */}
                <div className="p-6 space-y-8">
                    {/* Event Image */}
                    <div className="w-full h-80 bg-gray-200 rounded-xl overflow-hidden group">
                        <img 
                            src={event.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Event Info */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-kodchasan)]">{event.title}</h3>
                            <p className="text-xl text-gradient bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-medium font-[family-name:var(--font-kodchasan)]">
                                {event.organizer?.name}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <span className="font-[family-name:var(--font-kodchasan)] text-gray-700">
                                        {new Date(event.date).toLocaleDateString('id-ID', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <span className="font-[family-name:var(--font-kodchasan)] text-gray-700">
                                        {event.timeStart && event.timeEnd 
                                            ? `${event.timeStart} - ${event.timeEnd}`
                                            : new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                        }
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <span className="font-[family-name:var(--font-kodchasan)] text-gray-700">{event.location}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {event.maxParticipants && (
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                                        <p className="text-sm text-blue-600 font-[family-name:var(--font-kodchasan)] mb-1">Kapasitas</p>
                                        <p className="text-2xl font-bold text-blue-800 font-[family-name:var(--font-kodchasan)]">
                                            {event._count?.participants || 0} / {event.maxParticipants}
                                        </p>
                                        <p className="text-sm text-blue-600 font-[family-name:var(--font-kodchasan)]">peserta</p>
                                    </div>
                                )}
                                
                                {event.registrationDeadline && (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                                        <p className="text-sm text-orange-600 font-[family-name:var(--font-kodchasan)] mb-1">Batas Pendaftaran</p>
                                        <p className="text-lg font-semibold text-orange-800 font-[family-name:var(--font-kodchasan)]">
                                            {new Date(event.registrationDeadline).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <h4 className="font-bold text-gray-800 mb-3 font-[family-name:var(--font-kodchasan)] text-lg">Deskripsi Event</h4>
                                <p className="text-gray-600 leading-relaxed font-[family-name:var(--font-kodchasan)]">{event.description}</p>
                            </div>
                        )}

                        {/* Skills Required */}
                        {event.skills && event.skills.length > 0 && (
                            <div>
                                <h4 className="font-bold text-gray-800 mb-4 font-[family-name:var(--font-kodchasan)] text-lg">Skills yang Dibutuhkan</h4>
                                <div className="flex flex-wrap gap-3">
                                    {event.skills.map((skill: any, index: number) => (
                                        <span 
                                            key={skill.name} 
                                            className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-sm rounded-full font-[family-name:var(--font-kodchasan)] border border-yellow-200 hover:from-yellow-200 hover:to-orange-200 transition-all duration-300 animate-fadeInUp"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Action Buttons */}
                <div className="flex gap-4 p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 font-[family-name:var(--font-kodchasan)]"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handleRegister}
                        disabled={registerMutation.isPending}
                        className="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-orange-400 hover:to-yellow-400 text-gray-900 disabled:opacity-50 hover:scale-105 hover:shadow-lg font-[family-name:var(--font-kodchasan)] group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            {registerMutation.isPending ? 'Mendaftar...' : session ? 'Daftar Event' : 'Login untuk Daftar'}
                            {!registerMutation.isPending && <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Enhanced Ongoing Events Section
const OngoingEventsSection = () => {
    const [activeCategory, setActiveCategory] = useState("Pendidikan");
    
    const eventCategories = [
        { id: 1, name: "Pendidikan", icon: "📚" },
        { id: 2, name: "Akademik", icon: "🎓" },
        { id: 3, name: "Organisasi", icon: "🏢" },
        { id: 4, name: "Kompetisi", icon: "🏆" },
    ];

    const { data: events, isLoading } = api.event.getPublic.useQuery();
    const filteredEvents = events?.filter(event => true) || [];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-800 font-[family-name:var(--font-kodchasan)] animate-slideInLeft">
                            Ongoing events
                        </h2>
                        <p className="text-gray-600 mt-2 font-[family-name:var(--font-kodchasan)] animate-slideInLeft delay-100">
                            Discover amazing events happening around campus
                        </p>
                    </div>
                    <div className="flex gap-3 animate-slideInRight">
                        <button className="p-3 border border-gray-300 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-110 group">
                            <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-yellow-500" />
                        </button>
                        <button className="p-3 border border-gray-300 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-110 group">
                            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-yellow-500" />
                        </button>
                    </div>
                </div>

                {/* Enhanced Category filters */}
                <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                    {eventCategories.map((category, index) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.name)}
                            className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 font-[family-name:var(--font-kodchasan)] animate-fadeInUp flex items-center gap-2 ${
                                activeCategory === category.name
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 shadow-lg scale-105'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-yellow-300 hover:text-yellow-600 shadow-sm'
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <span>{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Enhanced Events grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-300 rounded"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                                <EventCard key={event.id} event={event} index={index} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 animate-fadeIn">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">📅</span>
                                </div>
                                <p className="text-gray-500 text-xl font-[family-name:var(--font-kodchasan)] mb-2">
                                    Belum ada event tersedia
                                </p>
                                <p className="text-gray-400 font-[family-name:var(--font-kodchasan)]">
                                    Event menarik akan segera hadir!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

// Enhanced Academic Vision Section
const AcademicVisionSection = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    
    const { data: events, isLoading } = api.event.getPublic.useQuery();

    const filteredEvents = events?.filter(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        
        switch (activeTab) {
            case 'upcoming':
                return eventDate >= now;
            case 'past':
                return eventDate < now;
            case 'recommend':
                return eventDate >= now;
            default:
                return true;
        }
    }) || [];

    const tabConfig = [
        { 
            id: 'upcoming', 
            label: 'Upcoming Event', 
            icon: '🚀',
            count: events?.filter(e => new Date(e.date) >= new Date()).length || 0
        },
        { 
            id: 'recommend', 
            label: 'Recommend Event', 
            icon: '⭐',
            count: events?.filter(e => new Date(e.date) >= new Date()).length || 0
        },
        { 
            id: 'past', 
            label: 'Past Event', 
            icon: '📚',
            count: events?.filter(e => new Date(e.date) < new Date()).length || 0
        }
    ];

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-400 rounded-full"></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-slideInUp">
                    <h2 className="text-5xl font-bold text-gray-800 mb-6 font-[family-name:var(--font-kodchasan)]">
                        Where your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">academic</span> vision<br />
                        becomes a reality
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-[family-name:var(--font-kodchasan)]">
                        Join thousands of students in their academic journey through exciting events and opportunities
                    </p>
                </div>

                <div className="mb-12">
                    {/* Enhanced Tab Navigation */}
                    <div className="flex justify-center gap-2 mb-12">
                        {tabConfig.map((tab, index) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 font-[family-name:var(--font-kodchasan)] animate-fadeInUp flex items-center gap-3 ${
                                    activeTab === tab.id 
                                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-xl scale-105' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 shadow-sm'
                                }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    activeTab === tab.id 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4 animate-slideInLeft">
                            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                            <span className="text-lg font-medium text-gray-700 font-[family-name:var(--font-kodchasan)]">
                                Featured Events
                            </span>
                        </div>
                        <div className="flex items-center gap-3 animate-slideInRight">
                            <span className="text-sm text-gray-600 font-[family-name:var(--font-kodchasan)] bg-gray-100 px-3 py-1 rounded-full">
                                {filteredEvents.length} / {events?.length || 0}
                            </span>
                            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-yellow-400 transition-all duration-300 hover:scale-110 group">
                                <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-yellow-500" />
                            </button>
                            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-yellow-400 transition-all duration-300 hover:scale-110 group">
                                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-yellow-500" />
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Events grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                                    <div className="h-48 bg-gray-300"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 bg-gray-300 rounded"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.slice(0, 4).map((event, index) => (
                                    <EventCard 
                                        key={event.id}
                                        event={event}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16 animate-fadeIn">
                                    <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="text-5xl">🎯</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 font-[family-name:var(--font-kodchasan)]">
                                        Belum ada event tersedia
                                    </h3>
                                    <p className="text-gray-500 font-[family-name:var(--font-kodchasan)] mb-6">
                                        untuk kategori ini. Event menarik akan segera hadir!
                                    </p>
                                    <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-6 py-3 rounded-full font-medium hover:from-orange-400 hover:to-yellow-400 transition-all duration-300 hover:scale-105 shadow-lg font-[family-name:var(--font-kodchasan)]">
                                        Notify Me
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// Enhanced Footer with modern design
const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-900 to-black text-white py-16 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full animate-spin-slow"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 border border-white rounded-full animate-spin-slow-reverse"></div>
                <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse"></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4 animate-slideInLeft">
                        <h3 className="text-3xl font-bold font-[family-name:var(--font-kodchasan)] bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            UACAD
                        </h3>
                        <p className="text-gray-300 font-[family-name:var(--font-kodchasan)] leading-relaxed">
                            Empowering students through seamless event management and academic excellence.
                        </p>
                        <div className="flex gap-4">
                            {['📧', '📱', '🌐'].map((icon, index) => (
                                <div 
                                    key={index}
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 cursor-pointer hover:scale-110"
                                >
                                    <span>{icon}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div className="space-y-4 animate-slideInUp delay-100">
                        <h4 className="text-lg font-semibold font-[family-name:var(--font-kodchasan)]">Quick Links</h4>
                        <ul className="space-y-2">
                            {['Events', 'About Us', 'Contact', 'Help'].map((link, index) => (
                                <li key={index}>
                                    <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-[family-name:var(--font-kodchasan)] hover:translate-x-1 transform inline-block">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Categories */}
                    <div className="space-y-4 animate-slideInUp delay-200">
                        <h4 className="text-lg font-semibold font-[family-name:var(--font-kodchasan)]">Categories</h4>
                        <ul className="space-y-2">
                            {['Academic', 'Organizations', 'Competitions', 'Workshops'].map((category, index) => (
                                <li key={index}>
                                    <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-[family-name:var(--font-kodchasan)] hover:translate-x-1 transform inline-block">
                                        {category}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Newsletter */}
                    <div className="space-y-4 animate-slideInRight">
                        <h4 className="text-lg font-semibold font-[family-name:var(--font-kodchasan)]">Stay Updated</h4>
                        <p className="text-gray-300 text-sm font-[family-name:var(--font-kodchasan)]">
                            Get notified about upcoming events
                        </p>
                        <div className="flex">
                            <input 
                                type="email" 
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-yellow-400 text-white font-[family-name:var(--font-kodchasan)]"
                            />
                            <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-r-lg font-medium hover:from-orange-400 hover:to-yellow-400 transition-all duration-300 font-[family-name:var(--font-kodchasan)]">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Section */}
                <div className="border-t border-gray-800 pt-8 text-center animate-fadeIn">
                    <p className="text-gray-400 font-[family-name:var(--font-kodchasan)]">
                        &copy; 2025 UACAD. All rights reserved. Made with ❤️ for students
                    </p>
                </div>
            </div>
        </footer>
    );
};

// Main Enhanced Landing Page Component
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <HeroSection />
            <OngoingEventsSection />
            <AcademicVisionSection />
            <Footer />
            
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes float-delay-1 {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                
                @keyframes float-delay-2 {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-25px); }
                }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes spin-slow-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                
                .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
                .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
                .animate-slideInLeft { animation: slideInLeft 0.8s ease-out; }
                .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
                .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-float-delay-1 { animation: float-delay-1 3s ease-in-out infinite 0.5s; }
                .animate-float-delay-2 { animation: float-delay-2 3s ease-in-out infinite 1s; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-spin-slow-reverse { animation: spin-slow-reverse 25s linear infinite; }
                
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-400 { animation-delay: 400ms; }
                .delay-500 { animation-delay: 500ms; }
            `}</style>
        </div>
    );
}