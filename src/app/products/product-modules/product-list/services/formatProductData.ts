// formatProductData.ts
import { ProductWithCategory } from '@/types/products';

type ProductStatus = 'draft' | 'published' | 'archived';
type LegacyProduct = {
  id: string;
  name: string;
  description: string;
  sku: string;
  price?: number; // Legacy field
  selling_price?: number;
  base_price?: number;
  current_stock?: number;
  stock_quantity?: number;
  minimum_stock?: number;
  min_stock_level?: number;
  status: string;
  created_at: string;
  images?: string[]; // Legacy field
  gallery_images?: string[];
  featured_image_url?: string;
  category_id?: string;
};

export class ProductDataFormatter {
  static formatPrice(price: number | null | undefined, currency = 'USD'): string {
    // Handle null, undefined, or NaN values
    if (price == null || isNaN(price) || price < 0) {
      return '$0.00';
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(price);
    } catch (error) {
      console.warn('Error formatting price:', error);
      return '$0.00';
    }
  }

  static formatStock(current: number | null | undefined, minimum: number | null | undefined): {
    level: 'out' | 'low' | 'normal';
    text: string;
    color: string;
  } {
    const currentStock = current ?? 0;
    const minimumStock = minimum ?? 0;
    
    if (currentStock === 0) {
      return { level: 'out', text: 'Out of Stock', color: 'text-red-600' };
    }
    if (currentStock <= minimumStock) {
      return { level: 'low', text: 'Low Stock', color: 'text-yellow-600' };
    }
    return { level: 'normal', text: 'In Stock', color: 'text-green-600' };
  }

  static formatStatus(status: ProductStatus): {
    text: string;
    color: string;
    bgColor: string;
  } {
    const statusConfig = {
      published: {
        text: 'Published',
        color: 'text-green-800',
        bgColor: 'bg-green-100'
      },
      draft: {
        text: 'Draft',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100'
      },
      archived: {
        text: 'Archived',
        color: 'text-red-800',
        bgColor: 'bg-red-100'
      }
    };

    return statusConfig[status] || statusConfig.draft;
  }

