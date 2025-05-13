"use client";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import SearchBar from "@/components/test/SearchBar";
import TestOptions from "@/components/test/TestOptions";
import { useToast } from "@/hooks/use-toast";
import { useFetchFiles } from "@/lib/fetchHooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TestPage = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const { data: TEST, isLoading, isError } = useFetchFiles();

  function routerToHistory() {
    router.push("/test/history");
  }

  useEffect(() => {
    if (TEST && TEST.some((testL) => testL.name === "New Chat")) {
      toast({
        title: "Please rename any unamed chats",
      });
    }
  }, [TEST]);

  if (isLoading || !TEST) {
    return <Loading />;
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <section className="flex flex-col items-center h-screen mt-10">
      <div className="relative w-full flex items-center justify-center">
        <SearchBar
          state={search}
          setState={setSearch}
        />

        <div
          className="absolute right-6 w-[93px] flex flex-col items-center justify-center dark:hover:border-white border-spanish-roast border-2 p-1 rounded-lg cursor-pointer transition"
          onClick={routerToHistory}
        >
          <Image
            src="/history.svg"
            alt="history"
            width={50}
            height={50}
            className="cursor-pointer mr-2"
          />
          <h4 className="mt-2">History</h4>
        </div>
      </div>

      <div className="flex flex-wrap justify-start items-start mt-10 mb-2 gap-x-8 gap-y-4 max-h-[65vh] overflow-y-auto w-[83%] scrollbar-hide">
        {TEST.filter(
          (testL) =>
            testL.name &&
            testL.name !== "New Chat" &&
            testL.name.toLowerCase().includes(search.toLowerCase())
        ).map((filteredTest) => (
          <TestOptions
            key={filteredTest.id}
            label={filteredTest.name}
            id={filteredTest.id}
          />
        ))}
      </div>
    </section>
  );
};

export default TestPage;
