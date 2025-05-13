import { db } from "@/lib/db";
import { draggableItems, folder } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { ChevronRight, FolderClosed } from "lucide-react";
import { useRef, useState } from "react";
import { useDrop } from "react-dnd";

const Drop = () => {
  const [folder, setFolder] = useState<folder | null>(null);
  const userId = Cookies.get("userIdHomi");
  const queryClient = useQueryClient();
  const dropRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: draggableItems.FOLDER,
    drop: (item: folder) => {
      setFolder(item);
      handleFolderDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  async function handleFolderDrop(id: string) {
    try {
      const response = await db.patch(
        `/api/update/fnf/folder/`,
        {
          user: userId,
          folder: id,
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

  drop(dropRef);

  return (
    <div
      className="h-10"
      ref={dropRef}
    >
      {isOver && (
        <div className="flex items-center gap-x-2 w-full p-2 border-2 border-dashed">
          <ChevronRight className="w-5 h-5" />
          <FolderClosed className="w-5 h-5" />
          <h2>{folder?.name}</h2>
        </div>
      )}
    </div>
  );
};

export default Drop;
