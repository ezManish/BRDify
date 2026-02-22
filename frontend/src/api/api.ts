import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

export interface BRD {
  id: number;
  title: string;
  status: string;
  requirements: { description: string }[];
  decisions: { description: string }[];
  stakeholders: { name: string; role: string }[];
  risks: { description: string; impact: string; mitigation: string }[];
  timelines: { milestone: string; expectedDate: string; description: string }[];
}

export interface RTMEntry {
  id: number;
  sourceChunk: string;
  requirement?: { id: number; description: string };
  decision?: { id: number; description: string };
  risk?: { id: number; description: string };
  timeline?: { id: number; milestone: string };
}

export const uploadFile = async (file: File): Promise<BRD> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/upload`, formData);
  return response.data;
};

export const uploadText = async (text: string): Promise<BRD> => {
  const response = await axios.post(`${API_URL}/upload-text`, text, {
    headers: { 'Content-Type': 'text/plain' } // Backend expects raw string body
  });
  return response.data;
};

export const getBrd = async (id: number): Promise<BRD> => {
  const response = await axios.get(`${API_URL}/brd/${id}`);
  return response.data;
};

export const getRtm = async (id: number): Promise<RTMEntry[]> => {
  const response = await axios.get(`${API_URL}/brd/${id}/rtm`);
  return response.data;
};

export const updateBrd = async (id: number, data: BRD): Promise<BRD> => {
  const response = await axios.put(`${API_URL}/brd/${id}`, data);
  return response.data;
};

export const getPdfUrl = (id: number) => `${API_URL}/brd/${id}/pdf`;
export const getDocxUrl = (id: number) => `${API_URL}/brd/${id}/docx`;
