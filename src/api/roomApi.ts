import axios from "./apiClient";
import type { Room } from "../types/room";

const api = axios.create({
  baseURL: "http://localhost:5242/api",
});

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>("/rooms");
  return response.data;
};

export const fetchUnavailableDates = async (): Promise<string[]> => {
  const response = await api.get<string[]>("/rooms/unavailable-dates");
  return response.data;
};
