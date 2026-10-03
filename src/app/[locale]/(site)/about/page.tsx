import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import VideoBackground from "@/components/VideoBackground";
import AnimatedStat from "@/components/AnimatedStat";
import { EditableLink, EditableRichText, EditableText } from "@/components/site/Editable";
import { getSiteContentMap, translator } from "@/lib/site-content";
import {
  breadcrumbJsonLd,
  jsonLdScript,
  organizationJsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  isKnownLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { ui } from "@/lib/strings";

export const revalidate = 60;
  // Edit state is resolved client-side (see EditModeContext).
  const editMode = false;

type AboutProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: AboutProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;
  const isMr = locale === "mr";

  const title = isMr
    ? "आमच्याबद्दल | तेजा पॉलिमर्स, पाचोरा"
    : "About Us | Tejas Polymers, Pachora";
  const description = isMr
    ? "पाचोरा, महाराष्ट्रातील सिंचन उपकरण निर्माता व पुरवठादार. IS 13488 प्रमाणित ठिबक सिंचन उत्पादने, मालक व शेतकरी यांना दुर्लभ नसणारी उपकरणे."
    : "Drip irrigation equipment manufacturer and supplier in Pachora, Maharashtra. IS 13488 certified products supplied to dealers and farmers across the region.";

  return {
    title,
    description,
    keywords: isMr
      ? ["ठिबक सिंचन निर्माता महाराष्ट्र", "पाचोरा शेती अवजारे पुरवठादार", "जळगाव कृषी कंपनी"]
      : [
          "irrigation equipment manufacturer Maharashtra",
          "farm machinery supplier Pachora",
          "agriculture equipment company Jalgaon",
          "drip irrigation supplier",
        ],
    alternates: {
      canonical: `/${locale}/about`,
      languages: localeAlternates("/about", true),
    },
  };
}

const VALUE_ICONS = ["🎯", "🤝", "♻️"];

export default async function AboutPage({ params }: AboutProps) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const map = await getSiteContentMap();
  const t = translator(map, locale);

  const isMr = locale === "mr";
  // AboutPage carries the Organization node so the business entity can be tied
  // to its own story page, plus a breadcrumb mirroring the visible nav.
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: isMr ? "तेजा पॉलिमर्सबद्दल" : "About Tejas Polymers",
    url: `${SITE_URL}/${locale}/about`,
    inLanguage: LOCALE_META[locale].htmlLang,
    mainEntity: organizationJsonLd(locale),
  };
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: ui("breadcrumbHome", locale), path: `/${locale}` },
    {
      name: isMr ? "आमच्याबद्दल" : "About",
      path: `/${locale}/about`,
    },
  ]);

  return (
    <>
      <Reveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(aboutLd, breadcrumbLd) }}
      />
      {/* Static hero. This deliberately does NOT use VideoBackground any more:
          the footage used to sit behind the headline as a decorative layer,
          which left the hero dark, unreadable behind moving images, and made
          the video impossible to pause properly for motion-sensitive visitors.
          The video now has its own section further down the page. */}
      <section className="wave-bg border-b border-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
            <Link href={localePath(locale, "/")} className="hover:text-brand-800">
              {ui("breadcrumbHome", locale)}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-brand-900">{t("about.heroTitle")}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-brand-950 sm:text-4xl">
            <EditableText contentKey="about.heroTitle" editMode={editMode} value={t("about.heroTitle")} as="span" />
          </h1>
          <div className="mt-3 max-w-2xl text-slate-700">
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

      {/* Video gets its own section rather than sitting behind the hero.
          Inline means it uses the YouTube player's own controls, does not
          autoplay, and does not compete with the headline for attention. */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-brand-900">
            <EditableText contentKey="about.videoTitle" editMode={editMode} value={t("about.videoTitle")} as="span" />
          </h2>
          <p className="mt-3 text-slate-600">
            <EditableText contentKey="about.videoBody" editMode={editMode} value={t("about.videoBody")} as="span" />
          </p>
        </div>
        <div className="reveal mx-auto mt-8 max-w-4xl">
          <VideoBackground videoId="lpP569Cv1x0" variant="inline" />
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
              href={localePath(locale, t("about.factoryCtaHref"))}
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
