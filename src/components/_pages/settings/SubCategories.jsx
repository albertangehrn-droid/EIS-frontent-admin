"use client";

import React, { useEffect, useState, useCallback } from "react";
import useAxios from "@/hooks/useAxios";
import { useCategory } from "@/contexts/categoryContext";
import { debounce } from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  FolderTree,
  Search,
  Plus,
  Pencil,
  Trash2,
  Layers,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/_ui/toast-utils";
import AddSubCategoryDialog from "@/components/_dialogs/AddSubCategoriesDialog";
import EditSubCategoryDialog from "@/components/_dialogs/EditSubCategories";
import ViewSubCategoryDialog from "@/components/_dialogs/ViewSubCategoryDialog";

const getFullUrl = (path) => {
  if (!path) return null;

  const cleanPath = path.trim().replace(/\\/g, "/");

  if (cleanPath.startsWith("http")) return cleanPath;

  const base = process.env.NEXT_PUBLIC_UPLOAD_URL;
  if (!base) return null;

  const normalizedBase = base.endsWith("/") ? base : base + "/";
  const normalizedPath = cleanPath.startsWith("/")
    ? cleanPath.slice(1)
    : cleanPath;

  return normalizedBase + normalizedPath;
};
const getRelativePath = (url) => {
  if (!url || typeof url !== "string") return "";

  const base = process.env.NEXT_PUBLIC_UPLOAD_URL;
  if (!base) return url;

  return url.startsWith(base) ? url.replace(base, "") : url;
};

