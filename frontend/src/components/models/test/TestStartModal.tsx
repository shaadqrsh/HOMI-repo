"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Cookies from "js-cookie";
import { Loader2, MoveLeft, MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useState } from "react";

import Loading from "@/components/fallbacks/Loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestStartModalProps {
  children: React.ReactNode;
  label: string;
  id: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

type TestOption = {
  label: string;
  value: "Test" | "Flashcard";
  image: string;
};

const TestStartModal = ({ children, label, id }: TestStartModalProps) => {
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState<"Test" | "Flashcard" | null>(null);
  const [testTitle, setTestTitle] = useState("full-chat");
  const [options, setOptions] = useState<"START" | "END" | null>("START");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedQuestions, setSelectedQuestions] = useState("10");
  const userId = Cookies.get("userIdHomi");
  const router = useRouter();

  const { data: testTopics, isLoading } = useQuery({
    queryKey: ["testOptions", userId, id],
    queryFn: async () => {
      const response = await db.get(`/test/testtopic/`, {
        params: {
          chatId: id,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });

  const testOptions: TestOption[] = [
    {
      label: "Practice with HOMI",
      value: "Flashcard",
      image: "/study.svg",
    },
    {
      label: "Test your Knowledge",
      value: "Test",
      image: "/cap.svg",
    },
  ];

  const getOptionClass = (optionValue: "Test" | "Flashcard") =>
    cn(
      "flex flex-col items-center gap-y-4 dark:hover:border-astro-zinger border-2 border-slate-950 p-2 rounded-lg",
      testType === optionValue && "dark:border-white dark:border-2"
    );

  async function testGenerate() {
    setLoading(true);
    const topic = testTitle === "full-chat" ? testTopics : testTitle;
    const diplayTitle = testTitle === "full-chat" ? label : testTitle;
    if (testType === "Flashcard") {
      router.push(
        `/test/flashcard/${diplayTitle}?difficulty=${selectedDifficulty}`
      );
      setLoading(false);
    } else {
      const response = await db.post(
        `/test/generate/`,
        {
          topic: topic,
          user: userId,
          diff: selectedDifficulty,
          noq: selectedQuestions,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
      if (response.status === 200) {
        router.replace(
          `/test/mcq/${response.data.testId}?title=${diplayTitle}&difficulty=${selectedDifficulty}`
        );
      }
      setLoading(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setTestType(null);
          setTestTitle("");
          setOptions("START");
          setSelectedDifficulty("Medium");
          setSelectedQuestions("10");
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-fit w-[1400px]">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {options === "START" ? (
            <motion.div
              key="START"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <main className="flex justify-center items-center gap-x-16 mt-4">
                {testOptions.map((option) => (
                  <button
                    key={option.value}
                    className={getOptionClass(option.value)}
                    onClick={() => setTestType(option.value)}
                  >
                    <Image
                      src={option.image}
                      alt={option.label}
                      width={70}
                      height={70}
                    />
                    <p>{option.label}</p>
                  </button>
                ))}
              </main>

              <Button
                variant="test"
                className="text-lg w-full mt-8"
                onClick={() => setOptions("END")}
              >
                Next
                <MoveRight />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="END"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col justify-center items-center gap-y-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <main className="flex flex-col justify-center items-center w-full gap-y-4">
                  <RadioGroup
                    defaultValue="full-chat"
                    onValueChange={(value) => setTestTitle(value)}
                    className="grid grid-cols-3 h-fit justify-center items-center w-full gap-y-4 overflow-y-auto max-h-[250px] scrollbar-hide py-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="full-chat"
                        id="f1"
                      />
                      <Label htmlFor="f1">Full Chat</Label>
                    </div>
                    {testTopics &&
                      testTopics.length > 0 &&
                      testTopics.map((t: string) => {
                        return (
                          <div
                            className="flex items-center space-x-2"
                            key={t}
                          >
                            <RadioGroupItem
                              value={t}
                              id={t}
                            />
                            <Label htmlFor={t}>{t}</Label>
                          </div>
                        );
                      })}
                  </RadioGroup>
                  <div className="flex justify-center items-center gap-x-4 mt-4 w-full">
                    <Select
                      defaultValue="Medium"
                      onValueChange={(value) => setSelectedDifficulty(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {testType === "Test" && (
                      <Select
                        defaultValue="10"
                        onValueChange={(value) => setSelectedQuestions(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Questions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <Button
                    variant="test"
                    className="text-lg w-full flex items-center"
                    onClick={testGenerate}
                    disabled={loading || !testType || !testTitle}
                  >
                    {loading && <Loading />}
                    Start Test
                  </Button>
                  <Button
                    variant="test"
                    className="text-lg w-full flex items-center"
                    onClick={() => setOptions("START")}
                    disabled={loading}
                  >
                    <MoveLeft /> Back
                  </Button>
                </main>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default TestStartModal;
