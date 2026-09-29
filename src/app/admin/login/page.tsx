import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <main className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Tejas Polymers Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the administrator password to open the dashboard.</p>
        <LoginForm />
        <Link
          href="/admin/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Forgot password?
        </Link>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-slate-500 hover:text-slate-700">
          Back to website
        </Link>
      </main>
    </div>
  );
}
