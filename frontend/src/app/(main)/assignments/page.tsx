"use client";
import AssignmentWrapper from "@/components/assignment/AssignmentWrapper";
import NoAssignmentCard from "@/components/assignment/NoAssignmentCard";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import AddAssignmentModal from "@/components/models/assignment/AddAssignmentModal";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { assignment } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

const Assignment = () => {
  const userId = Cookies.get("userIdHomi");

  const {
    data: assignments,
    isLoading,
    isError,
  } = useQuery<assignment[]>({
    queryKey: ["assignments", userId],
    queryFn: async () => {
      const response = await db.get(
        `/assignment/getAssignment/?user=${userId}`
      );
      return response.data;
    },
  });

  if (isLoading) return <Loading />;

  if (isError) return <ServerError />;

  const onGoing = assignments?.filter(
    (assignment) => assignment.submitted === false
  );

  const completed = assignments?.filter(
    (assignment) => assignment.submitted === true
  );

  return (
    <>
      {assignments && assignments?.length > 0 ? (
        <div className="flex flex-col justify-center items-center m-4 gap-y-4">
          {onGoing && onGoing?.length > 0 && (
            <AssignmentWrapper
              label="Ongoing Assignments"
              assignments={onGoing!}
            />
          )}
          {completed && completed?.length > 0 && (
            <AssignmentWrapper
              label="Submitted Assignments"
              assignments={completed!}
            />
          )}
          <div className="my-4 items-center flex justify-center">
            <AddAssignmentModal>
              <Button
                type="button"
                variant="att"
              >
                Add Assignment
              </Button>
            </AddAssignmentModal>
          </div>
        </div>
      ) : (
        <NoAssignmentCard />
      )}
    </>
  );
};

export default Assignment;
