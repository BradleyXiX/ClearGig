"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BrandBar } from "./BrandBar";

export interface AppShellProps {
  children: React.ReactNode;
  pathname?: string;
}

export function AppShell({ children, pathname: explicitPathname }: AppShellProps) {
  const routerPathname = usePathname();
  const currentPath = explicitPathname ?? routerPathname;
  const isShowcase = currentPath === "/showcase" || currentPath?.startsWith("/showcase/");

  // On showcase route, the showcase page provides its own single header and main landmark.
  // We do not render the app's BrandBar header or an extra outer main wrapper.
  if (isShowcase) {
    return <>{children}</>;
  }

  // On standard app routes (/dashboard, /projects/..., /), render the working app header and main landmark.
  return (
    <>
      <BrandBar />
      <main>{children}</main>
    </>
  );
}
