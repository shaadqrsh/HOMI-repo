import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { testResult } from "@/types";
import { Check, Dot, MoveLeft, MoveRight, X } from "lucide-react";
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TestResultModalProps {
  children: React.ReactNode;
  idx: number;
  questions: testResult[];
}

const TestResultModal = ({
  children,
  idx,
  questions,
}: TestResultModalProps) => {
  const [index, setIndex] = useState(idx);
  const currentQuestion = questions[index];

  const correctAnswerText =
    currentQuestion[currentQuestion.correctAnswer as keyof testResult];

  const userAnswerText =
    currentQuestion[currentQuestion.userAnswer as keyof testResult];

  const options = Object.entries(currentQuestion)
    .filter(
      ([key, value]) => key.startsWith("option") && typeof value === "string"
    )
    .map(([, value]) => value as string);

  function onClick(type: "inc" | "dec") {
    const newIndex = type === "inc" ? index + 1 : index - 1;
    if (newIndex >= 0 && newIndex < questions.length - 2) {
      setIndex(newIndex);
    }
  }

  const questionlength = questions.length - 2;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="dark:bg-spanish-roast">
        <DialogHeader className="w-full">
          <DialogTitle className="flex items-center justify-start gap-x-4 w-full">
            Question {index + 1}
            {userAnswerText === correctAnswerText ? (
              <Check
                className="dark:bg-emerald-600 rounded-md p-[2px]"
                size={22}
              />
            ) : (
              <X
                className="dark:bg-rose-600 rounded-lg p-[2px]"
                size={22}
              />
            )}
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <main className="flex flex-col justify-start items-center">
          <h1 className="text-lg rounded-md w-full">
            {index + 1}. {currentQuestion.question}
          </h1>
          <div className="flex flex-col gap-y-2 items-center justify-start mt-6 w-full">
            {options.map((option) => {
              let icon = null;
              if (option === correctAnswerText) {
                icon = <Check className="text-emerald-500" />;
              } else if (option === userAnswerText) {
                icon = <X className="text-rose-500" />;
              } else {
                icon = <Dot />;
              }
              return (
                <div
                  key={option}
                  className="w-full"
                >
                  {option === userAnswerText && (
                    <div
                      className={cn(
                        "text-xs dark:bg-purple-noir p-1 w-fit translate-x-2 translate-y-1",
                        userAnswerText === correctAnswerText
                          ? "text-emerald-600"
                          : "text-rose-600"
                      )}
                    >
                      Your Ans
                    </div>
                  )}
                  <div className="dark:bg-purple-noir rounded-md p-1 w-full flex items-center gap-x-2">
                    {icon}
                    <p className="text-sm">{option}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-full mt-8 w-full">
            {currentQuestion.explanation}
          </div>
          <div className="flex items-center justify-end mt-6 ml-auto gap-x-4">
            {index > 0 && (
              <Button
                variant="test"
                className="font-semibold"
                onClick={() => onClick("dec")}
              >
                <MoveLeft />
                Prev
              </Button>
            )}
            {index < questionlength - 1 && (
              <Button
                variant="test"
                className="font-semibold"
                onClick={() => onClick("inc")}
              >
                <MoveRight />
                Next
              </Button>
            )}
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
};

export default TestResultModal;
