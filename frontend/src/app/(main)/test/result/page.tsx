"use client";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import TestResultCard from "@/components/test/TestResultCard";
import { db } from "@/lib/db";
import { testResult } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TestResultPage = () => {
  const [details, setDetails] = useState({ title: "", score: "" });
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");
  const userId = Cookies.get("userIdHomi");

  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      router.push("/test");
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [router]);

  const { data: questions, isError } = useQuery<testResult[]>({
    queryKey: ["testResult", userId, testId],
    queryFn: async () => {
      const response = await db.get(`/test/gettest/?testId=${testId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      const length = response.data.length;
      const title = response.data[length - 2].subject;
      const score = response.data[length - 1].score;
      setDetails({ title, score });
      return response.data;
    },
  });

  if (!questions || !testId) {
    return <Loading />;
  }

  if (isError) {
    return <ServerError />;
  }

  const questionLength = questions.length;

  return (
    <section className="flex flex-col items-center mt-10 mx-4">
      <div className="flex items-center gap-x-8">
        <h1 className="text-2xl font-semibold">Subject: {details.title}</h1>
        <h1 className="text-2xl font-semibold">
          Score: {details.score}/{questionLength - 2}
        </h1>
      </div>

      <main className="flex flex-wrap justify-center gap-4 my-6">
        {questions &&
          questions.length > 0 &&
          questions.slice(0, questionLength - 2).map((question, idx) => {
            return (
              <TestResultCard
                questions={questions}
                result={question}
                key={question.question_id}
                idx={idx}
              />
            );
          })}
      </main>
    </section>
  );
};

export default TestResultPage;
