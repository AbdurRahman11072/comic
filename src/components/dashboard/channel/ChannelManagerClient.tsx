"use client";

import { useState } from "react";
import { ExternalLink, MessageSquare, Palette } from "lucide-react";
import { toast } from "react-hot-toast";
import { CreatorPost, CreatorProfile } from "@/services/creator.service";
import { UpdateCreatorProfileAction } from "@/actions/creator";

import { ChannelBannerPreview } from "./ChannelBannerPreview";
import { ChannelProfileForm } from "./ChannelProfileForm";
import { ChannelAnnouncementComposer } from "./ChannelAnnouncementComposer";

interface ChannelManagerClientProps {
  initialProfile?: CreatorProfile | null;
  initialPosts?: CreatorPost[];
  creatorId?: string;
}

export function ChannelManagerClient({
  initialProfile = null,
  initialPosts = [],
  creatorId,
}: ChannelManagerClientProps) {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(initialProfile);

  // Form state
  const [channelName, setChannelName] = useState(initialProfile?.channelName || "");
  const [description, setDescription] = useState(initialProfile?.channelDescription || "");
  const [profileImage, setProfileImage] = useState(initialProfile?.user?.image || "");
  const [bannerUrl, setBannerUrl] = useState(initialProfile?.channelBanner || "");

  // Uploading state
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleImageUpload = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadUrl =
        typeof window !== "undefined"
          ? ""
          : process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${uploadUrl}/api/v1/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setUrl(data.data.url);
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) {
      toast.error("Channel name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await UpdateCreatorProfileAction({
        channelName: channelName.trim(),
        channelDescription: description.trim() || null,
        channelBanner: bannerUrl || null,
      });
      if (res.success && res.data) {
        setProfile(res.data);
        toast.success("Channel settings saved successfully!");
      } else {
        toast.error(res.message || "Failed to save channel settings.");
      }
    } catch (_err) {
      toast.error("Failed to save channel settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" /> Channel Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your creator channel&apos;s appearance, publish announcements, and review stats.
          </p>
        </div>

        {creatorId && (
          <a
            href={`/channel/${creatorId}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl glass glass-hover text-xs font-semibold text-primary flex items-center gap-2 transition self-start sm:self-auto cursor-pointer"
          >
            <span>View Public Channel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Channel Customization Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <ChannelBannerPreview
              bannerUrl={bannerUrl}
              profileImage={profileImage}
              channelName={channelName}
              hasProfile={!!profile}
              uploadingBanner={uploadingBanner}
              uploadingProfile={uploadingProfile}
              onImageUpload={handleImageUpload}
              setBannerUrl={setBannerUrl}
              setProfileImage={setProfileImage}
              setUploadingBanner={setUploadingBanner}
              setUploadingProfile={setUploadingProfile}
            />

            <ChannelProfileForm
              channelName={channelName}
              description={description}
              saving={saving}
              onChannelNameChange={setChannelName}
              onDescriptionChange={setDescription}
              onSubmit={handleSave}
            />
          </form>
        </div>

        {/* RIGHT COLUMN: Channel Stats & Announcements */}
        <div className="lg:col-span-5 space-y-6">
          {creatorId && (
            <div className="glass rounded-2xl p-6 border border-white/5 space-y-5">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5 text-primary" /> Channel Announcements
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Post updates, hiatus notices, and announcements visible on your channel.
                </p>
              </div>

              <ChannelAnnouncementComposer creatorId={creatorId} initialPosts={initialPosts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
