// UseMethod.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env';
import { Alert } from "react-native";
export const UseMethod = async (
  method,
  url,
  payload = null,
  params = "",
  isMultipart = false,
  responseType = "json"
) => {
  try {
    const authToken = await AsyncStorage.getItem("api_token") ?? '';

    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    // Omit auth header for public auth endpoints
    const isAuthEndpoint = /^(login|register|forgot-password)/i.test(url) || /\/auth\//i.test(url);
    if (isAuthEndpoint) {
      delete headers.Authorization;
    }

    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }

    const apiBase = (API_URL || 'https://uccp.uccpevents.com').trim().replace(/\/+$/, '');
    const api = `${apiBase}/api/${url}`;

    let response;

    switch (method.toLowerCase()) {
      case "get": {
        const url = params
          ? (String(params).startsWith("?") ? `${api}${params}` : `${api}/${params}`)
          : api;
        response = await axios.get(url, { headers, responseType });
        break;
      }

      case "post": {
        const url = params
          ? (String(params).startsWith("?") ? `${api}${params}` : `${api}/${params}`)
          : api;
        response = await axios.post(url, payload, { headers, responseType });
        break;
      }

      case "put":
        response = await axios.put(api, payload, { headers, responseType });
        break;

      case "delete": {
        const url = params
          ? (String(params).startsWith("?") ? `${api}${params}` : `${api}/${params}`)
          : api;
        response = await axios.delete(url, { headers, responseType });
        break;
      }

      default:
        throw new Error(`Invalid HTTP method: ${method}`);
    }

    return response;
  } catch (error) {
    console.error(`Error with ${method.toUpperCase()} request to ${url}:`, error.response?.data ?? error);
    return error.response || null;
  }
};
