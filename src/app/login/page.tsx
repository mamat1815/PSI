"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle } from 'lucide-react';
export default function LoginPage() {
    const router = useRouter();
    const { status, data: session } = useSession();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => { if (searchParams.get('registered')) { setShowSuccess(true); const timer = setTimeout(() => setShowSuccess(false), 5000); return () => clearTimeout(timer); } }, [searchParams]);
    useEffect(() => {
        if (status === 'authenticated') {
            const userRole = session?.user?.role;
            if (userRole === 'Organisasi') {
                router.push('/dashboard');
            } else if (userRole === 'Mahasiswa') {
                router.push('/home'); // <-- Pastikan baris ini ada
            } else if (userRole === 'StaffKampus') {
                router.push('/staff'); 
            } else {
                router.push('/'); 
            }
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        const result = await signIn('credentials', { redirect: false, email, password });
        if (result?.error) { setError('Email atau password salah.'); setIsSubmitting(false); }
    };

    if (status === 'loading' || status === 'authenticated') return (<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-center text-3xl font-bold">Login</h1>
                {showSuccess && <div className="rounded-md bg-green-50 p-4"><div className="flex"><div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-green-400" /></div><div className="ml-3"><p className="text-sm font-medium text-green-800">Registrasi berhasil! Silakan login.</p></div></div></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-600">{error}</p>}
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border p-3"/>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border p-3"/>
                    <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-lg bg-yellow-400 py-3 px-4 font-semibold text-gray-800 hover:bg-yellow-500 disabled:bg-gray-300">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Login'}</button>
                </form>
            </div>
        </div>
    );
}

// // src/app/login/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { signIn, useSession } from "next-auth/react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { LogIn, Mail, KeyRound, Loader2, CheckCircle } from 'lucide-react';

// export default function LoginPage() {
//     const router = useRouter();
//     const { status, data: session } = useSession();
//     const searchParams = useSearchParams();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showSuccess, setShowSuccess] = useState(false);

//     // Menampilkan pesan sukses setelah registrasi
//     useEffect(() => {
//         if (searchParams.get('registered')) {
//             setShowSuccess(true);
//             const timer = setTimeout(() => setShowSuccess(false), 5000);
//             return () => clearTimeout(timer);
//         }
//     }, [searchParams]);
    
//     // Mengarahkan pengguna setelah login berhasil
//     useEffect(() => {
//         if (status === 'authenticated') {
//             const userRole = session?.user?.role;
//             if (userRole === 'Organisasi') {
//                 router.push('/dashboard'); // Arahkan organisasi ke dashboard
//             } else if (userRole === 'Mahasiswa') {
//                 router.push('/home'); // Ganti dengan URL dashboard mahasiswa
//             } else {
//                 router.push('/'); // Fallback
//             }
//         }
//     }, [status, session, router]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);
//         setError('');
//         const result = await signIn('credentials', { redirect: false, email, password });
//         if (result?.error) {
//             setError('Email atau password salah.');
//             setIsSubmitting(false);
//         }
//         // Jika berhasil, useEffect di atas akan menangani redirect
//     };

//     // Tampilkan loading saat sesi diperiksa atau saat sudah login dan sedang diarahkan
//     if (status === 'loading' || status === 'authenticated') {
//       return (
//         <div className="flex flex-col items-center justify-center min-h-screen">
//             <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
//         </div>
//       );
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
//             <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
//                 <div className="text-center">
//                     <LogIn className="mx-auto h-12 w-12 text-yellow-500" />
//                     <h1 className="mt-2 text-3xl font-bold">Login</h1>
//                 </div>
//                 {showSuccess && (
//                     <div className="rounded-md bg-green-50 p-4">
//                         <div className="flex">
//                             <div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-green-400" /></div>
//                             <div className="ml-3"><p className="text-sm font-medium text-green-800">Registrasi berhasil! Silakan login.</p></div>
//                         </div>
//                     </div>
//                 )}
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {error && <p className="text-red-600 text-sm text-center">{error}</p>}
//                     <div className="relative">
//                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                         <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 pl-10 border rounded-lg"/>
//                     </div>
//                     <div className="relative">
//                         <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 pl-10 border rounded-lg"/>
//                     </div>
//                     <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 font-semibold rounded-lg text-gray-800 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300">
//                         {isSubmitting ? <Loader2 className="animate-spin" /> : 'Login'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }