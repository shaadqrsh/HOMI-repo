"use client";

import Loading from "@/components/fallbacks/Loading";
import FlashCard from "@/components/flashcard/FlashCard";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { flashQuestion } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { MoveLeft, ServerCrash } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FlashcardIdPage = () => {
  const [questions, setQuestions] = useState<flashQuestion[] | null>(null);
  const [CurrentQuestion, setCurrentQuestion] = useState<flashQuestion | null>(
    null
  );

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const params = useParams();
  const flashcardId = params.flashcardId;
  const title = Array.isArray(flashcardId)
    ? decodeURIComponent(flashcardId[0])
    : flashcardId
    ? decodeURIComponent(flashcardId)
    : "";
  const difficulty = searchParams.get("difficulty");
  const userId = Cookies.get("userIdHomi");
  const { toast } = useToast();

  const {
    data: flashData,
    isLoading,
    isError,
  } = useQuery<flashQuestion[]>({
    queryKey: ["flashcard", userId, title, difficulty],
    queryFn: async () => {
      const response = await db.get("/test/getflash/", {
        params: {
          topic: title,
          diff: difficulty,
          userid: userId,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });

  const router = useRouter();

  useEffect(() => {
    if (flashData) {
      const q = flashData.slice(0, 50);
      setQuestions(q);
    }
  }, [flashData]);

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      questionId,
      newCategory,
    }: {
      questionId: string;
      newCategory: string;
    }) => {
      const response = await db.put(
        "/test/saveflash/",
        { questionId: questionId, category: newCategory },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
      return response.data;
    },
    onMutate: async ({ questionId, newCategory }) => {
      const previousData = queryClient.getQueryData([
        "flashcard",
        userId,
        title,
        difficulty,
      ]);
      queryClient.setQueryData(
        ["flashcard", userId, title, difficulty],
        (oldData: flashQuestion[]) =>
          oldData.map((q: flashQuestion) =>
            q.questionId === questionId ? { ...q, category: newCategory } : q
          )
      );
      return { previousData };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["flashcard", userId], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["flashcard", userId, title, difficulty],
      });
    },
  });

  if (isLoading || !flashData || !questions) {
    return <Loading />;
  }

  if (isError) {
    return <ServerCrash />;
  }

  const total = questions.length;
  const masteredCount = questions.filter(
    (q) => q.category === "mastered"
  ).length;
  const reviewCount = questions.filter((q) => q.category === "review").length;
  const learningCount = questions.filter(
    (q) => q.category === "learning"
  ).length;

  const getPercentage = (count: number) =>
    total > 0 ? (count / total) * 100 : 0;

  const activeQuestions = questions.filter((q) => q.category !== "mastered");

  function nextQuestion() {
    if (activeQuestions?.length === 0) {
      setCurrentQuestion(null);
    } else {
      const randomIndex = Math.floor(Math.random() * activeQuestions.length);
      setCurrentQuestion(activeQuestions[randomIndex]);
    }
  }

  const handleMarkCorrect = (questionId: string) => {
    updateCategoryMutation.mutate({ questionId, newCategory: "mastered" });
    nextQuestion();
  };

  const handleMarkReview = (questionId: string) => {
    updateCategoryMutation.mutate({ questionId, newCategory: "review" });
    nextQuestion();
  };

  return (
    <section className="relative flex flex-col items-center mt-10 w-full">
      {/* Back button positioned at the extreme left */}
      <button
        onClick={() => router.back()}
        className="absolute left-4 top-4 flex items-center gap-x-2 px-4 py-2 rounded-lg dark:bg-astro-zinger dark:text-liberty-blue text-sm font-medium"
      >
        <MoveLeft />
        Back
      </button>
      {/* Header container for the title */}
      <div className="w-full max-w-xl mb-4">
        <h1 className="text-center font-bold text-2xl">{title}</h1>
      </div>
      <FlashCard
        currentQuestion={CurrentQuestion}
        nextQuestion={nextQuestion}
        markCorrect={handleMarkCorrect}
        markReview={handleMarkReview}
        flashcardId={flashData[50].flashcardId}
      />
      <div className="flex flex-col justify-center mt-4 w-full max-w-xl space-y-4 mb-8">
        <div>
          <p className="mb-1">
            You have mastered {masteredCount} out of {total} questions
          </p>
          <div className="w-full h-4 bg-gray-200 rounded">
            <div
              className="h-4 bg-green-500 rounded"
              style={{ width: `${getPercentage(masteredCount)}%` }}
            />
          </div>
        </div>
        <div>
          <p className="mb-1">
            You are reviewing {reviewCount} out of {total} questions
          </p>
          <div className="w-full h-4 bg-gray-200 rounded">
            <div
              className="h-4 bg-yellow-500 rounded"
              style={{ width: `${getPercentage(reviewCount)}%` }}
            />
          </div>
        </div>
        <div>
          <p className="mb-1">
            You are learning {learningCount} out of {total} questions
          </p>
          <div className="w-full h-4 bg-gray-200 rounded">
            <div
              className="h-4 bg-red-500 rounded"
              style={{ width: `${getPercentage(learningCount)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashcardIdPage;
