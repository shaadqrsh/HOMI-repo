"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface AuthInputProps {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  fullWidth?: boolean;
  settings?: boolean;
}

const AuthInput = ({
  type,
  field,
  disabled,
  placeholder,
  fullWidth,
  settings,
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div
      className={cn(
        "flex border-2 border-ceremonial-purple rounded-md w-[310px]",
        fullWidth && "w-full"
      )}
    >
      <Input
        className={cn(
          `dark:text-ceremonial-purple border-0 
          dark:border-ceremonial-purple text-md h-15 rounded-md
          dark:bg-transparent dark:ring-offset-0 dark:focus-visible:ring-0
          text-ceremonial-purple bg-transparent ring-offset-0 focus-visible:ring-0
          dark:autofill:bg-transparent input-autofill border-ceremonial-purple autofill:bg-transparent`,
          fullWidth && "w-full",
          settings && "dark:text-white"
        )}
        type={showPassword ? "text" : type}
        disabled={disabled}
        {...field}
        placeholder={placeholder}
        autoComplete="off"
      />
      {type === "password" && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="mr-2"
        >
          {showPassword ? (
            <EyeOff
              size={20}
              className="dark:text-ceremonial-purple"
            />
          ) : (
            <Eye
              size={20}
              className="dark:text-ceremonial-purple"
            />
          )}
        </button>
      )}
    </div>
  );
};

export default AuthInput;
