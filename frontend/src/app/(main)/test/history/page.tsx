"use client";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import TestHistoryCard from "@/components/test/TestHistoryCard";
import { db } from "@/lib/db";
import { test } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const TestHistory = () => {
  const router = useRouter();
  const userId = Cookies.get("userIdHomi");
  const {
    data: tests,
    isLoading,
    isError,
  } = useQuery<test[]>({
    queryKey: ["Tests", userId],
    queryFn: async () => {
      const response = await db.get(`/test/gettests/?user=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <section className="mt-10 pb-8">
      <div className="relative flex items-center justify-center mb-4">
        <button
          onClick={() => router.back()}
          className="absolute left-5 dark:bg-astro-zinger rounded-lg dark:text-liberty-blue px-4 py-2 text-sm font-medium items-center flex gap-x-2"
        >
          <MoveLeft />
          Back
        </button>
        <h1 className="font-bold text-2xl">Test History</h1>
      </div>
      <div className="flex justify-center items-start mt-4 flex-wrap gap-4">
        {tests && tests.length > 0 ? (
          tests.map((test) => (
            <TestHistoryCard
              key={test.test_id}
              test={test}
            />
          ))
        ) : (
          <h1 className="text-3xl">No Tests Found</h1>
        )}
      </div>
    </section>
  );
};

export default TestHistory;
