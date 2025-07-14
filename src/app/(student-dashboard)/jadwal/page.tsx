// src/app/(student-dashboard)/jadwal/page.tsx
import { api } from "~/trpc/server";

export default async function JadwalPage() {
    const jadwalKuliah = await api.jadwal.getMine.query();

    type JadwalKuliah = {
        id: string;
        hari: string;
        jamMulai: string;
        jamSelesai: string;
        mataKuliah: string;
        ruangan: string;
        dosen: string | null;
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Jadwal Kuliah Anda</h1>
            </header>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruangan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosen</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {jadwalKuliah.length > 0 ? (
                            jadwalKuliah.map((item: JadwalKuliah) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.hari}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.jamMulai} - {item.jamSelesai}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.mataKuliah}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ruangan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dosen}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Anda belum mengunggah jadwal kuliah.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
