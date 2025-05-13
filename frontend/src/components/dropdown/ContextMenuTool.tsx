import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DeleteAlert from "@/components/models/DeleteFolderAlert";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";
import { useFetchFiles, useFetchFolders } from "@/lib/fetchHooks";
import { getFolderDepth } from "@/lib/utils";
import useSidebarStore from "@/store/useSidebarStore";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ContextMenuToolProps {
  children: React.ReactNode;
  id: string;
  type: "Folder" | "File";
  toggleRename: (id: string) => void;
  toggleFolder?: (id: string) => void;
}

const ContextMenuTool = ({
  children,
  id,
  type,
  toggleRename,
  toggleFolder,
}: ContextMenuToolProps) => {
  const [addFolder, setAddFolder] = useState(true);
  const userId = Cookies.get("userIdHomi");
  const queryClient = useQueryClient();
  const { data: folders } = useFetchFolders();
  const { data: files } = useFetchFiles();
  const { loading, keepClose } = useSidebarStore();
  const router = useRouter();

  // Determine loading state without conditionally returning early
  const isLoading = !folders || !files;

  useEffect(() => {
    // Only update addFolder when data is available
    if (!isLoading) {
      setAddFolder(getFolderDepth(id, folders) < 2);
    }
  }, [folders, id, isLoading]);

  async function createSubfolder() {
    if (loading) return;
    try {
      const response = await db.post(
        `/api/new/folder/`,
        {
          type: "folder",
          user: userId,
          parentfolderId: id,
          name: "SubFolder",
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
      }
    } catch (err) {
      console.log(err);
    }
    if (toggleFolder) toggleFolder(id);
  }

  async function createNewFile() {
    if (loading) return;
    try {
      const response = await db.post(
        `/api/new/folder/`,
        {
          type: "file",
          user: userId,
          parentfolderId: id,
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
        queryClient.invalidateQueries({ queryKey: ["files"] });
        router.push(`/chat/${response.data.id}`);
        keepClose();
      }
    } catch (err) {
      console.log(err);
    }
    if (toggleFolder) toggleFolder(id);
  }

  if (isLoading) {
    return (
      <motion.div className="flex flex-col gap-y-4">
        <Skeleton className="w-full h-5 rounded-md" />
        <Skeleton className="w-full h-5 rounded-md" />
        <Skeleton className="w-full h-5 rounded-md" />
      </motion.div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="z-20">
        {type === "Folder" && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (addFolder) createSubfolder();
              }}
              disabled={!addFolder}
            >
              New Subfolder
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                createNewFile();
              }}
            >
              New Chat
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            toggleRename(id);
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DeleteAlert
          type={type}
          loading={loading}
          isLoading={isLoading}
          files={files}
          id={id}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
            }}
            onSelect={(e) => e.preventDefault()}
            className="text-rose-500 focus:text-rose-500 dark:text-rose-500 dark:focus:text-rose-500 cursor-pointer"
            disabled={files.length === 1 && type === "File"}
          >
            Delete
          </DropdownMenuItem>
        </DeleteAlert>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContextMenuTool;
