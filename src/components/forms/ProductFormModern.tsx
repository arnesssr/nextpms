'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Box,
  Hash,
  Type,
  AlignLeft,
  Folder,
  BarChart3,
  Camera,
  Plus,
  Loader2,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '@/types/products';
import { useCategories } from '@/app/categories/category-modules/category-management/hooks/useCategories';
import { ProductService } from '@/services/products';
import { useMediaUpload } from '@/app/products/product-modules/media-management/hooks/useMediaUpload';

// Enhanced form schema with better validation
const productSchema = z.object({
  name: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name is too long'),
  description: z.string()
    .min(20, 'Please provide a more detailed description (at least 20 characters)'),
  base_price: z.number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price is too high'),
  selling_price: z.number()
    .min(0.01, 'Price must be greater than 0'),
  category_id: z.string().min(1, 'Please select a category'),
  sku: z.string().optional(),
  stock_quantity: z.number()
    .min(0, 'Stock cannot be negative')
    .max(999999, 'Stock quantity is too high'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModernProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess?: (product: Product) => void;
}

// Tab sections for better organization
const TAB_SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: FileText },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'media', label: 'Media', icon: Camera },
];

export function ProductFormModern({ product, onClose, onSuccess }: ProductFormModernProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(product?.id || null);
  const [formProgress, setFormProgress] = useState(0);

  const { categories, loading: categoriesLoading } = useCategories();
  const {
    media,
    uploading,
    uploadMedia,
    deleteMedia,
    setPrimaryImage
  } = useMediaUpload(currentProductId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      base_price: product?.base_price || 0,
      selling_price: product?.selling_price || 0,
      category_id: product?.category_id || '',
      sku: product?.sku || '',
      stock_quantity: product?.stock_quantity || 0,
      status: product?.status || 'draft',
    }
  });

  const watchedValues = watch();

  // Calculate form completion progress
  useEffect(() => {
    const fields = ['name', 'description', 'base_price', 'selling_price', 'category_id', 'stock_quantity'];
    const filledFields = fields.filter(field => {
      const value = watchedValues[field as keyof ProductFormData];
      return value !== '' && value !== 0 && value !== null && value !== undefined;
    });
    setFormProgress((filledFields.length / fields.length) * 100);
  }, [watchedValues]);

  // Auto-generate SKU
  useEffect(() => {
    if (!product && watchedValues.name && !watchedValues.sku) {
      const sku = watchedValues.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8) + '-' + Date.now().toString(36).toUpperCase();
      setValue('sku', sku);
    }
  }, [watchedValues.name, watchedValues.sku, product, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      const productData = {
        ...data,
        is_active: true,
        is_featured: false,
        is_digital: false,
        track_inventory: true,
        requires_shipping: true,
        min_stock_level: 0,
        discount_percentage: 0,
        tax_rate: 0,
      };

      let result;
      if (product?.id) {
        result = await ProductService.updateProduct(product.id, productData);
      } else {
        result = await ProductService.createProduct(productData);
      }

      if (result.success && result.data) {
        if (!product?.id) {
          setCurrentProductId(result.data.id);
        }
        
        toast.success(
          product?.id ? 'Product updated successfully!' : 'Product created successfully!',
          {
            description: 'Your changes have been saved.',
            icon: <Check className="h-4 w-4" />,
          }
        );
        
        onSuccess?.(result.data);
        
        if (product?.id) {
          onClose();
        }
      } else {
        throw new Error(result.error || 'Failed to save product');
      }
    } catch (error) {
      toast.error('Failed to save product', {
        description: 'Please check your inputs and try again.',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (files: FileList | File[]) => {
    if (!currentProductId) {
      toast.error('Please save the product first before uploading images');
      return;
    }

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      try {
        await uploadMedia(file);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const nextTab = () => {
    const currentIndex = TAB_SECTIONS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < TAB_SECTIONS.length - 1) {
      setActiveTab(TAB_SECTIONS[currentIndex + 1].id);
    }
  };

  const prevTab = () => {
    const currentIndex = TAB_SECTIONS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TAB_SECTIONS[currentIndex - 1].id);
    }
  };

  const calculateProfit = () => {
    const profit = (watchedValues.selling_price || 0) - (watchedValues.base_price || 0);
    const margin = watchedValues.base_price > 0 
      ? ((profit / watchedValues.base_price) * 100).toFixed(1)
      : '0';
    return { profit, margin };
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-5xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {product ? 'Edit Product' : 'Create New Product'}
              </h2>
              <p className="text-gray-600 mt-1">
                Fill in the details to {product ? 'update your' : 'add a new'} product
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Progress</span>
              <div className="w-32">
                <Progress value={formProgress} className="h-2" />
              </div>
              <span className="text-sm font-medium">{Math.round(formProgress)}%</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              {TAB_SECTIONS.map((section, index) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{section.label}</span>
                    <span className="sm:hidden">{index + 1}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6"
              >
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-gray-500" />
                    Product Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Premium Wireless Headphones"
                    className={cn(
                      "h-12 text-lg",
                      errors.name && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-gray-500" />
                    Description
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your product in detail. Include features, benefits, and specifications..."
                    rows={6}
                    className={cn(
                      "resize-none",
                      errors.description && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {watchedValues.description?.length || 0} characters
                    </p>
                    {errors.description && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category and SKU */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-gray-500" />
                      Category
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.category_id}
                      onValueChange={(value) => setValue('category_id', value)}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-12",
                          errors.category_id && "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      SKU
                      <Badge variant="secondary" className="text-xs">Auto</Badge>
                    </Label>
                    <div className="relative">
                      <Input
                        id="sku"
                        {...register('sku')}
                        placeholder="Auto-generated"
                        className="h-12 pr-10"
                        readOnly
                      />
                      <Zap className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Base Price Card */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <Label htmlFor="base_price" className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        Cost Price
                      </Label>
                      <Badge variant="outline">Your Cost</Badge>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="base_price"
                        type="number"
                        step="0.01"
                        {...register('base_price', { valueAsNumber: true })}
                        placeholder="0.00"
                        className={cn(
                          "h-14 pl-8 text-xl font-semibold",
                          errors.base_price && "border-red-500"
                        )}
                      />
                    </div>
                    {errors.base_price && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.base_price.message}
                      </p>
                    )}
                  </div>

                  {/* Selling Price Card */}
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <Label htmlFor="selling_price" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Selling Price
                      </Label>
                      <Badge className="bg-green-600">Customer Pays</Badge>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600">
                        $
                      </span>
                      <Input
                        id="selling_price"
                        type="number"
                        step="0.01"
                        {...register('selling_price', { valueAsNumber: true })}
                        placeholder="0.00"
                        className={cn(
                          "h-14 pl-8 text-xl font-semibold",
                          errors.selling_price && "border-red-500"
                        )}
                      />
                    </div>
                    {errors.selling_price && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.selling_price.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profit Analysis */}
                {watchedValues.base_price > 0 && watchedValues.selling_price > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Profit Analysis
                        </h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-2xl font-bold text-indigo-900">
                            ${calculateProfit().profit.toFixed(2)}
                          </p>
                          <p className="text-sm text-indigo-700">
                            Profit per unit ({calculateProfit().margin}% margin)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Estimated Revenue</p>
                        <p className="text-xl font-semibold text-gray-900">
                          ${((watchedValues.selling_price || 0) * (watchedValues.stock_quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stock Quantity */}
                <div className="space-y-4">
                  <Label htmlFor="stock_quantity" className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-gray-500" />
                    Stock Quantity
                    <span className="text-red-500">*</span>
                  </Label>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Input
                        id="stock_quantity"
                        type="number"
                        {...register('stock_quantity', { valueAsNumber: true })}
                        placeholder="0"
                        className={cn(
                          "h-14 text-xl font-semibold max-w-xs",
                          errors.stock_quantity && "border-red-500"
                        )}
                      />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-xl font-semibold">
                          ${((watchedValues.selling_price || 0) * (watchedValues.stock_quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stock Level Indicator */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stock Level</span>
                        <span className={cn(
                          "font-medium",
                          watchedValues.stock_quantity === 0 && "text-red-600",
                          watchedValues.stock_quantity > 0 && watchedValues.stock_quantity <= 10 && "text-yellow-600",
                          watchedValues.stock_quantity > 10 && "text-green-600"
                        )}>
                          {watchedValues.stock_quantity === 0 && "Out of Stock"}
                          {watchedValues.stock_quantity > 0 && watchedValues.stock_quantity <= 10 && "Low Stock"}
                          {watchedValues.stock_quantity > 10 && "In Stock"}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((watchedValues.stock_quantity || 0) / 100 * 100, 100)} 
                        className={cn(
                          "h-2",
                          watchedValues.stock_quantity === 0 && "[&>div]:bg-red-500",
                          watchedValues.stock_quantity > 0 && watchedValues.stock_quantity <= 10 && "[&>div]:bg-yellow-500",
                          watchedValues.stock_quantity > 10 && "[&>div]:bg-green-500"
                        )}
                      />
                    </div>
                  </div>
                  
                  {errors.stock_quantity && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.stock_quantity.message}
                    </p>
                  )}
                </div>

                {/* Product Status */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    Publication Status
                  </Label>
                  
                  <RadioGroup
                    value={watchedValues.status}
                    onValueChange={(value: any) => setValue('status', value)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <label
                      htmlFor="draft"
                      className={cn(
                        "relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                        watchedValues.status === 'draft' 
                          ? "border-gray-500 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="draft" id="draft" />
                        <div>
                          <p className="font-medium">Draft</p>
                          <p className="text-sm text-gray-600">Not visible to customers</p>
                        </div>
                      </div>
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    </label>
                    
                    <label
                      htmlFor="published"
                      className={cn(
                        "relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                        watchedValues.status === 'published' 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="published" id="published" />
                        <div>
                          <p className="font-medium">Published</p>
                          <p className="text-sm text-gray-600">Live and visible</p>
                        </div>
                      </div>
                      <Eye className="h-5 w-5 text-green-500" />
                    </label>
                    
                    <label
                      htmlFor="archived"
                      className={cn(
                        "relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                        watchedValues.status === 'archived' 
                          ? "border-orange-500 bg-orange-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="archived" id="archived" />
                        <div>
                          <p className="font-medium">Archived</p>
                          <p className="text-sm text-gray-600">Hidden from store</p>
                        </div>
                      </div>
                      <Package className="h-5 w-5 text-orange-500" />
                    </label>
                  </RadioGroup>
                </div>
              </motion.div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {!currentProductId ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <Package className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-yellow-900 mb-2">Save Product First</h3>
                    <p className="text-yellow-700">
                      Please save the product before uploading images. Click "Save as Draft" to continue.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Upload Area */}
                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
                        isDragging 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const files = Array.from(e.dataTransfer.files).filter(
                          file => file.type.startsWith('image/')
                        );
                        if (files.length > 0) {
                          handleImageUpload(files);
                        }
                      }}
                    >
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleImageUpload(e.target.files);
                          }
                        }}
                      />
                      
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className={cn(
                          "h-12 w-12 mx-auto mb-4",
                          isDragging ? "text-indigo-600" : "text-gray-400"
                        )} />
                        <p className="text-lg font-medium mb-2">
                          {isDragging ? "Drop images here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    </div>

                    {/* Image Gallery */}
                    {media && media.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {media.map((item) => (
                          <div key={item.id} className="relative group">
                            <img
                              src={item.url}
                              alt={item.alt_text || 'Product image'}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => setPrimaryImage(item.id)}
                                className="h-8"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMedia(item.id)}
                                className="h-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {item.is_primary && (
                              <Badge className="absolute top-2 left-2 bg-yellow-500">
                                Primary
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-2">
              {activeTab !== TAB_SECTIONS[0].id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevTab}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              {activeTab !== TAB_SECTIONS[TAB_SECTIONS.length - 1].id ? (
                <Button
                  type="button"
                  onClick={nextTab}
                  disabled={isSubmitting}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="outline"
                    onClick={() => setValue('status', 'draft')}
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save as Draft
                  </Button>
                  
                  <Button
                    type="submit"
                    onClick={() => setValue('status', 'published')}
                    disabled={isSubmitting || !isValid}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Publish Product
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
