// src/utils/scheduleConflict.ts

export interface ScheduleItem {
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  mataKuliah?: string;
  title?: string;
  type: 'kuliah' | 'event';
}

export interface EventSchedule {
  date: Date;
  timeStart: string;
  timeEnd: string;
  title: string;
}

const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

// Convert time string (HH:MM) to minutes since midnight
export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// Check if two time ranges overlap
export function timeRangesOverlap(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

// Check if event conflicts with existing schedule
export function checkEventConflict(
  event: EventSchedule,
  jadwalKuliah: ScheduleItem[]
): {
  hasConflict: boolean;
  conflicts: ScheduleItem[];
  conflictType: 'time' | 'none';
} {
  const eventDate = new Date(event.date);
  const eventDay = dayNames[eventDate.getDay()];
  
  const conflicts: ScheduleItem[] = [];

  // Check conflicts with kuliah schedule on the same day
  jadwalKuliah.forEach(jadwal => {
    if (jadwal.hari.toLowerCase() === eventDay) {
      const hasTimeConflict = timeRangesOverlap(
        event.timeStart,
        event.timeEnd,
        jadwal.jamMulai,
        jadwal.jamSelesai
      );

      if (hasTimeConflict) {
        conflicts.push(jadwal);
      }
    }
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    conflictType: conflicts.length > 0 ? 'time' : 'none'
  };
}

// Format conflict message for display
export function formatConflictMessage(conflicts: ScheduleItem[]): string {
  if (conflicts.length === 0) return '';
  
  if (conflicts.length === 1) {
    const conflict = conflicts[0]!;
    return `Bertabrakan dengan ${conflict.mataKuliah} (${conflict.jamMulai} - ${conflict.jamSelesai})`;
  }
  
  return `Bertabrakan dengan ${conflicts.length} jadwal kuliah`;
}

// Get schedule conflicts with detailed info
export function getDetailedConflicts(
  event: EventSchedule,
  jadwalKuliah: ScheduleItem[]
) {
  const result = checkEventConflict(event, jadwalKuliah);
  
  return {
    ...result,
    message: formatConflictMessage(result.conflicts),
    eventInfo: {
      day: dayNames[new Date(event.date).getDay()],
      date: event.date.toLocaleDateString('id-ID'),
      time: `${event.timeStart} - ${event.timeEnd}`
    }
  };
}
