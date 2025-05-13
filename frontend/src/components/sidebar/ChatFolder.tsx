import ContextMenuTool from "@/components/dropdown/ContextMenuTool";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { cn, getFolderDepth } from "@/lib/utils";
import { draggableItems, file, folder } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { ChevronRight, Ellipsis, FolderClosed, FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import ChatFile from "./ChatFile";

interface ChatFolderProps {
  folder: folder;
  allFolders: folder[];
  allFiles: file[];
}

const ChatFolder = ({ folder, allFolders, allFiles }: ChatFolderProps) => {
  const [openFolders, setOpenFolders] = useState(false);
  const [renameFolder, setRenameFolder] = useState(false);
  const queryClient = useQueryClient();
  const userId = Cookies.get("userIdHomi");
  const params = useParams();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [draggableItems.FILE, draggableItems.FOLDER],
    drop: (item: file | folder) => {
      if (item.type === "file") {
        handleFileDrop(item.id);
      }
      if (item.type === "folder") {
        const targetFolder = allFolders.find((folder) => folder.id === item.id);
        handleFolderDrop(targetFolder);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: draggableItems.FOLDER,
    item: folder,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  async function handleFolderDrop(target: folder | undefined) {
    if (target?.id === folder.id) return;
    if (isFolderNested) return;
    if (folder.parentfolderId === target?.id) return;
    try {
      const response = await db.patch(
        `/api/update/fnf/folder/`,
        {
          user: userId,
          folder: target?.id,
          parentfolderId: folder.id,
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
  }

  async function handleFileDrop(id: string) {
    try {
      const response = await db.patch(
        `/api/update/fnf/file/`,
        {
          user: userId,
          file: id,
          parentfolderId: folder.id,
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
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const name = nameRef.current?.value;
    if (!name?.trim()) return;

    try {
      const response = await db.patch(
        `/api/update/fnf/folder/`,
        {
          user: userId,
          name: name,
          folder: folder.id,
          parentfolderId:
            folder.parentfolderId === "TOP" ? null : folder.parentfolderId,
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
    setRenameFolder(false);
  }

  function toggleFolderState() {
    setOpenFolders((prevState) => !prevState);
  }

  function toggleFolderOpen() {
    setOpenFolders(true);
  }

  function toggleRenameState() {
    setRenameFolder((prevState) => !prevState);
  }

  const folderFiles = allFiles.filter(
    (file) => file.parentfolderId === folder.id
  );

  const sortedFiles = folderFiles.sort((a, b) => a.name.localeCompare(b.name));

  const folderSubfolders = allFolders.filter(
    (subfolder) => subfolder.parentfolderId === folder.id
  );

  const isSelected = folderFiles.some((file) => file.id === params.chatId);

  const renderFolder = (subfolder: folder) => (
    <ChatFolder
      key={subfolder.id}
      folder={subfolder}
      allFolders={allFolders}
      allFiles={allFiles}
    />
  );

  useEffect(() => {
    function hasSelectedFile(
      folderId: string,
      folders: folder[],
      files: file[],
      selectedFileId: string[] | string | undefined
    ): boolean {
      const folderFiles = files.filter(
        (file) => file.parentfolderId === folderId
      );
      if (folderFiles.some((file) => file.id === selectedFileId)) {
        return true;
      }

      const folderSubfolders = folders.filter(
        (subfolder) => subfolder.parentfolderId === folderId
      );
      return folderSubfolders.some((subfolder) =>
        hasSelectedFile(subfolder.id, folders, files, selectedFileId)
      );
    }

    const isSelectedOrHasSelectedFile = hasSelectedFile(
      folder.id,
      allFolders,
      allFiles,
      params.chatId
    );
    setOpenFolders(isSelectedOrHasSelectedFile);
  }, [folder.id, allFolders, allFiles, params.chatId]);

  const isFolderNested = getFolderDepth(folder.id, allFolders) === 2;

  useEffect(() => {
    if (isOver) {
      setOpenFolders(true);
    }
  }, [isOver]);

  useEffect(() => {
    if (isDragging) {
      setOpenFolders(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (renameFolder && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [renameFolder]);

  drop(dropRef);
  drag(dragRef);

  return (
    <div
      key={folder.id}
      className="flex flex-col space-y-2"
      ref={dragRef}
    >
      <button
        onClick={toggleFolderState}
        ref={dropRef}
        className={cn(
          "flex items-center gap-x-2 w-full mr-auto group",
          isSelected && "font-bold",
          isOver &&
            !isFolderNested &&
            "border-b-[4px] dark:border-ceremonial-purple"
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
          {!renameFolder ? (
            <span>{folder.name}</span>
          ) : (
            <form onSubmit={(e) => handleRename(e)}>
              <Input
                defaultValue={folder.name}
                className="w-full h-fit border-none border-0 focus-visible:ring-offset-0 focus-visible:ring-0"
                ref={nameRef}
                autoFocus
                onBlur={() => toggleRenameState()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.stopPropagation();
                  if (e.key === "Escape") toggleRenameState();
                }}
              />
            </form>
          )}
        </div>

        {!renameFolder && (
          <ContextMenuTool
            id={folder.id}
            type="Folder"
            toggleRename={toggleRenameState}
            toggleFolder={() => setOpenFolders(true)}
          >
            <div className="group-hover:flex ml-auto hidden">
              <Ellipsis />
            </div>
          </ContextMenuTool>
        )}
      </button>

      {openFolders && folderSubfolders.length > 0 && (
        <div className="ml-5 space-y-2">
          {folderSubfolders.map((subfolder) => renderFolder(subfolder))}
        </div>
      )}

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

export default ChatFolder;
