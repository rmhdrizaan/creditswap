import axios from "axios";

const API_URL = "http://localhost:5000/api/listings";

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return { headers: { Authorization: `Bearer ${user?.token}` } };
};

export const getListings = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const createListing = async (data) => {
  const res = await axios.post(API_URL, data, getConfig());
  return res.data;
};

export const getMyListings = async () => {
  const res = await axios.get(`${API_URL}/my`, getConfig());
  return res.data;
};

export const getListing = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getConfig());
  return res.data;
};

export const getAssignedListings = async () => {
  const res = await axios.get(`${API_URL}/assigned`, getConfig());
  return res.data;
};

export const completeListing = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/complete`, {}, getConfig());
  return res.data;
};