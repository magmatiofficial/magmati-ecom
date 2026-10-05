import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
        404 ERROR
      </span>
      <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-950 mb-3">
        Page Not Found
      </h1>
      <p className="text-xs text-zinc-500 max-w-sm mb-6">
        The garment or page you are looking for does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
