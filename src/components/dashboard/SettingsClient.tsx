"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Share2, Save, Loader2 } from "lucide-react";
import { UpdateSiteConfigAction } from "@/actions/site";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface SettingsClientProps {
  initialConfig: any;
}

export function SettingsClient({ initialConfig }: SettingsClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    announceText: initialConfig?.announceText || "",
    announceLink: initialConfig?.announceLink || "",
    facebook: initialConfig?.facebook || "",
    twitter: initialConfig?.twitter || "",
    discord: initialConfig?.discord || "",
    instagram: initialConfig?.instagram || "",
    youtube: initialConfig?.youtube || "",
    pointToFiatRate: initialConfig?.pointToFiatRate || 0.01,
    maxDailyAdPoints: initialConfig?.maxDailyAdPoints || 1000,
    featuredRequestFee: initialConfig?.featuredRequestFee || 500,
    customAdScript: initialConfig?.customAdScript || "",
    referralBonusPercent: initialConfig?.referralBonusPercent || 10,
    referralActiveMonths: initialConfig?.referralActiveMonths || 3,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await UpdateSiteConfigAction(config);
      if (res.success) {
        toast.success("Settings saved successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to save settings.");
      }
    } catch (error) {
      console.error("Failed to save site config:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Announcement Banner */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Globe className="w-5 h-5 text-primary" />
            <span>Announcement Banner</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announceText">Banner Text</Label>
              <Input 
                id="announceText" 
                placeholder="e.g. New series launched! Click here to read." 
                value={config.announceText}
                onChange={(e) => setConfig({ ...config, announceText: e.target.value })}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announceLink">Banner Link</Label>
              <Input 
                id="announceLink" 
                placeholder="https://..." 
                value={config.announceLink}
                onChange={(e) => setConfig({ ...config, announceLink: e.target.value })}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Share2 className="w-5 h-5 text-primary" />
            <span>Social Media</span>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input 
                id="facebook" 
                placeholder="URL" 
                value={config.facebook}
                onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discord">Discord</Label>
              <Input 
                id="discord" 
                placeholder="Invite Link" 
                value={config.discord}
                onChange={(e) => setConfig({ ...config, discord: e.target.value })}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">X (Twitter)</Label>
              <Input 
                id="twitter" 
                placeholder="URL" 
                value={config.twitter}
                onChange={(e) => setConfig({ ...config, twitter: e.target.value })}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Financial Settings */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Globe className="w-5 h-5 text-primary" />
            <span>Financial & Ads</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pointToFiatRate">Points to Fiat Rate ($)</Label>
              <Input 
                id="pointToFiatRate" 
                type="number"
                step="0.001"
                value={config.pointToFiatRate}
                onChange={(e) => setConfig({ ...config, pointToFiatRate: Number(e.target.value) })}
                className="bg-background/50 border-white/10"
              />
              <p className="text-[10px] text-muted-foreground">E.g., 0.01 means 100 points = $1.00</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDailyAdPoints">Max Daily Ad Points</Label>
              <Input 
                id="maxDailyAdPoints" 
                type="number"
                value={config.maxDailyAdPoints}
                onChange={(e) => setConfig({ ...config, maxDailyAdPoints: Number(e.target.value) })}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredRequestFee">Featured Request Fee (Points)</Label>
              <Input 
                id="featuredRequestFee" 
                type="number"
                value={config.featuredRequestFee}
                onChange={(e) => setConfig({ ...config, featuredRequestFee: Number(e.target.value) })}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customAdScript">Custom Ad Script (HTML/JS)</Label>
              <Textarea 
                id="customAdScript"
                placeholder="<!-- Paste your ad script code here (e.g. <script src='...'></script>) -->"
                value={config.customAdScript}
                onChange={(e) => setConfig({ ...config, customAdScript: e.target.value })}
                className="bg-background/50 border-white/10 min-h-[100px] font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">This script will load dynamically on pages with advertisements.</p>
            </div>
          </div>
        </div>

        {/* Referral Settings */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Share2 className="w-5 h-5 text-primary" />
            <span>Referral Program</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referralBonusPercent">Referral Bonus (%)</Label>
              <Input 
                id="referralBonusPercent" 
                type="number"
                value={config.referralBonusPercent}
                onChange={(e) => setConfig({ ...config, referralBonusPercent: Number(e.target.value) })}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralActiveMonths">Active Duration (Months)</Label>
              <Input 
                id="referralActiveMonths" 
                type="number"
                value={config.referralActiveMonths}
                onChange={(e) => setConfig({ ...config, referralActiveMonths: Number(e.target.value) })}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
