import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { Inquiry } from "@/lib/models/Inquiry";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  await connectDB();
  const newInquiries = await Inquiry.countDocuments({ status: "new" });

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar newInquiries={newInquiries} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl p-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
