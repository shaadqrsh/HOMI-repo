"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Update HELP type so that each step can be either a string or an object with image and text.
const HELP: Record<string, Array<string | { img: string; text: string }>> = {
  chat: [
    {
      img: "/cap.svg",
      text: "Here is help for chat. This image shows a cap icon.",
    },
    "Step 2: Use the toolbar to send messages.",
    "Step 3: Manage your conversations using the options menu.",
  ],
  attendance: [
    "Attendance Help: Step 1: Understand the attendance dashboard.",
    "Step 2: Mark your attendance accurately.",
    "Step 3: Review your attendance history to track your progress.",
  ],
  assignments: [
    "Assignments Help: Step 1: View your pending assignments.",
    "Step 2: Click an assignment for details and deadlines.",
    "Step 3: Submit your work before the deadline.",
  ],
  test: [
    "Test Help: Step 1: Read the test instructions carefully.",
    "Step 2: Answer all questions within the time limit.",
    "Step 3: Review your answers before submitting your test.",
  ],
};

interface HelpModelProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const HelpModel = ({ open, setOpen, children }: HelpModelProps) => {
  const pathname = usePathname();
  const path = pathname.split("/")[1];
  const steps = HELP[path] || ["No help available for this section."];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setStepIndex(0);
    }
  }, [open]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setOpen(false);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Help</AlertDialogTitle>
        </AlertDialogHeader>
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {typeof steps[stepIndex] === "object" ? (
              <div className="flex flex-col items-center">
                <img
                  src={(steps[stepIndex] as { img: string; text: string }).img}
                  alt="Help visual"
                  className="mb-2 w-16 h-16"
                />
                <p>
                  {(steps[stepIndex] as { img: string; text: string }).text}
                </p>
              </div>
            ) : (
              <p>{steps[stepIndex] as string}</p>
            )}
          </motion.div>
        </AnimatePresence>
        <AlertDialogFooter>
          <div className="flex justify-between w-full">
            {stepIndex > 0 ? (
              <Button
                onClick={handleBack}
                variant="att"
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}
            {stepIndex < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="att"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="att"
                onClick={() => setOpen(false)}
              >
                Okay
              </Button>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default HelpModel;
