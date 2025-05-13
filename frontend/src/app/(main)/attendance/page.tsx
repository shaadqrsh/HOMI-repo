"use client";
import ActionTooltip from "@/components/ActionTooltip";
import SubjectAttendance from "@/components/attendance/SubjectAttendance";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import AddSubjectModal from "@/components/models/attendance/AddSubjectModal";
import TargetSliderModal from "@/components/models/attendance/TargetSliderModal";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { subject, targetAttendance } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Info, SquarePen } from "lucide-react";

const Attendance = () => {
  const head = `py-2 text-lg`;
  const userId = Cookies.get("userIdHomi");

  const {
    data: target,
    isLoading: tl,
    isError: te,
  } = useQuery<targetAttendance>({
    queryKey: ["targetattendance", userId],
    queryFn: async () => {
      const response = await db.get(`/api/targetattendance/?user=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });

  const {
    data: subjects,
    isLoading: al,
    isError: ae,
  } = useQuery<subject[]>({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      const response = await db.get(`/api/attendance/?user=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });

  if (al || tl) return <Loading />;

  if (ae || te) return <ServerError />;

  const totalAttended = (subjects ?? []).reduce((sum, subject) => {
    return subject ? sum + subject.attended : sum;
  }, 0);

  const totalConducted = (subjects ?? [])
    .filter(Boolean)
    .reduce((sum, subject) => sum + subject.total, 0);

  const targetP = (target?.target ?? 0) / 100;

  const lecsToAttend = Math.ceil(
    (targetP * totalConducted - totalAttended) / (1 - targetP)
  );

  const lecsToBunk = Math.floor(
    (totalAttended - targetP * totalConducted) / targetP
  );

  const current =
    totalConducted > 0
      ? Number(((totalAttended / totalConducted) * 100).toFixed(2))
      : 0.0;

  let lecMessage = "";

  if (current < (target?.target ?? 0)) {
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

  return (
    <section className="flex flex-col items-center justify-center mt-6 gap-y-2">
      <div className="flex justify-evenly w-[80%] items-center dark:bg-ceremonial-purple bg-Lavender p-4">
        <div className="flex gap-x-2 items-center">
          <h1 className={cn("text-xl font-bold")}>Current: {current}%</h1>
          {current !== 0 && (
            <ActionTooltip label={lecMessage}>
              <Info
                className={cn(
                  "w-5 h-5",
                  current >= (target?.target ?? 0)
                    ? "text-green-600"
                    : "text-rose-600"
                )}
              />
            </ActionTooltip>
          )}
        </div>
        <div className="flex gap-x-2 items-center">
          <h1 className="text-xl font-bold">Target: {target?.target}%</h1>
          <TargetSliderModal
            targetValue={target?.target ?? 0}
            current={current}
            targetId={target?.id ?? ""}
          >
            <SquarePen className="w-5 h-5 cursor-pointer hover:opacity-45" />
          </TargetSliderModal>
        </div>
      </div>

      {/* table */}
      <table className="border border-slate-200 p-1 mt-4 w-[80%] text-center">
        <thead>
          <tr className="py-2 border-b border-slate-200">
            <th className={head}>Subject</th>
            <th className={head}></th>
            <th className={head}>Attended</th>
            <th className={head}>Total</th>
            <th className={head}>Percentage</th>
            <th className={`${head} text-center`}>Status</th>
            <th className={head}></th>
          </tr>
        </thead>
        <tbody>
          {subjects && subjects.length > 0 ? (
            subjects.map((subject) => {
              return (
                <tr
                  key={subject.id}
                  className="py-2 border-b border-slate-200"
                >
                  <SubjectAttendance
                    subject={subject}
                    target={target?.target ?? 0}
                  />
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6}
                className="text-center py-4"
              >
                Add subjects to display attendance data.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-end w-[80%] mt-1">
        <AddSubjectModal>
          <Button variant="att">Add Subject</Button>
        </AddSubjectModal>
      </div>
    </section>
  );
};

export default Attendance;
