import { API_BASE_URL } from "../constants/config";
import { apiRequest } from "./api";


const headers= {
      'Content-Type': 'application/json',
    };

// Specific methods if needed
export const saveBasket = (data) => apiRequest(API_BASE_URL,'POST',headers, '/create-basket', data);
export const getBaskets =async (limit) => apiRequest(API_BASE_URL,'GET',headers, `/get-all-basket?limit=${limit}`);
export const saveBuyBasket = (data) => apiRequest(API_BASE_URL,'POST',headers, `/buy-basket`, data);
export const getUserBaskets =async (id,limit) => apiRequest(API_BASE_URL,'GET',headers, `/get-user-baskets?id=${id}&limit=${limit}`);
export const getBasketDetails =async (id) => apiRequest(API_BASE_URL,'GET',headers, `/get-basket-details?id=${id}`);
export const getBasketTransactions =async (id,limit) => apiRequest(API_BASE_URL,'GET',headers, `/get-basket-transactions?id=${id}&limit=${limit}`);