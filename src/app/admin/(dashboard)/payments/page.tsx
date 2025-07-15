"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  CreditCard, 
  Check, 
  X, 
  Clock, 
  Search,
  Filter,
  RefreshCw,
  Eye,
  DollarSign,
  Calendar,
  User
} from "lucide-react";

const PaymentCard = ({ payment, onConfirm }: { payment: any; onConfirm: (id: string) => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800 border-green-200";
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED": return "bg-red-100 text-red-800 border-red-200";
      case "EXPIRED": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const canConfirm = payment.status === "PENDING";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{payment.organization.name}</h3>
            <p className="text-sm text-gray-600">{payment.organization.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Order ID: {payment.midtransOrderId}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            Rp {payment.amount.toLocaleString('id-ID')}
          </p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
            {payment.status}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(payment.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
          {payment.paidAt && (
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Dibayar: {new Date(payment.paidAt).toLocaleDateString('id-ID')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {payment.paymentMethod && (
            <span>Metode: {payment.paymentMethod}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Eye className="h-4 w-4" />
            Detail
          </button>
          {canConfirm && (
            <button 
              onClick={() => onConfirm(payment.id)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <Check className="h-4 w-4" />
              Konfirmasi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: paymentsData, isLoading, refetch } = api.admin.getPaymentHistory.useQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const confirmPayment = api.admin.confirmPayment.useMutation({
    onSuccess: () => {
      refetch();
      alert("Pembayaran berhasil dikonfirmasi!");
    },
    onError: (error) => {
      alert("Error: " + error.message);
    }
  });

  const handleConfirmPayment = (paymentId: string) => {
    if (confirm("Apakah Anda yakin ingin mengkonfirmasi pembayaran ini?")) {
      confirmPayment.mutate({ paymentId });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Pembayaran</h1>
            <p className="text-gray-600">Konfirmasi dan kelola pembayaran berlangganan</p>
          </div>
          <button 
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {paymentsData?.payments.filter(p => p.status === "PENDING").length || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Paid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {paymentsData?.payments.filter(p => p.status === "PAID").length || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Failed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {paymentsData?.payments.filter(p => p.status === "FAILED").length || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            Rp {(paymentsData?.payments.reduce((sum, p) => sum + (p.status === "PAID" ? p.amount : 0), 0) || 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari organisasi atau order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4 mb-8">
        {paymentsData?.payments && paymentsData.payments.length > 0 ? (
          paymentsData.payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onConfirm={handleConfirmPayment}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada pembayaran</h3>
            <p className="text-gray-600">Pembayaran dari organisasi akan muncul di sini</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paymentsData && paymentsData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {paymentsData.totalPages}
          </span>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === paymentsData.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
