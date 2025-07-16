"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Loader2, Building, Mail, Lock, User, FileText, Phone, ArrowLeft, Check } from 'lucide-react';
import Link from "next/link";

export default function RegisterOrganisasiPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        category: '', 
        description: '', 
        contact: '' 
    });

    const registerMutation = api.auth.registerOrganisasi.useMutation({ 
        onSuccess: () => router.push('/login?registered=true') 
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg mb-4">
                        <Building className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">
                        Registrasi Organisasi
                    </h1>
                    <p className="text-gray-600">Daftarkan organisasi Anda untuk bergabung dengan komunitas kampus</p>
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

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Organisasi */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nama Organisasi
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Masukkan nama organisasi"
                                    />
                                </div>
                            </div>

                            {/* Kategori */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kategori
                                </label>
                                <div className="relative">
                                    <select 
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                                    >
                                        <option value="" disabled>Pilih kategori...</option>
                                        <option value="BEM">BEM</option>
                                        <option value="Himpunan">Himpunan</option>
                                        <option value="UKM">UKM</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Deskripsi Organisasi
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    required 
                                    rows={4} 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Jelaskan tentang organisasi Anda..."
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Resmi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="organisasi@example.com"
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
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Masukkan password yang kuat"
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Narahubung <span className="text-gray-400 font-normal">(Opsional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    name="contact" 
                                    value={formData.contact} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Nomor telepon atau WhatsApp"
                                />
                            </div>
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
                                    Mendaftarkan...
                                </>
                            ) : (
                                <>
                                    <Check className="h-5 w-5 mr-2" />
                                    Daftar Organisasi
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