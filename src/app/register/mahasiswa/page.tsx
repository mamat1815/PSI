// src/app/register/mahasiswa/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { User, Loader2, GraduationCap, Mail, Lock, FileText, Upload, ArrowLeft, Check, UserCheck } from 'lucide-react';
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamic import untuk CreatableSelect untuk menghindari SSR issues
const CreatableSelect = dynamic(() => import('react-select/creatable'), {
    ssr: false,
    loading: () => <div className="mt-1 w-full rounded-lg border p-3 text-gray-400 bg-gray-50">Loading skills...</div>
});

export default function RegisterMahasiswaPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [nim, setNim] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [scheduleData, setScheduleData] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState<readonly { value: string; label: string; }[]>([]);
    const [isXLSXLoaded, setIsXLSXLoaded] = useState(false);

    // Load XLSX library
    useEffect(() => {
        if (!(window as any).XLSX) {
            const script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
            script.onload = () => setIsXLSXLoaded(true);
            document.head.appendChild(script);
        } else {
            setIsXLSXLoaded(true);
        }
    }, []);

    const { data: skillsOptions, isLoading: skillsLoading } = api.skill.getAll.useQuery(undefined, {
        select: (data) => data.map(skill => ({ value: skill.name, label: skill.name }))
    });
    const createSkillMutation = api.skill.create.useMutation({
        onSuccess: () => { utils.skill.getAll.invalidate(); }
    });
    const utils = api.useUtils();

    const registerMutation = api.auth.registerMahasiswa.useMutation({
        onSuccess: () => { router.push('/login?registered=true'); },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isXLSXLoaded || !(window as any).XLSX) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            const workbook = (window as any).XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName!];
            const json = (window as any).XLSX.utils.sheet_to_json(worksheet);
            setScheduleData(json as any);
        };
        reader.readAsBinaryString(file);
    };

    const handleCreateSkill = useCallback(async (inputValue: string) => {
        const newOption = { value: inputValue, label: inputValue };
        setSelectedSkills((prev) => [...(prev ?? []), newOption]);
        await createSkillMutation.mutateAsync({ name: inputValue });
    }, [createSkillMutation]);

    const handleSkillsChange = (newValue: unknown) => {
        setSelectedSkills((newValue as { value: string; label: string; }[]) ?? []);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate({ name, nim, email, password, skills: selectedSkills as any, schedule: scheduleData });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">
                        Registrasi Mahasiswa
                    </h1>
                    <p className="text-gray-600">Bergabunglah dengan komunitas mahasiswa dan mulai perjalanan akademis Anda</p>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-yellow-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {registerMutation.isError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-red-600 text-sm font-medium">{registerMutation.error.message}</p>
                            </div>
                        )}

                        {/* Nama Lengkap */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Masukkan nama lengkap Anda"
                                />
                            </div>
                        </div>

                        {/* NIM */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                NIM
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCheck className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    value={nim} 
                                    onChange={(e) => setNim(e.target.value)} 
                                    required 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Masukkan NIM Anda"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Kampus
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="mahasiswa@university.edu"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Masukkan password yang kuat"
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Soft Skills <span className="text-gray-400 font-normal">(Opsional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none z-10">
                                    <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <div className="pl-10">
                                    <CreatableSelect 
                                        isMulti 
                                        isClearable 
                                        value={selectedSkills} 
                                        onChange={handleSkillsChange} 
                                        options={skillsOptions} 
                                        isLoading={skillsLoading} 
                                        onCreateOption={handleCreateSkill} 
                                        placeholder="Pilih atau buat skill baru..." 
                                        formatCreateLabel={(inputValue) => `Tambah skill: "${inputValue}"`} 
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                border: 'none',
                                                boxShadow: 'none',
                                                backgroundColor: 'transparent',
                                                minHeight: '48px',
                                            }),
                                            valueContainer: (base) => ({
                                                ...base,
                                                padding: '8px 0',
                                            }),
                                        }}
                                    />
                                </div>
                                <div className="absolute inset-0 border border-gray-300 rounded-xl pointer-events-none group-focus-within:ring-2 group-focus-within:ring-yellow-500 group-focus-within:border-transparent transition-all duration-200 bg-gray-50 group-focus-within:bg-white" />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload Jadwal <span className="text-gray-400 font-normal">(XLSX, Opsional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <Upload className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    accept=".xlsx" 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 file:transition-colors"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-10">Upload file jadwal kuliah untuk sinkronisasi otomatis</p>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={registerMutation.isPending} 
                            className="w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 focus:ring-4 focus:ring-yellow-200 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                            {registerMutation.isPending ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Mendaftarkan Akun...
                                </>
                            ) : (
                                <>
                                    <Check className="h-5 w-5 mr-2" />
                                    Daftar Akun Mahasiswa
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <Link 
                        href="/register" 
                        className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md border border-yellow-100 font-medium text-yellow-600 hover:text-yellow-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Pilihan Registrasi
                    </Link>
                </div>
            </div>
        </div>
    );
}

