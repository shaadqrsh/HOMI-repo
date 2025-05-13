import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react";

interface TestOptionsModalProps {
  children: React.ReactNode;
}

const TestOptionsModal = ({ children }: TestOptionsModalProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Test</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            subject.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => e.stopPropagation()}
            className="border-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {}}
            className="dark:text-green-600 dark:bg-spanish-roast dark:hover:bg-slate-800"
          >
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TestOptionsModal;
