"use client";
import Answer from "@/components/chat/Answer";
import ChatInput from "@/components/chat/ChatInput";
import LoadingText from "@/components/chat/LoadingText";
import Question from "@/components/chat/Question";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import { useWebSocket } from "@/hooks/useWebSocket";
import { cn } from "@/lib/utils";
import useQuestionLoading from "@/store/useQuestionLoading";
import useSidebarStore from "@/store/useSidebarStore";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const ChatPage = () => {
  const { open, ChangeState } = useSidebarStore();
  const params = useParams();
  const { loading } = useQuestionLoading();
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = Cookies.get("userIdHomi");

  const { socket, messages, isLoading, isError, loadingOn } = useWebSocket(
    `wss://homitybscit-homi-bot.hf.space/ws/chat/?token=${Cookies.get(
      "next-session-id-homi"
    )}&userid=${userId}&chatId=${params.chatId}`
  );

  const sendMessage = (input: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          message: input,
          user: userId,
          chatpage: params.chatId,
        })
      );
    }
  };

  function setOpen(open: boolean) {
    if (open) ChangeState();
  }

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  if (isLoading || loadingOn) return <Loading />;
  if (isError) return <ServerError />;

  return (
    <section
      className={cn(
        "transition-all flex flex-col items-center justify-center h-full overflow-hidden",
        open && "blur-[2px]"
      )}
      onClick={() => setOpen(open)}
    >
      <main className="h-full w-full overflow-auto flex">
        {messages && messages.length > 0 ? (
          <div className="flex flex-col justify-start mt-6 mx-12 gap-y-3">
            {messages
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.time_stamp).getTime() -
                  new Date(b.time_stamp).getTime()
              )
              .map((chat) => {
                return (
                  <div key={chat.chat}>
                    {chat.by_user === "question" && (
                      <>
                        <Question question={chat.message} />
                        {loading[chat.chat] && <LoadingText />}
                      </>
                    )}

                    {chat.by_user === "answer" && (
                      <Answer
                        answer={chat.message}
                        id={chat.chat}
                      />
                    )}
                  </div>
                );
              })}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex flex-grow flex-1 items-center justify-center">
            <h1 className="text-2xl font-semibold text-center">
              Hello, what can HOMI help you with today?
            </h1>
          </div>
        )}
      </main>

      <ChatInput sendMessage={sendMessage} />
    </section>
  );
};

export default ChatPage;
