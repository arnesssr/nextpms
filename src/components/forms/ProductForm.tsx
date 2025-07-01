'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  DollarSign,
  Package,
  Tag,
  FileText,
  Star,
  Edit2,
  Trash2,
  Download,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Product } from '@/types';
import { useCategories } from '@/app/categories/category-modules/category-management/hooks/useCategories';
import { ProductService as productService } from '@/services/products';
import { useMediaUpload } from '@/app/products/product-modules/media-management/hooks/useMediaUpload';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  base_price: z.number().min(0.01, 'Base price must be greater than 0'),
  selling_price: z.number().min(0.01, 'Selling price must be greater than 0'),
  category_id: z.string().min(1, 'Category is required'),
  sku: z.string().optional(),
  stock_quantity: z.number().min(0, 'Stock cannot be negative'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

type ProductFormData = {
  name: string;
  description: string;
  base_price: number;
  selling_price: number;
  category_id: string;
  sku?: string;
  stock_quantity: number;
  status: 'draft' | 'published' | 'archived';
};

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess?: (product: Product) => void;
}

// Interface for pending uploads
interface PendingUpload {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [currentProductId, setCurrentProductId] = useState<string | null>(product?.id || null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isProcessingPending, setIsProcessingPending] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{[key: string]: number}>({});
  const [totalUploads, setTotalUploads] = useState(0);
  const [completedUploads, setCompletedUploads] = useState(0);
  

