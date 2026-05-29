export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  guests: number;
  comments: string;
}

export interface BookingRequest {
  dates: {
    from: string; // ISO YYYY-MM-DD
    to: string; // ISO YYYY-MM-DD
    nights: number;
  };
  guest: GuestDetails;
}
