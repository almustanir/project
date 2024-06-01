import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:4000", //place your locl host url of backend
  headers: {
    Authorization: `${localStorage.getItem("token")}`,
  },
});
