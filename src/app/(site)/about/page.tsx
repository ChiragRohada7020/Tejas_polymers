import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import { isAdminAuthenticated } from "@/lib/auth";
import { EditableLink, EditableRichText, EditableText } from "@/components/site/Editable";
import { content, getSiteContentMap } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us — Irrigation Equipment Supplier in Pachora, Maharashtra",
  description:
    "Learn about Tejas Polymers: an irrigation equipment supplier and agricultural machinery manufacturer based in Pachora, Maharashtra, supplying dependable farming equipment and spare parts to dealers and farmers across the region.",
  keywords: [
    "irrigation equipment manufacturer Maharashtra",
    "farm machinery supplier Pachora",
    "agriculture equipment company Jalgaon",
    "drip irrigation supplier",
  ],
  alternates: { canonical: "/about" },
};

const VALUE_ICONS = ["🎯", "🤝", "♻️"];

export default async function AboutPage() {
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
            <span className="text-white">About Us</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            <EditableText contentKey="about.heroTitle" editMode={editMode} value={t("about.heroTitle")} as="span" />
          </h1>
          <div className="mt-3 max-w-2xl text-brand-100">
            <EditableRichText contentKey="about.heroBody" editMode={editMode} value={t("about.heroBody")} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <h2 className="text-3xl font-bold text-brand-900">
              <EditableText contentKey="about.storyTitle" editMode={editMode} value={t("about.storyTitle")} as="span" />
            </h2>
            <div className="mt-4 leading-relaxed text-slate-600">
              <EditableRichText contentKey="about.storyBody" editMode={editMode} value={t("about.storyBody")} />
            </div>
          </div>
          <div className="reveal grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-2xl font-extrabold text-brand-700">
                  <AnimatedStat
                    contentKey={`about.stats.${i}.value`}
                    editMode={editMode}
                    value={t(`about.stats.${i}.value`)}
                    delay={i * 90}
                  />
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  <EditableText contentKey={`about.stats.${i}.label`} editMode={editMode} value={t(`about.stats.${i}.label`)} as="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="reveal text-center text-3xl font-bold text-brand-900">
            <EditableText contentKey="about.valuesTitle" editMode={editMode} value={t("about.valuesTitle")} as="span" />
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="reveal rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-3xl">{VALUE_ICONS[i]}</div>
                <h3 className="mt-3 font-semibold text-brand-900">
                  <EditableText contentKey={`about.values.${i}.title`} editMode={editMode} value={t(`about.values.${i}.title`)} as="span" />
                </h3>
                <div className="mt-2 text-sm leading-relaxed text-slate-600">
                  <EditableRichText contentKey={`about.values.${i}.text`} editMode={editMode} value={t(`about.values.${i}.text`)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <div className="reveal">
          <h2 className="text-3xl font-bold text-brand-900">
            <EditableText contentKey="about.factoryCtaTitle" editMode={editMode} value={t("about.factoryCtaTitle")} as="span" />
          </h2>
          <div className="mx-auto mt-3 max-w-lg text-slate-600">
            <EditableRichText contentKey="about.factoryCtaBody" editMode={editMode} value={t("about.factoryCtaBody")} />
          </div>
          {editMode ? (
            <span className="mt-8 inline-block rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow">
              <EditableLink
                labelKey="about.factoryCtaButton"
                hrefKey="about.factoryCtaHref"
                editMode
                label={t("about.factoryCtaButton")}
                href={t("about.factoryCtaHref")}
              />
            </span>
          ) : (
            <Link
              href={t("about.factoryCtaHref")}
              className="mt-8 inline-block rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow transition hover:bg-brand-700"
            >
              {t("about.factoryCtaButton")}
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
