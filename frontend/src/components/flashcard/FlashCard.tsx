"use client";

import { db } from "@/lib/db";
import { flashQuestion } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../fallbacks/Loading";
import { Button } from "../ui/button";

interface FlashCardProps {
  currentQuestion: flashQuestion | null;
  nextQuestion: () => void;
  markCorrect: (id: string) => void;
  markReview: (id: string) => void;
  flashcardId: string;
}

const FlashCard = ({
  currentQuestion,
  nextQuestion,
  markCorrect,
  markReview,
  flashcardId,
}: FlashCardProps) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const flashcardIdP = params.flashcardId;
  const label = Array.isArray(flashcardIdP)
    ? decodeURIComponent(flashcardIdP[0])
    : flashcardIdP
    ? decodeURIComponent(flashcardIdP)
    : "";
  const difficulty = searchParams.get("difficulty") || "medium";
  const router = useRouter();
  const userId = Cookies.get("userIdHomi");
  const queryClient = useQueryClient();

  let autoFlipTime = 10000; // 10 seconds for easy
  if (difficulty === "medium") {
    autoFlipTime = 20000; // 20 seconds for medium
  } else if (difficulty === "hard") {
    autoFlipTime = 30000; // 30 seconds for hard
  }

  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [progress, setProgress] = useState(100);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!currentQuestion) {
      nextQuestion();
    }
    setShouldAnimate(true);
    setProgress(100);
    setFlipped(false);
    if (initialLoad) {
      setInitialLoad(false);
    }
  }, [currentQuestion, nextQuestion]);

  // Timer to decrease the progress bar.
  // This effect will only start if it's not the initial load, a question is available, and the card is unflipped.
  useEffect(() => {
    if (initialLoad) return;
    if (!currentQuestion || flipped) return;

    const step = 100 / (autoFlipTime / 50); // decrease 100% over autoFlipTime in 50ms steps
    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev - step;
        if (nextVal <= 0) {
          clearInterval(timer);
          return 0;
        }
        return nextVal;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentQuestion, flipped, initialLoad, autoFlipTime]);

  // When progress hits 0, automatically flip the card.
  useEffect(() => {
    if (progress <= 0 && currentQuestion && !flipped) {
      handleFlip();
    }
  }, [progress, flipped, currentQuestion]);

  const handleFlip = () => {
    setFlipped((prev) => !prev);
    setShouldAnimate(true);
  };

  const handleMarkCorrect = () => {
    if (currentQuestion) {
      if (flipped) {
        setFlipped(false);
        setShouldAnimate(false);
      }
      markCorrect(currentQuestion.questionId);
      setFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion) {
      if (flipped) {
        setFlipped(false);
        setShouldAnimate(false);
      }
      markReview(currentQuestion.questionId);
    }
  };

  async function goBack() {
    router.push("/test");
    await db.delete("/test/deleteflash/", {
      data: {
        flashcardId,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
      },
    });
  }

  async function practiceMore() {
    setLoading(true);
    const response = await db.delete("/test/deleteflash/", {
      data: {
        flashcardId,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
      },
    });
    if (response.status === 200) {
      queryClient.invalidateQueries({
        queryKey: ["flashcard", userId, label, difficulty],
      });
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {currentQuestion ? (
        <>
          <div
            className="w-[540px] h-72 mb-4"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={shouldAnimate ? { duration: 0.6 } : { duration: 0 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Category label (front side only) */}
              {!flipped && (
                <div className="absolute z-10 left-2 p-2 top-2 dark:bg-ceremonial-purple rounded-md">
                  {currentQuestion.category}
                </div>
              )}

              {/* Progress bar (front side only) */}
              {!flipped && (
                <div className="absolute z-10 -bottom-[6px] w-full left-0 right-0">
                  <div className="w-full h-4 bg-astro-zinger rounded-bl-md rounded-br-md">
                    <div
                      className="h-4 bg-ceremonial-purple rounded-bl-md rounded-br-md"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Front Side (Question) */}
              <div
                className="absolute w-full h-full dark:bg-astro-zinger rounded-lg shadow-lg flex justify-center items-center p-4"
                style={{ backfaceVisibility: "hidden" }}
              >
                <p className="text-xl font-bold text-center dark:text-liberty-blue">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Back Side (Answer) */}
              <div
                className="absolute w-full h-full dark:bg-astro-zinger rounded-lg shadow-lg flex justify-center items-center p-4"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <p className="text-xl font-bold dark:text-liberty-blue">
                  {currentQuestion.answer}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex space-x-4 my-2">
            {!flipped && (
              <Button
                onClick={handleFlip}
                variant="att"
              >
                Check Answer
              </Button>
            )}

            {flipped && (
              <>
                <button
                  onClick={handleMarkCorrect}
                  className="px-4 py-2 w-[127px] bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  I know
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-800 transition"
                >
                  I don&apos;t Know
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center items-center gap-y-4">
          <div className="dark:bg-astro-zinger rounded-lg shadow-lg flex justify-center items-center p-4 w-[540px] h-72">
            <p className="text-xl dark:text-liberty-blue font-semibold">
              Yay!!😎 You completed your practice session.
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4 my-2">
            <Button
              className="w-[128px]"
              variant="att"
              onClick={goBack}
              disabled={loading}
            >
              Go back
            </Button>
            <Button
              variant="att"
              onClick={practiceMore}
              disabled={loading}
            >
              {loading ? <Loading /> : "Practice More"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCard;
