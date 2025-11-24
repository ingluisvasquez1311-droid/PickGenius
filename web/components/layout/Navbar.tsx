import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="glass-card fixed top-4 left-0 right-0 mx-auto w-[95%] max-w-6xl z-50 px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter">
                Tirens<span className="text-[var(--primary)]">Parleys</span>
            </Link>

            <div className="flex gap-6 text-sm font-medium">
                <Link href="/nba" className="hover:text-[var(--primary)] transition-colors">
                    🏀 NBA
                </Link>
                <Link href="/football" className="hover:text-[var(--primary)] transition-colors">
                    ⚽ Fútbol
                </Link>
            </div>

            <div className="hidden md:block text-xs text-[var(--text-muted)]">
                v2.0 Beta
            </div>
        </nav>
    );
}
