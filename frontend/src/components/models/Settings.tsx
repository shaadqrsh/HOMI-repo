"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { user } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Loading from "../fallbacks/Loading";
import AuthInput from "../form/AuthInput";
import { Button } from "../ui/button";

interface SettingsProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const formSchema = z.object({
  darkTheme: z.boolean().default(true),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

const formSchemaPass = z.object({
  oldPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type ProfileList = "Profile" | "Security";

const List: ProfileList[] = ["Profile", "Security"];

const Settings = ({ children, open, setOpen }: SettingsProps) => {
  const { setTheme, theme } = useTheme();
  const [state, setState] = useState<ProfileList>("Profile");
  const userId = Cookies.get("userIdHomi");
  const { toast } = useToast();
  const router = useRouter();

  const { data: details, isLoading: detailsLoading } = useQuery<user>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const response = await db.get(`/api/details/`, {
        params: {
          "user-id": userId,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      darkTheme: theme === "dark",
      email: "",
    },
  });

  const formPass = useForm<z.infer<typeof formSchemaPass>>({
    resolver: zodResolver(formSchemaPass),
    defaultValues: {
      confirmPassword: "",
      oldPassword: "",
      newPassword: "",
    },
  });

  const darkTheme = form.watch("darkTheme");

  const isLoading = form.formState.isSubmitting;
  const isLoadingPass = formPass.formState.isSubmitting;

  useEffect(() => {
    form.setValue("darkTheme", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setTheme(darkTheme ? "dark" : "light");
  }, [darkTheme, setTheme]);

  async function changePass(values: z.infer<typeof formSchemaPass>) {
    if (values.confirmPassword !== values.newPassword) {
      formPass.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
    try {
      const response = await db.post(
        "/api/changepass/",
        {
          "old-password": values.oldPassword,
          "new-password": values.newPassword,
          "user-id": userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );

      if (response.status === 200) {
        toast({ title: "Password changed successfully", duration: 2000 });
        formPass.reset();
      }
    } catch (e) {
      console.error("Error changing password:", e);
    }
  }

  async function changeEmail(values: z.infer<typeof formSchema>) {
    try {
      const response = await db.post(
        "/api/changemail/",
        {
          email: values.email,
          "user-id": userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );

      if (response.status === 200) {
        setTimeout(() => {
          router.push(`/verification?email=${values.email}`);
        }, 500);

        form.reset();
      }
    } catch (e) {
      console.error("Error changing email:", e);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full min-w-[40rem] h-fit">
        <DialogTitle>
          <DialogHeader className="text-xl">Profile</DialogHeader>
        </DialogTitle>
        <Separator />

        <section className="flex justify-center h-full w-full">
          <main className="w-[30%] p-2">
            <ul className="flex flex-col justify-start gap-y-2">
              {List.map((li) => (
                <li
                  className={cn(
                    "cursor-pointer p-2 rounded-md dark:hover:bg-ceremonial-purple hover:bg-Lavender transition",
                    li === state && "dark:bg-ceremonial-purple bg-Lavender"
                  )}
                  onClick={() => setState(li)}
                  key={li}
                >
                  {li}
                </li>
              ))}
            </ul>
          </main>

          <aside className="w-[70%] p-2">
            {/* {state === "General" && (
              <Form {...form}>
                <form className="flex flex-col gap-y-1 mt-1">
                  <FormField
                    control={form.control}
                    name="darkTheme"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between px-4">
                        <h2>Dark Theme</h2>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )} */}

            {state == "Profile" && (
              <>
                {detailsLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col mt-2 ml-2">
                    <h3 className="text-sm font-semibold">Username:</h3>
                    <p className="text-lg mb-3">{details?.username}</p>
                    <h3 className="text-sm font-semibold">Email:</h3>
                    <p className="text-lg">{details?.email}</p>
                  </div>
                )}
              </>
            )}

            {state === "Security" && (
              <>
                <Form {...formPass}>
                  <form
                    className="flex flex-col w-full mt-2 gap-y-1"
                    onSubmit={formPass.handleSubmit(changePass)}
                  >
                    <h2>Change your Password:</h2>
                    <div className="mt-2 flex flex-col gap-y-4 w-full">
                      {["oldPassword", "newPassword", "confirmPassword"].map(
                        (name) => (
                          <FormField
                            key={name}
                            control={formPass.control}
                            name={name as keyof typeof formSchemaPass.shape}
                            render={({ field }) => (
                              <FormItem className="relative">
                                <FormControl>
                                  <AuthInput
                                    type="password"
                                    disabled={isLoadingPass}
                                    field={field}
                                    placeholder={name
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/\b\w/g, (char) =>
                                        char.toUpperCase()
                                      )}
                                    fullWidth
                                    settings
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      )}
                      <Button
                        variant="att"
                        type="submit"
                      >
                        {isLoadingPass ? <Loading /> : "Save Password"}
                      </Button>
                    </div>
                  </form>
                </Form>

                <Form {...form}>
                  <form
                    className="flex flex-col w-full mt-2 gap-y-1"
                    onSubmit={form.handleSubmit(changeEmail)}
                  >
                    <h2 className="my-2 mt-5">Change your Email:</h2>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormControl>
                            <AuthInput
                              type="text"
                              disabled={isLoading}
                              field={field}
                              placeholder="Email"
                              fullWidth
                              settings
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      variant="att"
                      type="submit"
                      className="my-2"
                    >
                      {isLoading ? <Loading /> : "Save Email"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </aside>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
