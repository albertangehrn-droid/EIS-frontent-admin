"use client";

import React, { useEffect, useState, useCallback } from "react";
import useAxios from "@/hooks/useAxios";
import { debounce } from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Layers,
  Moon,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Search,
  CornerDownRight,
  RotateCw,
  Filter,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaRupeeSign } from "react-icons/fa";
import { Eye } from "lucide-react";
import { showToast } from "@/components/_ui/toast-utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import AddServiceDialog from "@/components/_dialogs/AddServiceDialog";
import EditServiceDialog from "@/components/_dialogs/EditServiceDialog";
import ViewServiceDialog from "@/components/_dialogs/ViewServiceDialog";

export default function Services() {
  const { request: fetchServices, loading, error } = useAxios();
  const { request: updateService } = useAxios();
  const { request: deleteService, loading: deleting } = useAxios();

  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // ✅ Status Filter State
  const [togglingId, setTogglingId] = useState(null);

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewService, setViewService] = useState(null);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    pageSize: 10,
  });

  // ✅ Updated Fetch Logic with Search & Status
  const getServices = async (page = 1, search = "", status = "all") => {
    // Build query params
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", 10);
    if (search) params.append("search", search);
    if (status !== "all")
      params.append("isActive", status === "active" ? "true" : "false"); // Assuming API accepts 'isActive' param

    const { data } = await fetchServices({
      method: "GET",
      url: `/admin/categories/get-all-services?${params.toString()}`,
      authRequired: true,
    });

    if (data?.success && data?.data) {
      setServices(data.data.result || []);
      setPagination({
        ...data.data.pagination,
        currentPage: Number(data.data.pagination.currentPage),
        pages: Number(data.data.pagination.pages),
      });
    }
  };

  // ✅ Debounced Search Handler
  const debouncedFetch = useCallback(
    debounce((query, status) => {
      getServices(1, query, status); // Always reset to page 1 on search
    }, 500),
    [],
  );

  useEffect(() => {
    getServices(1);
  }, []);

  // ✅ Handle Input Change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedFetch(value, statusFilter);
  };

  // ✅ Handle Status Filter Change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    getServices(1, searchQuery, value); // Fetch immediately on filter change
  };

  // ✅ Handle Refresh
  const handleRefresh = () => {
    getServices(pagination.currentPage, searchQuery, statusFilter);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      getServices(newPage, searchQuery, statusFilter);
    }
  };

  const handleViewClick = (service) => {
    setViewService(service);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAction = async () => {
    if (!serviceToDelete) return;

    const { data, error } = await deleteService({
      method: "DELETE",
      url: `/admin/categories/delete-service?serviceId=${serviceToDelete._id}`,
      authRequired: true,
    });

    if (error) {
      showToast("error", error || "Failed to delete service");
    } else {
      showToast("success", data?.message || "Service deleted successfully");
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
      getServices(pagination.currentPage, searchQuery, statusFilter);
    }
  };

  const handleStatusToggle = async (service, checked) => {
    setTogglingId(service._id);
     const payload = {
    serviceId: service._id,
    serviceName: service.serviceName,
    subCategoryId: service.subCategoryId?._id,
    type: service.type,
    commissionPercentage: service.commissionPercentage,
    pricing: {
      perKm: service.pricing?.perKm || 0,
      perHour: service.pricing?.perHour || 0,
      perDay: service.pricing?.perDay || 0,
      perService: service.pricing?.perService || 0,
    },
    nightAllowed: service.nightAllowed,
    nightChargesPerHour: service.nightChargesPerHour,
    isActive: checked,
    isTrending: service.isTrending,
  };

    const { data, error } = await updateService({
      method: "PUT",
      url: "/admin/categories/update-service",
      payload,
      authRequired: true,
    });

    if (error) {
      showToast("error", error || "Failed to update status");
    } else {
      showToast("success", data?.message || "Status updated successfully");
      setServices((prev) =>
        prev.map((s) =>
          s._id === service._id ? { ...s, isActive: checked } : s,
        ),
      );
    }
    setTogglingId(null);
  };

  const handleTrendingToggle = async (service, checked) => {
    setTogglingId(service._id);

     const payload = {
    serviceId: service._id,
    serviceName: service.serviceName,
    subCategoryId: service.subCategoryId?._id,
    type: service.type,
    commissionPercentage: service.commissionPercentage,
    pricing: {
      perKm: service.pricing?.perKm || 0,
      perHour: service.pricing?.perHour || 0,
      perDay: service.pricing?.perDay || 0,
      perService: service.pricing?.perService || 0,
    },
    nightAllowed: service.nightAllowed,
    nightChargesPerHour: service.nightChargesPerHour,
    isActive: service.isActive,
    isTrending: checked,
  };

    const { data, error } = await updateService({
      method: "PUT",
      url: "/admin/categories/update-service",
      payload,
      authRequired: true,
    });

    if (error) {
      showToast("error", error || "Failed to update trending");
    } else {
      showToast("success", data?.message || "Trending updated");
      setServices((prev) =>
        prev.map((s) =>
          s._id === service._id ? { ...s, isTrending: checked } : s,
        ),
      );
    }

    setTogglingId(null);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load services: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ Search & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-9 h-9 bg-white w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* ✅ Status Select Filter */}
          {/* <div className="w-full sm:w-[140px]">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="h-9 bg-white">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Filter className="w-3.5 h-3.5" />
                            <SelectValue placeholder="Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
             </div> */}
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* ✅ Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-25 shrink-0 bg-white"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Data"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Add Button */}
          <Button
            className="w-full sm:w-auto gap-2 shadow-sm flex-1 sm:flex-none"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add New Service
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 h-11 hover:bg-gray-50/50">
              <TableHead className="w-[200px] font-semibold text-gray-600">
                Service Name
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Category Hierarchy
              </TableHead>
              {/* <TableHead className="font-semibold text-gray-600">Standard Pricing</TableHead> */}
              <TableHead className="w-[120px] font-semibold text-gray-600">
                Night Charges
              </TableHead>
              <TableHead className="w-[100px] text-center font-semibold text-gray-600">
                Status
              </TableHead>
              <TableHead className="w-[110px] text-center font-semibold text-gray-600">
                Trending
              </TableHead>
              <TableHead className="w-[100px] text-center font-semibold text-gray-600">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && services.length === 0 ? (
              // Only show skeleton on initial load or if list is empty
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="h-20">
                  <TableCell>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-full max-w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : services.length > 0 ? (
              services.map((service) => (
                <TableRow
                  key={service._id}
                  className="hover:bg-gray-50/30 transition-colors"
                >
                  {/* Service Name */}
                  <TableCell className="align-top py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                        <Briefcase className="w-4 h-4" />
                      </div>

                      <div>
                        <p className="font-medium text-gray-900 capitalize py-2">
                          {service.serviceName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Hierarchy */}
                  <TableCell className="align-top py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <Layers className="w-3.5 h-3.5 text-gray-400" />
                        <span className="capitalize">
                          {service.subCategoryId?.categoryId?.name?.replace(
                            "_",
                            " ",
                          ) || "N/A"}
                        </span>
                      </div>
                      <div className="pl-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CornerDownRight className="w-3 h-3 text-gray-300" />
                        <span className="capitalize">
                          {service.subCategoryId?.name?.replace("_", " ") ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Pricing Models */}
                  {/* <TableCell className="align-top py-4">
                    <div className="flex flex-wrap gap-2">
                      {service.allowedChargeTypes?.perHour && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="flex items-center">
                            <FaRupeeSign className="w-2.5 h-2.5" />{service.pricing?.perHour}/hr
                          </span>
                        </Badge>
                      )}
                      
                      {service.allowedChargeTypes?.perDay && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-normal gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="flex items-center">
                            <FaRupeeSign className="w-2.5 h-2.5" />{service.pricing?.perDay}/day
                          </span>
                        </Badge>
                      )}

                      {service.allowedChargeTypes?.perService && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-normal gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="flex items-center">
                            <FaRupeeSign className="w-2.5 h-2.5" />{service.pricing?.perService} fixed
                          </span>
                        </Badge>
                      )}
                    </div>
                  </TableCell> */}

                  {/* Night Charges */}
                  <TableCell className="align-top py-4">
                    {service.nightAllowed ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-md w-fit">
                        <Moon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="flex items-center">
                          <FaRupeeSign className="w-2.5 h-2.5" />
                          {service.nightChargesPerHour}/hr
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic pl-1">
                        Not allowed
                      </span>
                    )}
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell className="align-top py-4 text-center">
                    <div className="flex flex-col items-center gap-1 py-1">
                      <Switch
                        checked={service.isActive}
                        disabled={togglingId === service._id}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(service, checked)
                        }
                        className={
                          togglingId === service._id ? "opacity-50" : ""
                        }
                      />
                      {/* <span className={`text-[10px] font-medium ${service.isActive ? "text-green-600" : "text-gray-400"}`}>
                            {service.isActive ? "Active" : "Inactive"}
                         </span> */}
                    </div>
                  </TableCell>
                  {/* Trending Toggle */}
                  <TableCell className="align-top py-4 text-center">
                    <Switch
                      checked={service.isTrending}
                      disabled={togglingId === service._id}
                      onCheckedChange={(checked) =>
                        handleTrendingToggle(service, checked)
                      }
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="align-top py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => handleEditClick(service)}
                        title="Edit Service"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleViewClick(service)}
                        title="View Service"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => confirmDelete(service)}
                        title="Delete Service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Briefcase className="w-8 h-8 opacity-20" />
                    <p>No services found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Page {pagination.currentPage} of {pagination.pages} (
          {pagination.total} items)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
            className="h-8 gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.pages || loading}
            className="h-8 gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AddServiceDialog
        open={isAddDialogOpen}
        setOpen={setIsAddDialogOpen}
        onSuccess={() => getServices(1, searchQuery, statusFilter)}
      />

      <EditServiceDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        service={selectedService}
        onSuccess={() =>
          getServices(pagination.currentPage, searchQuery, statusFilter)
        }
      />

      <ViewServiceDialog
        open={isViewDialogOpen}
        setOpen={setIsViewDialogOpen}
        service={viewService}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={() => setIsDeleteDialogOpen(false)}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Delete Service?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                "{serviceToDelete?.serviceName}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteAction}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
