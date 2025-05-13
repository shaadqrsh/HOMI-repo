import ContextMenuTool from "@/components/dropdown/ContextMenuTool";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import useSidebarStore from "@/store/useSidebarStore";
import { draggableItems, file } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Ellipsis, FileIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";

interface ChatFileProps {
  file: file;
}

const ChatFile = ({ file }: ChatFileProps) => {
  const [renameFile, setRenameFile] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const params = useParams();
  const queryClient = useQueryClient();
  const userId = Cookies.get("userIdHomi");
  const dragRef = useRef<HTMLDivElement | null>(null);
  const { keepClose } = useSidebarStore();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: draggableItems.FILE,
    item: file,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (renameFile && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [renameFile]);

  function toggleRenameState() {
    setRenameFile((prevState) => !prevState);
  }

  async function handleRename(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    const newName = nameRef.current?.value;
    if (!newName?.trim()) return;

    try {
      const response = await db.patch(
        `/api/update/fnf/file/`,
        {
          user: userId,
          name: newName,
          file: file.id,
          parentfolderId: file.parentfolderId,
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
      }
    } catch (err) {
      console.log(err);
    }

    toggleRenameState();
  }

  drag(dragRef);

  return (
    <div
      ref={dragRef}
      className={cn(isDragging && "opacity-50")}
    >
      <Link
        className={cn(
          "flex items-center gap-x-2 group mr-auto w-full cursor-pointer p-1 dark:hover:bg-ceremonial-purple rounded-md hover:bg-ceremonial-purple/60 hover:text-white transition",
          params.chatId === file.id &&
            "dark:bg-ceremonial-purple bg-ceremonial-purple text-white "
        )}
        href={`/chat/${file.id}`}
        onClick={keepClose}
      >
        <FileIcon className="w-5 h-5" />

        <div className="mr-auto">
          {renameFile ? (
            <form onSubmit={handleRename}>
              <Input
                defaultValue={file.name}
                className="h-fit border-none border-0 focus-visible:ring-offset-0 focus-visible:ring-0"
                ref={nameRef}
                autoFocus
                onBlur={toggleRenameState}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.stopPropagation();
                  if (e.key === "Escape") toggleRenameState();
                }}
              />
            </form>
          ) : (
            <span onDoubleClick={toggleRenameState}>{file.name}</span>
          )}
        </div>

        {!renameFile && (
          <ContextMenuTool
            id={file.id}
            type="File"
            toggleRename={toggleRenameState}
          >
            <div className="group-hover:flex ml-auto hidden">
              <Ellipsis />
            </div>
          </ContextMenuTool>
        )}
      </Link>
    </div>
  );
};

export default ChatFile;
