"use client";

import React, { useEffect, useState } from "react";
import { useCategory } from "@/contexts/categoryContext"; 
import useAxios from "@/hooks/useAxios"; 
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
import { ChevronDown, ChevronRight, CornerDownRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FolderTree } from "lucide-react";

export default function Categories() {
  const { categories } = useCategory(); 
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (categoryId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (!categories) {
      return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    // Mobile: Added overflow-x-auto to handle very narrow screens without breaking layout
    <div className="rounded-md border bg-white shadow-sm w-full overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[400px] md:min-w-full">
            <TableHeader>
            <TableRow className="bg-muted/50 h-10 hover:bg-muted/50">
                <TableHead className="w-[40px] px-2"></TableHead>
                <TableHead className="py-2">Category Name</TableHead>
                {/* Mobile: Hide Description Column */}
                <TableHead className="py-2 hidden md:table-cell">Description</TableHead>
                <TableHead className="py-2 w-[80px] md:w-[100px]">Status</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {categories.length > 0 ? (
                categories.map((cat) => (
                <React.Fragment key={cat._id}>
                    {/* Main Category Row */}
                    <TableRow 
                    className={`cursor-pointer transition-colors border-b h-12 ${expandedRows[cat._id] ? "bg-muted/30 border-b-0" : "hover:bg-muted/10"}`}
                    onClick={() => toggleRow(cat._id)}
                    >
                    <TableCell className="px-2 py-2 text-center align-top md:align-middle">
                        <Button variant="ghost" size="icon" className="h-6 w-6 mt-1 md:mt-0">
                        {expandedRows[cat._id] ? (
                            <ChevronDown className="h-4 w-4 opacity-70" />
                        ) : (
                            <ChevronRight className="h-4 w-4 opacity-70" />
                        )}
                        </Button>
                    </TableCell>
                    
                    <TableCell className="py-2 align-top md:align-middle">
                        <div className="flex flex-col">
                            <span className="font-semibold capitalize text-sm">
                                {cat.name.replace("_", " ")}
                            </span>
                            {/* Mobile: Show description under name since column is hidden */}
                            <span className="text-xs text-muted-foreground md:hidden line-clamp-1 mt-0.5">
                                {cat.description}
                            </span>
                        </div>
                    </TableCell>

                    {/* Desktop: Show Description Column */}
                    <TableCell className="text-muted-foreground text-sm py-2 truncate max-w-[300px] hidden md:table-cell">
                        {cat.description}
                    </TableCell>

                    <TableCell className="py-2 align-top md:align-middle">
                        <Badge
                        variant={cat.isActive ? "default" : "secondary"}
                        className={`h-5 text-[10px] px-2 whitespace-nowrap ${
                            cat.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                        >
                        {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </TableCell>
                    </TableRow>

                    {/* Subcategories Nested Row */}
                    {expandedRows[cat._id] && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20 shadow-inner">
                        <TableCell colSpan={4} className="p-0 border-b">
                            {/* Mobile: Reduced padding (pl-2 vs pl-12) to save space */}
                            <div className="pl-2 pr-2 md:pl-12 md:pr-4 py-3 flex gap-2 md:gap-3">
                                <div className="w-[2px] bg-indigo-100 rounded-full my-1 flex-shrink-0"></div>
                                <div className="w-full overflow-hidden">
                                    <SubCategoryList categoryId={cat._id} />
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                    )}
                </React.Fragment>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="w-8 h-8 opacity-20" />
                        <span>No categories found.</span>
                    </div>
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- Subcategory Component ---
function SubCategoryList({ categoryId }) {
  const { request: fetchSubCats, loading, error } = useAxios();
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const getSubCategories = async () => {
      const { data } = await fetchSubCats({
        method: "GET",
        url: `/admin/categories/get-subcategories`, 
        authRequired: true,
      });

      if (data?.success && data?.data?.result) {
        const filtered = data.data.result.filter(sub => {
          const subCatId = typeof sub.categoryId === 'object' && sub.categoryId !== null 
            ? sub.categoryId._id 
            : sub.categoryId;
            
          return subCatId === categoryId;
        });
        
        setSubCategories(filtered);
      }
    };

    getSubCategories();
  }, [categoryId]);

  if (loading) return (
      <div className="py-2 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
      </div>
  );
  
  if (error) return <div className="py-2 text-xs text-red-500">Error loading subcategories.</div>;

  if (subCategories.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm italic">
        <CornerDownRight className="w-4 h-4 opacity-50" />
        No subcategories found.
      </div>
    );
  }

  return (
    <div className="w-full">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
        Subcategories
      </h4>
      <div className="rounded-md border bg-white overflow-hidden">
        {/* Mobile: Added overflow-x-auto for the inner table as well */}
        <div className="overflow-x-auto">
            <Table className="min-w-[300px]">
            <TableHeader>
                <TableRow className="h-8 bg-gray-50/50 hover:bg-gray-50/50 border-b">
                <TableHead className="h-8 text-xs font-medium text-muted-foreground pl-4">Name</TableHead>
                {/* Mobile: Hide Description in nested table too */}
                <TableHead className="h-8 text-xs font-medium text-muted-foreground hidden sm:table-cell">Description</TableHead>
                <TableHead className="h-8 text-xs font-medium text-muted-foreground w-[80px]">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subCategories.map((sub) => (
                <TableRow key={sub._id} className="h-auto py-2 border-b last:border-0 hover:bg-gray-50/30">
                   <TableCell className="py-2 text-sm font-medium pl-4 align-top">
  <div className="flex items-start gap-3">
    {/* ICON */}
    <div className="w-7 h-7 shrink-0 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
      {sub.icon ? (
        <Image
          src={sub.icon}
          alt={sub.name}
          width={28}
          height={28}
          className="w-full h-full object-cover"
        />
      ) : (
        <FolderTree className="w-4 h-4 text-blue-600" />
      )}
    </div>

    {/* NAME + MOBILE DESC */}
    <div className="flex flex-col">
      <span className="capitalize">{sub.name}</span>

      {/* Mobile only description */}
      <span className="text-[10px] text-muted-foreground sm:hidden font-normal line-clamp-1">
        {sub.description}
      </span>
    </div>
  </div>
</TableCell>
                    {/* Desktop: Show Description Column */}
                    <TableCell className="py-2 text-xs text-muted-foreground hidden sm:table-cell">
                        {sub.description}
                    </TableCell>
                    <TableCell className="py-2 align-top">
                    <Badge variant="outline" className={`h-4 text-[10px] px-1.5 font-normal whitespace-nowrap ${
                        sub.isActive ? "text-green-600 border-green-200 bg-green-50/50" : "text-gray-500 bg-gray-50"
                    }`}>
                        {sub.isActive ? "Active" : "Inactive"}
                    </Badge>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
