import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Page Not Found | Lumora",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <Image
        src="/lumora.png"
        alt="Lumora"
        width={140}
        height={40}
        priority
      />

      <p className="mt-8 text-7xl sm:text-8xl font-extrabold tracking-tight text-green-600">
        404
      </p>

      <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-foreground">
        We couldn't find that page
      </h1>
      <p className="mt-3 max-w-md text-base sm:text-lg text-muted-foreground">
        The link may be broken, or the page may have been moved.
        Let's get you back on track.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-sm sm:text-base font-medium text-white transition-colors hover:bg-green-700"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}