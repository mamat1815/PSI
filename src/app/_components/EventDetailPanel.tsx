// src/app/_components/EventDetailPanel.tsx
"use client";

import { api } from "~/trpc/react";
import { Calendar, Loader2, MapPin, Sparkles, Star, Edit, Building } from "lucide-react";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

export default function EventDetailPanel({ eventId, onEdit }: { eventId: string, onEdit: (event: any) => void }) {
  const utils = api.useUtils();
  const { data: event, isLoading } = api.event.getByIdWithFeedback.useQuery(
    { id: eventId! },
    { enabled: !!eventId }
  );

  const recommendationMutation = api.event.getAiRecommendation.useMutation({
    onSuccess: () => {
        utils.event.getByIdWithFeedback.invalidate({ id: eventId! });
    }
  });

  const handleGenerateRecommendation = () => {
    if (eventId && !event?.aiRecommendation) {
        recommendationMutation.mutate({ eventId });
    }
  };

  if (!eventId) {
    return <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center text-gray-500 p-6"><p>Pilih event dari daftar untuk melihat detailnya.</p></div>;
  }
  if (isLoading) {
    return <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center"><Loader2 className="animate-spin mx-auto text-gray-400 h-8 w-8" /></div>;
  }
  if (!event) {
    return <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center text-red-500 p-6"><p>Gagal memuat detail event.</p></div>;
  }

  const averageRating = event.feedback.length > 0 ? event.feedback.reduce((acc, f) => acc + f.rating, 0) / event.feedback.length : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-6 flex-grow overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{event.title}</h2>
            {new Date(event.date) >= new Date() && (
                <button onClick={() => onEdit(event)} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"><Edit className="h-4 w-4"/> Edit</button>
            )}
        </div>
        
        <div className="aspect-video bg-gray-200 rounded-lg mb-4">
            <img src={`https://placehold.co/600x400/FBBF24/1E293B?text=${encodeURIComponent(event.title)}`} alt={event.title} className="w-full h-full object-cover rounded-lg"/>
        </div>

        <div className="space-y-3 text-gray-600 text-sm">
            <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-gray-400"/><span>{new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gray-400"/><span>{event.location}</span></div>
        </div>

        <div className="mt-4 pt-4 border-t"><div className="flex flex-wrap gap-2">{event.skills.map(skill => (<span key={skill.id} className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">{skill.name}</span>))}</div></div>
        <div className="mt-4 pt-4 border-t"><p className="text-gray-600">{event.description}</p></div>

        {new Date(event.date) < new Date() && (
            <>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Ringkasan Feedback</h3>
                  <div className="flex items-center justify-between mt-2">
                    <StarRating rating={averageRating} />
                    <span className="font-bold text-lg">{averageRating.toFixed(1)} <span className="text-sm text-gray-500">/ 5</span></span>
                    <span className="text-sm text-gray-600">{event.feedback.length} Ulasan</span>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Komentar Peserta</h3>
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2">{event.feedback.length > 0 ? (event.feedback.map(fb => (<div key={fb.id} className="flex gap-3 items-start"><img src={fb.user.image || `https://placehold.co/40x40?text=${fb.user.name?.charAt(0)}`} alt="avatar" className="h-8 w-8 rounded-full"/><div><p className="font-semibold text-sm">{fb.user.name}</p><p className="text-sm text-gray-600">{fb.comment}</p></div></div>))) : <p className="text-sm text-gray-500">Belum ada komentar.</p>}</div>
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500"/> Rekomendasi AI</h3>
                    {(event.aiRecommendation || recommendationMutation.data) && (<div className="prose prose-sm p-4 bg-yellow-50 border border-yellow-200 rounded-lg" dangerouslySetInnerHTML={{ __html: event.aiRecommendation || recommendationMutation.data }} />)}
                    {recommendationMutation.isError && <p className="text-sm text-red-500">Gagal mendapatkan rekomendasi.</p>}
                    {!event.aiRecommendation && (<button onClick={handleGenerateRecommendation} disabled={recommendationMutation.isPending} className="w-full mt-3 px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2">{recommendationMutation.isPending ? <Loader2 className="animate-spin h-4 w-4"/> : <Sparkles className="h-4 w-4"/>}{recommendationMutation.isPending ? 'Menganalisis...' : 'Buat Rekomendasi'}</button>)}
                </div>
            </>
        )}
      </div>
    </div>
  );
}
