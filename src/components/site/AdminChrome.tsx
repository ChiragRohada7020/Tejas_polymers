"use client";

import type { ReactNode } from "react";
import { useIsEditing } from "@/components/site/EditModeContext";

/**
 * Renders its children only while the visual editor is actually switched on.
 *
 * Used for admin-only markup (edit links, admin banners) that lives in
 * server components. Being logged in is not enough on its own - otherwise
 * an admin browsing the site normally would still see the admin chrome.
 */
export default function AdminChrome({
  canEdit,
  children,
}: {
  canEdit: boolean;
  children: ReactNode;
}) {
  const editing = useIsEditing(canEdit);
  if (!editing) return null;
  return <>{children}</>;
}