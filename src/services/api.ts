import axios from 'axios';

const API_BASE_URL = 'http://3.149.74.186:8080/v1';
const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NDI5MjAyOTAsImV4cCI6MzMyMDc1NzA5MCwicmVhZGVyX2lkIjoiMzE4OTI2IiwicmVhZGVyX3R5cGUiOiJ1aG4ifQ.JgiBSrvVEs3xaw-fak9YROWDxiPsbvyT1REWzAt0wU0';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  }
});

export interface User {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  status?: string;
  code_bbva?: string;
  [key: string]: any;
}

export interface FetchUsersParams {
  page?: number;
  size?: number;
  created_from?: string;
  created_to?: string;
  phone?: string;
  email?: string;
  username?: string;
  code?: string;
  code_bbva?: string;
}

export interface FetchUsersResponse {
  total: number;
  page: number;
  size: number;
  total_pages: number;
  remaining_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_page: number | null;
  previous_page: number | null;
  data: User[];
}

export const fetchUsers = async (params: FetchUsersParams): Promise<FetchUsersResponse> => {
  try {
    const response = await api.post<FetchUsersResponse>('/users', params);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty state if API fails
    return { 
      total: 0, 
      page: 1, 
      size: params.size || 20, 
      total_pages: 0, 
      remaining_pages: 0, 
      has_next_page: false, 
      has_previous_page: false, 
      next_page: null, 
      previous_page: null, 
      data: [] 
    };
  }
};
