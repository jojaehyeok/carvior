import { BookingDraft } from "@/types/booking";

const KEY = "bookingDraft";

class BookingStore {
  private draft: BookingDraft = {
    car: { model: "" },
    address: { main: "", detail: "" },
    schedule: { date: "", time: "" },
  };

  load() {
    const saved = localStorage.getItem(KEY);
    if (saved) this.draft = JSON.parse(saved);
  }

  save() {
    localStorage.setItem(KEY, JSON.stringify(this.draft));
  }

  update(partial: Partial<BookingDraft>) {
    this.draft = {
      ...this.draft,
      ...partial,
    };
    this.save();
  }

  get() {
    return this.draft;
  }

  clear() {
    localStorage.removeItem(KEY);
    this.draft = {
      car: { model: "" },
      address: { main: "", detail: "" },
      schedule: { date: "", time: "" },
    };
  }
}

export const bookingStore = new BookingStore();
