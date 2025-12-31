import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return { headers: { Authorization: `Bearer ${user?.token}` } };
};

export const getUserProfile = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getConfig());
  return res.data;
};