"use client";

import FormInput from "@/components/form/FormInput";
import FormTextArea from "@/components/form/FormTextArea";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Loading from "@/components/fallbacks/Loading";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { DatePicker } from "../../DatePicker";

interface AddAssignmentModalProps {
  children: React.ReactNode;
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Assignment name is required")
    .transform(
      (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    ),
  dueDate: z.date(),
  stringDate: z.string(),
  note: z.string().max(100, "Note can only be of 100 characters").optional(),
  marks: z.coerce.number(),
  isSubmitted: z.boolean().optional().default(false),
});

const AddAssignmentModal = ({ children }: AddAssignmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const userId = Cookies.get("userIdHomi");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      note: "",
      marks: 0,
      stringDate: "",
      isSubmitted: false,
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        await db.post(
          `/assignment/addAssignment/`,
          {
            subject: values.name,
            total_marks: values.marks,
            due_date: values.stringDate,
            note: values.note,
            submitted: values.isSubmitted,
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
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setLoading(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setLoading(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    if (values.dueDate) {
      values.stringDate = format(values.dueDate, "P");

      const [month, day, year] = values.stringDate.split("/");
      values.stringDate = `${day}-${month}-${year}`;
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
          <DialogTitle>Add Assignment</DialogTitle>
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
                    label="Assignment*"
                    fieldState={fieldState}
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
                      label="Marks"
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
                      label="DueDate*"
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

            <FormField
              control={form.control}
              name="isSubmitted"
              render={({ field, fieldState }) => (
                <FormItem className="flex items-center gap-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-md dark:text-white flex items-center pb-2">
                    Submitted
                  </FormLabel>
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

export default AddAssignmentModal;
