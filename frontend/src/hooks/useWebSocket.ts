"use client";
import { db } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface WebSocketMessage {
  chat: string;
  message: string;
  answer: string;
  by_user: "question" | "answer";
  time_stamp: string;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  messages: WebSocketMessage[];
  isLoading: boolean;
  isError: boolean;
  loadingOn: boolean;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [loadingOn, setLoading] = useState(false);
  const userId = Cookies.get("userIdHomi");
  const { chatId } = useParams();
  const queryClient = useQueryClient();

  const { isLoading, isError } = useQuery<WebSocketMessage[]>({
    queryKey: ["chatMessages", userId, chatId],
    queryFn: async () => {
      const response = await db.get(
        `/api/chat/?user=${userId}&chat=${chatId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
      setMessages(response.data);
      return response.data;
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId || !queryClient) return;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setLoading(true);
      console.log("Connected to WebSocket");
      const updatedMessages =
        queryClient.getQueryData<WebSocketMessage[]>([
          "chatMessages",
          userId,
          chatId,
        ]) || [];
      setMessages(updatedMessages);
      setLoading(false);
    };

    ws.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);

      // Append the new message to the query data
      queryClient.setQueryData<WebSocketMessage[]>(
        ["chatMessages", userId, chatId],
        (old = []) => [...old, data]
      );

      const updatedMessages =
        queryClient.getQueryData<WebSocketMessage[]>([
          "chatMessages",
          userId,
          chatId,
        ]) || [];
      setMessages(updatedMessages);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url, chatId, queryClient]);

  return { socket, messages, isLoading, isError, loadingOn };
};
