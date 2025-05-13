import { assignment } from "@/types";
import AssignmentCard from "./AssignmentCard";

interface AssignmentWrapperProps {
  label: string;
  assignments: assignment[];
}

const AssignmentWrapper = ({ label, assignments }: AssignmentWrapperProps) => {
  return (
    <section className="flex flex-col justify-center items-center gap-y-2">
      <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
      <div className="flex justify-center  flex-wrap gap-[18px]">
        {assignments?.map((item) => {
          return (
            <AssignmentCard
              assignment={item}
              key={item.id}
            />
          );
        })}
      </div>
    </section>
  );
};

export default AssignmentWrapper;
