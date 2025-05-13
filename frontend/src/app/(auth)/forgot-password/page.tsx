"use client";
import AuthInput from "@/components/form/AuthInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchemaEmail = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .toLowerCase(),
});

const formSchemaOTP = z.object({
  code: z
    .string()
    .min(1, "OTP is Required")
    .max(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

const formSchemaPass = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string().min(6, "Password must be at least 6 characters"),
});

type steps = "Email" | "OTP" | "Password";

const Verification = () => {
  const { toast } = useToast();
  const [state, setState] = useState<steps>("Email");
  const [token, setToken] = useState({ token: "", access: "" });
  const router = useRouter();

  const formEmail = useForm<z.infer<typeof formSchemaEmail>>({
    resolver: zodResolver(formSchemaEmail),
    defaultValues: {
      email: "",
    },
  });

  const formOtp = useForm<z.infer<typeof formSchemaOTP>>({
    resolver: zodResolver(formSchemaOTP),
    defaultValues: {
      code: "",
    },
  });

  const formPass = useForm<z.infer<typeof formSchemaPass>>({
    resolver: zodResolver(formSchemaPass),
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const isLoadingEmail = formEmail.formState.isSubmitting;

  const isLoadingOTP = formOtp.formState.isSubmitting;

  const isLoadingPass = formPass.formState.isSubmitting;

  async function onSubmitEmail(values: z.infer<typeof formSchemaEmail>) {
    try {
      const response = await db.post(`/api/forgotpassword/`, {
        email: values.email,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        toast({
          title: "OTP Sent",
          description: `OTP has been sent to ${values.email} `,
          duration: 2000,
        });
        setState("OTP");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          formEmail.setError("root", {
            type: "manual",
            message: "Email not Found",
          });
        } else {
          formEmail.setError("root", {
            type: "manual",
            message: "Somthing went wrong, Please try again later",
          });
        }
      }
    }
  }

  async function onSubmitOTP(values: z.infer<typeof formSchemaOTP>) {
    try {
      const response = await db.get(`/api/verify/`, {
        params: {
          otp: values.code,
          email: formEmail.getValues("email"),
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        console.log(response.data);
        toast({ title: "Email Verified", duration: 2000 });
        const data = response.data;
        Cookies.set("temp", data.access);
        Cookies.set("tempT", data.token);
        setToken({ access: data.access, token: data.token });
        console.log(token.access, token.token);
        setState("Password");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          formOtp.setError("root", {
            type: "manual",
            message: "Incorrect OTP Entered",
          });
        } else if (error.response?.status === 408) {
          formOtp.setError("root", {
            type: "manual",
            message: "OTP Expired, Please try again",
          });
          setTimeout(() => {
            setState("Email");
            formOtp.reset();
          }, 1000);
        } else if (error.response?.status === 429) {
          formOtp.setError("root", {
            type: "manual",
            message: "This is email has been blocked for 15 mins",
          });
          setTimeout(() => {
            router.replace("/sign-up");
          }, 10000);
        } else {
          formOtp.setError("root", {
            type: "manual",
            message: "Somthing went wrong, Please try again later",
          });
        }
      }
    }
  }

  async function onSubmitPass(values: z.infer<typeof formSchemaPass>) {
    if (values.password !== values.confirm) {
      formPass.setError("confirm", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      console.log(token.access, token.token);
      const response = await db.post(`/api/changepass/`, {
        token: Cookies.get("tempT"),
        password: values.password,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("temp")}`,
        },
      });
      if (response.status === 200) {
        toast({ title: "Password Changed Successful", duration: 2000 });
        router.push("/log-in");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          formOtp.setError("root", {
            type: "manual",
            message: "Try again",
          });
          console.error(error);
        } else {
          formOtp.setError("root", {
            type: "manual",
            message: "Somthing went wrong, Please try again later",
          });
        }
      }
    }
  }

  return (
    <section className="flex justify-center items-center py-6 flex-col gap-y-4 h-full">
      <Image
        src="/auth3.png"
        alt="logo"
        width={30}
        height={30}
        className="fixed top-4"
      />
      <h1 className="text-center text-3xl font-bold tracking-tight mt-4 text-liberty-blue">
        Forgot Password
      </h1>

      {state === "Email" && (
        <>
          <Form {...formEmail}>
            <form
              onSubmit={formEmail.handleSubmit(onSubmitEmail)}
              className="gap-y-6 mt-2 w-1/2 flex flex-col items-center justify-center"
            >
              <FormField
                control={formEmail.control}
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
                        disabled={isLoadingEmail}
                        field={field}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormMessage className="text-lg">
                {formEmail.formState.errors.root?.message}
              </FormMessage>

              <Button
                className="mt-2 dark:bg-ceremonial-purple dark:text-white hover:dark:bg-ceremonial-purple w-[310px] rounded-md text-md"
                disabled={isLoadingEmail}
                type="submit"
              >
                Send Mail
              </Button>
            </form>
          </Form>
        </>
      )}

      {state === "OTP" && (
        <>
          <Form {...formOtp}>
            <form
              onSubmit={formOtp.handleSubmit(onSubmitOTP)}
              className="gap-y-6 mt-2 w-1/2 flex flex-col items-center justify-center"
            >
              <FormField
                control={formOtp.control}
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
                      OTP*
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        className={`dark:text-ceremonial-purple border-2 w-[310px]
                     dark:border-ceremonial-purple text-md h-15 rounded-md
                     dark:bg-transparent dark:ring-offset-0 dark:focus-visible:ring-0
                       dark:selection:bg-transparent dark:autofill:bg-transparent input-autofill`}
                        disabled={isLoadingOTP}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormMessage className="text-lg">
                {formOtp.formState.errors.root?.message}
              </FormMessage>

              <Button
                className="mt-2 dark:bg-ceremonial-purple dark:text-white hover:dark:bg-ceremonial-purple w-[310px] rounded-md text-md"
                disabled={isLoadingPass}
                type="submit"
              >
                Verify Mail
              </Button>
            </form>
          </Form>
        </>
      )}
      {state === "Password" && (
        <>
          <Form {...formPass}>
            <form
              onSubmit={formPass.handleSubmit(onSubmitPass)}
              className="gap-y-6 mt-2 w-1/2 flex flex-col items-center justify-center"
            >
              <FormField
                control={formPass.control}
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
                      New Password*
                    </FormLabel>
                    <FormControl>
                      <AuthInput
                        type="password"
                        disabled={isLoadingPass}
                        field={field}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={formPass.control}
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
                        disabled={isLoadingEmail}
                        field={field}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormMessage className="text-lg">
                {formOtp.formState.errors.root?.message}
              </FormMessage>

              <Button
                className="mt-2 dark:bg-ceremonial-purple dark:text-white hover:dark:bg-ceremonial-purple w-[310px] rounded-md text-md"
                disabled={isLoadingPass}
                type="submit"
              >
                Change Password
              </Button>
            </form>
          </Form>
        </>
      )}
    </section>
  );
};

export default Verification;
