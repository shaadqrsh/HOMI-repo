"use client";
import { db } from "@/lib/db";
import useTestStore from "@/store/useTestStore";
import { testQuestion } from "@/types";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  questions: testQuestion[];
  difficulty: string;
}

const ProgressBar = ({ questions, difficulty }: ProgressBarProps) => {
  const router = useRouter();
  const params = useParams();
  const { testId } = params;
  const { answers } = useTestStore();
  const userId = Cookies.get("userIdHomi");

  const perQuestionTime =
    difficulty === "Easy" ? 40 : difficulty === "Medium" ? 30 : 20;
  const totalTime = questions.length * perQuestionTime;

  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [progress, setProgress] = useState(100);
  const queryClient = useQueryClient();

  function getScore() {
    let score = 0;
    questions.forEach((question) => {
      if (answers[question.question_id] === question.correctAnswer) {
        score += 1;
      }
    });
    return score;
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
      setProgress((prevProgress) =>
        prevProgress > 0 ? prevProgress - 100 / totalTime : 0
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [totalTime]);

  useEffect(() => {
    async function onsubmit() {
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
    }
    if (timeLeft === 0) {
      onsubmit();
    }
  }, [timeLeft, questions, answers, router, testId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <CircularProgress
        determinate
        thickness={5}
        color={timeLeft <= 60 ? "danger" : "primary"}
        value={progress}
        size="lg"
      >
        <Typography level="title-lg">{formatTime(timeLeft)}</Typography>
      </CircularProgress>
    </Box>
  );
};

export default ProgressBar;
