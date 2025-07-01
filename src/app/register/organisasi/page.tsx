// src/app/register/organisasi/page.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Building, Loader2 } from 'lucide-react';
import Link from "next/link";

export default function RegisterOrganisasiPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        category: '',
        description: '',
        contact: '',
    });

    const registerMutation = api.auth.registerOrganisasi.useMutation({
        onSuccess: () => {
            router.push('/login?registered=true');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <Building className="mx-auto h-12 w-12 text-yellow-500" />
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Registrasi Organisasi</h1>
                    <p className="mt-1 text-sm text-gray-600">Daftarkan BEM, UKM, atau Himpunan Anda.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {registerMutation.isError && (
                        <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">{registerMutation.error.message}</p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium">Nama Organisasi</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Kategori</label>
                             <select name="category" value={formData.category} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3 bg-white">
                                <option value="" disabled>Pilih satu...</option>
                                <option value="Badan Eksekutif Mahasiswa">BEM</option>
                                <option value="Himpunan Mahasiswa">Himpunan Mahasiswa</option>
                                <option value="Unit Kegiatan Mahasiswa">UKM</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Deskripsi Singkat</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 w-full rounded-lg border p-3" placeholder="Jelaskan tentang organisasi Anda..."></textarea>
                    </div>

                     <div>
                        <label className="text-sm font-medium">Email Resmi</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Password Akun</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Narahubung (WA/Line, Opsional)</label>
                        <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="mt-1 w-full rounded-lg border p-3"/>
                    </div>


                    <button type="submit" disabled={registerMutation.isPending} className="flex w-full justify-center rounded-lg bg-yellow-400 py-3 px-4 font-semibold text-gray-800 hover:bg-yellow-500 disabled:bg-gray-300">
                        {registerMutation.isPending ? <Loader2 className="animate-spin" /> : 'Daftar Akun Organisasi'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500">
                  <Link href="/register" className="font-medium text-yellow-600 hover:underline">
                    Kembali ke pilihan registrasi
                  </Link>
                </p>
            </div>
        </div>
    );
}
