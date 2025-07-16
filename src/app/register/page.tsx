// src/app/register/page.tsx
"use client";

import Link from 'next/link';
import { User, Building, GraduationCap, Users } from 'lucide-react';

export default function RegisterSelectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-3">
            UACAD
          </h1>
          <p className="text-xl text-gray-700 font-medium mb-2">
            Bergabunglah dengan Komunitas Kampus
          </p>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Pilih jenis akun yang ingin Anda buat untuk memulai perjalanan akademis yang luar biasa.
          </p>
        </div>
        
        {/* Selection Cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-10">
          <Link 
            href="/register/mahasiswa" 
            className="group relative overflow-hidden rounded-2xl border border-yellow-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl transition-all duration-300 group-hover:from-yellow-200 group-hover:to-amber-200">
                <User className="h-8 w-8 text-yellow-600 transition-colors group-hover:text-yellow-700" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-800 mb-1">Daftar sebagai Mahasiswa</h3>
                <p className="text-sm text-gray-600">Akses fitur pembelajaran dan komunitas</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/register/organisasi" 
            className="group relative overflow-hidden rounded-2xl border border-yellow-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl transition-all duration-300 group-hover:from-yellow-200 group-hover:to-amber-200">
                <Building className="h-8 w-8 text-yellow-600 transition-colors group-hover:text-yellow-700" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-800 mb-1">Daftar sebagai Organisasi</h3>
                <p className="text-sm text-gray-600">Kelola aktivitas dan member organisasi</p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white rounded-full shadow-md border border-yellow-100">
            <Users className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-gray-600">
              Sudah punya akun?
            </span>
            <Link 
              href="/login" 
              className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
            >
              Login di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}