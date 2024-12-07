"use client";

import { Home, Search, Settings, LogIn, PhoneCall } from "lucide-react";

import authImg from "@/public/authbird.svg";

import { auth } from "@/db/main";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Image from "next/image";

export default function Header() {
  const [userProfile, setUserProfile] = useState({ name: "", avatarUrl: "" });
  console.log(auth.currentUser, "auth");

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      console.log(user);
      const name = auth.currentUser?.displayName;

      setUserProfile({
        name: name?.toString() || "",
        avatarUrl: auth.currentUser?.photoURL || "",
      });
    });
  }, []);

  const items = [
    {
      title: "Главная",
      url: "/",
      icon: Home,
    },
    {
      title: "Авторизация",
      url: "/login",
      icon: LogIn,
    },
    {
      title: "Звонки",
      url: "/meet",
      icon: PhoneCall,
    },
    {
      title: "Поиск",
      url: "#",
      icon: Search,
    },
    {
      title: "Настройки",
      url: "#",
      icon: Settings,
    },
  ];

  return (
    // <div className="flex p-5 gap-5 h-screen align-center flex-col bg-red justify-between">
    //   <div className="flex flex-col p-5 h-full items-center rounded-2xl bg-primary">
    //     {/* <Link href="/">
    //       <Image
    //         src={logo}
    //         className="bg-white p-1 rounded-2xl"
    //         height={100}
    //         alt="logo"
    //       />
    //     </Link> */}
    //
    //     <h1 className="flex items-center"> {userName} </h1>
    //   </div>
    // </div>
    <Sidebar>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Меню</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userProfile.avatarUrl} />
            <AvatarFallback>
              <Image src={authImg} alt="ss" />
            </AvatarFallback>
          </Avatar>
          <h1 className="flex items-center"> {userProfile.name} </h1>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
