"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { targetAttendance } from "@/types";
import Loading from "../../fallbacks/Loading";

interface TargetSliderModalProps {
  children: React.ReactNode;
  targetValue: number | undefined;
  current: number;
  targetId: string;
}

const TargetSliderModal = ({
  children,
  targetValue,
  targetId,
}: TargetSliderModalProps) => {
  const userId = Cookies.get("userIdHomi");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const value = targetValue ?? 75;
  const [sliderValue, setSliderValue] = useState<number[]>([value]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } = useMutation({
    mutationFn: async (target: string) => {
      await db.put(
        `/api/targetset`,
        {
          target: target,
          user: userId,
          target_id: targetId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
    },
    onSuccess: () => {
      // Update the cache immediately to reflect the new target value
      queryClient.setQueryData(
        ["targetattendance", userId],
        (oldData: targetAttendance) => {
          return { ...oldData, target: sliderValue[sliderValue.length - 1] };
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["targetattendance", userId],
        exact: true,
      });
      setLoading(false);
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error Occured",
        description: "Error in updating Target",
      });
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSliderValue([value]);
      }, 100);
    }
  }, [open, value]);

  function onSubmit() {
    setLoading(true);
    const valueAsString = sliderValue[sliderValue.length - 1].toString();
    mutateAsync(valueAsString);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        asChild
        onClick={() => setOpen(true)}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="dark:bg-spanish-roast">
        <DialogHeader>
          <DialogTitle>Set Target</DialogTitle>
        </DialogHeader>

        <h2>Target: {sliderValue}</h2>

        <Slider
          value={sliderValue}
          onValueChange={(value: number[]) => setSliderValue(value)}
        />

        <Button
          type="button"
          onClick={onSubmit}
          variant="att"
          disabled={loading}
        >
          {loading ? <Loading /> : "Set Target"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TargetSliderModal;
