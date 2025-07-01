// src/app/register/page.tsx
"use client";

import Link from 'next/link';
import { User, Building } from 'lucide-react';

export default function RegisterSelectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-yellow-500">UACAD</h1>
        <p className="mt-2 text-lg text-gray-600">Bergabunglah dengan Komunitas Kampus</p>
        <p className="mt-4 text-gray-500">Pilih jenis akun yang ingin Anda buat.</p>
        
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link href="/register/mahasiswa" className="group flex flex-col items-center justify-center space-y-3 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-yellow-400 hover:shadow-lg">
            <User className="h-12 w-12 text-gray-400 transition-colors group-hover:text-yellow-500" />
            <span className="font-semibold text-gray-800">Daftar sebagai Mahasiswa</span>
          </Link>
          
          <Link href="/register/organisasi" className="group flex flex-col items-center justify-center space-y-3 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-yellow-400 hover:shadow-lg">
            <Building className="h-12 w-12 text-gray-400 transition-colors group-hover:text-yellow-500" />
            <span className="font-semibold text-gray-800">Daftar sebagai Organisasi</span>
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-yellow-600 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
