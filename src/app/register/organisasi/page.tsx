"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react';
import Link from "next/link";
export default function RegisterOrganisasiPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', category: '', description: '', contact: '' });
    const registerMutation = api.auth.registerOrganisasi.useMutation({ onSuccess: () => router.push('/login?registered=true') });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); registerMutation.mutate(formData); };
    return (
         <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-center text-3xl font-bold">Registrasi Organisasi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {registerMutation.isError && <p className="text-red-600">{registerMutation.error.message}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">Nama Organisasi</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3"/></div>
                        <div><label className="text-sm">Kategori</label><select name="category" value={formData.category} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3 bg-white"><option value="" disabled>Pilih...</option><option>BEM</option><option>Himpunan</option><option>UKM</option></select></div>
                    </div>
                    <div><label className="text-sm">Deskripsi</label><textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 w-full rounded-lg border p-3"></textarea></div>
                    <div><label className="text-sm">Email Resmi</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3"/></div>
                    <div><label className="text-sm">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3"/></div>
                    <div><label className="text-sm">Narahubung (Opsional)</label><input type="text" name="contact" value={formData.contact} onChange={handleChange} className="mt-1 w-full rounded-lg border p-3"/></div>
                    <button type="submit" disabled={registerMutation.isPending} className="flex w-full justify-center rounded-lg bg-yellow-400 py-3 px-4 font-semibold text-gray-800 hover:bg-yellow-500 disabled:bg-gray-300">{registerMutation.isPending ? <Loader2 className="animate-spin" /> : 'Daftar'}</button>
                </form>
                <p className="text-center text-sm"><Link href="/register" className="font-medium text-yellow-600 hover:underline">Kembali</Link></p>
            </div>
        </div>
    );
}
