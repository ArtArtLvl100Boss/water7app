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
    return (
        <html
            lang='en'
            suppressHydrationWarning>
            <head>
                <link
                    rel='shortcut icon'
                    href='https://scontent.fcgy1-1.fna.fbcdn.net/v/t1.15752-9/387589500_871139797865809_2005712015906634352_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=106&ccb=1-7&_nc_sid=b70caf&_nc_eui2=AeEldwPm6dDudT8eKSA2iqxfkPtXwxKmu-KQ-1fDEqa74qH2Q8aJaNrYOYfm_fe8zihoy6nZHHoEij3-XqkjDrXo&_nc_ohc=uXMr_PNGGBoQ7kNvgHjlfFz&_nc_oc=AdhrwsUe5BqlX_5mh429nIoUUgRA-Sg5rKR75nB5Gp_fvJeESPwApA-AtbbxRzXdvY8&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&oh=03_Q7cD1wE8xJqHoe___Ppljg8ZPTEod6-J6wWgMm42fLL-z57MEQ&oe=67FF4982'
                    className='size-full object-cover'
                />
            </head>
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
                                            src='https://scontent.fcgy1-1.fna.fbcdn.net/v/t1.15752-9/387589500_871139797865809_2005712015906634352_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=106&ccb=1-7&_nc_sid=b70caf&_nc_eui2=AeEldwPm6dDudT8eKSA2iqxfkPtXwxKmu-KQ-1fDEqa74qH2Q8aJaNrYOYfm_fe8zihoy6nZHHoEij3-XqkjDrXo&_nc_ohc=uXMr_PNGGBoQ7kNvgHjlfFz&_nc_oc=AdhrwsUe5BqlX_5mh429nIoUUgRA-Sg5rKR75nB5Gp_fvJeESPwApA-AtbbxRzXdvY8&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&oh=03_Q7cD1wE8xJqHoe___Ppljg8ZPTEod6-J6wWgMm42fLL-z57MEQ&oe=67FF4982'
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
