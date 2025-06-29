'use client';

import React, { useState } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { AdjustmentsList } from './components/AdjustmentsList';
import { CreateAdjustmentModal } from './components/CreateAdjustmentModal';
import { useAdjustments } from './hooks/useAdjustments';
import { CreateAdjustmentRequest, Adjustment, AdjustmentApprovalRequest } from './types/adjustments.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Settings, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdjustmentsPage() {
  const {
    adjustments,
    summary,
    loading,
    creating,
    approving,
    error,
    filter,
    loadAdjustments,
    loadSummary,
    createAdjustment,
    updateAdjustment,
    approveAdjustments,
    deleteAdjustment,
    setFilter,
    refreshData
  } = useAdjustments();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);

  // Mock data for dropdowns
  const locations = ['Warehouse A', 'Warehouse B', 'Store Front', 'Distribution Center'];

  const handleCreateSave = async (request: CreateAdjustmentRequest) => {
    const newAdjustment = await createAdjustment(request);
    if (newAdjustment) {
      toast.success('Adjustment created successfully');
      setIsCreateModalOpen(false);
    } else {
      toast.error('Failed to create adjustment');
    }
  };

  const handleEditAdjustment = (adjustment: Adjustment) => {
    setSelectedAdjustment(adjustment);
    // In a real app, this might open an edit modal
    toast.info(`Editing adjustment: ${adjustment.id}`);
  };

  const handleDeleteAdjustment = async (id: string) => {
    const success = await deleteAdjustment(id);
    if (success) {
      toast.success('Adjustment deleted successfully');
    } else {
      toast.error('Failed to delete adjustment');
    }
  };

  const handleViewAdjustment = (adjustment: Adjustment) => {
    setSelectedAdjustment(adjustment);
    // In a real app, this might open a detailed view modal
    toast.info(`Viewing adjustment: ${adjustment.id}`);
  };

  const handleApproveAdjustment = async (id: string) => {
    const request: AdjustmentApprovalRequest = {
      adjustmentIds: [id],
      approved: true
    };
    
    const result = await approveAdjustments(request);
    if (result) {
      toast.success('Adjustment approved successfully');
    } else {
      toast.error('Failed to approve adjustment');
    }
  };

  const handleRejectAdjustment = async (id: string) => {
    const request: AdjustmentApprovalRequest = {
      adjustmentIds: [id],
      approved: false,
      approvalNotes: 'Rejected via quick action'
    };
    
    const result = await approveAdjustments(request);
    if (result) {
      toast.success('Adjustment rejected');
    } else {
      toast.error('Failed to reject adjustment');
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    toast.success('Data refreshed');
  };

  // Load summary when component mounts
  React.useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Check if user can approve (mock permission check)
  const canApprove = true; // In a real app, this would come from user permissions

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Stock Adjustments</h2>
            <p className="text-muted-foreground">
              Manage inventory corrections and stock level adjustments
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline"
              disabled={creating}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              disabled={creating}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Adjustment
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalAdjustments}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.adjustmentsToday} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{summary.pendingAdjustments}</div>
                <p className="text-xs text-muted-foreground">
                  Require approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Increases</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.totalIncreases}</div>
                <p className="text-xs text-muted-foreground">
                  Inventory additions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Decreases</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.totalDecreases}</div>
                <p className="text-xs text-muted-foreground">
                  Inventory reductions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Impact</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.totalCostImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.totalCostImpact >= 0 ? '+' : ''}${summary.totalCostImpact.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Financial impact
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions for Pending Approvals */}
        {summary && summary.pendingAdjustments > 0 && canApprove && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-600 mr-2" />
                <CardTitle className="text-amber-800">Pending Approvals</CardTitle>
              </div>
              <CardDescription className="text-amber-700">
                You have {summary.pendingAdjustments} adjustment{summary.pendingAdjustments !== 1 ? 's' : ''} awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => setFilter({ status: 'pending' })}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Review Pending
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilter({})}
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adjustments List */}
        <AdjustmentsList
          adjustments={adjustments}
          loading={loading}
          onRefresh={handleRefresh}
          onFilter={setFilter}
          onDelete={handleDeleteAdjustment}
          onEdit={handleEditAdjustment}
          onView={handleViewAdjustment}
          onApprove={handleApproveAdjustment}
          onReject={handleRejectAdjustment}
          showStats={false} // We have summary cards above
          canApprove={canApprove}
        />

        {/* Create Adjustment Modal */}
        <CreateAdjustmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateSave}
          locations={locations}
        />
      </div>
    </SidebarLayout>
  );
}
