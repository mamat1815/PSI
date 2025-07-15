"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { 
    Send, 
    MessageSquare, 
    Calendar, 
    Clock, 
    CheckCircle, 
    AlertTriangle,
    Building,
    Search,
    Filter,
    ChevronDown,
    Loader2
} from "lucide-react";

interface Aspiration {
    id: string;
    category: string;
    content: string;
    status: 'PENDING' | 'REVIEWED' | 'RESPONDED';
    organizerId: string | null;
    createdAt: string;
    updatedAt: string;
    response?: string | null;
    organizer: {
        name: string;
    } | null;
}

const AspirationForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState('');
    
    const { data: organizations } = api.user.getOrganizations.useQuery();
    const mutation = api.aspiration.submit.useMutation({
        onSuccess: () => {
            setCategory('');
            setContent('');
            setSelectedOrgId('');
            onSuccess();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrgId) return;
        
        mutation.mutate({ 
            category, 
            content, 
            organizerId: selectedOrgId 
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sampaikan Aspirasi Anda</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tujukan ke Organisasi
                    </label>
                    <select
                        value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                    >
                        <option value="" disabled>Pilih organisasi tujuan...</option>
                        {organizations?.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                    >
                        <option value="" disabled>Pilih kategori...</option>
                        <option value="Akademik">Akademik</option>
                        <option value="Fasilitas Kampus">Fasilitas Kampus</option>
                        <option value="Kegiatan Mahasiswa">Kegiatan Mahasiswa</option>
                        <option value="Organisasi">Organisasi</option>
                        <option value="Pelayanan">Pelayanan</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sampaikan Aspirasi Anda
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={6}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                        placeholder="Tuliskan masukan, saran, atau ide Anda di sini..."
                    />
                </div>
                
                {mutation.isError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{mutation.error.message}</p>
                    </div>
                )}
                
                <button
                    type="submit"
                    disabled={mutation.isPending || !selectedOrgId}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    {mutation.isPending ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    Kirim Aspirasi
                </button>
            </form>
        </div>
    );
};

const AspirationCard = ({ aspiration }: { aspiration: Aspiration }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Menunggu
                    </span>
                );
            case 'REVIEWED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Ditinjau
                    </span>
                );
            case 'RESPONDED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Direspons
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                                {aspiration.category}
                            </span>
                            {getStatusBadge(aspiration.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Building className="h-4 w-4" />
                            <span>Kepada: {aspiration.organizer?.name || 'Organisasi tidak diketahui'}</span>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(aspiration.createdAt).toLocaleDateString('id-ID')}
                        </div>
                    </div>
                </div>
                
                <div className="mb-4">
                    <p className={`text-gray-700 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {aspiration.content}
                    </p>
                    {aspiration.content.length > 150 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium mt-2"
                        >
                            {isExpanded ? 'Sembunyikan' : 'Baca selengkapnya'}
                        </button>
                    )}
                </div>
                
                {aspiration.response && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Respons Organisasi:</h4>
                        <p className="text-sm text-green-700">{aspiration.response}</p>
                        <p className="text-xs text-green-600 mt-2">
                            Direspons pada {new Date(aspiration.updatedAt).toLocaleDateString('id-ID')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function AspirationPage() {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    
    const { data: aspirations, refetch } = api.aspiration.getMyAspirations.useQuery();
    
    const filteredAspirations = useMemo(() => {
        if (!aspirations) return [];
        
        return aspirations.filter(aspiration => {
            const matchesSearch = searchQuery === '' || 
                aspiration.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                aspiration.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                aspiration.organizer.name?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === '' || aspiration.status === statusFilter;
            const matchesCategory = categoryFilter === '' || aspiration.category === categoryFilter;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [aspirations, searchQuery, statusFilter, categoryFilter]);
    
    const categories = useMemo(() => {
        if (!aspirations) return [];
        const cats = aspirations.map(a => a.category);
        return [...new Set(cats)];
    }, [aspirations]);
    
    const handleFormSuccess = () => {
        refetch();
        setActiveTab('history');
    };

    const tabs = [
        { id: 'new' as const, name: 'Buat Aspirasi', icon: Send },
        { id: 'history' as const, name: 'Riwayat Aspirasi', icon: MessageSquare },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Aspirasi Mahasiswa</h1>
                <p className="text-gray-600">
                    Sampaikan masukan, saran, dan ide Anda kepada organisasi kampus
                </p>
            </header>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'border-yellow-500 text-yellow-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'new' && (
                <div className="max-w-4xl">
                    <AspirationForm onSuccess={handleFormSuccess} />
                </div>
            )}

            {activeTab === 'history' && (
                <div>
                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari aspirasi berdasarkan konten atau organisasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 bg-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="PENDING">Menunggu</option>
                                <option value="REVIEWED">Ditinjau</option>
                                <option value="RESPONDED">Direspons</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 bg-white"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            Menampilkan {filteredAspirations.length} dari {aspirations?.length || 0} aspirasi
                        </p>
                    </div>

                    {/* Aspirations List */}
                    {filteredAspirations.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-md">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {aspirations?.length === 0 ? 'Belum ada aspirasi' : 'Tidak ada aspirasi ditemukan'}
                            </h3>
                            <p className="text-gray-500">
                                {aspirations?.length === 0 
                                    ? 'Mulai sampaikan aspirasi Anda kepada organisasi kampus'
                                    : 'Coba ubah kata kunci pencarian atau filter yang digunakan'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredAspirations.map((aspiration) => (
                                <AspirationCard key={aspiration.id} aspiration={aspiration} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
