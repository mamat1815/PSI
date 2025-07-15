"use client";

import { api } from "~/trpc/react";
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  Crown,
  Shield
} from "lucide-react";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = "positive",
  description 
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  description?: string;
}) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${
        changeType === "positive" ? "from-green-500 to-emerald-600" :
        changeType === "negative" ? "from-red-500 to-rose-600" :
        "from-blue-500 to-blue-600"
      }`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {change && (
        <span className={`text-sm font-semibold ${
          changeType === "positive" ? "text-green-600" :
          changeType === "negative" ? "text-red-600" :
          "text-gray-600"
        }`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-600 font-medium">{title}</p>
    {description && (
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    )}
  </div>
);

const RecentPayment = ({ payment }: { payment: any }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${
        payment.status === "COMPLETED" ? "bg-green-500" :
        payment.status === "PENDING" ? "bg-yellow-500" :
        "bg-red-500"
      }`}></div>
      <div>
        <p className="font-semibold text-gray-900">{payment.organizationName}</p>
        <p className="text-sm text-gray-600">
          {payment.duration} bulan • {new Date(payment.createdAt).toLocaleDateString('id-ID')}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-gray-900">
        Rp {payment.amount.toLocaleString('id-ID')}
      </p>
      <span className={`text-xs px-2 py-1 rounded-full ${
        payment.status === "COMPLETED" ? "bg-green-100 text-green-800" :
        payment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
        "bg-red-100 text-red-800"
      }`}>
        {payment.status}
      </span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = api.admin.getDashboardStats.useQuery();
  const { data: recentPayments } = api.admin.getRecentPayments.useQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">Kelola pembayaran dan berlangganan organisasi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Organisasi"
          value={dashboardData?.totalOrganizations || 0}
          icon={Users}
          change="+12%"
          changeType="positive"
          description="Organisasi terdaftar"
        />
        <StatCard
          title="Berlangganan PRO"
          value={dashboardData?.proSubscriptions || 0}
          icon={Crown}
          change="+8%"
          changeType="positive"
          description="Organisasi dengan PRO"
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={`Rp ${(dashboardData?.monthlyRevenue || 0).toLocaleString('id-ID')}`}
          icon={DollarSign}
          change="+23%"
          changeType="positive"
          description="Total pembayaran"
        />
        <StatCard
          title="Pembayaran Pending"
          value={dashboardData?.pendingPayments || 0}
          icon={Clock}
          change="2"
          changeType="neutral"
          description="Menunggu konfirmasi"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Pendapatan Bulanan</h3>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart akan ditampilkan di sini</p>
              <p className="text-sm text-gray-500 mt-2">Integrasi dengan library chart</p>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Pembayaran Terbaru</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              7 hari terakhir
            </div>
          </div>
          
          <div className="space-y-4">
            {recentPayments && recentPayments.length > 0 ? (
              recentPayments.map((payment: any) => (
                <RecentPayment key={payment.id} payment={payment} />
              ))
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada pembayaran</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Konfirmasi Pembayaran</p>
              <p className="text-sm text-blue-600">Verifikasi manual</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left">
            <Users className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Kelola Organisasi</p>
              <p className="text-sm text-green-600">Lihat semua data</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left">
            <CreditCard className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">Riwayat Pembayaran</p>
              <p className="text-sm text-purple-600">Detail transaksi</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-left">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-900">Analytics</p>
              <p className="text-sm text-orange-600">Laporan detail</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
