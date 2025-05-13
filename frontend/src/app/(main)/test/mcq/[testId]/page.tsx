"use client";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import TestSubmit from "@/components/models/test/TestSubmit";
import OptionBtn from "@/components/test/OptionBtn";
import ProgressBar from "@/components/test/ProgressBar";
import QuestionList from "@/components/test/QuestionList";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import useTestStore from "@/store/useTestStore";
import { testQuestion } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

const QuizPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { questionIdx, setQuestionIdx } = useTestStore();
  const { testId } = useParams();
  const searchParams = useSearchParams();
  const testTitle = searchParams.get("title");
  const difficulty = searchParams.get("difficulty");
  console.log("page" + testTitle);
  const userId = Cookies.get("userIdHomi");

  const { data: questions, isError } = useQuery<testQuestion[]>({
    queryKey: ["questions", userId, testId],
    queryFn: async () => {
      const response = await db.get(`/test/getquestions/?testid=${testId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });

  if (!questions || !testId) {
    return <Loading />;
  }

  const currentQuestion = questions[questionIdx];

  const options = Object.entries(currentQuestion)
    .filter(([key]) => key.startsWith("option"))
    .map(([, value]) => value);

  function NextQuestion() {
    if (questions && questionIdx < questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    }
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <section className="flex justify-between items-start mt-10 px-14">
      <main className="flex flex-col justify-start w-[70%]">
        <h1 className="text-2xl font-semibold mb-6">{testTitle}</h1>
        <h4 className="text-2xl font-semibold">
          <span>{questionIdx + 1}.</span> {currentQuestion?.question}
        </h4>
        <div className="flex flex-col justify-start gap-y-4 mt-4 ml-6">
          {options.map((option, idx) => (
            <OptionBtn
              key={option}
              idx={idx}
              questionId={currentQuestion.question_id}
            >
              {option}
            </OptionBtn>
          ))}
        </div>
        <div className="mt-4 ml-6 flex gap-x-8 justify-between">
          {questionIdx > 0 && (
            <Button
              onClick={() => setQuestionIdx(questionIdx - 1)}
              variant="test"
            >
              <ArrowLeft />
              Previous
            </Button>
          )}
          {questions && questionIdx === questions.length - 1 ? (
            <TestSubmit
              testId={testId}
              questions={questions}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            >
              <Button variant="test">Submit</Button>
            </TestSubmit>
          ) : (
            <Button
              onClick={NextQuestion}
              variant="test"
              className="ml-auto"
            >
              Next
              <ArrowRight size={50} />
            </Button>
          )}
        </div>
      </main>
      <aside className="flex flex-col justify-center items-center ml-auto">
        <div className="flex flex-col p-6 dark:bg-violet-mix rounded-md justify-center items-center w-56">
          <ProgressBar
            questions={questions}
            difficulty={difficulty!}
          />
          <p className="dark:text-spanish-roast mt-2">Time Remaining</p>
        </div>
        <QuestionList questions={questions} />
      </aside>
    </section>
  );
};

export default QuizPage;
