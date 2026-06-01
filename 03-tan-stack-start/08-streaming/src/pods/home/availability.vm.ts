export type CalendarBlockType = "booking" | "block";
export type CalendarBlockStatus = "pending" | "confirmed";

export interface CalendarBlockVm {
  id: string;
  type: CalendarBlockType;
  status: CalendarBlockStatus;
  startDate: Date;
  endDate: Date;
  nights: number;
}
