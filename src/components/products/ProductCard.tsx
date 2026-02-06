'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { Badge } from '@/components/common/Badge';
import { formatIDR } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({
  product,
}: ProductCardProps) {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <Link href={`/products/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={
                product.images[currentImageIndex] || product.images[0]
              }
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_customizable && (
                <Badge variant="primary" size="sm">
                  Customizable
                </Badge>
              )}
              {!product.in_stock && (
                <Badge variant="danger" size="sm">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600'
                }`}
              />
            </button>

            {/* Out of stock overlay */}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {t('products.soldOut')}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-3">
            <span className="text-xl font-bold text-primary">
              {formatIDR(product.price)}
            </span>
          </div>

          {/* Color options preview */}
          <div className="flex items-center gap-2 mb-4">
            {product.colors.slice(0, 5).map((color, index) => (
              <button
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-primary transition-colors"
                style={{ backgroundColor: color.code }}
                title={color.name}
                onMouseEnter={() => setCurrentImageIndex(index % product.images.length)}
                onMouseLeave={() => setCurrentImageIndex(0)}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-gray-500">
                +{product.colors.length - 5}
              </span>
            )}
          </div>

          {/* View Details Button */}
          {product.in_stock ? (
            <Link
              href={`/products/${product.slug}`}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              {t('products.viewDetails') || 'View Details'}
            </Link>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-lg font-medium cursor-not-allowed"
            >
              {t('products.outOfStock')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
