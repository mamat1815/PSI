"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  Filter,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Tag,
  Target,
  CheckCircle,
  Zap,
  Sparkles,
  Brain,
  Heart,
  Star,
  RefreshCw,
  Loader2,
  BookOpen,
  Plus,
  Calendar,
  MapPin,
  X
} from "lucide-react";
import { api } from "~/trpc/react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedParticipants: string;
  duration: string;
  budget: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  tags: string[];
  targetAudience: string;
  objectives: string[];
  requirements: string[];
  tips: string[];
  trending: boolean;
  aiGenerated?: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  maxParticipants: number | null;
  registrationDeadline: string;
}

// Toast notification component
const ToastContainer = ({ 
  toasts, 
  removeToast 
}: { 
  toasts: Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>;
  removeToast: (id: string) => void;
}) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ 
  recommendation, 
  onCreateEvent 
}: { 
  recommendation: Recommendation;
  onCreateEvent: (rec: Recommendation) => void;
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Mudah': return 'bg-green-100 text-green-800';
      case 'Sedang': return 'bg-yellow-100 text-yellow-800';
      case 'Sulit': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
              {recommendation.trending && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </div>
              )}
              {recommendation.aiGenerated && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                  <Brain className="h-3 w-3" />
                  AI Generated
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                {recommendation.category}
              </span>
              <span className={`px-2 py-1 text-xs rounded-md font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                {recommendation.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3">
          {recommendation.description}
        </p>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{recommendation.estimatedParticipants}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-green-500" />
            <span>{recommendation.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4 text-yellow-500" />
            <span>{recommendation.budget}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="h-4 w-4 text-purple-500" />
            <span>{recommendation.targetAudience}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {recommendation.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {recommendation.tags.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{recommendation.tags.length - 4} lainnya
            </span>
          )}
        </div>

        {/* Objectives */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tujuan Utama:</h4>
          <ul className="space-y-1">
            {recommendation.objectives.slice(0, 2).map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Tips */}
        {recommendation.tips.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Tips Sukses:
            </h4>
            <p className="text-sm text-blue-700">
              {recommendation.tips[0]}
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onCreateEvent(recommendation)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Buat Event
        </button>
      </div>
    </div>
  );
};

// Create Event Modal Component
const CreateEventModal = ({
  isOpen,
  onClose,
  recommendation,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  onSubmit: (data: EventFormData & { recommendation: Recommendation }) => void;
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    timeStart: '',
    timeEnd: '',
    location: '',
    maxParticipants: null,
    registrationDeadline: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when recommendation changes
  React.useEffect(() => {
    if (recommendation) {
      setFormData({
        title: recommendation.title,
        description: recommendation.description,
        date: '',
        timeStart: '',
        timeEnd: '',
        location: '',
        maxParticipants: null,
        registrationDeadline: ''
      });
    }
  }, [recommendation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recommendation) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, recommendation });
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Buat Event dari Rekomendasi</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Event
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Event
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Contoh: Auditorium Kampus"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Mulai
                </label>
                <input
                  type="time"
                  value={formData.timeStart}
                  onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Selesai
                </label>
                <input
                  type="time"
                  value={formData.timeEnd}
                  onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimal Peserta (Opsional)
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Contoh: 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batas Pendaftaran (Opsional)
                </label>
                <input
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Buat Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// AI Generate Panel Component
const AIGeneratePanel = ({ onGenerate, isGenerating }: { onGenerate: (params: any) => void; isGenerating: boolean; }) => {
  const [generateParams, setGenerateParams] = useState({
    organizationType: "Student Organization",
    targetAudience: "Mahasiswa",
    budget: "Sedang" as "Rendah" | "Sedang" | "Tinggi",
    category: "",
    interests: [] as string[]
  });

  const handleGenerate = () => {
    onGenerate(generateParams);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-purple-900">AI Generator</h2>
          <p className="text-purple-700 text-sm">Buat rekomendasi kustom dengan AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-2">
            Target Audience
          </label>
          <select
            value={generateParams.targetAudience}
            onChange={(e) => setGenerateParams({ ...generateParams, targetAudience: e.target.value })}
            className="w-full p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="Mahasiswa">Mahasiswa</option>
            <option value="Mahasiswa IT">Mahasiswa IT</option>
            <option value="Mahasiswa Bisnis">Mahasiswa Bisnis</option>
            <option value="Mahasiswa Seni">Mahasiswa Seni</option>
            <option value="Seluruh Komunitas">Seluruh Komunitas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-900 mb-2">
            Budget Range
          </label>
          <select
            value={generateParams.budget}
            onChange={(e) => setGenerateParams({ ...generateParams, budget: e.target.value as "Rendah" | "Sedang" | "Tinggi" })}
            className="w-full p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="Rendah">Rendah (&lt; 5 juta)</option>
            <option value="Sedang">Sedang (5-15 juta)</option>
            <option value="Tinggi">Tinggi (&gt; 15 juta)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-900 mb-2">
            Kategori (Opsional)
          </label>
          <select
            value={generateParams.category}
            onChange={(e) => setGenerateParams({ ...generateParams, category: e.target.value })}
            className="w-full p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">Semua Kategori</option>
            <option value="Teknologi & IT">Teknologi & IT</option>
            <option value="Bisnis & Kewirausahaan">Bisnis & Kewirausahaan</option>
            <option value="Kesehatan & Wellness">Kesehatan & Wellness</option>
            <option value="Lingkungan & Sosial">Lingkungan & Sosial</option>
            <option value="Seni & Kreativitas">Seni & Kreativitas</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI Recommendations...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate AI Recommendations
          </>
        )}
      </button>
    </div>
  );
};

// Main Page Component
export default function RekomendasiAIPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [createEventModal, setCreateEventModal] = useState<{
    isOpen: boolean;
    recommendation: Recommendation | null;
  }>({
    isOpen: false,
    recommendation: null
  });
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([]);
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([]);

  // API queries
  const { data: recommendations = [], isLoading } = api.recommendation.getRecommendations.useQuery({
    category: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    budget: selectedBudget || undefined,
  });

  const { data: trendingCategories = [] } = api.recommendation.getTrendingCategories.useQuery();
  const { data: analytics } = api.recommendation.getAnalytics.useQuery();

  // Mutations
  const generateAI = api.recommendation.generateAIRecommendations.useMutation({
    onSuccess: (data) => {
      setAiRecommendations(data.recommendations);
      addToast('AI recommendations generated successfully!', 'success');
    },
    onError: () => {
      addToast('Failed to generate AI recommendations', 'error');
    }
  });

  const createEventFromRecommendation = api.recommendation.createEventFromRecommendation.useMutation({
    onSuccess: () => {
      addToast('Event berhasil dibuat dari rekomendasi!', 'success');
      router.push('/dashboard/manajemen');
    },
    onError: (error) => {
      addToast(error.message || 'Gagal membuat event', 'error');
    }
  });

  // Toast functions
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Combined recommendations
  const allRecommendations = useMemo(() => {
    return [...recommendations, ...aiRecommendations];
  }, [recommendations, aiRecommendations]);

  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter((rec) => {
      const categoryMatch = !selectedCategory || rec.category === selectedCategory;
      const difficultyMatch = !selectedDifficulty || rec.difficulty === selectedDifficulty;
      const budgetMatch = !selectedBudget || rec.budget === selectedBudget;
      
      return categoryMatch && difficultyMatch && budgetMatch;
    });
  }, [allRecommendations, selectedCategory, selectedDifficulty, selectedBudget]);

  const handleCreateEvent = (recommendation: Recommendation) => {
    setCreateEventModal({
      isOpen: true,
      recommendation
    });
  };

  const handleEventSubmit = async (data: EventFormData & { recommendation: Recommendation }) => {
    const { recommendation, ...eventData } = data;
    
    try {
      await createEventFromRecommendation.mutateAsync({
        recommendationId: recommendation.id,
        title: eventData.title,
        description: eventData.description,
        category: recommendation.category,
        estimatedParticipants: recommendation.estimatedParticipants,
        duration: recommendation.duration,
        budget: recommendation.budget,
        difficulty: recommendation.difficulty,
        tags: recommendation.tags,
        targetAudience: recommendation.targetAudience,
        objectives: recommendation.objectives,
        requirements: recommendation.requirements,
        tips: recommendation.tips,
        date: new Date(eventData.date),
        timeStart: eventData.timeStart,
        timeEnd: eventData.timeEnd,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        registrationDeadline: eventData.registrationDeadline ? new Date(eventData.registrationDeadline) : null,
        status: 'DRAFT' as const,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const handleGenerateAI = (params: any) => {
    generateAI.mutate(params);
  };

  const categories = [...new Set(allRecommendations.map(r => r.category))];
  const trendingRecommendations = allRecommendations.filter(r => r.trending);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Brain className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Rekomendasi Event</h1>
              <p className="text-gray-600">Dapatkan ide event cerdas dengan teknologi AI</p>
            </div>
          </div>

          {/* Trending Section - Only show if there are trending recommendations */}
          {trendingRecommendations.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-orange-900">Trending Sekarang</h2>
              </div>
              <p className="text-orange-700 text-sm mb-3">
                {trendingRecommendations.length} ide kegiatan yang sedang populer
              </p>
              <div className="flex flex-wrap gap-2">
                {trendingRecommendations.map((rec) => (
                  <span
                    key={rec.id}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium"
                  >
                    {rec.title.split(' ').slice(0, 3).join(' ')}...
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Welcome Message for AI-only recommendations */}
          {allRecommendations.length === 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-purple-900">Selamat Datang di AI Rekomendasi!</h2>
              </div>
              <p className="text-purple-700 text-sm mb-3">
                Sistem rekomendasi ini menggunakan teknologi AI Gemini untuk menghasilkan ide event yang sesuai dengan kebutuhan organisasi Anda. 
                Tidak ada template atau data dummy - semua rekomendasi dibuat secara real-time berdasarkan preferensi Anda.
              </p>
              <div className="flex items-center gap-2 text-purple-600 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Mulai dengan mengklik tombol "Generate AI Recommendations" di atas!</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Generator Panel */}
        <AIGeneratePanel 
          onGenerate={handleGenerateAI}
          isGenerating={generateAI.isPending}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-yellow-500" />
                Filter Rekomendasi
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Event
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Semua Tingkat</option>
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Range Budget
                  </label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Semua Budget</option>
                    <option value="Rendah">Rendah (&lt; 5 juta)</option>
                    <option value="Sedang">Sedang (5-15 juta)</option>
                    <option value="Tinggi">Tinggi (&gt; 15 juta)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Analytics - Only show if there are recommendations */}
            {(analytics && allRecommendations.length > 0) && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Generated</span>
                    <span className="font-medium">{aiRecommendations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Aktif</span>
                    <span className="font-medium">{filteredRecommendations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kategori Unik</span>
                    <span className="font-medium">{categories.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Status Info when no recommendations */}
            {allRecommendations.length === 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Engine</span>
                    <span className="font-medium text-green-600">Gemini Pro</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="font-medium text-green-600">Ready</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mode</span>
                    <span className="font-medium text-blue-600">Real-time</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-20 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
                <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {allRecommendations.length === 0 
                    ? "Belum Ada Rekomendasi" 
                    : "Tidak Ada Rekomendasi yang Sesuai Filter"
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {allRecommendations.length === 0 
                    ? "Generate rekomendasi pertama Anda dengan AI Gemini untuk mendapatkan ide event yang inovatif dan sesuai kebutuhan." 
                    : "Coba ubah filter atau generate ide baru dengan AI"
                  }
                </p>
                {allRecommendations.length === 0 && (
                  <div className="flex items-center justify-center gap-2 text-purple-600 text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Gunakan AI Generator di atas untuk memulai!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onCreateEvent={handleCreateEvent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Event Modal */}
        <CreateEventModal
          isOpen={createEventModal.isOpen}
          onClose={() => setCreateEventModal({ isOpen: false, recommendation: null })}
          recommendation={createEventModal.recommendation}
          onSubmit={handleEventSubmit}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}
