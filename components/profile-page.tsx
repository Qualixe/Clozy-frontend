"use client";

import * as React from "react";
import { Camera, Check, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import districts from "@/data/districts.json";

const PHONE_PATTERN = /^01[3-9]\d{8}$/;

export function ProfilePage() {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = React.useState(user?.name ?? "");
  const [gender, setGender] = React.useState(user?.gender ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [dob, setDob] = React.useState(user?.dob ?? "");
  const [address, setAddress] = React.useState(user?.address ?? "");
  const [district, setDistrict] = React.useState(user?.district ?? "");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);

  // A phone only stays "verified" for as long as it matches the exact
  // number the account confirmed — editing it away voids that until it's
  // re-confirmed via OTP (see confirmPhone() below).
  const phoneVerified = !!user?.phoneVerified && user.phone === phone.trim();
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [verifyingOtp, setVerifyingOtp] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);

  async function sendOtp() {
    const p = phone.trim();
    if (!PHONE_PATTERN.test(p)) return;

    setSendingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/phone/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Could not send a verification code.");
      setOtpSent(true);
      setOtpCode("");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Could not send a verification code.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function confirmPhone() {
    const p = phone.trim();
    if (otpCode.trim().length !== 6) return;

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/phone/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p, code: otpCode.trim() }),
      });
      const verifyBody = await verifyRes.json().catch(() => null);
      if (!verifyRes.ok) throw new Error(verifyBody?.message ?? "Incorrect code.");

      const confirmRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/phone/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phone: p }),
      });
      const confirmBody = await confirmRes.json().catch(() => null);
      if (!confirmRes.ok) {
        throw new Error(confirmBody?.message ?? "Could not confirm phone number.");
      }

      updateUser(confirmBody);
      setOtpSent(false);
      setOtpCode("");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Incorrect code.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.errors?.file?.[0] ?? body?.message ?? `Request failed with status ${res.status}`
        );
      }

      const updated = await res.json();
      updateUser(updated);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          email,
          gender: gender || null,
          phone: phone || null,
          dob: dob || null,
          address: address || null,
          district: district || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.errors?.email?.[0] ??
          body?.errors?.name?.[0] ??
          body?.errors?.phone?.[0] ??
          body?.errors?.dob?.[0] ??
          body?.message ??
          `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      const updated = await res.json();
      updateUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-lg font-semibold text-muted-foreground"
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
            {uploadingAvatar ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </span>
        </button>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingAvatar ? "Uploading…" : "Change Photo"}
          </Button>
          {avatarError && (
            <p className="mt-1.5 text-xs text-destructive">{avatarError}</p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-gender">Gender</Label>
          <Select
            value={gender}
            onValueChange={(value) => {
              setGender((value ?? "") as typeof gender);
              setSaved(false);
            }}
          >
            <SelectTrigger id="profile-gender" className="w-full">
              <SelectValue placeholder="Prefer not to say" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-phone">Phone</Label>
          <div className="flex gap-2">
            <Input
              id="profile-phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaved(false);
                setOtpSent(false);
                setOtpCode("");
                setOtpError(null);
              }}
              className="flex-1"
            />
            {phoneVerified ? (
              <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                disabled={!PHONE_PATTERN.test(phone.trim()) || sendingOtp}
                onClick={sendOtp}
              >
                {sendingOtp ? "Sending…" : otpSent ? "Resend code" : "Verify"}
              </Button>
            )}
          </div>

          {otpSent && !phoneVerified && (
            <div className="flex gap-2 pt-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                disabled={otpCode.trim().length !== 6 || verifyingOtp}
                onClick={confirmPhone}
              >
                {verifyingOtp ? "Checking…" : "Confirm"}
              </Button>
            </div>
          )}
          {otpError && <p className="text-xs text-destructive">{otpError}</p>}
          {otpSent && !phoneVerified && !otpError && (
            <p className="text-xs text-muted-foreground">
              We sent a 6-digit code to {phone.trim()}.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-district">District</Label>
          <Select
            value={district}
            onValueChange={(value) => {
              if (value !== null) {
                setDistrict(value);
                setSaved(false);
              }
            }}
          >
            <SelectTrigger id="profile-district" className="w-full">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-dob">Date of Birth</Label>
          <Input
            id="profile-dob"
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-address">Address</Label>
          <Textarea
            id="profile-address"
            rows={3}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
          {saved && !submitting && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-500">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
