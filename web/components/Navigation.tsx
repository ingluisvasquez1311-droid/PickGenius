'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Inicio', icon: '🏠' },
        { href: '/basketball-live', label: 'Baloncesto', icon: '🏀' },
        { href: '/football-live', label: 'Fútbol', icon: '⚽' },
    ];

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">📊</span>
                        <span className="text-xl font-bold text-white">PickGenius Live</span>
                    </div>

                    <div className="flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }
                  `}
                                >
                                    <span>{link.icon}</span>
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
