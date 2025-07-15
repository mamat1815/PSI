"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Crown, 
  Check, 
  X, 
  Loader2, 
  CreditCard, 
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Shield,
  Calendar
} from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period?: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
}

const PlanCard = ({ 
  plan, 
  currentPlan, 
  onSelectPlan 
}: { 
  plan: SubscriptionPlan; 
  currentPlan: string;
  onSelectPlan: (planId: string) => void;
}) => {
  const isCurrentPlan = currentPlan === plan.id;
  const isPro = plan.id === "PRO";

  return (
    <div className={`relative rounded-2xl border-2 p-8 ${
      plan.popular 
        ? "border-blue-500 bg-blue-50" 
        : "border-gray-200 bg-white"
    } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}>
      
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            🔥 Paling Populer
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Check className="h-4 w-4" />
            Plan Aktif
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        
        {plan.id === "FREE" ? (
          <div className="text-4xl font-bold text-gray-900">Gratis</div>
        ) : (
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">
              Rp {plan.price.toLocaleString('id-ID')}
            </span>
            <span className="text-gray-500 ml-1">/{plan.period}</span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
        
        {plan.limitations && plan.limitations.map((limitation, index) => (
          <div key={index} className="flex items-start gap-3">
            <X className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-500">{limitation}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelectPlan(plan.id)}
        disabled={isCurrentPlan}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
          isCurrentPlan
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : plan.popular
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {isCurrentPlan ? "Plan Saat Ini" : `Pilih ${plan.name}`}
      </button>
    </div>
  );
};

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  plan 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  plan: SubscriptionPlan | null;
}) => {
  const [months, setMonths] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const createPayment = api.subscription.createProSubscription.useMutation({
    onSuccess: (data) => {
      if (data.simulatedPayment) {
        // Development mode - show instructions
        alert(`✅ Payment berhasil dibuat (Development Mode)\n\nOrder ID: ${data.orderId}\n\n📝 Instruksi:\n1. Buka Admin Dashboard\n2. Konfirmasi pembayaran secara manual\n3. Fitur PRO akan aktif setelah konfirmasi`);
      } else if (data.snapRedirectUrl) {
        // Production mode - open Midtrans payment page
        window.open(data.snapRedirectUrl, '_blank');
      }
      setIsProcessing(false);
      onClose();
    },
    onError: (error) => {
      console.error("Payment creation failed:", error);
      setIsProcessing(false);
      alert("Gagal membuat pembayaran: " + error.message);
    }
  });

  if (!isOpen || !plan) return null;

  const totalAmount = plan.price * months;
  const discount = months >= 6 ? 10 : months >= 3 ? 5 : 0;
  const finalAmount = totalAmount * (1 - discount / 100);

  const handlePayment = () => {
    setIsProcessing(true);
    createPayment.mutate({ months });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Upgrade ke PRO</h2>
          <p className="text-gray-600">Tingkatkan pengalaman organisasi Anda</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durasi Berlangganan
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Bulan</option>
              <option value={3}>3 Bulan (Diskon 5%)</option>
              <option value={6}>6 Bulan (Diskon 10%)</option>
              <option value={12}>12 Bulan (Diskon 15%)</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Subtotal ({months} bulan)</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center mb-2 text-green-600">
                <span>Diskon ({discount}%)</span>
                <span>-Rp {(totalAmount - finalAmount).toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>Rp {finalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Bayar Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: currentSubscription, isLoading: subscriptionLoading } = 
    api.subscription.getCurrentSubscription.useQuery();
  
  const { data: plans, isLoading: plansLoading } = 
    api.subscription.getSubscriptionPlans.useQuery();

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleSelectPlan = (planId: string) => {
    if (planId === "PRO") {
      const proPlan = plans?.plans.find(p => p.id === "PRO");
      setSelectedPlan(proPlan || null);
      setShowPaymentModal(true);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pilih Paket Berlangganan
        </h1>
        <p className="text-xl text-gray-600">
          Tingkatkan kemampuan organisasi Anda dengan fitur-fitur canggih
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Status Berlangganan
              </h3>
              <p className="text-blue-700">
                Plan saat ini: <span className="font-bold">{currentSubscription.currentPlan}</span>
              </p>
              {currentSubscription.subscriptionExpiry && (
                <p className="text-blue-600 text-sm">
                  Berakhir: {new Date(currentSubscription.subscriptionExpiry).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                currentSubscription.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-semibold ${
                currentSubscription.isActive ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentSubscription.isActive ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {plans?.plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentSubscription?.currentPlan || "FREE"}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Perbandingan Fitur Detail
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Lanjutan</h3>
            <p className="text-gray-600 text-sm">
              Dapatkan insight mendalam tentang performa event, engagement audience, dan analytics seperti Instagram Business
            </p>
          </div>
          
          <div className="text-center">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Rekomendasi Otomatis</h3>
            <p className="text-gray-600 text-sm">
              Sistem AI yang secara otomatis memberikan rekomendasi event berdasarkan aspirasi, minat, dan feedback terkini
            </p>
          </div>
          
          <div className="text-center">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Targeting Audience</h3>
            <p className="text-gray-600 text-sm">
              Target audience yang tepat berdasarkan data aspirasi mahasiswa dan preferensi mereka
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Pertanyaan Umum
        </h2>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Apa yang terjadi jika saya upgrade ke PRO?
            </h3>
            <p className="text-gray-600">
              Anda akan langsung mendapatkan akses ke semua fitur PRO termasuk AI rekomendasi otomatis, 
              analytics lanjutan, dan tracking engagement yang detail.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Bisakah saya downgrade kapan saja?
            </h3>
            <p className="text-gray-600">
              Ya, Anda bisa downgrade ke plan FREE kapan saja. Fitur PRO akan tetap aktif hingga 
              periode berlangganan berakhir.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Apakah data saya aman?
            </h3>
            <p className="text-gray-600">
              Sangat aman! Kami menggunakan enkripsi tingkat enterprise dan mengikuti standar 
              keamanan industri untuk melindungi data organisasi Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
