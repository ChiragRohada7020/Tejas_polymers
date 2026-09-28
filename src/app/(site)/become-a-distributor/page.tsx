import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
import Reveal from "@/components/Reveal";
import { isAdminAuthenticated } from "@/lib/auth";
import { EditableRichText, EditableText } from "@/components/site/Editable";
import { content, getSiteContentMap } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Distributor — Tejas Polymers Irrigation Equipment",
  description:
    "Become a Tejas Polymers distributor. Factory-direct pricing on irrigation equipment and farm machinery, territory support and reliable supply of spare parts.",
  keywords: [
    "agriculture equipment distributor",
    "become a distributor",
    "irrigation equipment dealer opportunity",
    "farm machinery distributor India",
  ],
  alternates: { canonical: "/become-a-distributor" },
};

const BENEFIT_ICONS = ["💰", "🛡️", "📦", "📣"];

export default async function BecomeADistributorPage() {
  const editMode = await isAdminAuthenticated();
  const map = await getSiteContentMap();
  const t = (key: string) => content(map, key);

  return (
    <>
      <Reveal />
      <section className="bg-gradient-to-br from-brand-900 to-brand-700">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-brand-200">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Become a Distributor</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            <EditableText contentKey="distributor.heroTitle" editMode={editMode} value={t("distributor.heroTitle")} as="span" />
          </h1>
          <div className="mt-3 max-w-2xl text-brand-100">
            <EditableRichText contentKey="distributor.heroBody" editMode={editMode} value={t("distributor.heroBody")} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="reveal rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{BENEFIT_ICONS[i]}</div>
              <h3 className="mt-3 font-semibold text-brand-900">
                <EditableText contentKey={`distributor.benefits.${i}.title`} editMode={editMode} value={t(`distributor.benefits.${i}.title`)} as="span" />
              </h3>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                <EditableRichText contentKey={`distributor.benefits.${i}.text`} editMode={editMode} value={t(`distributor.benefits.${i}.text`)} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-5">
          <div className="reveal lg:col-span-2">
            <h2 className="text-2xl font-bold text-brand-900">
              <EditableText contentKey="distributor.lookingTitle" editMode={editMode} value={t("distributor.lookingTitle")} as="span" />
            </h2>
            <div className="mt-6 text-sm text-slate-700">
              <EditableRichText contentKey="distributor.lookingList" editMode={editMode} value={t("distributor.lookingList")} />
            </div>

            <h3 className="mt-10 text-lg font-semibold text-brand-900">
              <EditableText contentKey="distributor.processTitle" editMode={editMode} value={t("distributor.processTitle")} as="span" />
            </h3>
            <div className="mt-4 text-sm text-slate-700">
              <EditableRichText contentKey="distributor.processList" editMode={editMode} value={t("distributor.processList")} />
            </div>
          </div>

          <div className="reveal rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
            <h2 className="text-2xl font-bold text-brand-900">
              <EditableText contentKey="distributor.formTitle" editMode={editMode} value={t("distributor.formTitle")} as="span" />
            </h2>
            <div className="mt-2 text-sm text-slate-600">
              <EditableRichText contentKey="distributor.formSubtitle" editMode={editMode} value={t("distributor.formSubtitle")} />
            </div>
            <div className="mt-6">
              <InquiryForm variant="distributor" compact />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
