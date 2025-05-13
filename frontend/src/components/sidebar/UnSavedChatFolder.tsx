import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { draggableItems, file, folder } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { ChevronRight, FolderClosed, FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import ChatFile from "./ChatFile";

interface UnSavedChatFolderProps {
  folder: folder;
  files: file[];
}

const UnSavedChatFolder = ({ folder, files }: UnSavedChatFolderProps) => {
  const [openFolders, setOpenFolders] = useState(false);
  const userId = Cookies.get("userIdHomi");
  const params = useParams();
  const queryClient = useQueryClient();
  const dropRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: draggableItems.FILE,
    drop: (item: file) => {
      handleFileDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  async function handleFileDrop(id: string) {
    try {
      const response = await db.patch(
        `/api/update/fnf/file/`,
        {
          user: userId,
          file: id,
          parentfolderId: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        }
      );
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["files", userId] });
        setOpenFolders(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function toggleFolderState() {
    setOpenFolders((prevState) => !prevState);
  }

  const folderFiles = files.filter((file) => file.parentfolderId === folder.id);

  const sortedFiles = folderFiles.sort((a, b) => a.name.localeCompare(b.name));

  const isSelected = folderFiles.some((file) => file.id === params.chatId);

  useEffect(() => {
    if (isSelected) {
      setOpenFolders(true);
    } else {
      setOpenFolders(false);
    }
  }, [isSelected]);

  drop(dropRef);

  return (
    <div
      className={cn("flex flex-col space-y-2")}
      ref={dropRef}
    >
      <button
        onClick={toggleFolderState}
        className={cn(
          "flex items-center gap-x-2 w-full mr-auto group",
          isOver && "border-b-[4px] dark:border-ceremonial-purple",
          isSelected && "font-bold"
        )}
      >
        <motion.div animate={{ rotate: openFolders ? 90 : 0 }}>
          <ChevronRight className="w-5 h-5" />
        </motion.div>

        {openFolders ? (
          <FolderOpen className="w-5 h-5" />
        ) : (
          <FolderClosed className="w-5 h-5" />
        )}

        <div className="mr-auto">
          <p>{folder?.name}</p>
        </div>
      </button>

      {openFolders && sortedFiles.length > 0 && (
        <div className="ml-[1.6rem] space-y-1">
          {sortedFiles.map((file) => (
            <ChatFile
              key={file.id}
              file={file}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UnSavedChatFolder;
