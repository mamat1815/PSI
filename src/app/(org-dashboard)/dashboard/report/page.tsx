// src/app/(org-dashboard)/dashboard/laporan/page.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from "lucide-react";

const EventReportChart = () => {
    const { data, isLoading, isError } = api.report.getEventChartData.useQuery();

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400"/></div>;
    if (isError) return <div className="h-96 flex items-center justify-center text-red-500">Gagal memuat data chart event.</div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="partisipan" fill="#8884d8" name="Jumlah Partisipan" />
                <Bar dataKey="rating" fill="#82ca9d" name="Rating Rata-rata" />
            </BarChart>
        </ResponsiveContainer>
    );
};

const AspirationReportChart = () => {
    const { data, isLoading, isError } = api.report.getAspirationSentimentData.useQuery();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400"/></div>;
    if (isError) return <div className="h-96 flex items-center justify-center text-red-500">Gagal memuat data sentimen.</div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(0)}%`} outerRadius={150} fill="#8884d8" dataKey="value">
                    {data?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default function LaporanPage() {
    const [activeTab, setActiveTab] = useState('event');

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Laporan & Analisis</h1>
                <p className="mt-1 text-gray-600">Visualisasi data dari aktivitas organisasi Anda.</p>
            </header>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('event')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'event' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Laporan Event
                    </button>
                    <button onClick={() => setActiveTab('aspirasi')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'aspirasi' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Analisis Aspirasi
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'event' ? (
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Perbandingan Partisipan dan Rating Event</h2>
                        <EventReportChart />
                    </div>
                ) : (
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Distribusi Sentimen Aspirasi Mahasiswa</h2>
                        <AspirationReportChart />
                    </div>
                )}
            </div>
        </div>
    );
}
