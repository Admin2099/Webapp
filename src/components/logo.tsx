import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" prefetch={false}>
      <div className="relative size-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gradient-orange to-gradient-pink blur-[2px]"></div>
        <div className="relative size-8 rounded-full bg-gradient-to-br from-gradient-orange to-gradient-pink flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-card">
                <path d="M7 14.5C9 10.5 11.5 10.5 13.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 9.5C12.5 13.5 15 13.5 17 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      </div>
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gradient-orange to-gradient-pink">
        DataLeap
      </span>
    </Link>
  );
}
