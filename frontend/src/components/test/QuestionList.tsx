import { cn } from "@/lib/utils";
import useTestStore from "@/store/useTestStore";
import { testQuestion } from "@/types";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface QuestionListProps {
  questions: testQuestion[];
}

const QuestionList = ({ questions }: QuestionListProps) => {
  const { questionIdx, setQuestionIdx, answers } = useTestStore();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (questionRefs.current[questionIdx]) {
      questionRefs.current[questionIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [questionIdx]);

  return (
    <div className="w-56 flex flex-col mt-4">
      <h2 className="flex items-center gap-x-2 p-2 dark:bg-violet-mix rounded-md dark:text-spanish-roast font-semibold">
        Quiz Question List
        <ChevronDown />
      </h2>
      <div className="space-y-2 dark:bg-violet-mix p-1 rounded-md mt-2 h-72 overflow-y-auto scrollbar-hide">
        {questions &&
          questions.map((question, idx) => {
            const isAnswered = Object.keys(answers).includes(
              question.question_id.toString()
            );

            return (
              <div
                key={question.question_id}
                ref={(el) => {
                  questionRefs.current[idx] = el;
                }}
                className={cn(
                  "dark:hover:bg-chalk-violet w-full dark:text-liberty-blue font-semibold p-2 rounded-md cursor-pointer transition",
                  questionIdx === idx && "dark:bg-chalk-violet",
                  isAnswered && "dark:text-green-900"
                )}
                onClick={() => setQuestionIdx(idx)}
              >
                Quiz Question {idx + 1}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default QuestionList;
