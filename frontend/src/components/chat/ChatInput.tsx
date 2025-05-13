"use client";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import useQuestionLoading from "@/store/useQuestionLoading";
import useSidebarStore from "@/store/useSidebarStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { ArrowUp, Mic, MicOff, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSpeechRecognition } from "react-speech-kit";
import * as z from "zod";

interface ChatInputProps {
  sendMessage: (msg: string) => void;
}

const formSchema = z.object({
  question: z.string().min(1),
});

const ChatInput = ({ sendMessage }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const { open } = useSidebarStore();
  const { changeLoading } = useQuestionLoading();
  const queryClient = useQueryClient();
  const userId = Cookies.get("userIdHomi");
  const params = useParams();

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      // @ts-expect-error Argument of type 'SpeechRecognitionResult' is not assignable to parameter of type 'SetStateAction<string>'.
      setValue(result);
    },
    onError: (error) => {
      console.error("Speech Recognition Error:", error);
    },
  });

  function speak() {
    if (isLoading) return;
    if (!supported) alert("Browser does not support speech recognition");
    listen({ lang: "en-US", interimResults: true });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // async function saveAnswer(answer: string) {
  //   try {
  //     const response = await db.post(
  //       `/api/chat/save/`,
  //       {
  //         user: userId,
  //         chatpage: params.chatId,
  //         type: "answer",
  //         message: answer,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
  //         },
  //       }
  //     );
  //     if (response.status === 200) {
  //       changeLoading(response.data.id, true);
  //       queryClient.invalidateQueries({
  //         queryKey: ["chatMessages", userId, params.chatId],
  //       });
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   try {
  //     stop();
  //     const postResponse = await db.post(
  //       "/api/chat/save/",
  //       {
  //         user: userId,
  //         chatpage: params.chatId,
  //         type: "question",
  //         message: values.question,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
  //         },
  //       }
  //     );
  //     if (postResponse.status === 200) {
  //       queryClient.invalidateQueries({
  //         queryKey: ["chatMessages", userId, params.chatId],
  //       });
  //     }
  //     changeLoading(postResponse.data.id, true);
  //     form.resetField("question");
  //     const getResponse = await db.get(`/api/query/`, {
  //       params: {
  //         query: values.question,
  //         chatId: params.chatId,
  //       },
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
  //       },
  //     });
  //     if (getResponse.status === 200) {
  //       await saveAnswer(getResponse.data.answer);
  //       changeLoading(postResponse.data.id, false);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage(values.question);
    form.reset();
  }

  useEffect(() => {
    form.setValue("question", value);
  }, [value, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center justify-center flex-col mb-4">
                  <div className="flex border-2 border-white rounded-full px-4 py-2 w-11/12 items-center mb-2 bg-Lavender dark:bg-transparent">
                    <Search size={30} />
                    <Input
                      className={cn(
                        `w-full border-none border-0 focus-visible:ring-offset-0 focus-visible:ring-0 mx-1 placeholder:text-black
                           dark:placeholder:text-murex-200 placeholder:text-lg text-md dark:bg-transparent bg-transparent`,
                        open && "select-none pointer-events-none"
                      )}
                      placeholder="Ask HOMI"
                      {...field}
                      disabled={isLoading}
                      autoComplete="off"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue(e.target.value);
                      }}
                    />
                    {!listening ? (
                      <Mic
                        size={30}
                        onClick={speak}
                      />
                    ) : (
                      <MicOff
                        size={30}
                        onClick={() => stop()}
                      />
                    )}
                    <button
                      type="submit"
                      className="bg-ceremonial-purple p-1 rounded-full ml-2"
                      disabled={isLoading}
                    >
                      <ArrowUp
                        size={25}
                        className="dark:text-black text-white"
                      />
                    </button>
                  </div>
                  <p className="text-xs">
                    HOMI can make mistakes. Check important info.
                  </p>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatInput;
