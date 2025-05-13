import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { file, folder } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";

interface DeleteAlertProps {
  children: React.ReactNode;
  type: "Folder" | "File";
  loading: boolean;
  isLoading: boolean;
  id: string;
  files: file[];
}

const DeleteAlert = ({
  children,
  type,
  isLoading,
  loading,
  id,
  files,
}: DeleteAlertProps) => {
  const router = useRouter();
  const userId = Cookies.get("userIdHomi");
  const queryClient = useQueryClient();
  const params = useParams();
  const { toast } = useToast();

  // const { mutateAsync: deleteFolder } = useMutation({
  //   mutationFn: async () => {
  //     const response = await db.delete(`/api/delete/fnf/folder/`, {
  //       data: {
  //         folder: id,
  //         user: userId,
  //       },
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
  //       },
  //     });
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.setQueryData(
  //       ["folders", userId],
  //       (oldFolders: folder[] | undefined) => {
  //         if (!oldFolders) return [];
  //         return oldFolders.filter((f) => f.id !== id);
  //       }
  //     );
  //     queryClient.invalidateQueries({
  //       queryKey: ["folders", userId],
  //       exact: true,
  //     });
  //   },
  //   onError: () => {
  //     toast({
  //       title: "Error Occured",
  //       description: "Error in deleting folder",
  //     });
  //   },
  // });

  async function handleDelete() {
    if (loading || isLoading) return;
    if (type === "Folder") {
      try {
        const response = await db.delete(`/api/delete/fnf/folder/`, {
          data: {
            folder: id,
            user: userId,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        });

        if (response.status === 200) {
          queryClient.invalidateQueries({ queryKey: ["folders", userId] });

          const filesInFolder = files.filter(
            (file) => file.parentfolderId === id
          );

          if (filesInFolder.length > 0) {
            if (filesInFolder.some((file) => file.id === params.chatId)) {
              const remainingFiles = files.filter(
                (file) => file.parentfolderId !== id
              );

              if (remainingFiles.length === 1) {
                router.push(`/chat/${remainingFiles[0].id}`);
              } else if (remainingFiles.length > 1) {
                const randomFile =
                  remainingFiles[
                    Math.floor(Math.random() * remainingFiles.length)
                  ];
                router.push(`/chat/${randomFile.id}`);
              }
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (type === "File") {
      try {
        const response = await db.delete(`/api/delete/fnf/file/`, {
          data: {
            file: id,
            user: userId,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
          },
        });
        if (response.status === 200) {
          queryClient.invalidateQueries({ queryKey: ["files", userId] });

          if (params.chatId === id) {
            const remainingFiles = files.filter((file) => file.id !== id);

            if (remainingFiles.length === 1) {
              router.push(`/chat/${remainingFiles[0].id}`);
            } else if (remainingFiles.length > 1) {
              const randomFile =
                remainingFiles[
                  Math.floor(Math.random() * remainingFiles.length)
                ];
              router.push(`/chat/${randomFile.id}`);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            {type === "Folder" ? " folder and content inside it." : " file"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => e.stopPropagation()}
            className="border-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="dark:text-red-600 dark:bg-spanish-roast dark:hover:bg-slate-800"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlert;


