"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { 
    Lightbulb, 
    Sparkles, 
    Calendar, 
    Users, 
    Target,
    TrendingUp,
    Wand2,
    Copy,
    Check,
    Loader2,
    RefreshCw,
    Star,
    Clock,
    MapPin,
    DollarSign,
    Zap
} from "lucide-react";

interface EventRecommendation {
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
}

const RecommendationCard = ({ 
    recommendation, 
    onCopyToEvent 
}: { 
    recommendation: EventRecommendation;
    onCopyToEvent: (rec: EventRecommendation) => void;
}) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const handleCopy = () => {
        onCopyToEvent(recommendation);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Mudah': return 'bg-green-100 text-green-800';
            case 'Sedang': return 'bg-yellow-100 text-yellow-800';
            case 'Sulit': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
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
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                    >
                        {isCopied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Disalin
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Gunakan
                            </>
                        )}
                    </button>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
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
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Tips Sukses:
                        </h4>
                        <p className="text-sm text-blue-700">
                            {recommendation.tips[0]}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FilterPanel = ({
    categories,
    selectedCategory,
    onCategoryChange,
    difficulty,
    onDifficultyChange,
    budget,
    onBudgetChange
}: {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    difficulty: string;
    onDifficultyChange: (difficulty: string) => void;
    budget: string;
    onBudgetChange: (budget: string) => void;
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-500" />
                Filter Rekomendasi
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori Event
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
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
                        value={difficulty}
                        onChange={(e) => onDifficultyChange(e.target.value)}
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
                        value={budget}
                        onChange={(e) => onBudgetChange(e.target.value)}
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
    );
};

