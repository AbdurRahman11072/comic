"use client";

import React, { useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, User as UserIcon } from "lucide-react";

interface ChannelBannerPreviewProps {
  bannerUrl: string;
  profileImage: string;
  channelName: string;
  hasProfile: boolean;
  uploadingBanner: boolean;
  uploadingProfile: boolean;
  onImageUpload: (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => void;
  setBannerUrl: (url: string) => void;
  setProfileImage: (url: string) => void;
  setUploadingBanner: (v: boolean) => void;
  setUploadingProfile: (v: boolean) => void;
}

export function ChannelBannerPreview({
  bannerUrl,
  profileImage,
  channelName,
  hasProfile,
  uploadingBanner,
  uploadingProfile,
  onImageUpload,
  setBannerUrl,
  setProfileImage,
  setUploadingBanner,
  setUploadingProfile,
}: ChannelBannerPreviewProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div
        className="relative h-48 bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/10 group cursor-pointer"
        onClick={() => bannerInputRef.current?.click()}
        style={
          bannerUrl
            ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          {uploadingBanner ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <>
              <ImageIcon className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-xs">
                {bannerUrl ? "Change Channel Banner" : "Upload Channel Banner"}
              </span>
            </>
          )}
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageUpload(file, setBannerUrl, setUploadingBanner);
          }}
        />
      </div>

      {/* Profile Image + Channel Info Bar */}
      <div className="relative px-6 pb-6">
        <div className="flex items-end gap-5 -mt-12">
          <div
            className="relative w-24 h-24 rounded-2xl border-4 border-[#0d0f17] bg-white/5 overflow-hidden group cursor-pointer shrink-0 shadow-xl"
            onClick={() => profileInputRef.current?.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
              {uploadingProfile ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(file, setProfileImage, setUploadingProfile);
              }}
            />
          </div>
          <div className="pb-1 min-w-0">
            <h2 className="text-xl font-bold truncate text-white">
              {channelName || "Your Channel"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {!hasProfile
                ? "No profile yet — fill out the details below to create one."
                : "Creator Profile"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
