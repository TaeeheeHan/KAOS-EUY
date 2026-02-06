'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Palette, ChevronRight, X, Users, User, Package, Plus, Minus, Trash2 } from 'lucide-react';
import type { ProductColor, Size } from '@/types';
import { getProductBySlug } from '@/lib/mock-data';
import { useCartStore } from '@/stores/cart';
import { useCustomDesignStore } from '@/stores/customDesign';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Separator } from '@/components/common/Separator';
import { ColorSelector } from '@/components/products/ColorSelector';
import { CustomVisualizer } from '@/components/custom/CustomVisualizer';
import { PositionSelector } from '@/components/custom/PositionSelector';
import { DesignUploader } from '@/components/custom/DesignUploader';
import { formatIDR } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

interface VariantQuantity {
  size: Size;
  color: ProductColor;
  quantity: number;
}

type ViewMode = 'product' | 'customize';
type OrderType = 'personal' | 'bulk' | null;

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const [viewMode, setViewMode] = useState<ViewMode>('product');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [customStep, setCustomStep] = useState(1);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);

  // Multi-variant quantity state
  const [variants, setVariants] = useState<VariantQuantity[]>([]);

  const addItem = useCartStore((state) => state.addItem);
  const { getCustomPrice, resetAll, getAppliedParts } = useCustomDesignStore();

  const customPrice = getCustomPrice();
  const appliedParts = getAppliedParts();

  // Calculate totals
  const { totalQuantity, subtotal } = useMemo(() => {
    let qty = 0;
    let total = 0;
    variants.forEach(v => {
      qty += v.quantity;
      total += (product.price + customPrice) * v.quantity;
    });
    return { totalQuantity: qty, subtotal: total };
  }, [variants, product.price, customPrice]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);

  // Get variant key
  const getVariantKey = (size: Size, color: ProductColor) => `${size}-${color.code}`;

  // Get quantity for a specific variant
  const getVariantQuantity = (size: Size, color: ProductColor) => {
    const variant = variants.find(v => v.size === size && v.color.code === color.code);
    return variant?.quantity || 0;
  };

  // Update variant quantity
  const updateVariantQuantity = (size: Size, color: ProductColor, delta: number) => {
    setVariants(prev => {
      const existingIndex = prev.findIndex(v => v.size === size && v.color.code === color.code);

      if (existingIndex >= 0) {
        const newQuantity = Math.max(0, prev[existingIndex].quantity + delta);
        if (newQuantity === 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }
        return prev.map((v, i) =>
          i === existingIndex ? { ...v, quantity: newQuantity } : v
        );
      } else if (delta > 0) {
        return [...prev, { size, color, quantity: delta }];
      }
      return prev;
    });
  };

  // Set exact quantity for variant
  const setVariantQuantity = (size: Size, color: ProductColor, quantity: number) => {
    setVariants(prev => {
      const existingIndex = prev.findIndex(v => v.size === size && v.color.code === color.code);

      if (quantity <= 0) {
        if (existingIndex >= 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }
        return prev;
      }

      if (existingIndex >= 0) {
        return prev.map((v, i) =>
          i === existingIndex ? { ...v, quantity } : v
        );
      }
      return [...prev, { size, color, quantity }];
    });
  };

  // Remove variant
  const removeVariant = (size: Size, color: ProductColor) => {
    setVariants(prev => prev.filter(v => !(v.size === size && v.color.code === color.code)));
  };

  const handleProceedToCheckout = () => {
    if (variants.length === 0) {
      alert('Please select at least one size and quantity');
      return;
    }

    // Show order type modal for customized products
    if (viewMode === 'customize') {
      setShowOrderTypeModal(true);
    } else {
      // Regular product - add all variants to cart
      variants.forEach(v => {
        addItem(product, v.size, v.color, v.quantity);
      });
      router.push('/cart');
    }
  };

  const handleSelectOrderType = (orderType: OrderType) => {
    if (variants.length === 0 || !orderType) return;

    // Add all items to cart
    variants.forEach(v => {
      addItem(product, v.size, v.color, v.quantity);
    });

    // Store custom design info in session storage for checkout
    if (viewMode === 'customize') {
      sessionStorage.setItem('customOrder', JSON.stringify({
        orderType,
        productId: product.id,
        productName: product.name,
        variants,
        customPrice,
        appliedParts,
      }));
      resetAll();
    }

    setShowOrderTypeModal(false);

    // Navigate to checkout
    if (orderType === 'bulk') {
      router.push('/checkout?type=bulk');
    } else {
      router.push('/checkout');
    }
  };

  const handleAddToCart = () => {
    if (variants.length === 0) {
      alert('Please select at least one size and quantity');
      return;
    }

    variants.forEach(v => {
      addItem(product, v.size, v.color, v.quantity);
    });

    if (viewMode === 'customize') {
      resetAll();
    }

    setVariants([]);
    alert(`${totalQuantity} items added to cart!`);
  };

  const handleStartCustomize = () => {
    setViewMode('customize');
    setCustomStep(1);
  };

  const handleBackToProduct = () => {
    setViewMode('product');
    setCustomStep(1);
  };

  // Variant Selection Component
  const VariantSelector = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Select Size & Quantity</h3>
        {variants.length > 0 && (
          <span className="text-sm text-primary font-medium">
            {totalQuantity} items selected
          </span>
        )}
      </div>

      {/* Size/Quantity Grid for current color */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: selectedColor.code }}
          />
          <span className="text-sm font-medium text-gray-700">{selectedColor.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {product.sizes.map((size) => {
            const qty = getVariantQuantity(size, selectedColor);
            return (
              <div
                key={size}
                className={`border rounded-lg p-3 transition-all ${
                  qty > 0 ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-2">
                  <span className="font-semibold text-gray-900">{size}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateVariantQuantity(size, selectedColor, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={(e) => setVariantQuantity(size, selectedColor, parseInt(e.target.value) || 0)}
                    className="w-12 h-8 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={() => updateVariantQuantity(size, selectedColor, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Variants Summary */}
      {variants.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm">Selected Items</h4>
          </div>
          <div className="divide-y divide-gray-100">
            {variants.map((v) => (
              <div
                key={getVariantKey(v.size, v.color)}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: v.color.code }}
                  />
                  <span className="text-sm text-gray-700">
                    {v.color.name} / {v.size}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    x{v.quantity}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatIDR((product.price + customPrice) * v.quantity)}
                  </span>
                  <button
                    onClick={() => removeVariant(v.size, v.color)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total ({totalQuantity} pcs)</span>
            <span className="text-lg font-bold text-primary">{formatIDR(subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-primary">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
          {viewMode === 'customize' && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary">Customize</span>
            </>
          )}
        </div>

        {viewMode === 'product' ? (
          /* Standard Product View */
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square w-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? 'border-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right: Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  {product.in_stock ? (
                    <Badge variant="success" dot>{t('products.inStock')}</Badge>
                  ) : (
                    <Badge variant="danger" dot>{t('products.outOfStock')}</Badge>
                  )}
                  {product.is_customizable && (
                    <Badge variant="primary">{t('products.customizable')}</Badge>
                  )}
                </div>
              </div>

              <div className="py-4 border-y border-gray-200">
                <div className="text-4xl font-bold text-primary">
                  {formatIDR(product.price)}
                  <span className="text-base font-normal text-gray-500 ml-2">/ piece</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{product.description}</p>

              <ColorSelector
                colors={product.colors}
                selected={selectedColor}
                onChange={setSelectedColor}
              />

              <VariantSelector />

              <div className="space-y-3 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || variants.length === 0}
                  leftIcon={ShoppingCart}
                >
                  {variants.length > 0
                    ? `Add ${totalQuantity} items to Cart - ${formatIDR(subtotal)}`
                    : t('products.addToCart')
                  }
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="md" leftIcon={Heart}>
                    {t('products.addToWishlist')}
                  </Button>
                  <Button variant="outline" size="md" leftIcon={Share2}>
                    {t('products.share')}
                  </Button>
                </div>
              </div>

              {/* Customization CTA */}
              {product.is_customizable && (
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Palette className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {t('products.customizeProduct')}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add your own design to front, back, or sleeves. Make it unique!
                      </p>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleStartCustomize}
                        rightIcon={ChevronRight}
                      >
                        Start Customizing
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Customize View */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Visualizer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="sticky top-24">
                <CustomVisualizer
                  baseColor={selectedColor.code}
                  productImage={product.images[0]}
                />
              </div>
            </motion.div>

            {/* Right: Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-gray-500">Customize your design</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBackToProduct}>
                  Back to Product
                </Button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => setCustomStep(step)}
                    className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition-all ${
                      customStep === step
                        ? 'bg-primary text-white'
                        : customStep > step
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {step === 1 && 'Options'}
                    {step === 2 && 'Position'}
                    {step === 3 && 'Design'}
                  </button>
                ))}
              </div>

              <Separator />

              {/* Step Content */}
              <div className="min-h-[300px]">
                {customStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <ColorSelector
                      colors={product.colors}
                      selected={selectedColor}
                      onChange={setSelectedColor}
                    />
                    <VariantSelector />
                  </motion.div>
                )}

                {customStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <PositionSelector />
                  </motion.div>
                )}

                {customStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <DesignUploader />
                  </motion.div>
                )}
              </div>

              <Separator />

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Base Price</span>
                  <span>{formatIDR(product.price)} / pc</span>
                </div>
                {customPrice > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Custom ({appliedParts.length} position{appliedParts.length > 1 ? 's' : ''})</span>
                    <span>+{formatIDR(customPrice)} / pc</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total ({totalQuantity} pcs)</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatIDR(subtotal)}
                  </span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {customStep > 1 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCustomStep(customStep - 1)}
                  >
                    Back
                  </Button>
                )}
                {customStep < 3 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setCustomStep(customStep + 1)}
                    disabled={customStep === 1 && variants.length === 0}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleProceedToCheckout}
                    disabled={variants.length === 0}
                    leftIcon={ShoppingCart}
                  >
                    Proceed to Checkout - {formatIDR(subtotal)}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Order Type Selection Modal */}
      <AnimatePresence>
        {showOrderTypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowOrderTypeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Select Order Type</h2>
                  <p className="text-sm text-gray-500">Choose how you want to order</p>
                </div>
                <button
                  onClick={() => setShowOrderTypeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Personal Order Option */}
                <button
                  onClick={() => handleSelectOrderType('personal')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Personal Order</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        For individual orders (1-9 pieces)
                      </p>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Standard pricing applies</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </button>

                {/* Bulk Order Option */}
                <button
                  onClick={() => handleSelectOrderType('bulk')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-accent hover:bg-accent/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Users className="w-7 h-7 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Bulk Order</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        For large orders (10+ pieces) - Special pricing!
                      </p>
                      <div className="flex items-center gap-2 text-accent">
                        <span className="text-sm font-medium">Up to 30% discount for bulk orders</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                  </div>
                </button>

                {/* Info */}
                <p className="text-xs text-gray-500 text-center pt-2">
                  You can change your order type later in the checkout process
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