export default function SubCategories() {
  const { request: fetchSubCats, loading, error } = useAxios();
  const { request: deleteSubCat } = useAxios();
  const { categories } = useCategory();

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewSubCategory, setViewSubCategory] = useState(null);

  const [subCategories, setSubCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    pageSize: 10,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [editMode, setEditMode] = useState("all");

  const getSubCategories = async (query = "", categoryId = "all", page = 1) => {
    let endpoint = "";
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", 10);

    if (query) params.append("search", query);

    if (categoryId !== "all") {
      params.append("categoryId", categoryId);
      endpoint = `/admin/categories/get-subcategories-by-category?${params.toString()}`;
    } else {
      endpoint = `/admin/categories/get-subcategories?${params.toString()}`;
    }

    const { data } = await fetchSubCats({
      method: "GET",
      url: endpoint,
      authRequired: true,
    });

    if (data?.success) {
      if (data.data?.result) {
        const normalized = data.data.result.map((sub) => ({
          ...sub,
          icon: getRelativePath(sub.icon),
          subCategoryBannerImage: getRelativePath(sub.subCategoryBannerImage),
        }));

        setSubCategories(normalized);
        if (data.data.pagination) {
          setPagination({
            ...data.data.pagination,
            currentPage: Number(data.data.pagination.currentPage),
            pages: Number(data.data.pagination.pages),
          });
        }
      } else if (Array.isArray(data.data)) {
        setSubCategories(data.data);
      }
    } else {
      setSubCategories([]);
    }
  };

  // const iconSrc = getFullUrl(sub.icon);

  const debouncedFetch = useCallback(
    debounce((query, catId) => {
      getSubCategories(query, catId, 1);
    }, 500),
    [],
  );

  useEffect(() => {
    getSubCategories();
  }, []);

  // ✅ Refresh Handler
  const handleRefresh = () => {
    getSubCategories(searchQuery, selectedCategory, pagination.currentPage);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedFetch(value, selectedCategory);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSearchQuery("");
    getSubCategories("", value, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      getSubCategories(searchQuery, selectedCategory, newPage);
    }
  };

  const handleEditClick = (sub, mode = "all") => {
    setSelectedSubCategory(sub);
    setEditMode(mode);
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (sub) => {
    setViewSubCategory(sub);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (sub) => {
    setSubCategoryToDelete(sub);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subCategoryToDelete) return;

    setDeleting(true);

    const { data, error } = await deleteSubCat({
      method: "DELETE",
      url: `/admin/categories/delete-subcategory?subcategoryId=${subCategoryToDelete._id}`,
      authRequired: true,
    });

    setDeleting(false);

    if (error) {
      showToast("error", error || "Failed to delete");
    } else {
      showToast("success", data?.message || "Deleted successfully");
      setIsDeleteDialogOpen(false);
      setSubCategoryToDelete(null);
      getSubCategories(searchQuery, selectedCategory, pagination.currentPage);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load subcategories: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 items-center">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 h-9 bg-white w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="h-9 bg-white w-full">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="w-3.5 h-3.5" />
                  <SelectValue placeholder="Filter by Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories &&
                  categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name.replace("_", " ")}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
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

          <Button
            className="w-full sm:w-auto gap-2 shadow-sm flex-1 sm:flex-none"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />{" "}
            <span className="sm:inline">Add Subcategory</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table className="min-w-[400px] md:min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50 h-11 hover:bg-gray-50/50">
                <TableHead className="w-auto md:w-[200px] font-semibold text-gray-600 pl-4">
                  Subcategory Name
                </TableHead>
                <TableHead className="font-semibold text-gray-600 hidden md:table-cell">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-gray-600 hidden lg:table-cell">
                  Description
                </TableHead>
                <TableHead className="font-semibold text-gray-600 hidden lg:table-cell">
                  Banner
                </TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-600 hidden md:table-cell">
                  Status
                </TableHead>
                <TableHead className="w-[80px] text-center font-semibold text-gray-600">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && subCategories.length === 0 ? (
                // Only show skeletons if no data exists (initial load), otherwise keep old data while refreshing with spinner
                [1, 2, 3].map((i) => (
                  <TableRow key={i} className="h-14">
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : subCategories.length > 0 ? (
                subCategories.map((sub) => {
                  const iconSrc = getFullUrl(sub.icon);
                  const bannerSrc = getFullUrl(sub.subCategoryBannerImage); // ✅ YE LINE YAHA ADD KARO

                  return (
                    <TableRow
                      key={sub._id}
                      className="h-auto md:h-14 hover:bg-gray-50/30 transition-colors group"
                    >
                      {/* Subcategory Name + Mobile Context */}
                      <TableCell className="font-medium text-gray-900 pl-4 align-top md:align-middle py-3">
                        <div className="flex items-start md:items-center gap-3">
                          <div
                            className="relative cursor-pointer group/icon w-8 h-8 shrink-0 mt-0.5 md:mt-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(sub, "icon");
                            }}
                          >
                            {iconSrc ? (
                              <Image
                                src={iconSrc}
                                alt={sub.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full text-blue-600 flex items-center justify-center">
                                <FolderTree className="w-4 h-4" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 hidden group-hover/icon:flex items-center justify-center text-white">
                              <Pencil className="w-3 h-3" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{sub.name}</span>
                              {/* Mobile Name Edit Pencil */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(sub, "name");
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Mobile Only: Show Category & Status underneath */}
                            <div className="flex flex-col gap-1 md:hidden">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Layers className="w-3 h-3" />
                                {sub.categoryId?.name
                                  ? sub.categoryId.name.replace("_", " ")
                                  : categories
                                      .find((c) => c._id === sub.categoryId)
                                      ?.name.replace("_", " ") || "N/A"}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    sub.isActive ? "default" : "secondary"
                                  }
                                  className={`font-normal h-4 text-[10px] px-1.5 w-fit ${
                                    sub.isActive
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {sub.isActive ? "Active" : "Inactive"}
                                </Badge>

                                {/* Mobile Description + Edit Pencil */}
                                <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 max-w-full">
                                  <span
                                    className="text-[10px] text-gray-500 truncate block max-w-[220px]"
                                    title={sub.description}
                                  >
                                    {sub.description || "No description"}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 text-gray-400 hover:text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(sub, "description");
                                    }}
                                  >
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                </div>

                                {/* Banner Preview */}
                                <div
                                  className="relative cursor-pointer group/banner w-full h-14 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(sub, "banner");
                                  }}
                                >
                                  {bannerSrc ? (
                                    <Image
                                      src={bannerSrc}
                                      alt={sub.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] text-gray-400">
                                      No banner
                                    </span>
                                  )}

                                  <div className="absolute inset-0 bg-black/40 hidden group-hover/banner:flex items-center justify-center text-white">
                                    <Pencil className="w-3 h-3" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Desktop: Category Column */}
                      <TableCell className="text-gray-600 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          <span className="capitalize">
                            {sub.categoryId?.name
                              ? sub.categoryId.name.replace("_", " ")
                              : categories
                                  .find((c) => c._id === sub.categoryId)
                                  ?.name.replace("_", " ") || "N/A"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Desktop: Description Column */}
                      <TableCell className="text-gray-500 max-w-xs hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span title={sub.description}>
                            {sub.description
                              ? sub.description.split(" ").slice(0, 3).join(" ")
                              : "No description"}
                            {sub.description &&
                            sub.description.split(" ").length > 3
                              ? "…"
                              : ""}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 hover:bg-blue-50 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(sub, "description");
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Banner */}
                      <TableCell className="text-gray-500 max-w-xs hidden lg:table-cell">
                        <div className="flex flex-col gap-2 min-w-0">
                          <div
                            className="relative cursor-pointer group/banner w-10 h-10 rounded-md overflow-hidden border border-gray-100 bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(sub, "banner");
                            }}
                          >
                            {bannerSrc ? (
                              <Image
                                src={bannerSrc}
                                alt={sub.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                No banner
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 hidden group-hover/banner:flex items-center justify-center text-white">
                              <Pencil className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Desktop: Status Column */}
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={sub.isActive ? "default" : "secondary"}
                          className={`font-normal ${
                            sub.isActive
                              ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {sub.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell className="text-center align-top md:align-middle py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View details"
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewClick(sub)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(sub)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <FolderTree className="w-8 h-8 opacity-20" />
                      <p>No subcategories found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-4 gap-4 sm:gap-0">
        <div className="text-xs text-muted-foreground order-2 sm:order-1">
          Page {pagination.currentPage} of {pagination.pages} (
          {pagination.total} items)
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
            className="h-8 gap-1 flex-1 sm:flex-none"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.pages || loading}
            className="h-8 gap-1 flex-1 sm:flex-none"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AddSubCategoryDialog
        open={isAddDialogOpen}
        setOpen={setIsAddDialogOpen}
        onSuccess={() => getSubCategories(searchQuery, selectedCategory, 1)}
      />
      <EditSubCategoryDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        subCategory={selectedSubCategory}
        fieldToEdit={editMode}
        onSuccess={() =>
          getSubCategories(
            searchQuery,
            selectedCategory,
            pagination.currentPage,
          )
        }
      />

      <ViewSubCategoryDialog
        open={isViewDialogOpen}
        setOpen={setIsViewDialogOpen}
        subCategory={viewSubCategory}
        categories={categories}
      />
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={() => setIsDeleteDialogOpen(false)}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Delete Subcategory?
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{subCategoryToDelete?.name}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSubCategoryToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
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
