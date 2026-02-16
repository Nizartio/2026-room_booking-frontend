import api from "./apiClient";
import type { Room } from "../types/room";

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>("/rooms");
  return response.data;
};

export const fetchUnavailableDates = async (): Promise<string[]> => {
  const response = await api.get<string[]>("/rooms/unavailable-dates");
  return response.data;
};
