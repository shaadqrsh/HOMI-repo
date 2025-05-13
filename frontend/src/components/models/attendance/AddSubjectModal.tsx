"use client";

import Loading from "@/components/fallbacks/Loading";
import FormInput from "@/components/form/FormInput";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface AddSubjectModalProps {
  children: React.ReactNode;
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Subject name is required")
    .transform(
      (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    ),
  attended: z.coerce
    .number()
    .nonnegative("Attended lectures cannot be negative"),
  total: z.coerce.number().nonnegative("Total lectures cannot be negative"),
});

const AddSubjectModal = ({ children }: AddSubjectModalProps) => {
  const userId = Cookies.get("userIdHomi");
  const [loading, setloading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      attended: 0,
      total: 0,
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        await db.post(
          `/api/addsubjectattendance/`,
          {
            subject: values.name,
            attended: values.attended,
            total: values.total,
            user: userId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
            },
          }
        );
        form.reset();
        setOpen(false);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          const errorData = err.response.data;
          form.setError("name", {
            type: "manual",
            message: errorData.Error,
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: "An error occurred. Please try again.",
          });
        }
      }
    },
    onError: () => {
      toast({
        title: "Error Occured",
        description: "Error in updating attendance",
      });
      setloading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects", userId],
        exact: true,
      });
      setloading(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setloading(true);
    if (values.attended > values.total) {
      form.setError("total", {
        type: "manual",
        message: "Total lectures cannot be less than attended lectures",
      });
      setloading(false);
      return;
    }
    mutateAsync(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger
        asChild
        onClick={() => setOpen(true)}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="dark:bg-spanish-roast">
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem className="relative">
                  <Label
                    fieldState={fieldState}
                    label=" Subject Name*"
                  />
                  <FormControl>
                    <FormInput
                      type="text"
                      field={field}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attended"
              render={({ field, fieldState }) => (
                <FormItem className="relative">
                  <Label
                    fieldState={fieldState}
                    label="Lectures Attended"
                  />
                  <FormControl>
                    <FormInput
                      type="number"
                      field={field}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field, fieldState }) => (
                <FormItem className="relative">
                  <Label
                    fieldState={fieldState}
                    label="Total Lectures Conducted"
                  />
                  <FormControl>
                    <FormInput
                      type="number"
                      field={field}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormMessage>{form.formState.errors.root?.message}</FormMessage>

            <Button
              type="submit"
              variant="form"
              disabled={loading}
            >
              {loading ? <Loading /> : "Add"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectModal;
