"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BrandBar } from "./BrandBar";
import { CONTACT_INFO } from "@/lib/contact";

export interface AppShellProps {
  children: React.ReactNode;
  pathname?: string;
}

export function AppShell({ children, pathname: explicitPathname }: AppShellProps) {
  const routerPathname = usePathname();
  const currentPath = explicitPathname ?? routerPathname;
  const isShowcase = currentPath === "/showcase" || currentPath?.startsWith("/showcase/");

  // On showcase route, the showcase page provides its own single header and main landmark.
  // We do not render the app's BrandBar header, outer main wrapper, or app contact footer (showcase owns its complete footer).
  if (isShowcase) {
    return <>{children}</>;
  }

  // On standard app routes (/dashboard, /projects/..., /), render the working app header, main landmark, and compact no-print contact footer.
  return (
    <>
      <BrandBar />
      <main>{children}</main>
      <footer className="w-full border-t border-rule bg-paper-raised text-ink-muted text-xs font-mono py-4 px-4 sm:px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>Questions or implementation enquiries?</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href={CONTACT_INFO.email.href}
              className="hover:text-ink font-sans font-medium underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest rounded-control outline-none py-0.5"
            >
              Email Bradley
            </a>
            <span className="text-rule-strong" aria-hidden="true">
              ·
            </span>
            <a
              href={CONTACT_INFO.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink font-sans font-medium underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest rounded-control outline-none py-0.5"
            >
              WhatsApp
            </a>
            <span className="text-rule-strong" aria-hidden="true">
              ·
            </span>
            <a
              href={CONTACT_INFO.github.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink font-sans font-medium underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest rounded-control outline-none py-0.5"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
