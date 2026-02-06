'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getProducts } from '@/lib/mock-data';
import { fadeInUp } from '@/lib/animations';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [products] = useState<Product[]>(getProducts());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            {t('products.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('products.subtitle')}
          </p>
        </motion.div>

        {/* Products Grid */}
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
