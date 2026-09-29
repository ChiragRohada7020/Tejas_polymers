"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { EditableLink, EditableText } from "@/components/site/Editable";
import { useIsEditing } from "@/components/site/EditModeContext";
import EditableMedia from "@/components/site/EditableMedia";
import type { NavItem } from "@/app/(site)/layout";

export type HeaderProps = {
  editMode: boolean;
  logoImage: string;
  logoAlt: string;
  wordmarkStart: string;
  wordmarkEnd: string;
  nav: NavItem[];
  ctaLabel: string;
  ctaHref: string;
};

type BrandProps = Pick<
  HeaderProps,
  "editMode" | "logoImage" | "logoAlt" | "wordmarkStart" | "wordmarkEnd"
> & { dark?: boolean };

export function BrandMark({
  editMode,
  logoImage,
  logoAlt,
  wordmarkStart,
  wordmarkEnd,
  dark = false,
}: BrandProps) {
  const textColor = dark ? "text-white" : "text-brand-900";
  const accentColor = dark ? "text-brand-300" : "text-brand-600";

  const wordmark = (
    <span className={`text-lg font-bold tracking-tight ${textColor}`}>
      <EditableText contentKey="brand.wordmarkStart" editMode={editMode} value={wordmarkStart} as="span" />
      <span className={accentColor}>
        <EditableText contentKey="brand.wordmarkEnd" editMode={editMode} value={wordmarkEnd} as="span" />
      </span>
    </span>
  );

  if (!useIsEditing(editMode)) {
    return (
      <span className="flex items-center gap-2">
        {logoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoImage} alt={logoAlt} className="h-9 w-auto rounded-lg object-contain" loading="lazy" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-lg font-black text-white">
            {(wordmarkStart.charAt(0) || "A").toUpperCase()}
          </span>
        )}
        {wordmark}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <EditableMedia
        imageKey="brand.logoImage"
        altKey="brand.logoAlt"
        editMode
        src={logoImage}
        alt={logoAlt}
        imgClassName="h-9 w-auto rounded-lg object-contain"
        fallback={
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-lg font-black text-white">
            {(wordmarkStart.charAt(0) || "A").toUpperCase()}
          </span>
        }
      />
      {wordmark}
    </span>
  );
}

export default function HeaderClient(props: HeaderProps) {
  const { editMode, nav, ctaLabel, ctaHref } = props;
  // Nav/CTA render as editable links only while the editor is switched on.
  const editing = useIsEditing(editMode);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const headerClass = `sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur transition-shadow ${
    scrolled ? "shadow-sm" : ""
  }`;

  const desktopLink = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-brand-700"
    }`;

  const mobileLink = (active: boolean) =>
    `block rounded-md px-3 py-3 text-sm font-medium ${
      active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" title={`${props.wordmarkStart} ${props.wordmarkEnd} — home`}>
          <BrandMark {...props} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return editing ? (
              <span key={item.hrefKey} className="inline-flex items-center">
                <EditableLink
                  labelKey={item.labelKey}
                  hrefKey={item.hrefKey}
                  editMode
                  label={item.label}
                  href={item.href}
                  className={desktopLink(active)}
                />
              </span>
            ) : (
              <Link key={item.hrefKey} href={item.href} className={desktopLink(active)}>
                {item.label}
              </Link>
            );
          })}

          {editing ? (
            <span className="ml-3 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <EditableLink
                labelKey="header.cta.label"
                hrefKey="header.cta.href"
                editMode
                label={ctaLabel}
                href={ctaHref}
              />
            </span>
          ) : (
            <Link
              href={ctaHref}
              className="ml-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {ctaLabel}
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden" aria-label="Mobile navigation">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return editing ? (
              <span key={item.hrefKey} className="block">
                <EditableLink
                  labelKey={item.labelKey}
                  hrefKey={item.hrefKey}
                  editMode
                  label={item.label}
                  href={item.href}
                  className={mobileLink(active)}
                />
              </span>
            ) : (
              <Link key={item.hrefKey} href={item.href} className={mobileLink(active)}>
                {item.label}
              </Link>
            );
          })}
          {editing ? (
            <span className="mt-2 block">
              <EditableLink
                labelKey="header.cta.label"
                hrefKey="header.cta.href"
                editMode
                label={ctaLabel}
                href={ctaHref}
                className="block rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
              />
            </span>
          ) : (
            <Link
              href={ctaHref}
              className="mt-2 block rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {ctaLabel}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
