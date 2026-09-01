"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { UpdateUserProfileAction } from "@/actions/user";
import { ProfileSidebar } from "./ProfileSidebar";
import { PersonalInfoTab } from "./PersonalInfoTab";

interface ProfileClientProps {
  initialProfile: any;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [image, setImage] = useState(profile?.image || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await UpdateUserProfileAction({ name, image });
      if (res.success) {
        setProfile({ ...profile, name, image });
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (_err) {
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Navigation Sidebar */}
      <ProfileSidebar
        profile={profile}
        name={name}
        image={image}
        onImageUploaded={(url) => setImage(url)}
      />

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <PersonalInfoTab
          name={name}
          email={profile?.email}
          image={image}
          saving={saving}
          onNameChange={setName}
          onImageChange={setImage}
          onSubmit={handleUpdateProfile}
        />
      </div>
    </div>
  );
}
