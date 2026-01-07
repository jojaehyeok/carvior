import { BookingFormData } from '@/app/types/booking';

export type BookingDraft = BookingFormData;

const KEY = 'bookingDraft';

export function getBookingDraft(): BookingDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as BookingDraft) : null;
}

export function saveBookingDraft(draft: BookingDraft) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearBookingDraft() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}