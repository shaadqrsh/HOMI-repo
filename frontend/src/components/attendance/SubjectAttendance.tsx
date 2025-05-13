"use client";
import EditSubjectModal from "@/components/models/attendance/EditSubjectModal";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { type subject } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Edit, Info, Minus, Plus } from "lucide-react";
import ActionTooltip from "../ActionTooltip";

interface SubjectAttendanceProps {
  subject: subject;
  target: number;
}

const SubjectAttendance = ({ subject, target }: SubjectAttendanceProps) => {
  const { toast } = useToast();
  const data = `py-2 text-lg`;
  const queryClient = useQueryClient();
  const userId = Cookies.get("userIdHomi");

  const targetP = target / 100;

  const attendancePercentage = Number(
    ((subject?.attended / subject?.total) * 100).toFixed(2)
  );

  const lecsToAttend = Math.ceil(
    (targetP * subject.total - subject.attended) / (1 - targetP)
  );

  const lecsToBunk = Math.floor(
    (subject.attended - targetP * subject.total) / targetP
  );

  let lecMessage = "";

  if (subject.total === 0) {
    lecMessage = "No lectures have been conducted";
  } else {
    if (attendancePercentage < target) {
      if (lecsToAttend === Infinity) {
        lecMessage = "You have to attend all Lectures";
      } else if (lecsToAttend === 1) {
        lecMessage = "You have to attend the next lecture";
      } else {
        lecMessage = `You have to attend the next ${lecsToAttend} lectures`;
      }
    } else {
      if (lecsToBunk === 1) {
        lecMessage = "You can miss one class and still stay on track";
      } else if (lecsToBunk === 0) {
        lecMessage = "You can't miss the next lecture";
      } else {
        lecMessage = `You can miss up to ${lecsToBunk} classes and still stay on track`;
      }
    }
  }

  const { mutateAsync: Inc } = useMutation({
    mutationFn: async () => {
      await db.patch(
        `/api/incrementattendance/`,
        {
          user: userId,
          subject_id: subject.id,
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
      // Cancel any outgoing queries for "subjects" to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["subjects", userId] });

      // Snapshot of previous subjects
      const previousSubjects = queryClient.getQueryData(["subjects", userId]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["subjects", userId],
        (oldSubjects: subject[]) => {
          if (!oldSubjects) return oldSubjects;

          return oldSubjects.map((sub) => {
            if (sub.id === subject.id) {
              return {
                ...sub,
                attended: sub.attended + 1,
                total: sub.total + 1,
              };
            }
            return sub;
          });
        }
      );

      return { previousSubjects };
    },
    onError: (err, variables, context) => {
      toast({
        title: "Error Occured",
        description: "Error in updating attendance",
      });
      queryClient.setQueryData(["subjects", userId], context?.previousSubjects);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects", userId],
        exact: true,
      });
    },
  });

  const { mutateAsync: Dec } = useMutation({
    mutationFn: async () => {
      await db.patch(
        `/api/decrementattendance/`,
        {
          user: userId,
          subject_id: subject.id,
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
      // Cancel any outgoing queries for "subjects" to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["subjects", userId] });

      // Snapshot of previous subjects
      const previousSubjects = queryClient.getQueryData(["subjects", userId]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["subjects", userId],
        (oldSubjects: subject[]) => {
          if (!oldSubjects) return oldSubjects;

          return oldSubjects.map((sub) => {
            if (sub.id === subject.id) {
              return {
                ...sub,
                total: sub.total + 1,
              };
            }
            return sub;
          });
        }
      );

      return { previousSubjects };
    },
    onError: (err, variables, context) => {
      toast({
        title: "Error Occured",
        description: "Error in updating attendance",
      });
      queryClient.setQueryData(["subjects", userId], context?.previousSubjects);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects", userId],
        exact: true,
      });
    },
  });

  return (
    <>
      <td className={data}>{subject.subject}</td>
      <td className={data}>
        <div className="flex items-center justify-center gap-x-4">
          <button
            onClick={() => Inc()}
            className="bg-emerald-800 rounded-md text-slate-200 cursor-pointer text-base p-[5px]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => Dec()}
            className="bg-red-700 rounded-md text-slate-200 cursor-pointer text-base p-[5px]"
          >
            <Minus
              size={25}
              className="w-4 h-4"
            />
          </button>
        </div>
      </td>
      <td className={data}>{subject.attended}</td>
      <td className={data}>{subject.total}</td>
      <td className={data}>{attendancePercentage}%</td>
      <td className={`${data} text-center flex justify-center`}>
        <ActionTooltip label={lecMessage}>
          <Info
            className={cn(
              attendancePercentage >= target
                ? "text-emerald-600"
                : "text-rose-600"
            )}
          />
        </ActionTooltip>
      </td>
      <td className={data}>
        <EditSubjectModal subject={subject}>
          <Edit className=" hover:text-emerald-700 cursor-pointer transition" />
        </EditSubjectModal>
      </td>
    </>
  );
};

export default SubjectAttendance;
