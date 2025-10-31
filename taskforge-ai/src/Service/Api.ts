// export const BASE_URL='https://api.superceuticals.in'
export const BASE_URL ="http://localhost:5001/forge";

import axios from "axios";
const API = axios.create({
  baseURL : BASE_URL,
  timeout: 15000,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export default API;
