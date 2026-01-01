import axios from "axios";

const API_URL = "http://localhost:5000/api/offers";

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.token) throw new Error("User not authenticated");
  return { headers: { Authorization: `Bearer ${user.token}` } };
};

export const createOffer = async (listingId, message) => {
  const res = await axios.post(
    `${API_URL}/${listingId}`,
    { message },
    getConfig()
  );
  return res.data;
};

export const updateOffer = async (listingId, message) => {
  const res = await axios.put(
    `${API_URL}/${listingId}`,
    { message },
    getConfig()
  );
  return res.data;
};

export const getMyOffers = async () => {
  const res = await axios.get(`${API_URL}/my`, getConfig());
  return res.data;
};

export const getListingOffers = async (listingId) => {
  const res = await axios.get(
    `${API_URL}/listing/${listingId}`,
    getConfig()
  );
  return res.data;
};

export const acceptOffer = async (offerId) => {
  const res = await axios.post(
    `${API_URL}/${offerId}/accept`,
    {},
    getConfig()
  );
  return res.data;
};
