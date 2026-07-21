"use client";

import { useState } from "react";
import { Loader2, User as UserIcon, History, Lock, Save, Camera, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { UpdateUserAction } from "@/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ProfileClientProps {
  initialProfile: any;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [tab, setTab] = useState("info");

  // Profile Edit State
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [image, setImage] = useState(profile?.image || "");

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await UpdateUserAction(profile.id, { name, image });
      if (res.success) {
        setProfile({ ...profile, name, image });
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("An error occurred while changing password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar / Tabs */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="glass p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center mb-6">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 p-1 bg-background">
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <label 
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
              title="Upload new image"
            >
              <Camera className="w-4 h-4" />
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('image', file);
                  
                  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                  const res = await fetch(`${url}/api/v1/upload`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                  });
                  const data = await res.json();
                  if (data.success && data.data?.url) {
                    setImage(data.data.url);
                    toast.success("Image uploaded! Click Save Changes below.");
                  } else {
                    toast.error("Failed to upload image");
                  }
                }}
              />
            </label>
          </div>
          <h2 className="font-bold text-lg">{profile?.name}</h2>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
          <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs capitalize flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {profile?.role}
          </div>

          {/* User Stats Summary */}
          <div className="grid grid-cols-2 gap-2 w-full mt-6 pt-6 border-t border-white/5">
            <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center">
              <span className="text-sm font-bold">{profile?.points.toLocaleString()}</span>
              <span className="text-[10px] font-medium uppercase opacity-60">Points</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center">
              <span className="text-sm font-bold">{profile?.bookmarks?.length || 0}</span>
              <span className="text-[10px] font-medium uppercase opacity-60">Saved</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setTab("info")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            tab === "info" ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass glass-hover text-muted-foreground hover:text-white"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Personal Info</span>
        </button>
        <button 
          onClick={() => setTab("history")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            tab === "history" ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass glass-hover text-muted-foreground hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">Transactions</span>
        </button>
        <button 
          onClick={() => setTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            tab === "security" ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass glass-hover text-muted-foreground hover:text-white"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">Security</span>
        </button>
      </aside>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {tab === "info" && (
          <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Profile Settings</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={profile?.email} 
                    disabled 
                    className="bg-background/20 border-white/5 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Avatar URL</Label>
                <Input 
                  id="image" 
                  value={image} 
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..." 
                  className="bg-background/50 border-white/10"
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-bold">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}

        {tab === "history" && (
          <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Transaction History</h3>
            <div className="space-y-4">
              {!profile?.pointTransactions || profile?.pointTransactions?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  No transactions yet.
                </div>
              ) : (
                profile?.pointTransactions?.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${t.amount > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {t.amount > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t.description}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-sm ${t.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                      {t.amount > 0 ? "+" : ""}{t.amount} P
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Security Settings</h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-background/50 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background/50 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 border-white/10"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button type="submit" disabled={passwordLoading} className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-bold">
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
