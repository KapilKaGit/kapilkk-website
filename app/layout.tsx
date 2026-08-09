import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
export const metadata: Metadata = { title: 'Kapil Archive', description: 'A personal archive of projects, tools, notes, images, experiments, and resources.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className="min-h-screen antialiased"><Nav/><main>{children}</main><footer className="mx-auto max-w-7xl px-4 py-10 text-center text-sm text-archive-muted">Kapil Archive — personal knowledge base, image library, and toolbox.</footer></body></html>}
