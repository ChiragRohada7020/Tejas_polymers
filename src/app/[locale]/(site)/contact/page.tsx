import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
import Reveal from "@/components/Reveal";
import { EditableRichText, EditableText } from "@/components/site/Editable";
import { AREA_SERVED, CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { getSiteContentMap, translator } from "@/lib/site-content";
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

type ContactProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
};

export async function generateMetadata({ params }: ContactProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;
  const isMr = locale === "mr";

  const title = isMr
    ? "संपर्क | तेजा पॉलिमर्स, पाचोरा"
    : "Contact | Tejas Polymers, Pachora";
  const description = isMr
    ? "सिंचन उपकरणांच्या भाव व डिस्ट्रिब्यूटर किंमतसाठी संपर्क साधा. गोरडाखेडा, पाचोरा, महाराष्ट्र ४२४२०१. १-२ कार्यदिवसांत उत्तर."
    : "Contact us for irrigation equipment quotes and distributor pricing. Goradakheda, Pachora, Maharashtra 424201. We respond within 1-2 business days.";

  return {
    title,
    description,
    keywords: isMr
      ? ["सिंचन उपकरण पुरवठादार संपर्क", "पाचोरा शेती उपकरण डीलर", "जळगाव कृषी अवजारे पुरवठादार", "ठिबक सिंचन किंमतपत्रक"]
      : [
          "irrigation equipment supplier contact",
          "farm equipment dealer Pachora",
          "agriculture machinery supplier Jalgaon",
          "drip irrigation price list",
        ],
    alternates: {
      canonical: `/${locale}/contact`,
      languages: localeAlternates("/contact", true),
    },
  };
}

export default async function ContactPage({ params, searchParams }: ContactProps) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const { product } = await searchParams;
  const map = await getSiteContentMap();
  const t = translator(map, locale);
  const email = t("footer.contact.email") || CONTACT.email;
  const phone = t("footer.contact.phone") || CONTACT.phone;
  const address = t("footer.contact.address") || CONTACT.address;

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/contact#business`,
    name: SITE_NAME,
    url: `${SITE_URL}/contact`,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/images/og/tejas-polymers.jpg`,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.street,
      addressLocality: CONTACT.locality,
      addressRegion: CONTACT.region,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CONTACT.latitude,
      longitude: CONTACT.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
    areaServed: AREA_SERVED.map((area) => ({ "@type": "City", name: area })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where is Tejas Polymers located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `We are at ${address}.`,
        },
      },
      {
        "@type": "Question",
        name: "What products do you supply?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We supply drip and irrigation systems, sprayers and dusters, power tillers, harvesting machinery, water pumps, hand tools and spare parts.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer distributor or dealer pricing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We offer distributor and dealer pricing on bulk quantities, with support for new territories. Send us an enquiry and we will share the price list.",
        },
      },
      {
        "@type": "Question",
        name: "Do you supply spare parts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We stock spare parts for the equipment we sell and aim to dispatch them quickly so your customers stay productive.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Reveal />
      <section className="wave-bg border-b border-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
            <Link href={localePath(locale, "/")} className="hover:text-brand-800">{ui("breadcrumbHome", locale)}</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-900">{ui("footerContact", locale)}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-brand-950 sm:text-4xl">
            <EditableText contentKey="contact.heroTitle" editMode={editMode} value={t("contact.heroTitle")} as="span" />
          </h1>
          <div className="mt-3 max-w-2xl text-slate-700">
            <EditableRichText contentKey="contact.heroBody" editMode={editMode} value={t("contact.heroBody")} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="reveal lg:col-span-2">
            <h2 className="text-2xl font-bold text-brand-900">
              <EditableText contentKey="contact.infoTitle" editMode={editMode} value={t("contact.infoTitle")} as="span" />
            </h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">{ui("labelEmail", locale)}</dt>
                <dd className="mt-1 text-slate-800">
                  <EditableText contentKey="footer.contact.email" editMode={editMode} value={email} as="span" />
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">{ui("labelPhoneWhatsApp", locale)}</dt>
                <dd className="mt-1 text-slate-800">
                  <EditableText contentKey="footer.contact.phone" editMode={editMode} value={phone} as="span" />
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">{ui("labelFactoryAddress", locale)}</dt>
                <dd className="mt-1 text-slate-800">
                  <EditableText contentKey="footer.contact.address" editMode={editMode} value={address} as="span" />
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">{ui("labelWorkingHours", locale)}</dt>
                <dd className="mt-1 text-slate-800">
                  <EditableText contentKey="contact.hours" editMode={editMode} value={t("contact.hours")} as="span" />
                </dd>
              </div>
            </dl>

            <div className="mt-8 rounded-xl border border-brand-100 bg-brand-50 p-5">
              <p className="font-semibold text-brand-900">
                <EditableText
                  contentKey="contact.distributorTitle"
                  editMode={editMode}
                  value={t("contact.distributorTitle")}
                  as="span"
                />
              </p>
              <div className="mt-1 text-sm text-slate-600">
                <EditableRichText
                  contentKey="contact.distributorBody"
                  editMode={editMode}
                  value={t("contact.distributorBody")}
                />
              </div>
              <Link
                href={localePath(locale, "/become-a-distributor")}
                className="mt-3 inline-block text-sm font-semibold text-brand-700 underline hover:text-brand-800"
              >
                <EditableText
                  contentKey="contact.distributorCta"
                  editMode={editMode}
                  value={t("contact.distributorCta")}
                  as="span"
                />{" "}
                →
              </Link>
            </div>
          </div>

          <div className="reveal rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
            <h2 className="text-2xl font-bold text-brand-900">
              <EditableText contentKey="contact.formTitle" editMode={editMode} value={t("contact.formTitle")} as="span" />
            </h2>
            <div className="mt-2 text-sm text-slate-600">
              <EditableRichText contentKey="contact.formBody" editMode={editMode} value={t("contact.formBody")} />
            </div>
            <div className="mt-6">
              <InquiryForm
                variant="general"
                productName={product ? decodeURIComponent(product) : undefined}
                compact
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