export default function RekomendasiPage() {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedBudget, setSelectedBudget] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock data for demonstration
    const recommendations: EventRecommendation[] = [
        {
            id: "1",
            title: "Workshop AI & Machine Learning untuk Mahasiswa",
            description: "Workshop intensif tentang pengenalan AI dan machine learning dengan hands-on practice menggunakan Python. Cocok untuk mahasiswa yang ingin memahami dasar-dasar AI dan implementasinya dalam berbagai bidang.",
            category: "Teknologi & IT",
            estimatedParticipants: "50-100 orang",
            duration: "2 hari",
            budget: "Sedang",
            difficulty: "Sedang",
            tags: ["AI", "Machine Learning", "Python", "Workshop", "Hands-on", "Tech"],
            targetAudience: "Mahasiswa IT & Non-IT",
            objectives: [
                "Memahami konsep dasar AI dan Machine Learning",
                "Praktik implementasi algoritma sederhana",
                "Networking dengan praktisi industri"
            ],
            requirements: ["Laptop", "Basic programming knowledge", "Python installed"],
            tips: ["Siapkan dataset menarik untuk praktik", "Undang speaker dari industri"],
            trending: true
        },
        {
            id: "2",
            title: "Entrepreneurship Fair & Startup Showcase",
            description: "Event yang mempertemukan mahasiswa entrepreneur dengan investor dan mentor. Dilengkapi dengan kompetisi pitch, workshop bisnis, dan networking session dengan startup founder sukses.",
            category: "Bisnis & Kewirausahaan",
            estimatedParticipants: "200-300 orang",
            duration: "1 hari",
            budget: "Tinggi",
            difficulty: "Sulit",
            tags: ["Startup", "Business", "Pitch", "Investor", "Entrepreneur", "Networking"],
            targetAudience: "Mahasiswa Entrepreneur",
            objectives: [
                "Memfasilitasi networking antara mahasiswa dan investor",
                "Memberikan exposure untuk startup mahasiswa",
                "Edukasi tentang ekosistem startup"
            ],
            requirements: ["Venue besar", "Sound system", "Display booth", "Catering"],
            tips: ["Undang investor ternama sebagai juri", "Buat kompetisi dengan hadiah menarik"],
            trending: true
        },
        {
            id: "3",
            title: "Environmental Awareness & Tree Planting",
            description: "Kegiatan penanaman pohon dan edukasi lingkungan di area kampus atau sekitar. Dikombinasikan dengan seminar tentang sustainability dan workshop pembuatan kompos dari sampah organik.",
            category: "Lingkungan & Sosial",
            estimatedParticipants: "100-150 orang",
            duration: "Half day",
            budget: "Rendah",
            difficulty: "Mudah",
            tags: ["Environment", "Sustainability", "Tree Planting", "Green", "Social Impact"],
            targetAudience: "Seluruh Mahasiswa",
            objectives: [
                "Meningkatkan kesadaran lingkungan mahasiswa",
                "Kontribusi nyata untuk lingkungan kampus",
                "Membangun sense of community"
            ],
            requirements: ["Bibit pohon", "Alat berkebun", "Air", "Snack"],
            tips: ["Koordinasi dengan pihak kampus untuk lokasi", "Dokumentasi progress pertumbuhan pohon"],
            trending: false
        },
        {
            id: "4",
            title: "Digital Marketing & Content Creator Bootcamp",
            description: "Bootcamp intensif untuk belajar digital marketing mulai dari strategi, content creation, social media management, hingga analytics. Dipandu oleh praktisi berpengalaman dengan studi kasus real.",
            category: "Marketing & Media",
            estimatedParticipants: "75-100 orang",
            duration: "3 hari",
            budget: "Sedang",
            difficulty: "Sedang",
            tags: ["Digital Marketing", "Content Creation", "Social Media", "Analytics", "Branding"],
            targetAudience: "Mahasiswa & UMKM",
            objectives: [
                "Menguasai strategi digital marketing modern",
                "Kemampuan membuat content yang engaging",
                "Understanding social media analytics"
            ],
            requirements: ["Laptop/smartphone", "Design software", "Internet", "Projector"],
            tips: ["Buat challenge content creation", "Partnership dengan brand untuk case study"],
            trending: true
        },
        {
            id: "5",
            title: "Mental Health & Wellness Festival",
            description: "Festival kesehatan mental dengan berbagai kegiatan seperti yoga session, meditation workshop, konseling gratis, art therapy, dan talk show dengan psikolog. Menciptakan safe space untuk diskusi mental health.",
            category: "Kesehatan & Wellness",
            estimatedParticipants: "150-200 orang",
            duration: "1 hari",
            budget: "Sedang",
            difficulty: "Sedang",
            tags: ["Mental Health", "Wellness", "Yoga", "Meditation", "Self Care", "Therapy"],
            targetAudience: "Seluruh Mahasiswa",
            objectives: [
                "Meningkatkan awareness tentang mental health",
                "Memberikan tools untuk self-care",
                "Mengurangi stigma terhadap mental health issues"
            ],
            requirements: ["Yoga mats", "Sound system", "Comfortable space", "Professional counselors"],
            tips: ["Ciptakan atmosphere yang tenang dan welcoming", "Sediakan anonymous consultation"],
            trending: false
        },
        {
            id: "6",
            title: "Gaming Tournament & Esports Competition",
            description: "Turnamen gaming multi-platform dengan game populer seperti Mobile Legends, PUBG, Valorant, dan FIFA. Dilengkapi dengan workshop tentang karir di industri esports dan gaming.",
            category: "Gaming & Esports",
            estimatedParticipants: "300-500 orang",
            duration: "2 hari",
            budget: "Tinggi",
            difficulty: "Sulit",
            tags: ["Esports", "Gaming", "Tournament", "Competition", "Mobile Legends", "Valorant"],
            targetAudience: "Mahasiswa Gamer",
            objectives: [
                "Mengembangkan komunitas gaming di kampus",
                "Edukasi tentang karir di industri esports",
                "Kompetisi yang fair dan menyenangkan"
            ],
            requirements: ["Gaming setup", "High-speed internet", "Streaming equipment", "Referees"],
            tips: ["Partnership dengan brand gaming", "Live streaming untuk engagement"],
            trending: true
        }
    ];

    const categories = [...new Set(recommendations.map(r => r.category))];

    const filteredRecommendations = useMemo(() => {
        return recommendations.filter((rec) => {
            const categoryMatch = !selectedCategory || rec.category === selectedCategory;
            const difficultyMatch = !selectedDifficulty || rec.difficulty === selectedDifficulty;
            const budgetMatch = !selectedBudget || rec.budget === selectedBudget;
            
            return categoryMatch && difficultyMatch && budgetMatch;
        });
    }, [selectedCategory, selectedDifficulty, selectedBudget]);

    const handleCopyToEvent = (recommendation: EventRecommendation) => {
        // In a real implementation, this would navigate to the event creation page
        // with pre-filled data from the recommendation
        console.log("Copying to event creation:", recommendation);
        
        // For now, we'll just show a simple alert
        alert(`Ide "${recommendation.title}" berhasil disalin ke template event baru!`);
    };

    const handleGenerateNew = () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setIsGenerating(false);
            alert("Rekomendasi baru berhasil di-generate berdasarkan tren terkini!");
        }, 2000);
    };

    const trendingRecommendations = recommendations.filter(r => r.trending);

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <Lightbulb className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Rekomendasi Ide Kegiatan</h1>
                                <p className="text-gray-600">AI-powered suggestions untuk event organisasi Anda</p>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerateNew}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-4 w-4" />
                                    Generate AI Ideas
                                </>
                            )}
                        </button>
                    </div>

                    {/* Trending Section */}
                    {trendingRecommendations.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                <h2 className="text-lg font-semibold text-orange-900">Trending Sekarang</h2>
                            </div>
                            <p className="text-orange-700 text-sm mb-3">
                                {trendingRecommendations.length} ide kegiatan yang sedang populer di kalangan mahasiswa
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filter */}
                    <div className="lg:col-span-1">
                        <FilterPanel
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            difficulty={selectedDifficulty}
                            onDifficultyChange={setSelectedDifficulty}
                            budget={selectedBudget}
                            onBudgetChange={setSelectedBudget}
                        />
                        
                        {/* Stats */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                Statistik
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Ide</span>
                                    <span className="font-medium">{recommendations.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Trending</span>
                                    <span className="font-medium">{trendingRecommendations.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Filtered</span>
                                    <span className="font-medium">{filteredRecommendations.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {filteredRecommendations.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
                                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Rekomendasi</h3>
                                <p className="text-gray-600">
                                    Coba ubah filter atau generate ide baru dengan AI
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {filteredRecommendations.map((recommendation) => (
                                    <RecommendationCard
                                        key={recommendation.id}
                                        recommendation={recommendation}
                                        onCopyToEvent={handleCopyToEvent}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
