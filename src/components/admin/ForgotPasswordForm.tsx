"use client";

import { useState } from "react";

type Step = "request" | "enter";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

/**
 * Two-step admin password reset: request an emailed code, then exchange
 * it for a new password.
 */
export default function ForgotPasswordForm({ contactEmail }: { contactEmail: string }) {
  const [step, setStep] = useState<Step>("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/password/forgot", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not send the code.");
      setNotice(data.message || "If the admin inbox is configured, a code has been sent.");
      setStep("enter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not reset the password.");
      window.location.href = "/admin/login?reset=1";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {step === "request" ? (
        <>
          <p className="text-sm text-slate-600">
            We will email a 6-digit verification code to the administrator inbox
            ({contactEmail}). The code is valid for 10 minutes and can be used once.
          </p>
          <button
            type="button"
            onClick={requestCode}
            disabled={busy}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Sending..." : "Email me a code"}
          </button>
        </>
      ) : (
        <>
          {notice && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">{notice}</p>
          )}
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
              Verification code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={`${inputCls} tracking-[0.4em]`}
              placeholder="000000"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
              placeholder="At least 10 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="Repeat the new password"
            />
          </div>
          <button
            type="button"
            onClick={resetPassword}
            disabled={busy || otp.length !== 6 || newPassword.length === 0}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Set new password"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setError(null);
            }}
            className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Send another code
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}