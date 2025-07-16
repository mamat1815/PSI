"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  Mail,
  Lock,
  LogIn,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered")) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session?.user?.role;
      if (userRole === "Organisasi") {
        router.push("/dashboard");
      } else if (userRole === "Mahasiswa") {
        router.push("/home");
      } else if (userRole === "StaffKampus") {
        router.push("/staff");
      } else {
        router.push("/");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.error) {
      setError("Email atau password salah.");
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="font-medium text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-xl">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-5xl font-bold text-transparent">
            UACAD
          </h1>
          <p className="mb-2 text-xl font-medium text-gray-700">
            Selamat Datang Kembali
          </p>
          <p className="text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 transform animate-pulse rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-green-800">
                  Registrasi berhasil! Silakan login dengan akun Anda.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="rounded-3xl border border-yellow-100 bg-white p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="group">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-yellow-500" />
                </div>
                <input
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 py-4 pr-4 pl-10 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-yellow-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 py-4 pr-12 pl-10 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-yellow-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full transform items-center justify-center rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-yellow-500 hover:to-amber-600 focus:ring-4 focus:ring-yellow-200 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sedang Masuk...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Masuk ke Akun
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="mb-4 text-gray-600">Belum punya akun?</p>
            <a
              href="/register"
              className="inline-flex transform items-center rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:scale-105 hover:border-yellow-200 hover:from-yellow-50 hover:to-amber-50 hover:text-yellow-700 hover:shadow-md"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Daftar Sekarang
            </a>
          </div>
        </div>
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
