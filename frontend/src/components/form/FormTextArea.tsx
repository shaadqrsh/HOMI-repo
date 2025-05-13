import { Textarea } from "../ui/textarea";

interface FormTextAreaProps {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  disabled?: boolean;
}

const FormTextArea = ({ type, field, disabled }: FormTextAreaProps) => {
  return (
    <Textarea
      className={`dark:bg-transparent dark:ring-offset-0 dark:focus-visible:ring-0 text-md 
        min-h-12 rounded-md w-full dark:text-white border-2 dark:border-white`}
      type={type}
      disabled={disabled}
      {...field}
      autoComplete="off"
    />
  );
};

export default FormTextArea;
