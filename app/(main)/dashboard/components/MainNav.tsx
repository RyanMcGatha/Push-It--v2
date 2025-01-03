"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, User, Settings, Bell, HelpCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { preload } from "swr";

interface Profile {
  customUrl: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MainNav() {
  const pathname = usePathname();
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedProfile = sessionStorage.getItem("userProfile");
    if (cachedProfile) {
      const profile = JSON.parse(cachedProfile);
      if (profile.customUrl) {
        setProfileUrl(`/${profile.customUrl}`);
      }
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          if (data.profile?.customUrl) {
            setProfileUrl(`/${data.profile.customUrl}`);
            sessionStorage.setItem("userProfile", JSON.stringify(data.profile));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const prefetchNotifications = () => {
    preload("/api/notifications", fetcher);
  };

  const prefetchFriends = () => {
    preload("/api/friends", fetcher);
    preload("/api/friends/requests", fetcher);
    preload("/api/friends/requests/incoming", fetcher);
    preload("/api/friends/requests/outgoing", fetcher);
  };

  const prefetchChats = () => {
    preload("/api/chats", fetcher);
  };

  const prefetchProfile = () => {
    if (profileUrl) {
      preload("/api/me", fetcher);
      preload("/api/profile", fetcher);
      preload(`/api/profile/${profileUrl.slice(1)}`, fetcher);
    }
  };

  const prefetchSettings = () => {
    preload("/api/me", fetcher);
    preload("/api/profile", fetcher);
    preload("/api/onboarding/progress", fetcher);
    preload("/api/notifications", fetcher);
  };

  const navItems = [
    {
      id: "home",
      href: "/dashboard",
      label: "Home",
      icon: Home,
      onHover: prefetchChats,
    },
    {
      id: "notifications",
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: Bell,
      onHover: prefetchNotifications,
    },
    {
      id: "friends",
      href: "/dashboard/friends",
      label: "Friends",
      icon: Users,
      onHover: prefetchFriends,
    },
    ...(profileUrl && !isLoading
      ? [
          {
            id: "profile",
            href: profileUrl,
            label: "Profile",
            icon: User,
            onHover: prefetchProfile,
          },
        ]
      : []),
    {
      id: "settings",
      href: "/settings",
      label: "Settings",
      icon: Settings,
      onHover: prefetchSettings,
    },
  ];

  return (
    <nav className="flex flex-col items-center gap-1 py-4 bg-background border-r border-border/50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <div
            key={item.id}
            className="group relative flex items-center"
            onMouseEnter={item.onHover}
          >
            <Link href={item.href} className="p-2 block" prefetch={true}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            </Link>
            <div
              className="
              absolute left-full ml-2 
              px-3 py-1.5 
              bg-popover/95 
              backdrop-blur-sm 
              text-popover-foreground 
              text-sm font-medium
              rounded-lg
              whitespace-nowrap 
              shadow-lg
              ring-1 ring-black/5
              opacity-0 invisible 
              group-hover:opacity-100 group-hover:visible 
              transition-all duration-200 ease-out
              translate-x-[-12px] group-hover:translate-x-0
              scale-95 group-hover:scale-100
              z-50
              before:absolute before:left-[-4px] before:top-1/2 before:-translate-y-1/2
              before:h-2 before:w-2 before:rotate-45
              before:bg-popover/95
              before:backdrop-blur-sm
              before:rounded-sm
              before:ring-1 before:ring-black/5
            "
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
