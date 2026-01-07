// types/booking.ts
export interface BookingDraft {
  car: {
    model: string;
  };
  address: {
    main: string;
    detail: string;
  };
  schedule: {
    date: string;
    time: string;
  };
  evaluator?: {
    id: string;
    name: string;
  };
}

export interface BookingConfirm {
  draft: BookingDraft;
  evaluator: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    specialty: string[];
    fee: number;
  };
  estimatedDuration: number;
  totalPrice: number;
}
