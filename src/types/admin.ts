export type RoomBookingResponse = {
  id: number;
  roomId: number;
  roomName: string;

  customerId: number;
  customerName: string;
  customerEmail: string;

  startTime: string;
  endTime: string;

  status: string;
};