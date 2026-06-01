import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function searchHistory(query: string, userId: string) {
    return axios.post(`${API_BASE_URL}/api/v1/queries`, {query, userId});
}