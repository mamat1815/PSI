"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { 
    MessageSquare, 
    Calendar, 
    Clock, 
    CheckCircle, 
    AlertTriangle,
    Building,
    Search,
    Filter,
    ChevronDown,
    Loader2,
    Reply,
    User,
    Send
} from "lucide-react";

interface AspirationIncoming {
    id: string;
    category: string;
    content: string;
    status: 'PENDING' | 'REVIEWED' | 'RESPONDED';
    createdAt: string;
    updatedAt: string;
    response?: string | null;
    user: {
        name: string;
        email: string;
    };
}

const AspirationIncomingCard = ({ aspiration, onRespond }: { 
    aspiration: AspirationIncoming;
    onRespond: (id: string, response: string) => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState(aspiration.response || '');
    
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

    const handleSubmitReply = () => {
        if (replyText.trim()) {
            onRespond(aspiration.id, replyText.trim());
            setIsReplying(false);
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
                            <User className="h-4 w-4" />
                            <span>Dari: {aspiration.user.name}</span>
                            <span className="text-gray-300">•</span>
                            <span>{aspiration.user.email}</span>
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
                    <h4 className="font-medium text-gray-900 mb-2">Isi Aspirasi:</h4>
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
                
                {aspiration.response && !isReplying && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Respons Anda:</h4>
                        <p className="text-sm text-blue-700">{aspiration.response}</p>
                        <p className="text-xs text-blue-600 mt-2">
                            Direspons pada {new Date(aspiration.updatedAt).toLocaleDateString('id-ID')}
                        </p>
                        <button
                            onClick={() => setIsReplying(true)}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Edit Respons
                        </button>
                    </div>
                )}
                
                {(aspiration.status === 'PENDING' || isReplying) && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">
                            {aspiration.response ? 'Edit Respons:' : 'Berikan Respons:'}
                        </h4>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                            placeholder="Tulis respons Anda untuk aspirasi ini..."
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleSubmitReply}
                                disabled={!replyText.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                <Send className="h-4 w-4" />
                                {aspiration.response ? 'Update Respons' : 'Kirim Respons'}
                            </button>
                            {isReplying && (
                                <button
                                    onClick={() => {
                                        setIsReplying(false);
                                        setReplyText(aspiration.response || '');
                                    }}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function AspirationOrgPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'RESPONDED'>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Akademik' | 'Fasilitas' | 'Kegiatan' | 'Lainnya'>('ALL');

    // Get aspirations for this organization
    const { data: aspirations, isLoading, refetch } = api.aspiration.getForOrganization.useQuery();
    
    // Mutation for responding to aspirations
    const respondMutation = api.aspiration.respond.useMutation({
        onSuccess: () => {
            refetch();
        },
    });

    const handleRespond = (aspirationId: string, response: string) => {
        respondMutation.mutate({
            aspirationId,
            response,
        });
    };

    const filteredAspirations = useMemo(() => {
        if (!aspirations) return [];
        
        return aspirations.filter((aspiration) => {
            const matchesSearch = aspiration.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                aspiration.user.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || aspiration.status === statusFilter;
            const matchesCategory = categoryFilter === 'ALL' || aspiration.category === categoryFilter;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [aspirations, searchTerm, statusFilter, categoryFilter]);

    const stats = useMemo(() => {
        if (!aspirations) return { total: 0, pending: 0, responded: 0 };
        
        return {
            total: aspirations.length,
            pending: aspirations.filter(a => a.status === 'PENDING').length,
            responded: aspirations.filter(a => a.status === 'RESPONDED').length,
        };
    }, [aspirations]);

    if (isLoading) {
        return (
            <div className="min-h-screen p-8 bg-gray-50">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin h-8 w-8 text-yellow-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <MessageSquare className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Aspirasi Masuk</h1>
                            <p className="text-gray-600">Kelola aspirasi yang masuk dari mahasiswa</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <MessageSquare className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Aspirasi</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Menunggu Respons</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Sudah Direspons</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.responded}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cari Aspirasi
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari berdasarkan isi atau nama mahasiswa..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Menunggu</option>
                                <option value="REVIEWED">Ditinjau</option>
                                <option value="RESPONDED">Direspons</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter Kategori
                            </label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value as any)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            >
                                <option value="ALL">Semua Kategori</option>
                                <option value="Akademik">Akademik</option>
                                <option value="Fasilitas">Fasilitas</option>
                                <option value="Kegiatan">Kegiatan</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Aspirations List */}
                <div className="space-y-6">
                    {filteredAspirations.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Aspirasi</h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' 
                                    ? 'Tidak ada aspirasi yang sesuai dengan filter Anda.'
                                    : 'Belum ada aspirasi yang masuk untuk organisasi Anda.'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredAspirations.map((aspiration) => (
                            <AspirationIncomingCard 
                                key={aspiration.id} 
                                aspiration={aspiration}
                                onRespond={handleRespond}
                            />
                        ))
                    )}
                </div>

                {respondMutation.isError && (
                    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
                        <p className="text-sm text-red-600">Gagal mengirim respons. Silakan coba lagi.</p>
                    </div>
                )}

                {respondMutation.isSuccess && (
                    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 max-w-sm">
                        <p className="text-sm text-green-600">Respons berhasil dikirim!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
