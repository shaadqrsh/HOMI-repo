import { CircleUserRound } from "lucide-react";

const Question = ({ question }: { question: string }) => {
  return (
    <div className="text-slate-200 font-medium text-xl flex gap-x-2 items-center">
      <CircleUserRound size={30} />
      {question}
    </div>
  );
};

export default Question;
