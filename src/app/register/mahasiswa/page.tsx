// src/app/register/mahasiswa/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { User, Loader2 } from 'lucide-react';
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamic import untuk CreatableSelect untuk menghindari SSR issues
const CreatableSelect = dynamic(() => import('react-select/creatable'), {
    ssr: false,
    loading: () => <div className="mt-1 w-full rounded-lg border p-3 text-gray-400">Loading skills...</div>
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-yellow-500" />
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Registrasi Mahasiswa</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {registerMutation.isError && (<p className="rounded-md bg-red-100 p-3 text-sm text-red-700">{registerMutation.error.message}</p>)}
                    <div><label className="text-sm font-medium">Nama Lengkap</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/></div>
                    <div><label className="text-sm font-medium">NIM</label><input type="text" value={nim} onChange={(e) => setNim(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/></div>
                    <div><label className="text-sm font-medium">Email Kampus</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/></div>
                    <div><label className="text-sm font-medium">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/></div>
                    <div>
                        <label className="text-sm font-medium">Soft Skills (Opsional)</label>
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
                            className="mt-1"
                        />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Upload Jadwal (XLSX, Opsional)</label><input type="file" onChange={handleFileChange} accept=".xlsx" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/></div>
                    <button type="submit" disabled={registerMutation.isPending} className="flex w-full justify-center rounded-lg bg-yellow-400 py-3 px-4 font-semibold text-gray-800 hover:bg-yellow-500 disabled:bg-gray-300">
                        {registerMutation.isPending ? <Loader2 className="animate-spin" /> : 'Daftar Akun'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500"><Link href="/register" className="font-medium text-yellow-600 hover:underline">Kembali ke pilihan registrasi</Link></p>
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
