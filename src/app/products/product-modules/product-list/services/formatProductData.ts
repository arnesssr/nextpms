// formatProductData.ts
import { Product, ProductStatus } from '../../product-catalog/types';

export class ProductDataFormatter {
  static formatPrice(price: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }

  static formatStock(current: number, minimum: number): {
    level: 'out' | 'low' | 'normal';
    text: string;
    color: string;
  } {
    if (current === 0) {
      return { level: 'out', text: 'Out of Stock', color: 'text-red-600' };
    }
    if (current <= minimum) {
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
      active: {
        text: 'Active',
        color: 'text-green-800',
        bgColor: 'bg-green-100'
      },
      inactive: {
        text: 'Inactive',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100'
      },
      discontinued: {
        text: 'Discontinued',
        color: 'text-red-800',
        bgColor: 'bg-red-100'
      },
      out_of_stock: {
        text: 'Out of Stock',
        color: 'text-orange-800',
        bgColor: 'bg-orange-100'
      },
      pending: {
        text: 'Pending',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100'
      }
    };

    return statusConfig[status] || statusConfig.inactive;
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

  static formatDimensions(dimensions?: Product['dimensions']): string {
    if (!dimensions) return 'N/A';
    
    const { length, width, height, unit } = dimensions;
    if (!length || !width || !height) return 'N/A';
    
    return `${length} × ${width} × ${height} ${unit}`;
  }

  static formatSKU(sku: string): string {
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

  static calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  static formatProductCard(product: Product): {
    formattedPrice: string;
    stockStatus: ReturnType<typeof ProductDataFormatter.formatStock>;
    statusInfo: ReturnType<typeof ProductDataFormatter.formatStatus>;
    initials: string;
    shortDescription: string;
    formattedSKU: string;
    formattedDate: string;
  } {
    return {
      formattedPrice: this.formatPrice(product.price),
      stockStatus: this.formatStock(product.current_stock, product.minimum_stock),
      statusInfo: this.formatStatus(product.status),
      initials: this.generateProductInitials(product.name),
      shortDescription: this.truncateDescription(product.description),
      formattedSKU: this.formatSKU(product.sku),
      formattedDate: this.formatDate(product.created_at),
    };
  }

  static sortProducts(products: Product[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Product[] {
    return [...products].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.current_stock;
          bValue = b.current_stock;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static filterProducts(products: Product[], filters: Record<string, any>): Product[] {
    return products.filter(product => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${product.name} ${product.description} ${product.sku}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && product.status !== filters.status) {
        return false;
      }

      // Price range filter
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }

      // Low stock filter
      if (filters.lowStock && product.current_stock > product.minimum_stock) {
        return false;
      }

      return true;
    });
  }
}

export const formatProductData = ProductDataFormatter;
