import React from "react";
import {
  User,
  Settings,
  MessageCircle,
  Video,
  Palette,
  Bell,
} from "lucide-react";

const navItems = [
  { icon: User, label: "Profile", active: true },
  { icon: Settings, label: "Account" },
  { icon: MessageCircle, label: "Chat" },
  { icon: Video, label: "Voice & Video" },
  { icon: Palette, label: "Appearance" },
  { icon: Bell, label: "Notifications" },
];

export function Sidebar() {
  return (
    <div className="w-72 h-full bg-white shadow-md flex flex-col p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Settings</h2>
      <div className="space-y-2 flex-1">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition ${
              item.active
                ? "bg-primary text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}