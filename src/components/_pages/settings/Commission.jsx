"use client";

import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCw, Pencil, Plus } from "lucide-react";
import { showToast } from "@/components/_ui/toast-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Commission() {
  const { request, loading } = useAxios();

  const [commission, setCommission] = useState(null);
  const [noCommissionMsg, setNoCommissionMsg] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [mode, setMode] = useState("add");
  const [percentage, setPercentage] = useState("");

  // Fetch current commission
  const fetchCommission = async () => {
    const { data, error } = await request({
      method: "GET",
      url: "/admin/commission/current",
      authRequired: true,
    });

    if (error) {
      setCommission(null);
      setNoCommissionMsg(error || "No active commission rate is set.");
      setPercentage("");
      return;
    }

    if (data?.success) {
      setCommission(data.data);
      setPercentage(String(data.data.percentage));
      setNoCommissionMsg("");
    }
  };

  useEffect(() => {
    fetchCommission();
  }, []);

  // Combined save handler for add & edit
  const handleSave = async () => {
    const value = Number(percentage.trim());

    if (!percentage.trim() || isNaN(value) || value < 0 || value > 100) {
      showToast("error", "Please enter a valid percentage (0–100)");
      return;
    }

    const endpoint = mode === "add" ? "/admin/commission/add" : "/admin/commission/update";
    const method = mode === "add" ? "POST" : "PUT";
    const successMsg = mode === "add" ? "Commission added" : "Commission updated";

    const { data, error } = await request({
      method,
      url: endpoint,
      authRequired: true,
      payload: { percentage: value },
    });

    if (error) {
      showToast("error", error);
      return;
    }

    if (data?.success) {
      showToast("success", data.message || successMsg);
      setCommission(data.data);
      setPercentage(String(data.data.percentage));
      setNoCommissionMsg("");
      setOpenPopup(false);
    }
  };

  // Loading state
  if (loading && !commission && !noCommissionMsg) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-44 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commission Rate</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Set and manage the platform-wide commission percentage
          </p>
        </div>

        <div className="flex items-center gap-3">
          {commission && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchCommission}
              disabled={loading}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}

          {commission ? (
            <Button
              className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
              onClick={() => {
                setMode("edit");
                setPercentage(String(commission.percentage));
                setOpenPopup(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit Rate
            </Button>
          ) : (
            <Button
              className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
              onClick={() => {
                setMode("add");
                setPercentage("");
                setOpenPopup(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Set Commission
            </Button>
          )}
        </div>
      </div>

      {/* No commission warning */}
      {!commission && noCommissionMsg && (
        <div className="rounded-xl border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          {noCommissionMsg}
        </div>
      )}

      {/* Commission info card */}
      {commission && (
        <Card className="border-border/50 shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/95">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Active Commission</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-3 pb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {commission.percentage}%
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant="outline"
                className={
                  commission.isActive
                    ? "bg-emerald-950/40 text-emerald-800 border-emerald-600/50 px-3 py-1 text-xs font-medium"
                    : "bg-rose-950/40 text-rose-400 border-rose-800/50 px-3 py-1 text-xs font-medium"
                }
              >
                {commission.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium text-foreground">{getTimeAgo(commission.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openPopup} onOpenChange={setOpenPopup}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-card/90 border-border/60">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {mode === "add" ? "Set Commission Rate" : "Update Commission Rate"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {mode === "add"
                ? "Define the commission percentage applied across the platform."
                : "Modify the current commission rate."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-5">
            <div className="space-y-2">
              <label htmlFor="percentage" className="text-sm font-medium">
                Percentage
              </label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="12.5"
                  className="pr-10 bg-muted/40 border-border/70 focus-visible:ring-1 focus-visible:ring-primary/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a value between 0 and 100
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpenPopup(false)}
              className="border-border/70 hover:bg-muted/70"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="min-w-[100px] bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const d = new Date(date);

  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  const months =
    (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();

  if (months >= 1) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  return `${diffDays} days ago`;
}