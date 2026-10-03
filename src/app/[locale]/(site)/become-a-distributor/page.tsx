import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
import Reveal from "@/components/Reveal";
import { EditableRichText, EditableText } from "@/components/site/Editable";
import { getSiteContentMap, translator } from "@/lib/site-content";
import {
  breadcrumbJsonLd,
  jsonLdScript,
  organizationJsonLd,
} from "@/lib/seo";
import { AREA_SERVED, SITE_URL } from "@/lib/site";
import {
  DEFAULT_LOCALE,
  isKnownLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { ui } from "@/lib/strings";

export const revalidate = 60;
  // Edit state is resolved client-side (see EditModeContext).
  const editMode = false;

type DistributorProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: DistributorProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;
  const isMr = locale === "mr";

  const title = isMr
    ? "डिस्ट्रिब्यूटर व्हा | तेजा पॉलिमर्स"
    : "Become a Distributor | Tejas Polymers";
  const description = isMr
    ? "तेजा पॉलिमर्सचे डिस्ट्रिब्यूटर व्हा. सिंचन उपकरणे व शेती अवजारांवर थेट कारखान्यादून किंमत, क्षेत्रासाठी सहाय्य व स्पेअर पार्ट्सची खात्रीशीर उपलब्धता."
    : "Become a Tejas Polymers distributor. Factory-direct pricing on irrigation equipment and farm machinery, territory support and reliable supply of spare parts.";

  return {
    title,
    description,
    keywords: isMr
      ? ["कृषी उपकरण वितरक", "डिस्ट्रिब्यूटर व्हा", "सिंचन उपकरण डीलर संधी", "शेती अवजारे वितरक"]
      : [
          "agriculture equipment distributor",
          "become a distributor",
          "irrigation equipment dealer opportunity",
          "farm machinery distributor India",
        ],
    alternates: {
      canonical: `/${locale}/become-a-distributor`,
      languages: localeAlternates("/become-a-distributor", true),
    },
  };
}

const BENEFIT_ICONS = ["💰", "🛡️", "📦", "📣"];

export default async function BecomeADistributorPage({ params }: DistributorProps) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const map = await getSiteContentMap();
  const t = translator(map, locale);

  const isMr = locale === "mr";
  // The distributor page is an Offer: a dealership opportunity. Declaring it
  // lets Google treat it as a service offering rather than thin marketing copy.
  const distributorLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: isMr ? "डिस्ट्रिब्यूटर संधी" : "Irrigation Equipment Distribution",
    serviceType: isMr
      ? "सिंचन उपकरण वितरण"
      : "Irrigation equipment distribution",
    description: isMr
      ? "कारखान्यातून थेट किंमत, क्षेत्रासाठी सविष्ट संरक्षण व स्पेअर पार्ट्सची खात्रीशीर उपलब्धता."
      : "Factory-direct pricing, territory protection and reliable spare parts supply.",
    provider: { "@id": `${SITE_URL}/${locale}#organization` },
    areaServed: AREA_SERVED.map((a) => ({ "@type": "City", name: a })),
    url: `${SITE_URL}/${locale}/become-a-distributor`,
  };
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: ui("breadcrumbHome", locale), path: `/${locale}` },
    {
      name: isMr ? "डिस्ट्रिब्यूटर व्हा" : "Become a Distributor",
      path: `/${locale}/become-a-distributor`,
    },
  ]);

  return (
    <>
      <Reveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            { ...organizationJsonLd(locale), "@id": `${SITE_URL}/${locale}#organization` },
            distributorLd,
            breadcrumbLd
          ),
        }}
      />
      <section className="wave-bg border-b border-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
            <Link href={localePath(locale, "/")} className="hover:text-brand-800">{ui("breadcrumbHome", locale)}</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-900">{ui("footerBecomeDistributor", locale)}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-brand-950 sm:text-4xl">
            <EditableText contentKey="distributor.heroTitle" editMode={editMode} value={t("distributor.heroTitle")} as="span" />
          </h1>
          <div className="mt-3 max-w-2xl text-slate-700">
            <EditableRichText contentKey="distributor.heroBody" editMode={editMode} value={t("distributor.heroBody")} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="reveal rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{BENEFIT_ICONS[i]}</div>
              {/* h2 rather than h3: this grid sits directly under the page
                  h1 with no intervening section heading, so h3 would skip a
                  level in the document outline. */}
              <h2 className="mt-3 font-semibold text-brand-900">
                <EditableText contentKey={`distributor.benefits.${i}.title`} editMode={editMode} value={t(`distributor.benefits.${i}.title`)} as="span" />
              </h2>
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
