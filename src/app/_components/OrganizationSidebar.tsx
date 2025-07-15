// src/app/_components/OrganizationSidebar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Settings, LogOut, BarChart, Users, MessageSquare, Lightbulb, Brain, Crown } from "lucide-react";

export default function OrganizationSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/manajemen", label: "Manajemen", icon: Calendar },
        { href: "/events", label: "Events & Peserta", icon: Users },
        { href: "/aspirasi-org", label: "Aspirasi Masuk", icon: MessageSquare },
        { href: "/rekomendasi-ai", label: "AI Rekomendasi", icon: Brain },
        { href: "/dashboard/report", label: "Laporan", icon: BarChart },
        { href: "/subscription", label: "Berlangganan", icon: Crown },
    ];

    return (
        <div className="fixed left-0 top-0 w-80 h-screen hidden md:flex z-30 bg-transparent">
            {/* Curved Background - Both Sides Curved with Floating Effect */}
            <div 
                className="absolute top-4 left-4 right-4 bottom-4 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-2xl"
                style={{
                    borderRadius: "20px",
                    filter: "drop-shadow(8px 0 25px rgba(0,0,0,0.3))"
                }}
            />
            
            {/* Content overlay */}
            <aside className="relative z-10 w-full flex flex-col text-slate-800 mt-4 mb-4 mx-4">
                <div className="p-6 flex flex-col h-full overflow-y-auto scrollbar-hide">
                    <h1 className="text-3xl font-bold mb-12 font-[family-name:var(--font-kodchasan)] text-slate-800 tracking-wider">UACAD</h1>
                    
                    <nav className="flex-grow">
                        <ul className="space-y-4">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}
                                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 group max-w-[240px] ${
                                            pathname === link.href || pathname.startsWith(link.href)
                                                ? 'bg-white/40 shadow-xl transform scale-105 text-slate-900 border border-white/50 backdrop-blur-md' 
                                                : 'hover:bg-white/25 hover:transform hover:scale-105 hover:shadow-lg text-slate-700 hover:text-slate-900 hover:border hover:border-white/30'
                                        }`}
                                    >
                                        <link.icon className={`h-6 w-6 transition-transform duration-300 ${
                                            pathname === link.href || pathname.startsWith(link.href) ? 'scale-110' : 'group-hover:scale-110'
                                        }`} />
                                        <span className="font-[family-name:var(--font-kodchasan)] text-base tracking-wide">{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    
                    <div className="border-t border-slate-700/25 pt-6 mt-6">
                        <div className="flex items-center gap-4 bg-white/30 rounded-2xl p-4 backdrop-blur-md border border-white/40 shadow-xl max-w-[240px]">
                            <img
                                src={session?.user?.image ?? `https://placehold.co/50x50/1e293b/FFC700?text=${session?.user?.name?.charAt(0)}&font=Inter`}
                                alt="User Avatar"
                                className="h-12 w-12 rounded-full object-cover border-2 border-white/70 shadow-lg"
                            />
                            <div className="flex-grow">
                                <p className="font-bold text-sm font-[family-name:var(--font-kodchasan)] text-slate-800 tracking-wide">{session?.user?.name}</p>
                                <p className="text-xs opacity-80 font-[family-name:var(--font-kodchasan)] text-slate-700">Organisasi</p>
                            </div>
                            <button 
                                onClick={() => signOut({ callbackUrl: '/' })} 
                                className="p-2 rounded-full hover:bg-white/50 transition-all duration-200 hover:scale-110 shadow-md"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5 text-slate-700"/>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
