export interface BookingData {
  id: string;
  carModel: string;
  address: {
    main: string;
    detail: string;
  };
  date: string;
  time: string;
  evaluator: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    specialty: string[];
    fee: number;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedDuration: number; // 분 단위
}