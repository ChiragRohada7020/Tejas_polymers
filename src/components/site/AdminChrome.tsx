"use client";

import type { ReactNode } from "react";
import { useIsEditing } from "@/components/site/EditModeContext";

/**
 * Renders its children only while the visual editor is switched on.
 *
 * Used for admin-only markup (edit links, admin banners) that lives in
 * server components. Because admin status is resolved in the browser,
 * these render nothing on the server and appear only for an admin who
 * has pressed "Edit Website".
 */
export default function AdminChrome({ children }: { children: ReactNode }) {
  const editing = useIsEditing();
  if (!editing) return null;
  return <>{children}</>;
}