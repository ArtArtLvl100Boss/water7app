import type React from 'react';
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Water 7 Report Generator',
    description: 'Calculate business earnings from water and soap sales',
    generator: 'v0.dev',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const water7img = '/water7.jpg';

    return (
        <html
            lang='en'
            suppressHydrationWarning>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    inter.className
                )}>
                <ThemeProvider
                    attribute='class'
                    defaultTheme='dark'
                    enableSystem={false}
                    disableTransitionOnChange>
                    <div className='relative flex min-h-screen flex-col'>
                        <header className='sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                            <div className='container flex h-14 max-w-screen-2xl items-center'>
                                <div className='flex items-center gap-2'>
                                    <div className='size-10 overflow-hidden rounded-md border'>
                                        <img
                                            src={water7img}
                                            className='size-full object-cover'
                                        />
                                    </div>
                                    <div className='mr-4 flex'>
                                        <div className='font-bold'>Water 7</div>
                                    </div>
                                </div>
                                <div className='flex flex-1 items-center justify-end'>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </header>
                        <div className='flex-1'>{children}</div>
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}

import './globals.css';
