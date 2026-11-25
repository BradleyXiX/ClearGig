import React from "react";
import Link from "next/link";
import { BrandMark } from "../ui/BrandMark";
import { CONTACT_INFO } from "@/lib/contact";

export function ShowcaseFooter() {
  return (
    <footer className="w-full bg-dark-canvas text-on-dark border-t border-rule-strong no-print py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        {/* Contact / Enquiries Section */}
        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="border-b border-rule-strong/60 pb-12 sm:pb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Invitation column */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-on-dark-muted block">
                GET IN TOUCH
              </span>
              <h2
                id="contact-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-sans font-semibold tracking-tight text-on-dark leading-tight"
              >
                Have a project in mind?
              </h2>
              <p className="text-base text-on-dark-muted leading-relaxed max-w-xl">
                Questions about ClearGig or interested in an implementation for your business? Get in touch with Bradley.
              </p>
              <p className="text-xs font-mono text-on-dark-muted pt-1">
                Email opens your mail app. WhatsApp opens a conversation—you send the message.
              </p>
            </div>

            {/* Actions & selectable contact details column */}
            <div className="lg:col-span-6 flex flex-col items-start gap-4 pt-1 sm:pt-2">
              {/* Primary action: Email */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
                <a
                  href={CONTACT_INFO.email.href}
                  className="inline-flex items-center justify-center font-sans font-medium rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-dark focus-visible:ring-offset-2 focus-visible:ring-offset-dark-canvas px-6 py-3 min-h-[44px] text-sm bg-paper text-ink hover:bg-paper-raised active:bg-paper-sunken shadow-sm"
                >
                  Email Bradley
                </a>
                <span className="text-sm font-mono text-on-dark-muted select-all break-all">
                  {CONTACT_INFO.email.display}
                </span>
              </div>

              {/* Secondary actions & direct details */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2 text-sm text-on-dark-muted">
                {/* WhatsApp */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={CONTACT_INFO.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1 font-medium inline-flex items-center gap-1.5"
                    aria-label="Chat on WhatsApp (opens in new tab)"
                  >
                    <span>Chat on WhatsApp</span>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                  <span className="text-xs font-mono text-on-dark-muted select-all">
                    ({CONTACT_INFO.whatsapp.display})
                  </span>
                </div>

                <span className="hidden sm:inline text-rule-strong" aria-hidden="true">
                  ·
                </span>

                {/* GitHub */}
                <div className="flex items-center gap-2">
                  <a
                    href={CONTACT_INFO.github.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1 font-medium inline-flex items-center gap-1.5"
                    aria-label={`GitHub profile ${CONTACT_INFO.github.handle} (opens in new tab)`}
                  >
                    <span>GitHub · {CONTACT_INFO.github.handle}</span>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Existing Brand & Navigation row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Light wordmark and core phrase */}
          <div className="space-y-2">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-on-dark hover:text-focus-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark focus-visible:ring-offset-2 rounded-control outline-none py-1"
              aria-label="ClearGig home"
            >
              <BrandMark size={20} className="text-on-dark" />
              <span>ClearGig</span>
            </Link>
            <p className="text-sm font-mono text-on-dark-muted">
              Clarity before commitment.
            </p>
          </div>

          {/* Genuine application and showcase links */}
          <nav
            className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm font-medium text-on-dark-muted"
            aria-label="Showcase footer navigation"
          >
            <Link
              href="/"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              New estimate
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              Workspace
            </Link>
            <a
              href="#approach"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              The approach
            </a>
            <a
              href="#workspace"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              Inside ClearGig
            </a>
          </nav>
        </div>

        {/* Bottom copyright and public preview disclosure */}
        <div className="border-t border-rule-strong/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-on-dark-muted">
          <div>© 2026 ClearGig. All rights reserved.</div>
          <div>Workflow preview · No pricing shown.</div>
        </div>
      </div>
    </footer>
  );
}
