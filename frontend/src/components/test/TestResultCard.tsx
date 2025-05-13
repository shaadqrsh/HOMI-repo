import TestResultModal from "@/components/models/test/TestResultModal";
import { cn } from "@/lib/utils";
import { testResult } from "@/types";

interface TestResultCardProps {
  result: testResult;
  questions: testResult[];
  idx: number;
}

const TestResultCard = ({ result, idx, questions }: TestResultCardProps) => {
  const options = Object.entries(result)
    .filter(
      ([key, value]) => key.startsWith("option") && typeof value === "string"
    )
    .map(([, value]) => value as string);

  return (
    <TestResultModal
      questions={questions}
      idx={idx}
    >
      <main
        className={cn(
          "border-l-[6px] flex flex-col items-start gap-y-4 p-4 dark:bg-astro-zinger rounded-lg dark:text-spanish-roast font-semibold w-[500px] h-[200px] cursor-pointer",
          result.is_correct ? "border-test-green" : "border-rose-600"
        )}
      >
        <h1>
          {idx + 1}. {result.question}
        </h1>
        <div className="flex flex-col items-start gap-y-2 overflow-y-auto scrollbar-hide w-full">
          {options.map((option, idx) => {
            return (
              <div
                className="flex gap-x-2 items-center"
                key={idx}
              >
                <div className="p-2 dark:bg-perpetual-purple rounded-full" />
                <h3>{option}</h3>
              </div>
            );
          })}
        </div>
      </main>
    </TestResultModal>
  );
};

export default TestResultCard;
