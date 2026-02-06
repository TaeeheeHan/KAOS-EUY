'use client';

import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { CartIndicator } from '@/components/cart/CartIndicator';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: '/products', label: t('nav.catalog') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-accent text-3xl text-primary">{t('brand.name')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-secondary hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart, Language & Mobile Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Order Lookup - Desktop */}
            <Link
              href="/order-lookup"
              className="hidden md:flex items-center gap-1 text-secondary hover:text-primary transition-colors"
              title={t('nav.orderLookup') || 'Order Lookup'}
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Language Switcher - Desktop */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Cart Indicator */}
            <CartIndicator />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-secondary" />
              ) : (
                <Menu className="w-6 h-6 text-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block font-body text-secondary hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Order Lookup - Mobile */}
            <Link
              href="/order-lookup"
              className="flex items-center gap-2 font-body text-secondary hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="w-4 h-4" />
              {t('nav.orderLookup') || 'Order Lookup'}
            </Link>
            {/* Language Switcher - Mobile */}
            <div className="pt-2 border-t border-gray-200">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
