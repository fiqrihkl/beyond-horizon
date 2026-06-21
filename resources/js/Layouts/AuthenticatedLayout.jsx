import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DarkModeToggle from '@/Components/DarkModeToggle';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 font-sans">
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                                    BH
                                </div>
                                <span className="text-xl font-bold text-navy dark:text-white tracking-tight hidden sm:block">
                                    BEYOND <span className="text-primary">HORIZON</span>
                                </span>
                            </Link>

                            <div className="hidden space-x-6 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="text-slate hover:text-primary dark:text-slate-light font-medium"
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('invitations.index')}
                                    active={route().current('invitations.index')}
                                    className="text-slate hover:text-primary dark:text-slate-light font-medium"
                                >
                                    Undangan Saya
                                </NavLink>
                                {user.role === 'admin' && (
                                    <NavLink
                                        href={route('admin.dashboard')}
                                        active={route().current('admin.dashboard')}
                                        className="text-slate hover:text-primary dark:text-slate-light font-medium"
                                    >
                                        Admin Panel
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <DarkModeToggle />
                            
                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                                        >
                                            {user.name}
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profil Saya</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Keluar</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown((p) => !p)}
                                    className="p-2 text-slate hover:bg-slate-100 rounded-lg dark:text-slate-light dark:hover:bg-slate-800"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} d="M4 6h16M4 12h16M4 18h16" />
                                        <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('invitations.index')} active={route().current('invitations.index')}>Undangan Saya</ResponsiveNavLink>
                    </div>
                    <div className="border-t border-slate-100 pb-1 pt-4 dark:border-slate-800">
                        <div className="px-4">
                            <div className="font-bold text-navy dark:text-white">{user.name}</div>
                            <div className="text-sm text-slate dark:text-slate-light">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profil Saya</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Keluar</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="pb-12">{children}</main>
        </div>
    );
}