  // Fetch real categories from the backend
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Use media management hooks when we have a product ID
  const {
    media,
    loading: mediaLoading,
    uploading,
    fetchMedia,
    uploadMedia,
    deleteMedia,
    updateMedia,
    setPrimaryImage
  } = useMediaUpload(currentProductId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || '',
      base_price: product.base_price || 0,
      selling_price: product.selling_price || 0,
      category_id: product.category_id || '',
      sku: product.sku || '',
      stock_quantity: product.stock_quantity || 0,
      status: product.status || 'draft' as const,
    } : {
      name: '',
      description: '',
      base_price: 0,
      selling_price: 0,
      category_id: '',
      sku: '',
      stock_quantity: 0,
      status: 'draft' as const,
    }
  });

  const watchedValues = watch();

  // Generate SKU automatically if not provided
  useEffect(() => {
    if (!product && watchedValues.name && !watchedValues.sku) {
      const generatedSku = watchedValues.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
      setValue('sku', generatedSku);
    }
  }, [watchedValues.name, watchedValues.sku, product, setValue]);

  // Process pending uploads when product ID becomes available
  useEffect(() => {
    const processPendingUploads = async () => {
      if (currentProductId && pendingUploads.length > 0 && !isProcessingPending) {
        setIsProcessingPending(true);
        
        toast.info(`Processing ${pendingUploads.length} pending upload(s)...`);
        
        for (const pending of pendingUploads) {
          try {
            // Update status to uploading
            setPendingUploads(prev => prev.map(p => 
              p.id === pending.id ? { ...p, status: 'uploading' } : p
            ));
            
            await uploadMedia(pending.file);
            
            // Update status to completed
            setPendingUploads(prev => prev.map(p => 
              p.id === pending.id ? { ...p, status: 'completed', progress: 100 } : p
            ));
            
            toast.success(`${pending.file.name} uploaded successfully.`);
          } catch (error) {
            // Update status to error
            setPendingUploads(prev => prev.map(p => 
              p.id === pending.id ? { ...p, status: 'error' } : p
            ));
            
            toast.error(`Failed to upload ${pending.file.name}.`);
          }
        }
        
        // Clear completed and error uploads after a delay
        setTimeout(() => {
          setPendingUploads(prev => prev.filter(p => p.status === 'pending'));
          setIsProcessingPending(false);
        }, 2000);
      }
    };

    processPendingUploads();
  }, [currentProductId, pendingUploads, isProcessingPending, uploadMedia]);

  // Enhanced image upload with progress tracking
  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (!currentProductId) {
      // Store files as pending uploads
      const newPendingUploads: PendingUpload[] = fileArray.map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const
      }));
      
      setPendingUploads(prev => [...prev, ...newPendingUploads]);
      toast.info(`${fileArray.length} file(s) prepared for upload. They will be uploaded once the product is saved.`);
      return;
    }

    // Upload immediately if product exists
    for (const file of fileArray) {
      const fileId = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      try {
        // Simulate upload progress
        const uploadInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress >= 90) {
              clearInterval(uploadInterval);
              return prev;
            }
            return { ...prev, [fileId]: currentProgress + 10 };
          });
        }, 200);
        
        await uploadMedia(file);
        
        clearInterval(uploadInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        // Remove progress after completion
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [fileId]: removed, ...rest } = prev;
            return rest;
          });
        }, 1000);
        
        toast.success(`${file.name} has been uploaded successfully.`);
      } catch (error) {
        setUploadProgress(prev => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });
        
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length > 0) {
        handleImageUpload(imageFiles);
      } else {
        toast.error("Please upload only image files.");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await deleteMedia(mediaId);
      toast.success("The image has been deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete the image. Please try again.");
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    try {
      await setPrimaryImage(mediaId);
      toast.success("The primary image has been updated.");
    } catch (error) {
      toast.error("Failed to set primary image. Please try again.");
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData, isDraft = false) => {
    setIsSubmitting(true);
    try {
      const productData = {
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        sku: data.sku || '',
        base_price: data.base_price,
        selling_price: data.selling_price,
        stock_quantity: data.stock_quantity,
        status: isDraft ? 'draft' : data.status || 'published',
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
        // Update existing product
        result = await productService.updateProduct(product.id, productData);
      } else {
        // Create new product
        result = await productService.createProduct(productData);
      }
      
      if (result.success) {
        // Set the product ID for media management if this was a new product
        if (!product?.id && result.data?.id) {
          setCurrentProductId(result.data.id);
        }
        
        onSuccess?.(result.data);
        
        // Only close if this is an update, not a new product creation
        if (product?.id) {
          onClose();
        } else {
          toast.success("Product created successfully! You can now upload images.");
        }
      } else {
        throw new Error(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      // TODO: Show error toast/message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstimatedValue = () => {
    return (watchedValues.selling_price || 0) * (watchedValues.stock_quantity || 0);
  };

  return (
    <div className="max-h-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-full">
        {/* Basic Information */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center text-blue-900">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-blue-700">
              Enter the basic details for your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 block">
                Product Name *
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter a descriptive product name"
                className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
              />
              {errors.name && (
                <p className="text-sm text-red-600 font-medium flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 block">
                Description *
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your product features, benefits, and specifications..."
                rows={4}
                className="min-h-[100px] text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm resize-y"
              />
              {errors.description && (
                <p className="text-sm text-red-600 font-medium flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="sku" className="text-sm font-semibold text-gray-700 block">
                  SKU <span className="text-gray-500 font-normal">(Auto-generated)</span>
                </Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="Will be generated automatically"
                  className="h-11 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 shadow-sm"
                  readOnly
                />
                {errors.sku && (
                  <p className="text-sm text-red-600 font-medium flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.sku.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="category_id" className="text-sm font-semibold text-gray-700 block">
                  Category *
                </Label>
                <Select 
                  value={watchedValues.category_id} 
                  onValueChange={(value) => setValue('category_id', value)}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className="h-11 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm">
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Choose a product category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-base py-2">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-sm text-red-600 font-medium flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.category_id.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center text-green-900">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Pricing & Inventory
            </CardTitle>
            <CardDescription className="text-green-700">
              Set pricing and stock information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="base_price" className="text-sm font-semibold text-gray-700 block">
                  Base Price * <span className="text-gray-500 font-normal">(Cost)</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    {...register('base_price', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="h-12 text-base pl-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm font-medium"
                  />
                </div>
                {errors.base_price && (
                  <p className="text-sm text-red-600 font-medium flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.base_price.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="selling_price" className="text-sm font-semibold text-gray-700 block">
                  Selling Price * <span className="text-gray-500 font-normal">(Customer pays)</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    {...register('selling_price', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="h-12 text-base pl-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm font-medium"
                  />
                </div>
                {errors.selling_price && (
                  <p className="text-sm text-red-600 font-medium flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.selling_price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="stock_quantity" className="text-sm font-semibold text-gray-700 block">
                Stock Quantity * <span className="text-gray-500 font-normal">(Available units)</span>
              </Label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                <Input
                  id="stock_quantity"
                  type="number"
                  {...register('stock_quantity', { valueAsNumber: true })}
                  placeholder="Enter stock quantity"
                  className="h-12 text-base pl-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm font-medium"
                />
              </div>
              {errors.stock_quantity && (
                <p className="text-sm text-red-600 font-medium flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.stock_quantity.message}
                </p>
              )}
            </div>

            {/* Estimated Value */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estimated Inventory Value:</span>
                <Badge variant="outline" className="font-mono">
                  ${getEstimatedValue().toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Status */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
            <CardTitle className="flex items-center text-purple-900">
              <Tag className="mr-2 h-5 w-5 text-purple-600" />
              Product Status
            </CardTitle>
            <CardDescription className="text-purple-700">
              Set the publication status of your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 block">
                Publication Status *
              </Label>
              <Select 
                value={watchedValues.status} 
                onValueChange={(value: 'draft' | 'published' | 'archived') => setValue('status', value)}
              >
                <SelectTrigger className="h-11 text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm">
                  <SelectValue placeholder="Choose publication status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft" className="text-base py-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="published" className="text-base py-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Published
                    </div>
                  </SelectItem>
                  <SelectItem value="archived" className="text-base py-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                      Archived
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {watchedValues.status === 'draft' && "Product is saved as draft and not visible to customers"}
                {watchedValues.status === 'published' && "Product is live and visible to customers"}
                {watchedValues.status === 'archived' && "Product is archived and not visible to customers"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product Media Management */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center text-orange-900">
              <ImageIcon className="mr-2 h-5 w-5 text-orange-600" />
              Product Media
              {media && media.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                  {media.length} image{media.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-orange-700">
              {currentProductId 
                ? "Upload and manage multiple images for your product"
                : "Save the product first to upload images"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pending Uploads Display (shown even without product ID) */}
            {pendingUploads.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Pending Uploads ({pendingUploads.length})</h4>
                  {!currentProductId && (
                    <Badge variant="outline" className="text-xs">
                      Will upload after saving
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {pendingUploads.map((pending) => (
                    <div key={pending.id} className="relative">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
                        <img
                          src={pending.preview}
                          alt="Pending upload"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Status overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          {pending.status === 'pending' && (
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                          )}
                          {pending.status === 'uploading' && (
                            <Badge className="text-xs bg-blue-500">
                              Uploading...
                            </Badge>
                          )}
                          {pending.status === 'completed' && (
                            <Badge className="text-xs bg-green-500">
                              ✓ Uploaded
                            </Badge>
                          )}
                          {pending.status === 'error' && (
                            <Badge variant="destructive" className="text-xs">
                              Error
                            </Badge>
                          )}
                        </div>
                        
                        {/* Remove button for pending items */}
                        {pending.status === 'pending' && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => {
                              URL.revokeObjectURL(pending.preview);
                              setPendingUploads(prev => prev.filter(p => p.id !== pending.id));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="mt-1 text-xs text-gray-600 truncate">
                        {pending.file.name}
                      </p>
                    </div>
                  ))}
                </div>
                {!currentProductId && (
                  <p className="text-sm text-muted-foreground">
                    💡 These files will be automatically uploaded once you save the product.
                  </p>
                )}
              </div>
            )}
            
            {!currentProductId && pendingUploads.length === 0 ? (
              <>
                {/* Enhanced Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : uploading 
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label htmlFor="media-upload" className={`cursor-pointer ${uploading ? 'cursor-not-allowed' : ''}`}>
                    <Upload className={`mx-auto h-12 w-12 mb-4 ${
                      isDragging ? 'text-primary' : uploading ? 'text-yellow-500' : 'text-gray-400'
                    }`} />
                    <p className="text-sm font-medium mb-2">
                      {isDragging 
                        ? 'Drop files here...' 
                        : uploading 
                          ? 'Uploading...' 
                          : 'Click to upload or drag and drop'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </label>
                  
                  {/* Upload Progress */}
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <div key={fileId} className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>

                {/* Media Gallery */}
                {mediaLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : media && media.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {media.map((item) => (
                      <div key={item.id} className="relative group aspect-square">
                        <img
                          src={item.url}
                          alt={item.alt_text || 'Product image'}
                          className="w-full h-full object-cover rounded-lg border transition-transform group-hover:scale-105"
                        />
                        
                        {/* Primary Badge */}
                        {item.is_primary && (
                          <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                        
                        {/* Action Menu */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!item.is_primary && (
                                <DropdownMenuItem onClick={() => handleSetPrimary(item.id)}>
                                  <Star className="w-4 h-4 mr-2" />
                                  Set as Primary
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Full Size
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const link = document.createElement('a');
                                link.href = item.url;
                                link.download = item.filename || 'image';
                                link.click();
                              }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMedia(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* File Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs truncate">
                            {item.filename || 'Unknown file'}
                          </p>
                          <p className="text-xs text-gray-300">
                            {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <p>No images uploaded yet</p>
                    <p className="text-sm">Upload your first image to get started</p>
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="h-11 px-6 border-2 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Button>
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isSubmitting}
              onClick={() => {
                setValue('status', 'draft');
                handleSubmit((data) => onSubmit(data, true))();
              }}
              className="h-11 px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              📝 Save as Draft
            </Button>
            <Button 
              type="button" 
              disabled={isSubmitting || !isDirty}
              onClick={() => {
                setValue('status', 'published');
                handleSubmit((data) => onSubmit(data, false))();
              }}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all duration-200"
            >
              {isSubmitting ? '⏳ Publishing...' : product ? '✅ Update & Publish' : '🚀 Publish Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
