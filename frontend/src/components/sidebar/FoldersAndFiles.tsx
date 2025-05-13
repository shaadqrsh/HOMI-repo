import ChatFolder from "@/components/sidebar/ChatFolder";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchFiles, useFetchFolders } from "@/lib/fetchHooks";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Drop from "./Drop";
import UnSavedChatFolder from "./UnSavedChatFolder";

const FoldersAndFiles = () => {
  const userId = Cookies.get("userIdHomi");
  const { data: folders } = useFetchFolders();
  const { data: files } = useFetchFiles();

  if (!folders || !files) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-y-4"
      >
        <Skeleton className="w-full h-5 rounded-md" />
        <Skeleton className="w-full h-5 rounded-md" />
        <Skeleton className="w-full h-5 rounded-md" />
      </motion.div>
    );
  }

  const unSavedChatFolder = folders.find((folder) => folder.id === userId);

  const unSavedfiles = files.filter(
    (file) => file.parentfolderId === unSavedChatFolder?.id
  );

  const topFolders = folders.filter(
    (folder) =>
      folder.name !== "Unsaved Chats" && folder.parentfolderId === "TOP"
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-y-3 h-full"
      >
        {unSavedChatFolder && (
          <UnSavedChatFolder
            folder={unSavedChatFolder}
            files={unSavedfiles}
          />
        )}
        {topFolders.map((folder) => {
          return (
            <ChatFolder
              key={folder.id}
              folder={folder}
              allFolders={folders}
              allFiles={files}
            />
          );
        })}
        <Drop />
      </motion.div>
    </DndProvider>
  );
};

export default FoldersAndFiles;
