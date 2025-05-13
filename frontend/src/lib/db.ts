import axios from "axios";
//  https://homitybscit-bot.hf.space/

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "https://homitybscit-homi-bot.hf.space";

export const db = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});






