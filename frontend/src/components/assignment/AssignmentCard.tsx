"use client";
import EditAssignmentModal from "@/components/models/assignment/EditAssignmentModal";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { assignment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { Edit } from "lucide-react";

interface AssignmentCardProps {
  assignment: assignment;
}

const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const userId = Cookies.get("userIdHomi");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      await db.put(
        `/assignment/onSubmittedChange/`,
        {
          user: userId,
          assignment_id: assignment.id,
          submitted: !assignment.submitted,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["assignments", userId] });

      const previousAssignments = queryClient.getQueryData([
        "assignments",
        userId,
      ]);

      queryClient.setQueryData(
        ["assignments", userId],
        (old: assignment[] = []) =>
          old.map((a: assignment) =>
            a.id === assignment.id ? { ...a, submitted: !a.submitted } : a
          )
      );

      return { previousAssignments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["assignments", userId],
        context?.previousAssignments
      );
      toast({ title: "Error", description: "Error Updating Assignment" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", userId] });
    },
  });

  let date = "-";
  let isPast = false;

  if (assignment.due_date !== null) {
    const [day, month, year] = assignment.due_date.split("-");
    const formattedDateStr = `${year}-${month}-${day}`;
    const dueDate = new Date(formattedDateStr);
    const today = new Date();

    isPast = dueDate < today;
    date = format(dueDate, "PP");
  }

  return (
    <section className="px-4 py-3 dark:bg-astro-zinger bg-Lavender max-h-fit w-[385px] rounded-lg flex flex-col gap-y-1 min-h-48 h-48">
      <div className="flex justify-start items-center">
        <h1
          className={cn(
            "text-lg font-semibold",
            isPast && !assignment.submitted
              ? "text-red-800"
              : "dark:text-liberty-blue"
          )}
        >
          {assignment.subject}
        </h1>
        <EditAssignmentModal assignment={assignment}>
          <Edit className="ml-auto w-5 h-5 cursor-pointer dark:text-liberty-blue transition hover:opacity-45" />
        </EditAssignmentModal>
      </div>

      <div className="flex justify-between gap-x-4">
        <p className="dark:text-liberty-blue items-center">Due Date: {date}</p>
        <p className="dark:text-liberty-blue">
          Total Marks:
          {assignment.total_marks === 0 ? " -" : ` ${assignment.total_marks}`}
        </p>
      </div>

      <h2 className="dark:text-liberty-blue text-sm">Note:</h2>
      <div className="flex flex-col overflow-y-auto scrollbar-hide">
        <p className="dark:text-liberty-blue text-sm mb-1">
          {assignment.note?.trim() ? assignment.note : "-"}
        </p>
      </div>

      <div className="flex justify-start mt-auto">
        <button
          onClick={async () => await mutateAsync()}
          className={cn(
            "dark:bg-liberty-blue p-2 rounded-md dark:hover:bg-transparent dark:hover:border-liberty-blue hover:border-2 dark:hover:text-liberty-blue transition"
          )}
        >
          {assignment.submitted ? "Undo" : "Submit"}
        </button>
      </div>
    </section>
  );
};

export default AssignmentCard;
