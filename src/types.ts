export type Guest = {
  guest_id?: string;
  _id?: string;
  name?: string | null;
  phone?: string | null;
  consent_status?: "pending" | "opted_in" | "opted_out" | string;
  photo_url?: string | null;
  photo_updated_at?: number | string;
  arrived_at?: string;
  created_at?: string;
  [key: string]: any;
};

export type ActiveTable = {
  table_no: string | number;
  guests?: Guest[];
  [key: string]: any;
};
