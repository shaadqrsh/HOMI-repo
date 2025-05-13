"use client";
import Loading from "@/components/fallbacks/Loading";
import ServerError from "@/components/fallbacks/ServerError";
import { db } from "@/lib/db";
import { useFetchFiles, useFetchFolders } from "@/lib/fetchHooks";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const ChatPage = () => {
  const [error, setError] = useState(false);
  const router = useRouter();
  const hasCreatedFile = useRef(false);

  const {
    data: folders,
    isLoading: folderLoading,
    isError: folderError,
  } = useFetchFolders();

  const {
    data: files,
    isLoading: fileLoading,
    isError: fileError,
  } = useFetchFiles();

  const createFile = useCallback(
    async (parentFolderId: string, userId: string) => {
      try {
        hasCreatedFile.current = true;

        const response = await db.post(
          `/api/new/folder/`,
          {
            type: "file",
            user: userId,
            parentfolderId: parentFolderId,
            name: "New Chat",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
            },
          }
        );

        router.push(`/chat/${response.data.id}`);
      } catch (error) {
        console.error("Error creating file:", error);
        hasCreatedFile.current = false;
      }
    },
    [router]
  );

  useEffect(() => {
    const handleData = async () => {
      try {
        const userId = Cookies.get("userIdHomi");

        if (!userId) {
          router.push("/log-in");
          return;
        }

        if (!folderLoading && !fileLoading) {
          const unsavedFolder = folders?.find((folder) => folder.id === userId);

          if (unsavedFolder) {
            const unsavedFile = files?.find(
              (file) => file.parentfolderId === unsavedFolder.id
            );

            if (unsavedFile) {
              router.push(`/chat/${unsavedFile.id}`);
            } else if (!hasCreatedFile.current) {
              await createFile(unsavedFolder.id, userId);
            }
          } else {
            router.push("/sign-up");
          }
        }
      } catch (err) {
        console.error("Error handling data:", err);
        setError(true);
      }
    };

    handleData();
  }, [folders, files, folderLoading, fileLoading, router, createFile]);

  if (error || fileError || folderError) return <ServerError />;

  return <Loading />;
};

export default ChatPage;
