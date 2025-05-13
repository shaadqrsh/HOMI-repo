"use client";
import Settings from "@/components/models/Settings";
import { db } from "@/lib/db";
import Cookies from "js-cookie";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropDownProps {
  children: React.ReactNode;
}

const UserDropDown = ({ children }: UserDropDownProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const router = useRouter();

  async function logout() {
    setLoading(true);
    const token = Cookies.get("next-secure-id-homi");
    const response = await db.post(
      `/api/token/logout/`,
      {
        refresh_token: token,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("next-session-id-homi")}`,
        },
      }
    );
    if (response.status === 204) {
      Cookies.remove("next-session-id-homi");
      Cookies.remove("next-secure-id-homi");
      Cookies.remove("userIdHomi");
      router.push("/log-in");
      setLoading(true);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <Settings
          open={open}
          setOpen={setOpen}
        >
          <DropdownMenuItem
            className="flex cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen(true);
            }}
          >
            <IoSettingsOutline />
            Settings
          </DropdownMenuItem>
        </Settings>
        {/* <HelpModel
          open={openHelp}
          setOpen={setOpenHelp}
        >
          <DropdownMenuItem
            className="flex cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpenHelp(true);
            }}
          >
            <MessageCircleQuestion />
            Help
          </DropdownMenuItem>
        </HelpModel> */}
        <DropdownMenuItem
          onClick={() => logout()}
          disabled={loading}
          className="flex text-rose-500 focus:text-rose-500 dark:text-rose-500 dark:focus:text-rose-500 cursor-pointer"
        >
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropDown;
