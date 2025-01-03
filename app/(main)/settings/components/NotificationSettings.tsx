import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Volume2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NotificationSettings {
  desktop: boolean;
  sound: boolean;
  mentions: boolean;
  messagePreview: boolean;
}

const defaultSettings: NotificationSettings = {
  desktop: true,
  sound: true,
  mentions: true,
  messagePreview: true,
};

export default function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (typeof window === "undefined") return defaultSettings;
    try {
      const savedSettings = localStorage.getItem("notificationSettings");
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      return defaultSettings;
    }
  });

  // Initialize notifications on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Request notification permission if desktop notifications are enabled
    if (settings.desktop && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          setSettings((prev) => ({ ...prev, desktop: false }));
          toast({
            title: "Permission Denied",
            description:
              "Please enable notifications in your browser settings to receive alerts",
          });
        } else {
          toast({
            title: "Notifications Enabled",
            description: "You will now receive desktop notifications",
          });
        }
      });
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    }
  }, [settings]);

  const handleSettingChange = async (setting: keyof NotificationSettings) => {
    // Special handling for desktop notifications
    if (setting === "desktop") {
      if (!settings.desktop && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({
            title: "Permission Denied",
            description:
              "Please enable notifications in your browser settings to receive alerts",
          });
          return; // Don't update settings if permission was denied
        }
        toast({
          title: "Notifications Enabled",
          description: "You will now receive desktop notifications",
        });
      }
    }

    // Test notification sound when enabling sound
    if (setting === "sound" && !settings.sound) {
      try {
        const audio = new Audio("/notification-sound.mp3");
        await audio.play();
      } catch (error) {
        console.error("Failed to play notification sound:", error);
      }
    }

    // Single state update
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Desktop Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive notifications when the app is in the background
              </div>
            </div>
            <Switch
              checked={settings.desktop}
              onCheckedChange={() => handleSettingChange("desktop")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Sound Notifications</div>
              <div className="text-sm text-muted-foreground">
                Play a sound when receiving new messages
              </div>
            </div>
            <Switch
              checked={settings.sound}
              onCheckedChange={() => handleSettingChange("sound")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Mentions</div>
              <div className="text-sm text-muted-foreground">
                Get notified when someone mentions you
              </div>
            </div>
            <Switch
              checked={settings.mentions}
              onCheckedChange={() => handleSettingChange("mentions")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Message Preview</div>
              <div className="text-sm text-muted-foreground">
                Show message content in notifications
              </div>
            </div>
            <Switch
              checked={settings.messagePreview}
              onCheckedChange={() => handleSettingChange("messagePreview")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
