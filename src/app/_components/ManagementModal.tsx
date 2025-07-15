// src/app/_components/ManagementModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import { Loader2, X, CalendarPlus, Upload, Clock, Users, Camera } from "lucide-react";
import CreatableSelect from 'react-select/creatable';

const initialFormData = { 
    title: '', 
    description: '', 
    date: '', 
    timeStart: '', 
    timeEnd: '', 
    location: '', 
    image: '', 
    maxParticipants: '', 
    registrationDeadline: '' 
};

export default function ManagementModal({ isOpen, onClose, initialData = null }: { isOpen: boolean, onClose: () => void, initialData: any }) {
    const utils = api.useUtils();
    const [formData, setFormData] = useState(initialFormData);
    const [selectedSkills, setSelectedSkills] = useState<readonly { value: string; label: string; }[]>([]);
    
    const { data: skillsOptions, isLoading: skillsLoading } = api.skill.getAll.useQuery(undefined, {
      select: (data) => data.map(skill => ({ value: skill.name, label: skill.name }))
    });

    useEffect(() => {
        if (initialData) {
            const eventDate = new Date(initialData.date ?? '');
            setFormData({
                title: initialData.title,
                description: initialData.description,
                date: eventDate.toISOString().split('T')[0] ?? '',
                timeStart: initialData.timeStart ?? '',
                timeEnd: initialData.timeEnd ?? '',
                location: initialData.location,
                image: initialData.image ?? '',
                maxParticipants: initialData.maxParticipants?.toString() ?? '',
                registrationDeadline: (initialData.registrationDeadline 
                    ? new Date(initialData.registrationDeadline).toISOString().split('T')[0] 
                    : '') as string
            });
            setSelectedSkills(initialData.skills.map((s: { name: string }) => ({ value: s.name, label: s.name })))
        } else {
            setFormData(initialFormData);
            setSelectedSkills([]);
        }
    }, [initialData, isOpen]);

    const createEventMutation = api.event.create.useMutation({ onSuccess: () => { utils.event.getAll.invalidate(); onClose(); } });
    const updateEventMutation = api.event.update.useMutation({ onSuccess: () => { utils.event.getAll.invalidate(); onClose(); } });
    const createSkillMutation = api.skill.create.useMutation({ onSuccess: () => { utils.skill.getAll.invalidate(); }});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));

    const handleSubmit = (status: 'DRAFT' | 'PUBLISHED') => {
        const [year, month, day] = formData.date.split('-').map(Number);
        // Untuk backward compatibility, kita gunakan timeStart sebagai waktu utama
        const [hours, minutes] = formData.timeStart.split(':').map(Number);
        const combinedDate = new Date(year ?? 0, (month ?? 0) - 1, day ?? 0, hours ?? 0, minutes ?? 0);
        
        const payload = {
            title: formData.title,
            description: formData.description,
            date: combinedDate,
            timeStart: formData.timeStart,
            timeEnd: formData.timeEnd,
            location: formData.location,
            image: formData.image || null,
            maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
            registrationDeadline: formData.registrationDeadline 
                ? new Date(formData.registrationDeadline + 'T23:59:59') 
                : null,
            skills: selectedSkills.map(s => ({ value: s.value, label: s.label })),
            status,
        };
        
        if (initialData?.id) {
            updateEventMutation.mutate({ id: initialData.id, ...payload });
        } else {
            createEventMutation.mutate(payload);
        }
    };
    
    const handleCreateSkill = useCallback(async (inputValue: string) => {
        const newOption = { value: inputValue, label: inputValue };
        setSelectedSkills((prev) => [...(prev ?? []), newOption]);
        await createSkillMutation.mutateAsync({ name: inputValue });
    }, [createSkillMutation]);

    const isLoading = createEventMutation.isPending || updateEventMutation.isPending;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <CalendarPlus className="text-yellow-500"/>
                        <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Event' : 'Buat Event Baru'}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X /></button>
                </header>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="text-sm font-medium">Judul Event</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="Masukkan judul event"/>
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium">Deskripsi</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md" placeholder="Jelaskan detail event..."></textarea>
                    </div>

                    {/* Upload Image */}
                    <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Gambar Event (URL)
                        </label>
                        <input 
                            name="image" 
                            value={formData.image} 
                            onChange={handleChange} 
                            className="mt-1 w-full p-2 border rounded-md" 
                            placeholder="https://example.com/image.jpg"
                        />
                        {formData.image && (
                            <div className="mt-2">
                                <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Tanggal</label>
                            <input name="date" type="date" value={formData.date} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Batas Pendaftaran</label>
                            <input name="registrationDeadline" type="date" value={formData.registrationDeadline} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Waktu Mulai
                            </label>
                            <input name="timeStart" type="time" value={formData.timeStart} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Waktu Selesai
                            </label>
                            <input name="timeEnd" type="time" value={formData.timeEnd} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Lokasi</label>
                            <input name="location" value={formData.location} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="Masukkan lokasi event"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Maksimal Peserta
                            </label>
                            <input 
                                name="maxParticipants" 
                                type="number" 
                                value={formData.maxParticipants} 
                                onChange={handleChange} 
                                className="mt-1 w-full p-2 border rounded-md" 
                                placeholder="Kosongkan jika tidak ada batas"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium">Skill Terkait</label>
                        <CreatableSelect 
                            isMulti 
                            value={selectedSkills} 
                            onChange={setSelectedSkills} 
                            options={skillsOptions} 
                            isLoading={skillsLoading} 
                            onCreateOption={handleCreateSkill} 
                            placeholder="Pilih atau buat skill baru..."
                            className="mt-1"
                        />
                    </div>
                </div>
                <footer className="p-4 border-t flex justify-end items-center gap-3 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                    <button onClick={() => handleSubmit('DRAFT')} disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-md hover:bg-gray-100 flex items-center gap-2">{isLoading && <Loader2 className="h-4 w-4 animate-spin"/>}Simpan sebagai Draft</button>
                    <button onClick={() => handleSubmit('PUBLISHED')} disabled={isLoading} className="px-6 py-2 text-sm font-semibold text-white rounded-md flex items-center gap-2 bg-gray-800 hover:bg-gray-700">{isLoading && <Loader2 className="h-4 w-4 animate-spin"/>}Publikasikan</button>
                </footer>
            </div>
        </div>
    );
}