  static formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  }

  static formatWeight(weight: number, unit = 'kg'): string {
    return `${weight} ${unit}`;
  }

  static formatDimensions(dimensions?: { length?: number; width?: number; height?: number; unit?: string }): string {
    if (!dimensions) return 'N/A';
    
    const { length, width, height, unit } = dimensions;
    if (!length || !width || !height) return 'N/A';
    
    return `${length} × ${width} × ${height} ${unit || 'cm'}`;
  }

  static formatSKU(sku: string | null | undefined): string {
    if (!sku) return 'N/A';
    return sku.toUpperCase();
  }

  static formatBarcode(barcode?: string): string {
    if (!barcode) return 'N/A';
    return barcode;
  }

  static generateProductInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  static truncateDescription(description: string, maxLength = 100): string {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + '...';
  }

  static formatTags(tags: string[]): string {
    if (!tags || tags.length === 0) return 'No tags';
    return tags.join(', ');
  }

  static formatCategory(category?: { name: string; slug: string } | null): string {
    if (!category || !category.name) return 'Uncategorized';
    return category.name;
  }

  static generateImageUrl(bucketName: string, filePath: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
  }

  static processProductMedia(media?: any[]): {
    primaryImage: string | null;
    galleryImages: string[];
    hasImages: boolean;
  } {
    if (!media || !Array.isArray(media) || media.length === 0) {
      return {
        primaryImage: null,
        galleryImages: [],
        hasImages: false
      };
    }

    // Find primary image first
    const primaryMedia = media.find(m => m.is_primary === true);
    const primaryImage = primaryMedia 
      ? this.generateImageUrl(primaryMedia.bucket_name || 'media-files', primaryMedia.file_path)
      : null;

    // Generate all image URLs
    const galleryImages = media
      .filter(m => m.file_path) // Only media with valid file paths
      .map(m => this.generateImageUrl(m.bucket_name || 'media-files', m.file_path));

    // If no primary image, use the first available image
    const effectivePrimaryImage = primaryImage || (galleryImages.length > 0 ? galleryImages[0] : null);

    return {
      primaryImage: effectivePrimaryImage,
      galleryImages,
      hasImages: galleryImages.length > 0
    };
  }

  static calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  static formatProductCard(product: ProductWithCategory | LegacyProduct): {
    formattedPrice: string;
    stockStatus: ReturnType<typeof ProductDataFormatter.formatStock>;
    statusInfo: ReturnType<typeof ProductDataFormatter.formatStatus>;
    initials: string;
    shortDescription: string;
    formattedSKU: string;
    formattedDate: string;
    primaryImage: string | null;
    galleryImages: string[];
    hasImages: boolean;
  } {
    // Handle different price field names and get the best available price
    const getPrice = (prod: any) => {
      if (prod.selling_price != null && !isNaN(prod.selling_price)) {
        return prod.selling_price;
      }
      if (prod.price != null && !isNaN(prod.price)) {
        return prod.price;
      }
      if (prod.base_price != null && !isNaN(prod.base_price)) {
        return prod.base_price;
      }
      return 0;
    };
    
    // Handle different stock field names
    const getCurrentStock = (prod: any) => {
      if (prod.current_stock != null) return prod.current_stock;
      if (prod.stock_quantity != null) return prod.stock_quantity;
      return 0;
    };
    
    const getMinimumStock = (prod: any) => {
      if (prod.minimum_stock != null) return prod.minimum_stock;
      if (prod.min_stock_level != null) return prod.min_stock_level;
      return 0;
    };
    
    // Handle different status formats
    const getStatus = (prod: any): ProductStatus => {
      const status = prod.status;
      if (status === 'published' || status === 'active') return 'published';
      if (status === 'draft' || status === 'inactive') return 'draft';
      if (status === 'archived' || status === 'discontinued') return 'archived';
      return 'draft';
    };
    
    // Process media data (for products with media relationship)
    const mediaData = this.processProductMedia((product as any).media);
    
    return {
      formattedPrice: this.formatPrice(getPrice(product)),
      stockStatus: this.formatStock(getCurrentStock(product), getMinimumStock(product)),
      statusInfo: this.formatStatus(getStatus(product)),
      initials: this.generateProductInitials(product.name || 'Unknown'),
      shortDescription: this.truncateDescription(product.description || 'No description available'),
      formattedSKU: this.formatSKU(product.sku),
      formattedDate: this.formatDate(product.created_at),
      primaryImage: mediaData.primaryImage,
      galleryImages: mediaData.galleryImages,
      hasImages: mediaData.hasImages,
    };
  }

  static sortProducts(products: (ProductWithCategory | LegacyProduct)[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): (ProductWithCategory | LegacyProduct)[] {
    return [...products].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'price':
          // Use selling_price first, then fallback to price or base_price
          aValue = a.selling_price ?? a.price ?? a.base_price ?? 0;
          bValue = b.selling_price ?? b.price ?? b.base_price ?? 0;
          break;
        case 'stock':
          aValue = a.current_stock ?? a.stock_quantity ?? 0;
          bValue = b.current_stock ?? b.stock_quantity ?? 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static filterProducts(products: (ProductWithCategory | LegacyProduct)[], filters: Record<string, any>): (ProductWithCategory | LegacyProduct)[] {
    return products.filter(product => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${product.name || ''} ${product.description || ''} ${product.sku || ''}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Category filter
      if (filters.category && product.category_id !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && product.status !== filters.status) {
        return false;
      }

      // Price range filter
      const productPrice = product.selling_price ?? product.price ?? product.base_price ?? 0;
      if (filters.minPrice && productPrice < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && productPrice > filters.maxPrice) {
        return false;
      }

      // Low stock filter
      const currentStock = product.current_stock ?? product.stock_quantity ?? 0;
      const minimumStock = product.minimum_stock ?? product.min_stock_level ?? 0;
      if (filters.lowStock && currentStock > minimumStock) {
        return false;
      }

      return true;
    });
  }
}

export const formatProductData = ProductDataFormatter;
