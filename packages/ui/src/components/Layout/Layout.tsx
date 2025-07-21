import React from 'react';

export interface LayoutProps {
    /**
     * Layout contents
     */
    children: React.ReactNode;
    /**
     * Header component
     */
    header?: React.ReactNode;
    /**
     * Footer component
     */
    footer?: React.ReactNode;
    /**
     * Sidebar component
     */
    sidebar?: React.ReactNode;
    /**
     * Sidebar width
     */
    sidebarWidth?: string;
    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * Layout component for page structure
 */
export const Layout = ({
    children,
    header,
    footer,
    sidebar,
    sidebarWidth = '250px',
    className = '',
    ...props
}: LayoutProps) => {
    return (
        <div className={`min-h-screen flex flex-col ${className}`} {...props}>
            {header && (
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                    {header}
                </header>
            )}

            <div className="flex flex-1">
                {sidebar && (
                    <aside
                        className="border-r border-gray-200 bg-gray-50"
                        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
                    >
                        {sidebar}
                    </aside>
                )}

                <main className="flex-1">
                    {children}
                </main>
            </div>

            {footer && (
                <footer className="bg-white border-t border-gray-200">
                    {footer}
                </footer>
            )}
        </div>
    );
};

export default Layout;