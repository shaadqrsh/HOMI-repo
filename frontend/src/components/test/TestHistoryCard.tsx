import { cn } from "@/lib/utils";
import { test } from "@/types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface TestHistoryCardProps {
  test: test;
}

const TestHistoryCard = ({ test }: TestHistoryCardProps) => {
  const router = useRouter();
  function onClick() {
    router.push(`/test/result?testId=${test.test_id}`);
  }
  return (
    <main
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-y-2 p-4 dark:bg-astro-zinger border-2 border-dotted border-black rounded-lg dark:text-spanish-roast font-semibold w-[500px] h-fit cursor-pointer"
      )}
    >
      <h1 className="text-xl">{test.subject}</h1>
      <div className="flex items-center gap-x-4 w-full">
        <h3 className="text-lg">Score: {test.score}</h3>
        <h3 className="ml-auto flex">Date: {format(test.test_date, "PP")}</h3>
      </div>
    </main>
  );
};

export default TestHistoryCard;
