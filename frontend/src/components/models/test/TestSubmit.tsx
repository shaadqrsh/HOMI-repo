import useTestStore from "@/store/useTestStore";
import { testQuestion } from "@/types";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "../../ui/button";

import { db } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "../../fallbacks/Loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

interface TestSubmitProps {
  children: React.ReactNode;
  testId: string | string[];
  questions: testQuestion[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TestSubmit = ({
  children,
  testId,
  questions,
  isOpen,
  setIsOpen,
}: TestSubmitProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { answers } = useTestStore();
  const queryClient = useQueryClient();
  const userId = Cookies.get("userIdHomi");

  function getScore() {
    let score = 0;
    questions.forEach((question) => {
      if (answers[question.question_id] === question.correctAnswer) {
        score += 1;
      }
    });
    return score;
  }

  async function onsubmit() {
    setLoading(true);

    const finalAnswers = { ...answers };
    questions.forEach((question) => {
      if (finalAnswers[question.question_id] === undefined) {
        finalAnswers[question.question_id] = null;
      }
    });

    const response = await db.put(
      `/test/savetest/`,
      {
        testId,
        score: getScore(),
        answers: finalAnswers,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      }
    );
    if (response.status === 200) {
      router.push(`/test/result?testId=${testId}`);
      queryClient.invalidateQueries({ queryKey: ["Tests", userId] });
    }
    setLoading(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Submit Test</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will submit your Test.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onsubmit}
            className="dark:text-green-600 dark:bg-spanish-roast dark:hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? <Loading /> : <span>Submit</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestSubmit;
