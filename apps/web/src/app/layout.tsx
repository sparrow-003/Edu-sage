import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'EduSage AI Platform',
    description: 'A comprehensive AI-powered educational platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}