"use client";

import React from "react";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PersonalInfoTabProps {
  name: string;
  email: string;
  image: string;
  saving: boolean;
  onNameChange: (name: string) => void;
  onImageChange: (image: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PersonalInfoTab({
  name,
  email,
  image,
  saving,
  onNameChange,
  onImageChange,
  onSubmit,
}: PersonalInfoTabProps) {
  return (
    <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
      <h3 className="text-2xl font-bold mb-6">Profile Settings</h3>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={email}
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
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="https://..."
            className="bg-background/50 border-white/10"
          />
        </div>
        <div className="flex justify-end pt-4 border-t border-white/5">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-bold cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
