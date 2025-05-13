import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ControllerFieldState } from "react-hook-form";

interface LabelProps {
  label: string;
  fieldState: ControllerFieldState;
}

const Label = ({ label, fieldState }: LabelProps) => {
  return (
    <FormLabel
      className={cn(
        `text-md absolute dark:text-white left-0 translate-x-[10px] 
        -translate-y-[7px] dark:bg-spanish-roast px-[5px] z-20 mt-[2px]`,
        fieldState.error && "dark:text-red-900"
      )}
    >
      {label}
    </FormLabel>
  );
};

export default Label;
