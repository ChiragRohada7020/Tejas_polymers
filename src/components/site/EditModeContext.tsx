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
  /**
   * True only when the visitor is authenticated AND has switched the
   * editor on. Editing UI must never depend on `active` alone - a
   * logged-in admin browsing the site sees the normal website.
   */
  active: boolean;
  enable: () => void;
  disable: () => void;
};

const EditModeContext = createContext<EditModeValue>({
  active: false,
  enable: () => {},
  disable: () => {},
});

/** Read by every Editable* component to decide whether to render editors. */
export function useEditMode() {
  return useContext(EditModeContext);
}

/**
 * Effective "is the editor showing right now" flag.
 *
 * `canEdit` is the server-rendered permission (is this visitor an admin).
 * It alone must never decide visibility of editing UI, otherwise a
 * logged-in admin browsing normally would still see the editor chrome.
 */
export function useIsEditing(canEdit: boolean): boolean {
  const { active } = useEditMode();
  return canEdit && active;
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

export function EditModeProvider({
  canEdit,
  children,
}: {
  canEdit: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Default OFF. Being logged in grants permission to edit, it does not
  // put the page into edit mode.
  const [active, setActive] = useState(false);

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
    if (!canEdit) {
      setActive(false);
      return;
    }
    if (new URLSearchParams(window.location.search).get("edit") === "1") {
      writeFlag(true);
      setActive(true);
      return;
    }
    setActive(readFlag());
  }, [canEdit, pathname]);

  // Drive the dashed-outline styling from one place.
  useEffect(() => {
    if (!active) return;
    document.body.classList.add("site-editing");
    return () => document.body.classList.remove("site-editing");
  }, [active]);

  // Losing the session must drop edit mode immediately.
  useEffect(() => {
    if (!canEdit) writeFlag(false);
  }, [canEdit]);

  const value = useMemo<EditModeValue>(
    () => ({ active: active && canEdit, enable, disable }),
    [active, canEdit, enable, disable]
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
      {canEdit && !value.active && <EditWebsiteButton onClick={enable} />}
    </EditModeContext.Provider>
  );
}
