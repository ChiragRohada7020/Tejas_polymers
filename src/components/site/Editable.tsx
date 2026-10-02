"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useIsEditing } from "@/components/site/EditModeContext";
import { useLocale } from "@/components/site/LocaleContext";
import { localePath } from "@/lib/i18n";

type BaseProps = {
  contentKey: string;
  /**
   * Retained for compatibility with older call sites. Admin status and the
   * on/off toggle now both come from useIsEditing(), so this is ignored.
   */
  editMode?: boolean;
  className?: string;
  style?: CSSProperties;
};


function useCancelOnEscape(ref: React.RefObject<HTMLElement | null>, editMode: boolean, original: string) {
  useEffect(() => {
    if (!editMode) return;
    const node = ref.current;
    if (!node) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        node.textContent = original;
        node.blur();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [editMode, original, ref]);
}

/** Plain-text inline block. Renders identical output for anonymous visitors. */
export function EditableText({
  contentKey,
  editMode,
  value,
  as: Tag = "span",
  className,
  style,
}: BaseProps & { value: string; as?: "span" | "p" | "h1" | "h2" | "h3" | "li" | "div" }) {
  const ref = useRef<HTMLElement | null>(null);
  const editing = useIsEditing();
  useCancelOnEscape(ref, editing, value);

  if (!editing) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      // @ts-expect-error contentEditable ref polymorphism
      ref={ref}
      className={className}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-content-key={contentKey}
      data-content-kind="text"
    >
      {value}
    </Tag>
  );
}

/** Rich-text inline block with a minimal B/I/link/list toolbar. */
export function EditableRichText({
  contentKey,
  editMode,
  value,
  className,
  style,
}: BaseProps & { value: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const editing = useIsEditing();
  useCancelOnEscape(ref, editing, value);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  if (!editing) {
    return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: value }} />;
  }

  function command(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg);
    ref.current?.focus();
  }

  function addLink() {
    const url = window.prompt("Link destination (e.g. /products or https://…)", "/products");
    if (url) command("createLink", url);
  }

  return (
    <div className={className} style={style}>
      <div className="site-edit-toolbar" contentEditable={false}>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("bold")}>
          B
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("italic")}>
          I
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addLink}>
          🔗
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("insertUnorderedList")}>
          • List
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        data-content-key={contentKey}
        data-content-kind="rich"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

/**
 * Adds the `edit=1` flag to internal links so the target page opens in the
 * visual editor. External links, anchors and tel/mailto are left untouched.
 */
function withEditParam(href: string, editMode: boolean): string {
  if (!editMode || !href) return href;
  if (/^(https?:)?\/\//i.test(href)) return href;
  if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return href;
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("edit", "1");
  return `${path}?${params.toString()}`;
}

/**
 * Link that still navigates normally while the visual editor is on (the target
 * page opens in edit mode too). Use the small buttons next to the label to
 * rename the text or change the destination.
 */
export function EditableLink({
  labelKey,
  hrefKey,
  editMode,
  label,
  href,
  className,
  children,
}: {
  labelKey: string;
  hrefKey: string;
  editMode?: boolean;
  label: string;
  href: string;
  className?: string;
  children?: ReactNode;
}) {
  const editing = useIsEditing();
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const locale = useLocale();

  /*
   * `href` is the locale-neutral value an admin edits and what gets persisted
   * ("/products"). `displayHref` is what the browser navigates to. Keeping
   * those separate is what lets one stored link serve both languages without
   * an admin edit on the Marathi page silently rewriting the English one to
   * "/mr/products".
   */
  const displayHref = localePath(locale, href);

  if (!editing) {
    // Render a next/link Link, not a bare <a>, so that client-side
    // navigation and prefetching still work for normal visitors.
    return (
      <Link href={displayHref} className={className}>
        {children ?? label}
      </Link>
    );
  }

  function editLabel(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const holder = labelRef.current;
    if (!holder) return;
    const next = window.prompt("Text", holder.innerText.trim() || label);
    if (next === null) return;
    holder.textContent = next;
    holder.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function editHref(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const holder = labelRef.current;
    if (!holder) return;
    const next = window.prompt("Link destination (e.g. /products or https://…)", href);
    if (next === null) return;
    holder.dataset.linkHref = next;
    const anchor = holder.closest("a");
    // Persist the raw, locale-neutral value in dataset; only the live anchor
    // gets the locale-prefixed version.
    if (anchor) anchor.setAttribute("href", withEditParam(localePath(locale, next), editing));
    // Trigger an input event so VisualEditorShell detects the change
    holder.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <a
        href={withEditParam(displayHref, editing)}
        className={className}
        title={`Go to ${displayHref} (edit mode stays on)`}
      >
        <span
          ref={labelRef}
          data-content-key={labelKey}
          data-content-kind="text"
          data-link-key={hrefKey}
          data-link-href={href}
        >
          {children ?? label}
        </span>
      </a>
      <button
        type="button"
        onClick={editLabel}
        title="Change text"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/10 text-[10px] hover:bg-slate-900/20"
      >
        ✏️
      </button>
      <button
        type="button"
        onClick={editHref}
        title="Change link destination"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/10 text-[10px] hover:bg-slate-900/20"
      >
        🔗
      </button>
    </span>
  );
}
