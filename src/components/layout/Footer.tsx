'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-accent text-2xl text-primary mb-4">{t('brand.name')}</h3>
            <p className="font-body text-sm text-gray-300">
              {t('brand.tagline')}
            </p>
            <p className="font-body text-sm text-gray-300 mt-2">
              {t('footer.brandDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.links.catalog')}
                </Link>
              </li>
              <li>
                <Link href="/order-lookup" className="text-gray-300 hover:text-primary transition-colors">
                  {t('nav.orderLookup') || 'Order Lookup'}
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.links.sizeGuide')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.links.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-display font-bold mb-4">{t('footer.information')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.links.contact')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.links.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-display font-bold mb-4">{t('footer.followUs')}</h4>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-300">WhatsApp: +62 812-3456-7890</p>
              <p className="text-sm text-gray-300">Email: hello@kaoseuy.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t('brand.name')} - {t('footer.copyright')}
          </p>
          {/* Hidden admin link */}
          <Link
            href="/admin/login"
            className="text-xs text-gray-600 hover:text-gray-400 mt-2 inline-block"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
