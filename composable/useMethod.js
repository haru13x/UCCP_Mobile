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

    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }

    const api = `${API_URL}/api/${url}`;

    let response;

    switch (method.toLowerCase()) {
      case "get":
        response = await axios.get(`${api}/${params}`, { headers, responseType });
        break;

      case "post":
        
        response = await axios.post(api, payload, { headers, responseType });
        break;

      case "put":
        response = await axios.put(api, payload, { headers, responseType });
        break;

      case "delete":
        response = await axios.delete(`${api}/${params}`, { headers, responseType });
        break;

      default:
        throw new Error(`Invalid HTTP method: ${method}`);
    }

    return response;
  } catch (error) {
    console.error(`Error with ${method.toUpperCase()} request to ${url}:`, error.response?.data ?? error);
    return null;
  }
};
