"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Shield,
  DollarSign,
  FileText,
  Database
} from "lucide-react";

export default function AdminSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navLinks = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/payments", label: "Pembayaran", icon: CreditCard },
        { href: "/admin/subscriptions", label: "Berlangganan", icon: DollarSign },
        { href: "/admin/organizations", label: "Organisasi", icon: Users },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/reports", label: "Laporan", icon: FileText },
        { href: "/admin/system", label: "Sistem", icon: Database },
        { href: "/admin/settings", label: "Pengaturan", icon: Settings },
    ];

    return (
        <div className="fixed left-0 top-0 w-80 h-screen hidden md:flex z-30 bg-transparent">
            {/* Curved Background with Admin Theme */}
            <div 
                className="absolute top-4 left-4 right-4 bottom-4 bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-2xl"
                style={{
                    borderRadius: "20px",
                    filter: "drop-shadow(8px 0 25px rgba(0,0,0,0.4))"
                }}
            />
            
            {/* Content overlay */}
            <aside className="relative z-10 w-full flex flex-col text-white mt-4 mb-4 mx-4">
                <div className="p-6 flex flex-col h-full overflow-y-auto scrollbar-hide">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-8 w-8 text-blue-400" />
                            <h1 className="text-2xl font-bold font-[family-name:var(--font-kodchasan)] text-white tracking-wider">
                                UACAD
                            </h1>
                        </div>
                        <p className="text-blue-300 text-sm font-medium">Super Admin Panel</p>
                    </div>
                    
                    <nav className="flex-grow">
                        <ul className="space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}
                                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 group max-w-[240px] ${
                                            pathname === link.href || pathname.startsWith(link.href)
                                                ? 'bg-blue-600/40 shadow-xl transform scale-105 text-white border border-blue-400/50 backdrop-blur-md' 
                                                : 'hover:bg-white/10 hover:transform hover:scale-105 hover:shadow-lg text-gray-300 hover:text-white hover:border hover:border-white/20'
                                        }`}
                                    >
                                        <link.icon className={`h-6 w-6 transition-transform duration-300 ${
                                            pathname === link.href || pathname.startsWith(link.href) ? 'scale-110 text-blue-400' : 'group-hover:scale-110'
                                        }`} />
                                        <span className="font-[family-name:var(--font-kodchasan)] text-base tracking-wide">{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    
                    <div className="border-t border-gray-600/50 pt-6 mt-6">
                        <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20 shadow-xl max-w-[240px]">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/30 shadow-lg">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-sm font-[family-name:var(--font-kodchasan)] text-white tracking-wide">
                                    {session?.user?.name || "Super Admin"}
                                </p>
                                <p className="text-xs opacity-80 font-[family-name:var(--font-kodchasan)] text-blue-300">
                                    Administrator
                                </p>
                            </div>
                            <button 
                                onClick={() => signOut({ callbackUrl: '/admin/login' })} 
                                className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 shadow-md"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5 text-gray-300 hover:text-white"/>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
