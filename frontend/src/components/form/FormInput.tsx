import { Input } from "@/components/ui/input";

interface FormInputProps {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  disabled?: boolean;
  placeholder?: string;
}

const FormInput = ({ type, field, disabled, placeholder }: FormInputProps) => {
  return (
    <Input
      className={`dark:bg-transparent dark:ring-offset-0 dark:focus-visible:ring-0 text-md 
        h-15 rounded-md min-w-full dark:text-white border-2 dark:border-white`}
      type={type}
      disabled={disabled}
      {...field}
      autoComplete="off"
      placeholder={placeholder}
    />
  );
};

export default FormInput;