// "use client";
// import { useState } from "react";
// import { api } from "~/trpc/react";
// import { useRouter } from "next/navigation";
// import { Loader2 } from 'lucide-react';
// import Link from "next/link";
// export default function RegisterMahasiswaPage() {
//     const router = useRouter();
//     const [name, setName] = useState('');
//     const [nim, setNim] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [scheduleData, setScheduleData] = useState([]);
//     const registerMutation = api.auth.registerMahasiswa.useMutation({ onSuccess: () => router.push('/login?registered=true') });
//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file || !(window as any).XLSX) return;
//         const reader = new FileReader();
//         reader.onload = (event) => {
//             const data = event.target?.result;
//             const workbook = (window as any).XLSX.read(data, { type: 'binary' });
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName!];
//             const json = (window as any).XLSX.utils.sheet_to_json(worksheet);
//             setScheduleData(json as any);
//         };
//         reader.readAsBinaryString(file);
//     };
//     const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); registerMutation.mutate({ name, nim, email, password, schedule: scheduleData }); };
//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
//             <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js" async></script>
//             <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
//                 <h1 className="text-center text-3xl font-bold">Registrasi Mahasiswa</h1>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {registerMutation.isError && <p className="text-red-600">{registerMutation.error.message}</p>}
//                     <input type="text" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border p-3"/>
//                     <input type="text" placeholder="NIM" value={nim} onChange={(e) => setNim(e.target.value)} required className="w-full rounded-lg border p-3"/>
//                     <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border p-3"/>
//                     <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border p-3"/>
//                     <div><label className="block text-sm font-medium">Upload Jadwal (Opsional)</label><input type="file" onChange={handleFileChange} accept=".xlsx" className="mt-1 w-full text-sm"/></div>
//                     <button type="submit" disabled={registerMutation.isPending} className="flex w-full justify-center rounded-lg bg-yellow-400 py-3 px-4 font-semibold text-gray-800 hover:bg-yellow-500 disabled:bg-gray-300">{registerMutation.isPending ? <Loader2 className="animate-spin" /> : 'Daftar'}</button>
//                 </form>
//                 <p className="text-center text-sm"><Link href="/register" className="font-medium text-yellow-600 hover:underline">Kembali</Link></p>
//             </div>
//         </div>
//     );
// }

// // // src/app/register/mahasiswa/page.tsx
// // "use client";

// // import { useState } from "react";
// // import { api } from "~/trpc/react";
// // import { useRouter } from "next/navigation";
// // import { User, Loader2 } from 'lucide-react';
// // import Link from "next/link";

// // export default function RegisterMahasiswaPage() {
// //     const router = useRouter();
// //     const [name, setName] = useState('');
// //     const [nim, setNim] = useState('');
// //     const [email, setEmail] = useState('');
// //     const [password, setPassword] = useState('');
// //     const [scheduleData, setScheduleData] = useState([]);

// //     const registerMutation = api.auth.registerMahasiswa.useMutation({
// //         onSuccess: () => {
// //             router.push('/login?registered=true');
// //         },
// //     });

// //     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //         const file = e.target.files?.[0];
// //         if (!file || !(window as any).XLSX) return;
        
// //         const reader = new FileReader();
// //         reader.onload = (event) => {
// //             const data = event.target?.result;
// //             const workbook = (window as any).XLSX.read(data, { type: 'binary' });
// //             const sheetName = workbook.SheetNames[0];
// //             const worksheet = workbook.Sheets[sheetName!];
// //             const json = (window as any).XLSX.utils.sheet_to_json(worksheet);
// //             setScheduleData(json as any);
// //         };
// //         reader.readAsBinaryString(file);
// //     };

// //     const handleSubmit = (e: React.FormEvent) => {
// //         e.preventDefault();
// //         registerMutation.mutate({ name, nim, email, password, schedule: scheduleData });
// //     };

// //     return (
// //         <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
// //             <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js" async></script>
// //             <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
// //                 <div className="text-center">
// //                     <User className="mx-auto h-12 w-12 text-yellow-500" />
// //                     <h1 className="mt-2 text-3xl font-bold text-gray-900">Registrasi Mahasiswa</h1>
// //                 </div>

// //                 <form onSubmit={handleSubmit} className="space-y-4">
// //                     {registerMutation.isError && (
// //                         <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">{registerMutation.error.message}</p>
// //                     )}

// //                     <div>
// //                         <label className="text-sm font-medium">Nama Lengkap</label>
// //                         <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/>
// //                     </div>
// //                     <div>
// //                         <label className="text-sm font-medium">NIM</label>
// //                         <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/>
// //                     </div>
// //                     <div>
// //                         <label className="text-sm font-medium">Email Kampus</label>
// //                         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/>
// //                     </div>
// //                     <div>
// //                         <label className="text-sm font-medium">Password</label>
// //                         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/>
// //                     </div>
// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700">Upload Jadwal (XLSX, Opsional)</label>
// //                         <input type="file" onChange={handleFileChange} accept=".xlsx" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/>
// //                     </div>

// //                     <button type="submit" disabled={registerMutation.isPending} className="flex w-full justify-center rounded-lg bg-yellow-400 py-3 px-4 font-semibold text-gray-800 hover:bg-yellow-500 disabled:bg-gray-300">
// //                         {registerMutation.isPending ? <Loader2 className="animate-spin" /> : 'Daftar Akun'}
// //                     </button>
// //                 </form>
// //                 <p className="text-center text-sm text-gray-500">
// //                   <Link href="/register" className="font-medium text-yellow-600 hover:underline">
// //                     Kembali ke pilihan registrasi
// //                   </Link>
// //                 </p>
// //             </div>
// //         </div>
// //     );
// // }
