'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  CreditCard, 
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { Supplier } from '../types/suppliers.types';

interface ViewSupplierModalProps {
  supplier: Supplier;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({ 
  supplier, 
  open, 
  onClose, 
  onEdit 
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'average':
        return 'outline';
      case 'poor':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building className="w-5 h-5" />
            {supplier.companyName}
          </DialogTitle>
          <DialogDescription>
            Complete supplier information and details
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="grid gap-6 py-4">
            {/* Status and Type */}
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <Badge variant={getStatusBadgeVariant(supplier.status)}>
                  {supplier.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                <Badge variant="outline">
                  {supplier.supplierType}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Performance</p>
                <Badge variant={getPerformanceBadgeVariant(supplier.performanceRating)}>
                  {supplier.performanceRating}
                </Badge>
              </div>
            </div>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company Name</p>
                    <p className="font-medium">{supplier.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Business Type</p>
                    <p>{supplier.businessType}</p>
                  </div>
                </div>
                
                {supplier.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </div>
                )}
                
                {supplier.taxId && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tax ID</p>
                    <p>{supplier.taxId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact Name</p>
                  <p className="font-medium">{supplier.name}</p>
                  {supplier.contactPerson.title && (
                    <p className="text-sm text-gray-500">{supplier.contactPerson.title}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a 
                      href={`mailto:${supplier.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a 
                      href={`tel:${supplier.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            {(supplier.address.street || supplier.address.city) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {supplier.address.street && <p>{supplier.address.street}</p>}
                    <p>
                      {[supplier.address.city, supplier.address.state, supplier.address.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {supplier.address.country && <p>{supplier.address.country}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            {supplier.paymentTerms && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Terms</p>
                    <p>{supplier.paymentTerms}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {supplier.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{supplier.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm">{supplier.createdAt.toLocaleDateString()} at {supplier.createdAt.toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm">{supplier.updatedAt.toLocaleDateString()} at {supplier.updatedAt.toLocaleTimeString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              Edit Supplier
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
