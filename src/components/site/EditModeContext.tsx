"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

const FLAG = "agrigrid_edit_mode";

type EditModeValue = {
  /** True when the browser has confirmed this visitor is an admin. */
  isAdmin: boolean;
  /**
   * True only when the visitor is an admin AND has switched the editor
   * on. Editing UI must never depend on `active` alone - a logged-in
   * admin browsing the site sees the normal website.
   */
  active: boolean;
  enable: () => void;
  disable: () => void;
};

const EditModeContext = createContext<EditModeValue>({
  isAdmin: false,
  active: false,
  enable: () => {},
  disable: () => {},
});

export function useEditMode() {
  return useContext(EditModeContext);
}

/**
 * Effective "is the editor showing right now" flag.
 *
 * Takes no argument on purpose. Admin status is resolved in the browser
 * from /api/admin/session, because reading cookies() while rendering a
 * page forces Next.js to mark it `private, no-store` - which disabled
 * CDN caching site-wide and made every navigation pay for a fresh
 * server render plus database round trip.
 */
export function useIsEditing(): boolean {
  const { isAdmin, active } = useEditMode();
  return isAdmin && active;
}

function readFlag(): boolean {
  try {
    return window.sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

function writeFlag(on: boolean) {
  try {
    if (on) window.sessionStorage.setItem(FLAG, "1");
    else window.sessionStorage.removeItem(FLAG);
  } catch {
    /* storage unavailable - toggle still works for the current page */
  }
}

function EditWebsiteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Switch on the visual editor to change text and links on this site"
      className="fixed bottom-4 right-4 z-[100] inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
    >
      <span aria-hidden="true">Edit Website</span>
    </button>
  );
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Default OFF. Being logged in grants permission to edit, it does not
  // put the page into edit mode.
  const [active, setActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Ask the server once per page load whether this visitor is an admin.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean }) => {
        if (!cancelled) setIsAdmin(Boolean(d?.authenticated));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(() => {
    writeFlag(true);
    setActive(true);
  }, []);

  const disable = useCallback(() => {
    writeFlag(false);
    setActive(false);
  }, []);

  // Keep the toggle across client-side navigation, and honour ?edit=1.
  useEffect(() => {
    if (!isAdmin) {
      setActive(false);
      return;
    }
    if (new URLSearchParams(window.location.search).get("edit") === "1") {
      writeFlag(true);
      setActive(true);
      return;
    }
    setActive(readFlag());
  }, [isAdmin, pathname]);

  // Drive the dashed-outline styling from one place.
  useEffect(() => {
    if (!active) return;
    document.body.classList.add("site-editing");
    return () => document.body.classList.remove("site-editing");
  }, [active]);

  // Losing the session must drop edit mode immediately.
  useEffect(() => {
    if (!isAdmin) writeFlag(false);
  }, [isAdmin]);

  const value = useMemo<EditModeValue>(
    () => ({ isAdmin, active: active && isAdmin, enable, disable }),
    [isAdmin, active, enable, disable]
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
      {isAdmin && !value.active && <EditWebsiteButton onClick={enable} />}
    </EditModeContext.Provider>
  );
}