"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import TestStartModal from "../models/test/TestStartModal";

interface TestOptionsProps {
  label: string;
  id: string;
}

const TestOptions = ({ label, id }: TestOptionsProps) => {
  const [open, setOpen] = useState(false);
  return (
    <TestStartModal
      label={label}
      open={open}
      setOpen={setOpen}
      id={id}
    >
      <div
        className={cn(
          "flex justify-center items-center cursor-pointer rounded-full p-5 bg-astro-zinger w-[280px] h-[75px]"
        )}
      >
        <p
          className={cn(
            "dark:text-liberty-blue font-bold text-lg text-center line-clamp-2"
          )}
        >
          {label}
        </p>
      </div>
    </TestStartModal>
  );
};

export default TestOptions;
