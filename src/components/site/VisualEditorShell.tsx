"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type EditorState = {
  enabled: boolean;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  savedAt: number | null;
};

function collectItems(): { key: string; value: string }[] {
  const items: { key: string; value: string }[] = [];
  const seenKeys = new Set<string>();

  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-content-key]"));
  for (const node of nodes) {
    const key = node.dataset.contentKey;
    if (!key) continue;
    seenKeys.add(key);

    const kind = node.dataset.contentKind || "text";
    if (node instanceof HTMLImageElement) {
      items.push({ key, value: node.getAttribute("src") || "" });
    } else if (kind === "rich") {
      items.push({ key, value: node.innerHTML });
    } else {
      items.push({ key, value: node.innerText });
    }
  }

  // Also collect any modified or tracked link destinations
  const linkNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-link-key]"));
  for (const node of linkNodes) {
    const lKey = node.dataset.linkKey;
    const lHref = node.dataset.linkHref;
    if (lKey && lHref !== undefined && !seenKeys.has(lKey)) {
      items.push({ key: lKey, value: lHref });
    }
  }

  return items;
}

const EDIT_FLAG = "agrigrid_edit_mode";

/** True when the current URL asks for edit mode, or a previous page turned it on. */
function editModeRequested(): boolean {
  if (typeof window === "undefined") return false;
  const fromUrl = new URLSearchParams(window.location.search).get("edit") === "1";
  if (fromUrl) {
    try {
      window.sessionStorage.setItem(EDIT_FLAG, "1");
    } catch {
      /* storage unavailable — edit mode still works for this page */
    }
    return true;
  }
  try {
    return window.sessionStorage.getItem(EDIT_FLAG) === "1";
  } catch {
    return false;
  }
}

export default function VisualEditorShell() {
  const pathname = usePathname();
  const [state, setState] = useState<EditorState>({
    enabled: false,
    dirty: false,
    saving: false,
    error: null,
    savedAt: null,
  });

  useEffect(() => {
    if (editModeRequested()) {
      setState((s) => ({ ...s, enabled: true }));
      document.body.classList.add("site-editing");
    }
    return () => document.body.classList.remove("site-editing");
    // Re-check on every client-side navigation so edit mode persists while browsing pages.
  }, [pathname]);

  useEffect(() => {
    if (!state.enabled) return;
    const onInput = (event: Event) => {
      if ((event.target as HTMLElement | null)?.closest?.("[data-content-key]")) {
        setState((s) => ({ ...s, dirty: true, savedAt: null }));
      }
    };
    document.addEventListener("input", onInput);
    return () => document.removeEventListener("input", onInput);
  }, [state.enabled]);

  // Warn before leaving the page with unsaved edits (link clicks, refresh, close).
  useEffect(() => {
    if (!state.enabled || !state.dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state.enabled, state.dirty]);

  // Intercept in-page link clicks so unsaved edits aren't silently dropped.
  useEffect(() => {
    if (!state.enabled || !state.dirty) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank") return;
      if (!window.confirm("You have unsaved changes. Leave this page and discard them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [state.enabled, state.dirty]);

  if (!state.enabled) return null;

  async function save() {
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: collectItems() }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Could not save changes.");
      }
      setState((s) => ({ ...s, dirty: false, savedAt: Date.now() }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Could not save changes.",
      }));
    } finally {
      setState((s) => ({ ...s, saving: false }));
    }
  }

  function discard() {
    window.location.reload();
  }

  function exit() {
    try {
      window.sessionStorage.removeItem(EDIT_FLAG);
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    window.location.href = url.toString();
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
      <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">✏️ Editing</span>
      <span className="text-xs text-slate-500">
        {state.saving
          ? "Saving…"
          : state.savedAt
            ? "Saved ✓"
            : state.dirty
              ? "Unsaved changes"
              : "Click text to edit · click links to open that page · ✏️/🔗 to edit link text/URL"}
      </span>
      {state.error && <span className="w-full text-xs text-red-600">{state.error}</span>}
      <span className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={discard}
          disabled={state.saving || !state.dirty}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={save}
          disabled={state.saving || !state.dirty}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {state.saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={exit}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Exit
        </button>
      </span>
    </div>
  );
}
