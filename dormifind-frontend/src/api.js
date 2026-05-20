import axios from "axios";

const API = axios.create({
    baseURL:"http://localhost/backend/config/api",
 withCredentials: true
});

export default API;
