// lib/bookingDraft.ts
const KEY = 'bookingDraft';

export function getBookingDraft(): BookingDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveBookingDraft(partial: Partial<BookingDraft>) {
  const prev = getBookingDraft() ?? {};
  const next = { ...prev, ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
}
