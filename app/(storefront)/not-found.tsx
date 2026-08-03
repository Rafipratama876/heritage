import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-content min-h-[70vh] flex flex-col items-center justify-center text-center pt-24">
      <p className="eyebrow mb-4">404</p>
      <h1 className="font-display text-4xl sm:text-5xl text-ivory">
        This page wasn&apos;t found.
      </h1>
      <p className="text-muted mt-4 max-w-md">
        The page you&apos;re looking for may have been moved or no longer exists.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}
