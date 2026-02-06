'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Users, Tag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { CartItem } from '@/components/cart/CartItem';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { formatIDR } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import { useLanguage } from '@/contexts/LanguageContext';

type OrderType = 'personal' | 'bulk';

// Bulk order discount tiers
const BULK_DISCOUNTS = [
  { minQty: 10, discount: 0.1, label: '10-24 pcs: 10% off' },
  { minQty: 25, discount: 0.15, label: '25-49 pcs: 15% off' },
  { minQty: 50, discount: 0.2, label: '50-99 pcs: 20% off' },
  { minQty: 100, discount: 0.3, label: '100+ pcs: 30% off' },
];

function getBulkDiscount(totalQuantity: number): number {
  for (let i = BULK_DISCOUNTS.length - 1; i >= 0; i--) {
    if (totalQuantity >= BULK_DISCOUNTS[i].minQty) {
      return BULK_DISCOUNTS[i].discount;
    }
  }
  return 0;
}

export default function CartPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(items.map((_, index) => index.toString()))
  );
  const [orderType, setOrderType] = useState<OrderType>('personal');

  // Calculate subtotal only for selected items
  const { subtotal, totalQuantity } = useMemo(() => {
    let total = 0;
    let qty = 0;
    items.forEach((item, index) => {
      if (selectedItems.has(index.toString())) {
        total += item.product.price * item.quantity;
        qty += item.quantity;
      }
    });
    return { subtotal: total, totalQuantity: qty };
  }, [items, selectedItems]);

  // Calculate bulk discount
  const bulkDiscountRate = orderType === 'bulk' ? getBulkDiscount(totalQuantity) : 0;
  const discountAmount = Math.round(subtotal * bulkDiscountRate);
  const shippingCost = 0; // Free shipping
  const grandTotal = subtotal - discountAmount + shippingCost;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map((_, index) => index.toString())));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (index: number, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(index.toString());
    } else {
      newSelected.delete(index.toString());
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;

    if (confirm(t('cart.confirmDelete'))) {
      Array.from(selectedItems)
        .reverse()
        .forEach((indexStr) => {
          const index = parseInt(indexStr, 10);
          const item = items[index];
          removeItem(item.product.id, item.size, item.color);
        });
      setSelectedItems(new Set());
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) return;

    // Store order type in session storage
    sessionStorage.setItem('orderType', orderType);
    sessionStorage.setItem('bulkDiscount', bulkDiscountRate.toString());

    router.push(orderType === 'bulk' ? '/checkout?type=bulk' : '/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('cart.continueShopping')}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t('cart.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            Total {items.length} item(s)
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="font-medium text-gray-900">
                  {t('cart.selectAll')} ({selectedItems.size}/{items.length})
                </span>
              </label>

              <button
                onClick={handleDeleteSelected}
                disabled={selectedItems.size === 0}
                className="text-sm text-gray-600 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('cart.deleteSelected')}
              </button>
            </div>

            {/* Items */}
            {items.map((item, index) => (
              <CartItem
                key={`${item.product.id}-${item.size}-${item.color.code}`}
                item={item}
                selected={selectedItems.has(index.toString())}
                onSelect={(selected) => handleSelectItem(index, selected)}
                onUpdateQuantity={(quantity) =>
                  updateQuantity(
                    item.product.id,
                    item.size,
                    item.color,
                    quantity
                  )
                }
                onRemove={() =>
                  removeItem(item.product.id, item.size, item.color)
                }
              />
            ))}
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="sticky top-4 bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                {t('cart.orderSummary')}
              </h2>

              <Separator />

              {/* Order Type Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Order Type</h3>

                {/* Personal Order */}
                <button
                  onClick={() => setOrderType('personal')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    orderType === 'personal'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      orderType === 'personal' ? 'bg-primary/20' : 'bg-gray-100'
                    }`}>
                      <User className={`w-5 h-5 ${orderType === 'personal' ? 'text-primary' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Personal Order</p>
                      <p className="text-xs text-gray-500">1-9 pieces, standard price</p>
                    </div>
                    {orderType === 'personal' && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* Bulk Order */}
                <button
                  onClick={() => setOrderType('bulk')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    orderType === 'bulk'
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      orderType === 'bulk' ? 'bg-accent/20' : 'bg-gray-100'
                    }`}>
                      <Users className={`w-5 h-5 ${orderType === 'bulk' ? 'text-accent' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Bulk Order</p>
                      <p className="text-xs text-gray-500">10+ pieces, up to 30% off!</p>
                    </div>
                    {orderType === 'bulk' && (
                      <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Bulk Discount Info */}
              <AnimatePresence>
                {orderType === 'bulk' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-accent font-semibold">
                        <Tag className="w-4 h-4" />
                        Bulk Discount Tiers
                      </div>
                      <div className="text-xs space-y-1">
                        {BULK_DISCOUNTS.map((tier, i) => (
                          <div
                            key={i}
                            className={`flex justify-between ${
                              totalQuantity >= tier.minQty &&
                              (i === BULK_DISCOUNTS.length - 1 || totalQuantity < BULK_DISCOUNTS[i + 1].minQty)
                                ? 'text-accent font-semibold'
                                : 'text-gray-600'
                            }`}
                          >
                            <span>{tier.label}</span>
                            {totalQuantity >= tier.minQty &&
                              (i === BULK_DISCOUNTS.length - 1 || totalQuantity < BULK_DISCOUNTS[i + 1].minQty) && (
                              <span>✓ Applied</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 pt-2">
                        Current: {totalQuantity} pcs → {bulkDiscountRate > 0 ? `${bulkDiscountRate * 100}% discount` : 'Add more for discount'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Separator />

              {/* Summary Rows */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.subtotal')} ({totalQuantity} pcs)</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>

                {orderType === 'bulk' && discountAmount > 0 && (
                  <div className="flex justify-between text-accent font-medium">
                    <span>Bulk Discount ({bulkDiscountRate * 100}%)</span>
                    <span>-{formatIDR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.shipping')}</span>
                  <span>
                    {shippingCost === 0 ? t('cart.free') : formatIDR(shippingCost)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {t('cart.total')}
                </span>
                <div className="text-right">
                  {discountAmount > 0 && (
                    <span className="text-sm text-gray-400 line-through block">
                      {formatIDR(subtotal)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-primary">
                    {formatIDR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Savings Badge */}
              {orderType === 'bulk' && discountAmount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <span className="text-green-700 font-semibold">
                    🎉 You save {formatIDR(discountAmount)}!
                  </span>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={selectedItems.size === 0}
                onClick={handleCheckout}
                rightIcon={ChevronRight}
              >
                {t('cart.checkout')} ({formatIDR(grandTotal)})
              </Button>

              {/* Continue Shopping */}
              <Link href="/products">
                <Button variant="ghost" size="md" fullWidth>
                  {t('cart.continueShopping')}
                </Button>
              </Link>

              {/* Info */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="mb-2">💳 {t('cart.securePayment')}</p>
                <p className="mb-2">🚚 {t('cart.freeShipping')}</p>
                <p>📦 {t('cart.productionTime')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
