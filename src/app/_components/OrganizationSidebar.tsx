// src/app/_components/OrganizationSidebar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Settings, LogOut, BarChart, Users } from "lucide-react";

export default function OrganizationSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/manajemen", label: "Manajemen", icon: Calendar },
        { href: "/events", label: "Events & Peserta", icon: Users },
        { href: "/dashboard/report", label: "Laporan", icon: BarChart },
    ];

    return (
        <aside className="w-72 h-screen bg-yellow-400 p-6 flex-col text-slate-800 hidden md:flex">
            <h1 className="text-3xl font-bold mb-12">UACAD</h1>
            <nav className="flex-grow">
                <ul>
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href}
                                className={`flex items-center gap-4 px-4 py-3 my-2 rounded-lg font-semibold transition-colors duration-200 ${
                                    pathname.startsWith(link.href) ? 'bg-white shadow-md' : 'hover:bg-white/50'
                                }`}
                            >
                                <link.icon className="h-6 w-6" />
                                <span>{link.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="border-t border-slate-600/30 pt-4">
                <div className="flex items-center gap-3">
                    <img
                        src={session?.user?.image ?? `https://placehold.co/40x40/FFC700/0B2A43?text=${session?.user?.name?.charAt(0)}`}
                        alt="User Avatar"
                        className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-grow">
                        <p className="font-bold text-sm">{session?.user?.name}</p>
                        <p className="text-xs">Organisasi</p>
                    </div>
                    <button className="p-2 rounded-full hover:bg-white/50"><Settings className="h-5 w-5"/></button>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 rounded-full hover:bg-white/50"><LogOut className="h-5 w-5"/></button>
                </div>
            </div>
        </aside>
    );
}
