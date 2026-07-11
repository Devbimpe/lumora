"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <Image
        src="/lumora.png"
        alt="Lumora"
        width={140}
        height={40}
        priority
      />

      <h1 className="mt-8 text-2xl sm:text-3xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-base sm:text-lg text-muted-foreground">
        We hit an unexpected error. Try again, or head back to the homepage.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm sm:text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>

        <Link
          href="/landingpage"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm sm:text-base font-medium text-foreground transition-colors hover:bg-muted"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}