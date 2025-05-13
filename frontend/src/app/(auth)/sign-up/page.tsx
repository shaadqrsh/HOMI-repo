"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AuthInput from "@/components/form/AuthInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string().min(6, "Password must be at least 6 characters"),
});

const Register = () => {
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.password !== values.confirm) {
      form.setError("confirm", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
    try {
      const response = await db.post(
        `/api/register/`,
        {
          username: values.username,
          password: values.password,
          email: values.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast({ title: "Account Created", duration: 2000 });
        router.replace(`/verification?email=${values.email}`);
        form.reset();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const errorData = error.response.data;
        form.setError(errorData.field, {
          type: "manual",
          message: errorData.message,
        });
      } else {
        form.setError("root", {
          type: "manual",
          message: "Somthing went wrong, Please try again later",
        });
      }
    }
  }

  return (
    <div className="flex justify-center items-center py-6 flex-col gap-y-4 h-full">
      <Image
        src="/authlogo.png"
        alt="logo"
        width={30}
        height={30}
      />
      <h1 className="text-center text-3xl font-bold tracking-tight mt-4 text-liberty-blue">
        Sign up
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gap-y-6 mt-2 w-1/2 flex flex-col items-center justify-center"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormLabel
                  className={cn(
                    `text-lg absolute dark:text-black left-0 translate-x-[10px] 
                  -translate-y-[7px] dark:bg-slate-100 px-1 z-10 mt-[2px]`,
                    fieldState.error && "dark:text-red-900"
                  )}
                >
                  Username*
                </FormLabel>

                <FormControl>
                  <AuthInput
                    type="text"
                    field={field}
                    disabled={isLoading}
                    // autoComplete="off"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormLabel
                  className={cn(
                    `text-lg absolute dark:text-black left-0 translate-x-[10px] 
                  -translate-y-[7px] dark:bg-slate-100 px-1 z-10 mt-[2px]`,
                    fieldState.error && "dark:text-red-900"
                  )}
                >
                  Email*
                </FormLabel>
                <FormControl>
                  <AuthInput
                    type="Email"
                    disabled={isLoading}
                    field={field}
                    // autoComplete="email"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormLabel
                  className={cn(
                    `text-lg absolute dark:text-black left-0 translate-x-[10px] 
                    -translate-y-[7px] dark:bg-slate-100 px-1 z-10 mt-[2px]`,
                    fieldState.error && "dark:text-red-900"
                  )}
                >
                  Password*
                </FormLabel>
                <FormControl>
                  <AuthInput
                    type="password"
                    disabled={isLoading}
                    field={field}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormLabel
                  className={cn(
                    `text-lg absolute dark:text-black left-0 translate-x-[10px] 
                  -translate-y-[7px] dark:bg-slate-100 px-1 z-10 mt-[2px]`,
                    fieldState.error && "dark:text-red-900"
                  )}
                >
                  Confirm Password*
                </FormLabel>
                <FormControl>
                  <AuthInput
                    type="password"
                    disabled={isLoading}
                    field={field}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormMessage className="text-lg">
            {form.formState.errors.root?.message}
          </FormMessage>

          <Button
            className="mt-2 dark:bg-ceremonial-purple dark:text-white hover:dark:bg-ceremonial-purple w-[310px] rounded-md text-md"
            disabled={isLoading}
            type="submit"
          >
            Sign up
          </Button>
        </form>
      </Form>

      <h2 className="text-center text-xl mt-auto text-liberty-blue">
        Already have an account?
        <a
          href="log-in"
          className="hover:underline ml-1"
        >
          Log in
        </a>
      </h2>
    </div>
  );
};

export default Register;
