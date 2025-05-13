"use client";

import FormInput from "@/components/form/FormInput";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { subject } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Loading from "../../fallbacks/Loading";

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
import { useToast } from "@/hooks/use-toast";

interface EditSubjectModalProps {
  children: React.ReactNode;
  subject: subject;
}

const formSchema = z.object({
  attended: z.coerce
    .number()
    .nonnegative("Attended lectures cannot be negative"),
  total: z.coerce.number().nonnegative("Total lectures cannot be negative"),
});

const EditSubjectModal = ({ children, subject }: EditSubjectModalProps) => {
  const userId = Cookies.get("userIdHomi");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"EDIT" | "DELETE">("EDIT");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attended: subject.attended,
      total: subject.total,
    },
  });

  useEffect(() => {
    form.reset({
      attended: subject.attended,
      total: subject.total,
    });
  }, [subject, form]);

  const { mutateAsync } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        await db.put(
          `/api/editsubject/`,
          {
            subject_id: subject.id,
            subject: subject.subject,
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
        return values;
      } catch (err) {
        console.log(err);
        form.setError("root", {
          type: "manual",
          message: "An error occurred. Please try again.",
        });
        throw err;
      }
    },
    onSuccess: (updatedValues) => {
      // Immediately update the UI by updating the cached subjects for the given user
      queryClient.setQueryData(
        ["subjects", userId],
        (oldSubjects: subject[] | undefined) => {
          if (!oldSubjects) return [];
          return oldSubjects.map((sub) => {
            if (sub.id === subject.id) {
              return {
                ...sub,
                attended: updatedValues.attended,
                total: updatedValues.total,
              };
            }
            return sub;
          });
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["subjects", userId],
        exact: true,
      });
      setLoading(false);
    },
    onError: () => {
      toast({
        title: "Error Occured",
        description: "Error in updating subject",
      });
      setLoading(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    if (values.attended > values.total) {
      form.setError("total", {
        type: "manual",
        message: "Total lectures cannot be less than attended lectures",
      });
      setLoading(false);
      return;
    }
    mutateAsync(values);
  }

  const { mutateAsync: DeleteSub } = useMutation({
    mutationFn: async () => {
      const response = await db.delete(`/api/deletesubject/`, {
        data: {
          user: userId,
          subject_id: subject.id,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Immediately update the UI by removing the deleted subject from the cache
      queryClient.setQueryData(
        ["subjects", userId],
        (oldSubjects: subject[] | undefined) => {
          if (!oldSubjects) return [];
          return oldSubjects.filter((sub) => sub.id !== subject.id);
        }
      );

      // Optionally, if target attendance depends on subjects, invalidate it
      queryClient.invalidateQueries({
        queryKey: ["subjects", userId],
        exact: true,
      });
      setLoading(false);
      setOpen(false);
      setType("EDIT");
    },
    onError: () => {
      toast({
        title: "Error Occured",
        description: "Error in deleting subject",
      });
      setLoading(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
          setType("EDIT");
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
        <AnimatePresence mode="wait">
          {type === "EDIT" ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>Edit Subject</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-y-4 mt-4"
                >
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

                  <FormMessage>
                    {form.formState.errors.root?.message}
                  </FormMessage>

                  <Button
                    type="submit"
                    variant="form"
                    disabled={loading}
                  >
                    {loading ? <Loading /> : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setType("DELETE")}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="delete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>Delete</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-y-4">
                <p className="mt-2">
                  Are you sure you want to delete this subject?
                </p>
                <div className="flex items-center gap-x-4 ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setType("EDIT")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-x-2">
                    <Button
                      variant="destructive"
                      disabled={loading}
                      onClick={() => {
                        DeleteSub();
                        setLoading(true);
                      }}
                    >
                      {loading ? <Loading /> : "Confirm Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectModal;
