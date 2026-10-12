import Link from "next/link";
import { EditableRichText, EditableText } from "@/components/site/Editable";
import { BrandMark } from "@/components/HeaderClient";
import { allBlogPosts } from "@/lib/blog";
import { localePath, type Locale } from "@/lib/i18n";
import { ui } from "@/lib/strings";

type Props = {
  locale: Locale;
  logoImage: string;
  logoAlt: string;
  wordmarkStart: string;
  wordmarkEnd: string;
  aboutBlurb: string;
  email: string;
  phone: string;
  address: string;
};

export default function Footer({
  locale,
  logoImage,
  logoAlt,
  wordmarkStart,
  wordmarkEnd,
  aboutBlurb,
  email,
  phone,
  address,
}: Props) {
  /** Keeps a visitor inside the language they are currently reading. */
  const href = (path: string) => localePath(locale, path);

  /** The five newest guides, so the footer link list stays current on its own. */
  const guides = allBlogPosts().slice(0, 5);

  return (
    <footer className="wave-bg-deep text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <BrandMark
            logoImage={logoImage}
            logoAlt={logoAlt}
            wordmarkStart={wordmarkStart}
            wordmarkEnd={wordmarkEnd}
            dark
          />
          <EditableRichText
            contentKey="footer.aboutBlurb"
            value={aboutBlurb}
            className="mt-4 text-sm leading-relaxed text-slate-400"
          />
        </div>

        <nav aria-label="Footer products">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {ui("footerProducts", locale)}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link prefetch className="hover:text-white" href={href("/products?category=flat-inline-drip")}>{ui("catFlatInlineDrip", locale)}</Link></li>
            <li><Link prefetch className="hover:text-white" href={href("/products?category=online-drip-emitters")}>{ui("catOnlineDrip", locale)}</Link></li>
            <li><Link prefetch className="hover:text-white" href={href("/products?category=filters")}>{ui("catFilters", locale)}</Link></li>
            <li><Link prefetch className="hover:text-white" href={href("/products?category=fittings-accessories")}>{ui("catFittings", locale)}</Link></li>
          </ul>
        </nav>

        <nav aria-label="Footer company">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {ui("footerCompany", locale)}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link prefetch className="hover:text-white" href={href("/about")}>{ui("footerAbout", locale)}</Link></li>
            <li><Link prefetch className="hover:text-white" href={href("/become-a-distributor")}>{ui("footerBecomeDistributor", locale)}</Link></li>
            <li><Link prefetch className="hover:text-white" href={href("/blog")}>{ui("footerBlog", locale)}</Link></li>
            <li><Link prefetch className="hover:text-white" href={href("/contact")}>{ui("footerContact", locale)}</Link></li>
            <li><Link prefetch className="hover:text-white" href={href("/products")}>{ui("allProducts", locale)}</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {ui("footerContact", locale)}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>
              📧 <EditableText contentKey="footer.contact.email" value={email} as="span" />
            </li>
            <li>
              📞 <EditableText contentKey="footer.contact.phone" value={phone} as="span" />
            </li>
            <li>
              📍 <EditableText contentKey="footer.contact.address" value={address} as="span" />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        {/*
          Direct links into the guides, on every page of the site.

          The section is kept out of the main navigation, so this strip is what
          actually feeds it: it gives crawlers a plain <a href> to five guide
          URLs from every page rather than only the index, and it gives a reader
          who has just finished a product page somewhere else to go. The anchor
          text is the guide's own title, which is also what the guide ranks for.
        */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {ui("footerGuides", locale)}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
            {guides.map((post) => (
              <li key={post.slug} className="max-w-md">
                <Link prefetch className="hover:text-white" href={href(`/blog/${post.slug}`)}>
                  {post.copy[locale].title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                prefetch
                className="font-medium text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-white"
                href={href("/blog")}
              >
                {ui("footerBlogAll", locale)}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {wordmarkStart} {wordmarkEnd}. {ui("allRightsReserved", locale)}
      </div>
    </footer>
  );
}

