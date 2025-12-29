'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#050505] border-t border-[#1a1a1a] py-12 text-sm text-[var(--text-muted)]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                PickGenius
                            </span>
                        </Link>
                        <p className="max-w-xs mb-4">
                            La plataforma de análisis deportivo más avanzada, impulsada por Inteligencia Artificial para darte ventaja en cada jugada.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <a href="#" className="hover:text-white transition-colors">Twitter (X)</a>
                            <a href="#" className="hover:text-white transition-colors">Instagram</a>
                            <a href="#" className="hover:text-white transition-colors">Discord</a>
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Plataforma</h4>
                        <ul className="space-y-2">
                            <li><Link href="/football-live" className="hover:text-[var(--primary)] transition-colors">Fútbol en Vivo</Link></li>
                            <li><Link href="/basketball-live" className="hover:text-[var(--primary)] transition-colors">Baloncesto en Vivo</Link></li>
                            <li><Link href="/pricing" className="hover:text-[var(--primary)] transition-colors">Planes Premium</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/terms" className="hover:text-[var(--primary)] transition-colors">Términos de Servicio</Link></li>
                            <li><Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">Política de Privacidad</Link></li>
                            <li><Link href="/contact" className="hover:text-[var(--primary)] transition-colors">Contacto</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#1a1a1a] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} PickGenius AI. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs">Sistemas Operativos</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
