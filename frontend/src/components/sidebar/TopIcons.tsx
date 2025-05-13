"use client";

import ActionTooltip from "@/components/ActionTooltip";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import useSidebarStore from "@/store/useSidebarStore";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Spin as Hamburger } from "hamburger-react";
import Cookies from "js-cookie";
import { CirclePlus, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const TopIcons = () => {
  const { open, ChangeState, setLoading, loading, keepClose } =
    useSidebarStore();
  const userId = Cookies.get("userIdHomi");
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleFolder() {
    try {
      if (loading) return;
      setLoading(true);
      const response = await db.post(
        `/api/new/folder/`,
        {
          type: "folder",
          user: userId,
          name: "New Folder",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["folders", userId] });
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFile() {
    try {
      if (loading) return;
      setLoading(true);
      const response = await db.post(
        `/api/new/folder/`,
        {
          type: "file",
          user: userId,
          parentfolderId: userId,
          name: "New Chat",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
      if (response.status === 200) {
        router.push(`/chat/${response.data.id}`);
        queryClient.invalidateQueries({ queryKey: ["files", userId] });
        setLoading(false);
        keepClose();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex flex-col my-4 items-start">
      <motion.div
        layout
        className="flex items-center"
      >
        <ActionTooltip
          label="Open"
          side="right"
          disabled={open}
        >
          <motion.div layout>
            <Hamburger
              toggled={open}
              toggle={ChangeState}
              direction="right"
              size={25}
              rounded
            />
          </motion.div>
        </ActionTooltip>

        {open && (
          <motion.span
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base ml-2 h-fit"
          >
            Close
          </motion.span>
        )}
      </motion.div>

      <motion.div
        layout
        className="flex items-center my-2"
      >
        <ActionTooltip
          label="New Chat"
          side="right"
          disabled={open}
        >
          <motion.button
            className={cn(`group rounded-full w-fit ml-3 flex items-center`)}
            onClick={handleFile}
            layout
          >
            <motion.div layout>
              <CirclePlus size={25} />
            </motion.div>
            {open && (
              <motion.span
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base ml-[18px] pr-4 h-fit"
              >
                New Chat
              </motion.span>
            )}
          </motion.button>
        </ActionTooltip>
      </motion.div>

      {open && (
        <>
          <motion.button
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center mt-2"
            onClick={handleFolder}
          >
            <FolderPlus
              size={25}
              className=" ml-3"
            />
            <motion.span
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.23 }}
              className="text-base ml-[18px] h-fit"
            >
              New Folder
            </motion.span>
          </motion.button>
        </>
      )}
    </div>
  );
};

export default TopIcons;
