import { file, folder } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { db } from "./db";

const userId = Cookies.get("userIdHomi");

export function useFetchFolders() {
  return useQuery<folder[]>({
    queryKey: ["folders", userId],
    queryFn: async (): Promise<folder[]> => {
      const response = await db.get(`/api/folders/?user=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });
}

export function useFetchFiles() {
  return useQuery<file[]>({
    queryKey: ["files", userId],
    queryFn: async (): Promise<file[]> => {
      const response = await db.get(`/api/files/?user=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });
}
