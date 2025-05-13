import { cn } from "@/lib/utils";
import useTestStore from "@/store/useTestStore";
import { Check } from "lucide-react";
import React from "react";

interface OptionBtnProps {
  children: React.ReactNode;
  idx: number;
  questionId: string;
}

const idxMap = ["A", "B", "C", "D"];

const OptionBtn = ({ children, idx, questionId }: OptionBtnProps) => {
  const { answers, addAnswers } = useTestStore();

  const isSelected = answers[questionId] === `option${idxMap[idx]}`;

  function answer() {
    addAnswers(questionId, `option${idxMap[idx]}`);
  }
  return (
    <button
      className={cn(
        "h-fit flex items-center justify-start gap-x-4 dark:bg-white rounded-lg p-[2px] dark:text-liberty-blue transition text-start",
        isSelected && "dark:bg-violet-mix"
      )}
      onClick={answer}
    >
      <div
        className={cn(
          " min-w-[40px] w-[40px] min-h-[40px] dark:bg-violet-mix rounded-md flex items-center justify-center dark:text-spanish-roast transition",
          isSelected && "dark:bg-perpetual-purple dark:text-white"
        )}
      >
        {idxMap[idx]}
      </div>
      <span className="text-lg font-medium">{children}</span>
      {isSelected && (
        <Check className="ml-auto mr-2 p-1 dark:bg-perpetual-purple rounded-full dark:text-white" />
      )}
    </button>
  );
};
export default OptionBtn;
