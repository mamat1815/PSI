"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { 
  Loader2, 
  TrendingUp, 
  Users, 
  Award, 
  Calendar,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Star,
  Download,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Color palettes
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
const PERFORMANCE_COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard = ({ title, value, change, icon, color }: MetricCardProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-sm text-green-600 mt-1">{change}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const EventReportChart = () => {
    const { data, isLoading, isError } = api.report.getEventChartData.useQuery();

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400"/></div>;
    if (isError) return <div className="h-96 flex items-center justify-center text-red-500">Gagal memuat data chart event.</div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="partisipan" fill="#3B82F6" name="Jumlah Partisipan" />
                <Bar dataKey="rating" fill="#10B981" name="Rating Rata-rata" />
            </BarChart>
        </ResponsiveContainer>
    );
};

const AspirationReportChart = () => {
    const { data, isLoading, isError } = api.report.getAspirationSentimentData.useQuery();

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400"/></div>;
    if (isError) return <div className="h-96 flex items-center justify-center text-red-500">Gagal memuat data sentimen.</div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie 
                  data={data} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} 
                  outerRadius={120} 
                  fill="#8884d8" 
                  dataKey="value"
                >
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

const DetailedReportView = () => {
  const { data: reportData, isLoading } = api.report.getDetailedReportData.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-8">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Event"
          value={reportData.eventPerformance.length}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Total Peserta"
          value={reportData.eventPerformance.reduce((sum, event) => sum + event.attended, 0)}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Rating Rata-rata"
          value={reportData.feedbackAnalysis.averageRating}
          icon={<Star className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
        <MetricCard
          title="Tingkat Kepuasan"
          value={`${reportData.feedbackAnalysis.satisfactionRate}%`}
          icon={<Award className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Event Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performa Event</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={reportData.eventPerformance.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 11 }}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="registered" fill="#3B82F6" name="Terdaftar" />
                <Bar yAxisId="left" dataKey="attended" fill="#10B981" name="Hadir" />
                <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#F59E0B" strokeWidth={3} name="Rating" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Trend Bulanan</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={reportData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="events" fill="#3B82F6" name="Jumlah Event" />
                <Line yAxisId="right" type="monotone" dataKey="participants" stroke="#10B981" strokeWidth={3} name="Peserta" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Demand */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Permintaan Skill Teratas</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.skillDemand} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="skill" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="demand" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Participant Demographics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Demografi Peserta</h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.participantDemographics}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ role, percentage }) => `${role} (${percentage}%)`}
                >
                  {reportData.participantDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Participant Growth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pertumbuhan Peserta</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.participantGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Total Kumulatif" />
                <Bar dataKey="monthly" fill="#10B981" name="Bulanan" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Rating Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribusi Rating</h3>
            <Star className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.feedbackAnalysis.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Events Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Event Terbaik</h3>
          <Award className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.topEvents.map((event, index) => (
                <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(event.date), "dd MMM yyyy", { locale: id })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.participants}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{event.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.feedbackCount}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Kategori Event</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportData.eventCategories.map((category, index) => (
            <div key={category.name} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{category.count} event</p>
                <p className="text-sm text-gray-600">{category.participants} total peserta</p>
                <p className="text-xs text-gray-500">
                  {category.count > 0 ? Math.round(category.participants / category.count) : 0} rata-rata peserta/event
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function LaporanPage() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Laporan & Analisis</h1>
                    <p className="mt-1 text-gray-600">Insight mendalam dari aktivitas organisasi Anda</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>
            </header>

            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button 
                      onClick={() => setActiveTab('overview')} 
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'overview' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                        📊 Overview Detail
                    </button>
                    <button 
                      onClick={() => setActiveTab('event')} 
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'event' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                        📅 Laporan Event
                    </button>
                    <button 
                      onClick={() => setActiveTab('aspirasi')} 
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'aspirasi' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                        💭 Analisis Aspirasi
                    </button>
                </nav>
            </div>

            <div className="space-y-6">
                {activeTab === 'overview' && <DetailedReportView />}
                
                {activeTab === 'event' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold text-gray-900">Perbandingan Partisipan dan Rating Event</h2>
                          <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <EventReportChart />
                    </div>
                )}
                
                {activeTab === 'aspirasi' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold text-gray-900">Distribusi Sentimen Aspirasi Mahasiswa</h2>
                          <PieChartIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <AspirationReportChart />
                    </div>
                )}
            </div>
        </div>
    );
}
