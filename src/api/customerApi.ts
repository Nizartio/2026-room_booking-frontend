import api from "./apiClient";
import type { Customer } from "../types/customer";

export type CreateCustomerPayload = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export type UpdateCustomerPayload = CreateCustomerPayload & {
  isActive: boolean;
};

export type PagedCustomerResponse = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: Customer[];
};

export const fetchCustomers = async (
  search?: string,
  page = 1,
  pageSize = 10
): Promise<PagedCustomerResponse> => {
  let query = "";

  if (search) {
    query = `?search=${encodeURIComponent(search)}`;
  }

  if (page) {
    query += query ? `&page=${page}` : `?page=${page}`;
  }

  if (pageSize) {
    query += query ? `&pageSize=${pageSize}` : `?pageSize=${pageSize}`;
  }

  const response = await api.get<PagedCustomerResponse>(
    `/customers${query}`
  );

  return response.data;
};

export const deleteCustomer = async (id: number) => {
  return api.delete(`/customers/${id}`);
};

export const createCustomer = async (
  payload: CreateCustomerPayload
) => {
  return api.post("/customers", payload);
};

export const updateCustomer = async (
  id: number,
  payload: UpdateCustomerPayload
) => {
  return api.put(`/customers/${id}`, payload);
};