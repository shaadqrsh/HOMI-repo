"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";

const formSchema = z.object({
  code: z
    .string()
    .min(6, "Code must be exactly 6 digits")
    .max(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

const Verification = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await db.get(`/api/verify/`, {
        params: {
          email: email,
          otp: values.code,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        toast({ title: "Verification Successful", duration: 2000 });
        const data = response.data;
        Cookies.set("next-session-id-homi", data.access, { expires: 30 });
        Cookies.set("next-secure-id-homi", data.refresh, { expires: 30 });
        Cookies.set("userIdHomi", data.id, { expires: 30 });
        router.replace("/chat");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          form.setError("root", {
            type: "manual",
            message: "Incorrect OTP Entered",
          });
        } else if (error.response?.status === 408) {
          form.setError("root", {
            type: "manual",
            message: "OTP Expired, Please try again",
          });
          setTimeout(() => {
            router.replace("/sign-up");
          }, 1000);
        } else if (error.response?.status === 429) {
          form.setError("root", {
            type: "manual",
            message: "This is email has been blocked for 15 mins",
          });
          setTimeout(() => {
            router.replace("/sign-up");
          }, 10000);
        } else {
          form.setError("root", {
            type: "manual",
            message: "Somthing went wrong, Please try again later",
          });
        }
      }
    }
  }

  return (
    <div className="flex justify-center items-center py-6 flex-col gap-y-4 h-full">
      <Image
        src="/auth3.png"
        alt="logo"
        width={30}
        height={30}
        className="fixed top-4"
      />
      <h1 className="text-center text-3xl font-bold tracking-tight mt-4 text-liberty-blue">
        Verification
      </h1>
      <h3 className="text-center text-xl font-semibold tracking-tight mt-4 text-liberty-blue">
        A code has been sent to {email}
      </h3>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gap-y-6 mt-2 w-1/2 flex flex-col items-center justify-center"
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormLabel
                  className={cn(
                    `text-lg absolute dark:text-black left-0 translate-x-[10px] 
                  -translate-y-[7px] dark:bg-slate-100 px-1 z-10 mt-[2px]`,
                    fieldState.error && "dark:text-red-900"
                  )}
                >
                  Enter the Code
                </FormLabel>
                <FormControl>
                  <div className="flex border-2 border-ceremonial-purple rounded-md w-[310px]">
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      className={`dark:text-ceremonial-purple border-0 
                     dark:border-ceremonial-purple text-md h-15 rounded-md
                     dark:bg-transparent dark:ring-offset-0 dark:focus-visible:ring-0
                       dark:selection:bg-transparent dark:autofill:bg-transparent input-autofill`}
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </div>
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
            Verify
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Verification;
