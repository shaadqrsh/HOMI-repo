import { folder } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFolderDepth(
  folderId: string,
  folders: folder[],
  currentDepth: number = 0
): number {
  const folder = folders.find((f) => f.id === folderId);

  if (!folder) {
    return -1;
  }

  if (folder.parentfolderId === "TOP") {
    return currentDepth;
  }

  return getFolderDepth(folder.parentfolderId, folders, currentDepth + 1);
}





