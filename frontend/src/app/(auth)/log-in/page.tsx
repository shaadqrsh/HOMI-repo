"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LogIn = () => {
  const { toast } = useToast();

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await db.post(
        `/api/token/`,
        {
          username: values.username,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Login Successful",
          duration: 2000,
        });
        const data = response.data;
        Cookies.set("next-session-id-homi", data.access, { expires: 30 });
        Cookies.set("next-secure-id-homi", data.refresh, { expires: 30 });
        Cookies.set("userIdHomi", data.id, { expires: 30 });
        form.reset();
        router.push("/chat");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const errorData = error.response.data;
        form.setError(errorData.field, {
          type: "manual",
          message: errorData.message,
        });
      } else {
        form.setError("root", {
          type: "manual",
          message: "An error occurred. Please try again.",
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
        Log In
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
                    `text-lg absolute dark:text-black text-black bg-slate-100 left-0  
                    translate-x-[10px] -translate-y-[7px] dark:bg-slate-100 px-1 z-10 mt-[2px]`,
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
                    // autoComplete="username"
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
                    `text-lg absolute dark:text-black text-black bg-slate-100 left-0  
                    translate-x-[10px] -translate-y-[7px] dark:bg-slate-100 px-1 z-10 mt-[2px]`,
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
                <Button
                  variant="link"
                  type="button"
                  className="dark:text-black mr-auto -translate-x-4 -translate-y-3"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot Password?
                </Button>
              </FormItem>
            )}
          />

          <FormMessage className="text-lg">
            {form.formState.errors.root?.message}
          </FormMessage>

          <Button
            className="dark:bg-ceremonial-purple bg-ceremonial-purple dark:text-white text-white hover:dark:bg-ceremonial-purple/80 hover:bg-ceremonial-purple/85 w-[310px] rounded-md text-md -translate-y-4"
            disabled={isLoading}
            type="submit"
          >
            Log In
          </Button>
        </form>
      </Form>

      <h2 className="text-center text-xl mt-auto text-liberty-blue">
        Don&apos;t have an account?
        <a
          href="sign-up"
          className="hover:underline ml-1"
        >
          Sign up
        </a>
      </h2>
    </div>
  );
};

export default LogIn;
