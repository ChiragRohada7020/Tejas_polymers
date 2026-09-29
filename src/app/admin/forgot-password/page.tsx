import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { adminAlertEmail } from "@/lib/mailer";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset admin password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <main className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Tejas Polymers Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lost your password? Get a one-time verification code by email.
        </p>
        <ForgotPasswordForm contactEmail={adminAlertEmail()} />
        <Link href="/admin/login" className="mt-6 inline-block text-sm font-medium text-slate-500 hover:text-slate-700">
          Back to sign in
        </Link>
      </main>
    </div>
  );
}