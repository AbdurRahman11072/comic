"use client";

import { useState } from "react";
import {
  Loader2,
  User as UserIcon,
  History,
  Lock,
  Save,
  Camera,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  Coins,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { UpdateUserAction } from "@/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useGetReferralStatsQuery } from "@/redux/api/referralApi";

interface ProfileClientProps {
  initialProfile: any;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [tab, setTab] = useState("info");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Referral Stats
  const { data: referralData, isLoading: referralLoading } = useGetReferralStatsQuery();
  const referralStats = referralData?.data;

  // Profile Edit State
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [image, setImage] = useState(profile?.image || "");

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const referralCode = referralStats?.referralCode || profile?.referralCode || "CBD-PENDING";
  const shareableUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://comicbd.com/?ref=${referralCode}`;

  const copyToClipboard = (text: string, isLink: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Referral link copied to clipboard!");
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("Referral code copied!");
    }
  };

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
                  formData.append("image", file);

                  const url = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:5000");
                  const res = await fetch(`${url}/api/v1/upload`, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
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
          onClick={() => setTab("referrals")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            tab === "referrals" ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass glass-hover text-muted-foreground hover:text-white"
          }`}
        >
          <Gift className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium">Referrals & Rewards</span>
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

        {tab === "referrals" && (
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-popover to-background p-8">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Invite Friends & Earn Free Points
                </div>
                <h3 className="text-3xl font-black tracking-tight text-white">
                  Share Your Link, Earn Points Forever
                </h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Invite your friends to Comic BD. When they sign up with your link, they receive{" "}
                  <strong className="text-emerald-400">+{referralStats?.referralSignupBonus || 50} free points</strong> immediately,
                  and you earn <strong className="text-purple-400">{referralStats?.referralBonusPercent || 10}%</strong> of all ad points they earn for their first {referralStats?.referralActiveMonths || 3} months!
                </p>
              </div>
            </div>

            {/* Referral Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {referralLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : referralStats?.totalReferrals || 0}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Total Friends Invited</div>
                </div>
              </div>

              <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">
                    {referralLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (referralStats?.totalPointsEarned || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Referral Points Earned</div>
                </div>
              </div>

              <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">
                    {referralLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : referralStats?.activeReferrals || 0}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Active Earning Friends</div>
                </div>
              </div>
            </div>

            {/* Referral Link & Code Sharing Box */}
            <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" /> Your Exclusive Referral Link
                </h4>
                <p className="text-xs text-muted-foreground">
                  Anyone who clicks your unique link will have your referral code pre-filled automatically upon signup.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-muted-foreground font-mono truncate select-all"
                />
                <Button
                  type="button"
                  onClick={() => copyToClipboard(shareableUrl, true)}
                  className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 mr-2 text-emerald-300" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </Button>
              </div>

              {/* Quick Referral Code Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Referral Code
                  </div>
                  <div className="text-xl font-mono font-black text-purple-400 tracking-wider mt-0.5">
                    {referralCode}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyToClipboard(referralCode, false)}
                  className="border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl h-9"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedCode ? "Code Copied" : "Copy Code"}
                </Button>
              </div>

              {/* 1-Click Social Share */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Share to Social Networks
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Join me on Comic BD and read trending comics! Use my referral code ${referralCode} to get free points: ${shareableUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Read high-quality manhwa & comics on Comic BD! Sign up with my referral code ${referralCode} for free bonus points:`)}&url=${encodeURIComponent(shareableUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    Twitter / X
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(`Sign up on Comic BD using my referral code ${referralCode} for free points!`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    Telegram
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            {/* Invited Friends List */}
            <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Invited Friends ({referralStats?.recentReferrals?.length || 0})
              </h4>

              {!referralStats?.recentReferrals || referralStats.recentReferrals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No friends invited yet. Share your referral link to get your first bonus!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {referralStats.recentReferrals.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                          {friend.image ? (
                            <img src={friend.image} alt={friend.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            friend.name?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{friend.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            Joined {new Date(friend.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {friend.isActive ? (
                          <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            Active Bonus
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold bg-white/10 text-muted-foreground px-2.5 py-0.5 rounded-full">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
