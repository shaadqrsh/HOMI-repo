"use client";

import { DatePicker } from "@/components/DatePicker";
import Loading from "@/components/fallbacks/Loading";
import FormInput from "@/components/form/FormInput";
import FormTextArea from "@/components/form/FormTextArea";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { assignment } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface EditAssignmentModalProps {
  children: React.ReactNode;
  assignment: assignment;
}

const formSchema = z.object({
  dueDate: z.date(),
  stringDate: z.string(),
  note: z.string().max(100, "Note can only be of 100 characters").optional(),
  marks: z.coerce.number(),
});

const EditAssignmentModal = ({
  children,
  assignment,
}: EditAssignmentModalProps) => {
  const userId = Cookies.get("userIdHomi");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"EDIT" | "DELETE">("EDIT");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stringDate: assignment.due_date,
      note: assignment.note,
      marks: assignment.total_marks,
    },
  });

  useEffect(() => {
    form.reset({
      stringDate: assignment.due_date,
      note: assignment.note,
      marks: assignment.total_marks,
    });

    const string = form.getValues("stringDate");
    const [day, month, year] = string.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    form.setValue("dueDate", date);
  }, [assignment, form]);

  const { mutateAsync } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      await db.patch(
        `/assignment/editAssignment/`,
        {
          total_marks: values.marks,
          due_date: values.stringDate,
          note: values.note,
          assignment_id: assignment.id,
          user: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
      setOpen(false);
      form.reset();
      return values;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["assignments", userId] });

      const previousAssignments = queryClient.getQueryData<assignment[]>([
        "assignments",
        userId,
      ]);

      return { previousAssignments };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["assignments", userId],
        (oldData: assignment[] = []) =>
          oldData.map((assignmentItem) =>
            assignmentItem.id === assignment.id
              ? {
                  ...assignmentItem,
                  total_marks: variables.marks,
                  due_date: variables.stringDate,
                  note: variables.note,
                }
              : assignmentItem
          )
      );
      setLoading(false);
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["assignments", userId],
        context?.previousAssignments
      );
      toast({ title: "Error", description: "Error Updating Assignment" });
      setLoading(false);
    },
  });

  const { mutateAsync: deleteAssignment } = useMutation({
    mutationFn: async () => {
      await db.delete(`/assignment/deleteAssignment/`, {
        data: {
          user: userId,
          assignment_id: assignment.id,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["assignments", userId] });

      const previousAssignments = queryClient.getQueryData<assignment[]>([
        "assignments",
        userId,
      ]);

      queryClient.setQueryData(
        ["assignments", userId],
        (oldData: assignment[] = []) =>
          oldData.filter((a) => a.id !== assignment.id)
      );

      return { previousAssignments };
    },
    onSuccess: () => {
      setLoading(false);
      setOpen(false);
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["assignments", userId],
        context?.previousAssignments
      );
      toast({ title: "Error", description: "Error Deleting Assignment" });
      setLoading(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.dueDate) {
      values.stringDate = format(values.dueDate, "P");
      const [month, day, year] = values.stringDate.split("/");
      values.stringDate = `${day}-${month}-${year}`;
    }
    setLoading(true);
    mutateAsync(values);
  }

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
                <DialogTitle>Edit Assignment</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-y-4 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field, fieldState }) => (
                      <FormItem className="relative">
                        <Label
                          label="Note"
                          fieldState={fieldState}
                        />
                        <FormControl>
                          <FormTextArea
                            type="text"
                            field={field}
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 w-full gap-x-4">
                    <FormField
                      control={form.control}
                      name="marks"
                      render={({ field, fieldState }) => (
                        <FormItem className="relative">
                          <Label
                            label="Marks*"
                            fieldState={fieldState}
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
                      name="dueDate"
                      render={({ field, fieldState }) => (
                        <FormItem className="relative">
                          <Label
                            label="DueDate"
                            fieldState={fieldState}
                          />
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormMessage>
                    {form.formState.errors.root?.message}
                  </FormMessage>

                  <Button
                    type="submit"
                    variant="form"
                    disabled={loading}
                  >
                    {loading ? <Loading /> : "Edit"}
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
                  Are you sure you want to delete this assignment?
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
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setLoading(true);
                      deleteAssignment();
                    }}
                    disabled={loading}
                  >
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentModal;
