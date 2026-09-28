import Link from "next/link";
import { EditableRichText, EditableText } from "@/components/site/Editable";
import { BrandMark } from "@/components/HeaderClient";

type Props = {
  editMode: boolean;
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
  editMode,
  logoImage,
  logoAlt,
  wordmarkStart,
  wordmarkEnd,
  aboutBlurb,
  email,
  phone,
  address,
}: Props) {
  return (
    <footer className="border-t border-slate-200 bg-brand-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <BrandMark
            editMode={editMode}
            logoImage={logoImage}
            logoAlt={logoAlt}
            wordmarkStart={wordmarkStart}
            wordmarkEnd={wordmarkEnd}
            dark
          />
          <EditableRichText
            contentKey="footer.aboutBlurb"
            editMode={editMode}
            value={aboutBlurb}
            className="mt-4 text-sm leading-relaxed text-slate-400"
          />
        </div>

        <nav aria-label="Footer products">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Products</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/products?category=sprayers-dusters">Sprayers &amp; Dusters</Link></li>
            <li><Link className="hover:text-white" href="/products?category=tillers-cultivators">Tillers &amp; Cultivators</Link></li>
            <li><Link className="hover:text-white" href="/products?category=harvesting-machinery">Harvesting Machinery</Link></li>
            <li><Link className="hover:text-white" href="/products?category=irrigation-equipment">Irrigation Equipment</Link></li>
            <li><Link className="hover:text-white" href="/products?category=hand-tools">Hand Tools</Link></li>
            <li><Link className="hover:text-white" href="/products?category=spare-parts">Spare Parts</Link></li>
          </ul>
        </nav>

        <nav aria-label="Footer company">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/about">About Us</Link></li>
            <li><Link className="hover:text-white" href="/become-a-distributor">Become a Distributor</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-white" href="/products">All Products</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>
              📧 <EditableText contentKey="footer.contact.email" editMode={editMode} value={email} as="span" />
            </li>
            <li>
              📞 <EditableText contentKey="footer.contact.phone" editMode={editMode} value={phone} as="span" />
            </li>
            <li>
              📍 <EditableText contentKey="footer.contact.address" editMode={editMode} value={address} as="span" />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {wordmarkStart} {wordmarkEnd}. All rights reserved.
      </div>
    </footer>
  );
}

