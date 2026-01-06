// lib/booking-store.ts
interface BookingFormData {
  carModel: string;
  address: {
    main: string;
    detail: string;
  };
  date: string;
  time: string;
  evaluator?: {
    id: string;
    name: string;
    rating: number;
    fee: number;
    specialty: string[];
  };
}

class BookingStore {
  private bookingData: BookingFormData = {
    carModel: '',
    address: { main: '', detail: '' },
    date: '',
    time: '',
  };

  setCarModel(carModel: string) {
    this.bookingData.carModel = carModel;
    this.saveToLocalStorage();
  }

  setAddress(main: string, detail: string) {
    this.bookingData.address = { main, detail };
    this.saveToLocalStorage();
  }

  setDateTime(date: string, time: string) {
    this.bookingData.date = date;
    this.bookingData.time = time;
    this.saveToLocalStorage();
  }

  setEvaluator(evaluator: any) {
    this.bookingData.evaluator = evaluator;
    this.saveToLocalStorage();
  }

  getData() {
    return { ...this.bookingData };
  }

  clear() {
    this.bookingData = {
      carModel: '',
      address: { main: '', detail: '' },
      date: '',
      time: '',
    };
    localStorage.removeItem('bookingData');
  }

  private saveToLocalStorage() {
    localStorage.setItem('bookingData', JSON.stringify(this.bookingData));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('bookingData');
    if (saved) {
      this.bookingData = JSON.parse(saved);
    }
  }
}

export const bookingStore = new BookingStore();