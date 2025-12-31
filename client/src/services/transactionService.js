import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return { headers: { Authorization: `Bearer ${user?.token}` } };
};

export const getMyTransactions = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};