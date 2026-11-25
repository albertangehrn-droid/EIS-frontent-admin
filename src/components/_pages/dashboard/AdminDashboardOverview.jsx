"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAxios from "@/hooks/useAxios";

import {
  ArrowUpRight,
  CircleDollarSign,
  ClipboardList,
  RefreshCw,
  Users,
  UserCog,
} from "lucide-react";

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();

  const meta =
    normalized === "completed"
      ? {
          label: "Completed",
          className: "border-emerald-500/40 text-emerald-600 bg-emerald-500/5",
        }
      : normalized === "pending" || normalized === "pending_assignment"
        ? {
            label:
              normalized === "pending_assignment"
                ? "Pending assignment"
                : "Pending",
            className: "border-amber-500/40 text-amber-600 bg-amber-500/5",
          }
        : normalized === "cancelled" || normalized === "canceled"
          ? {
              label: "Cancelled",
              className: "border-red-500/40 text-red-600 bg-red-500/5",
            }
          : normalized === "in_progress"
            ? {
                label: "In progress",
                className: "border-sky-500/40 text-sky-600 bg-sky-500/5",
              }
            : {
                label: status || "-",
                className:
                  "border-muted-foreground/20 text-muted-foreground bg-muted/40",
              };

  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-[10px] font-medium inline-flex items-center justify-center",
        meta.className,
      ].join(" ")}
      title={meta.label}
    >
      {meta.label}
    </span>
  );
}

function AdminDashboardOverview() {
  const router = useRouter();
  const { request: apiRequest, loading } = useAxios();
  const [analytics, setAnalytics] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [orderTab, setOrderTab] = useState("worker");
  const [range, setRange] = useState("today"); // UI-only for now (API doesn't take range yet)
  const [sideSection, setSideSection] = useState("health"); // "health" | "joins" | "insights"

  const fetchAnalytics = async () => {
    setFetchError(null);

    const { data, error } = await apiRequest({
      method: "GET",
      url: "/admin/reports-analytics/analytics",
      authRequired: true,
      params: {
        sections: "overview,orders,staff,customers,services,transportBookings",
      },
    });

    if (error || !data?.success) {
      setFetchError(error || data?.message || "Failed to fetch analytics");
      setAnalytics(null);
      return;
    }

    setAnalytics(data);
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = analytics?.data?.overview?.kpis;
  const orderStats = kpis?.orders || {};
  const staffStats = kpis?.staff || {};

  const recentOrders = analytics?.data?.overview?.recent?.orders || [];
  const recentStaff = analytics?.data?.overview?.recent?.staff || [];
  const recentCustomers = analytics?.data?.overview?.recent?.customers || [];
  const orderTimeline = analytics?.data?.orders?.timeline || [];
  const statusBreakdown = analytics?.data?.orders?.statusBreakdown || [];
  const frequentCustomers = analytics?.data?.customers?.frequentCustomers || [];
  const popularServices = analytics?.data?.services?.popularServices || [];
  const recentTransportOrders =
    analytics?.data?.transportBookings?.recentBookings || [];

  const workerCommissionValue = Number(
    kpis?.workerAdminCommission ?? kpis?.adminCommission ?? 0,
  );
  const transportCommissionValue = Number(kpis?.transportAdminCommission ?? 0);
  const totalCommissionValue = workerCommissionValue + transportCommissionValue;

  const inr = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    [],
  );

  const number = useMemo(() => new Intl.NumberFormat("en-IN"), []);

  const timelineMax = useMemo(() => {
    return Math.max(
      1,
      ...orderTimeline
        .map((x) => Number(x?.count || 0))
        .filter((n) => Number.isFinite(n)),
    );
  }, [orderTimeline]);

  const quickStats = useMemo(() => {
    const items = [
      {
        label: "Total orders",
        value: number.format(Number(kpis?.totalOrders || 0)),
        chip: "All time",
        icon: ClipboardList,
        accent: "from-sky-500/10 via-indigo-500/5 to-transparent",
      },
      {
        label: "Completed",
        value: number.format(Number(kpis?.orders?.completedOrders || 0)),
        chip: "Delivered/Done",
        icon: ArrowUpRight,
        accent: "from-emerald-500/10 via-sky-500/5 to-transparent",
      },
      {
        label: "Customers",
        value: number.format(Number(kpis?.totalCustomers || 0)),
        chip: "Active base",
        icon: Users,
        accent: "from-purple-500/10 via-indigo-500/5 to-transparent",
      },
      {
        label: "Staff",
        value: number.format(Number(kpis?.totalStaff || 0)),
        chip: "Workers & vendors",
        icon: UserCog,
        accent: "from-amber-500/10 via-orange-500/5 to-transparent",
      },
    ];

    // Keep commission separate so layout stays nice on small screens
    const revenue = {
      label: "Admin Commission",
      value: inr.format(totalCommissionValue),
      chip: "Net to platform",
      icon: CircleDollarSign,
      accent: "from-emerald-500/10 via-lime-500/5 to-transparent",
    };

    return { items, revenue };
  }, [inr, kpis, number, totalCommissionValue]);

  const formatWhen = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Live snapshot of Majdoor Mitra operations — workers, services,
            orders, and customers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* <Tabs value={range} onValueChange={setRange}>
            <TabsList className="h-8 gap-0 rounded-full bg-muted px-0 text-[11px]">
              <TabsTrigger
                value="today"
                className="rounded-full px-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                value="week"
                className="rounded-full px-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Week
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="rounded-full px-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs> */}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
            className="h-8 rounded-full px-3 text-[11px] font-medium"
          >
            <RefreshCw
              className={[
                "mr-2 h-3.5 w-3.5",
                loading ? "animate-spin" : "",
              ].join(" ")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error / hint */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-[11px] text-muted-foreground">
          Range filter is UI-only for now (backend doesn't expose range yet).
        </div>
        {fetchError ? (
          <div className="text-[11px] text-red-600">
            {fetchError}{" "}
            <button
              className="underline"
              onClick={fetchAnalytics}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {quickStats.items.map((s) => {
          const Icon = s.icon;

          return (
            <Card key={s.label} className="relative overflow-hidden">
              <div
                className={[
                  "absolute inset-0 bg-gradient-to-br",
                  s.accent,
                ].join(" ")}
              />

              <CardContent className="relative flex flex-col gap-2 p-3">
                {/* header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border bg-background/70">
                      <Icon className="h-4 w-4 text-foreground/70" />
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {s.label}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[10px] font-normal"
                  >
                    {s.chip}
                  </Badge>
                </div>

                {/* main value */}
                <div className="flex flex-col gap-2">
                  {/* ✅ Show main value only for Completed & Customers */}
                  {(s.label === "Completed" || s.label === "Customers") && (
                    <span className="text-lg font-semibold">
                      {loading && !analytics ? "—" : s.value}
                    </span>
                  )}

                  {/* 🔹 Orders mini breakdown */}
                  {s.label === "Total orders" && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="rounded-md bg-muted/40 px-2 py-1 text-center">
                        <p className="text-[10px] text-muted-foreground">
                          Worker
                        </p>
                        <p className="text-xs font-semibold">
                          {number.format(Number(orderStats?.totalOrders || 0))}
                        </p>
                      </div>

                      <div className="rounded-md bg-muted/40 px-2 py-1 text-center">
                        <p className="text-[10px] text-muted-foreground">
                          Transport
                        </p>
                        <p className="text-xs font-semibold">
                          {number.format(
                            Number(orderStats?.totalTransportBookings || 0),
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 🔹 Staff mini breakdown */}
                  {s.label === "Staff" && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="rounded-md bg-muted/40 px-2 py-1 text-center">
                        <p className="text-[10px] text-muted-foreground">
                          Workers
                        </p>
                        <p className="text-xs font-semibold">
                          {number.format(Number(staffStats?.worker || 0))}
                        </p>
                      </div>

                      <div className="rounded-md bg-muted/40 px-2 py-1 text-center">
                        <p className="text-[10px] text-muted-foreground">
                          Vendors
                        </p>
                        <p className="text-xs font-semibold">
                          {number.format(
                            Number(staffStats?.transportVendor || 0),
                          )}
                        </p>
                      </div>

                      <div className="rounded-md bg-muted/40 px-2 py-1 text-center">
                        <p className="text-[10px] text-muted-foreground">
                          Drivers
                        </p>
                        <p className="text-xs font-semibold">
                          {number.format(
                            Number(staffStats?.transportDriver || 0),
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Admin Commission */}
        <Card className="relative overflow-hidden md:col-span-2 xl:col-span-1">
          <div
            className={[
              "absolute inset-0 bg-gradient-to-br",
              quickStats.revenue.accent,
            ].join(" ")}
          />
          <CardContent className="relative flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border bg-background/70">
                  <CircleDollarSign className="h-4 w-4 text-foreground/70" />
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {quickStats.revenue.label}
                </span>
              </div>

              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] font-normal"
              >
                {quickStats.revenue.chip}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">
                {loading && !analytics ? "—" : quickStats.revenue.value}
              </span>
              <span className="text-[10px] text-muted-foreground">INR</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-md bg-muted/40 px-2 py-1 text-center">
                <p className="text-[10px] text-muted-foreground">Worker</p>
                <p className="text-xs font-semibold">
                  {inr.format(Number(workerCommissionValue || 0))}
                </p>
              </div>

              <div className="rounded-md bg-muted/40 px-2 py-1 text-center">
                <p className="text-[10px] text-muted-foreground">Transport</p>
                <p className="text-xs font-semibold">
                  {inr.format(Number(transportCommissionValue || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower grid */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        {/* Recent orders */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                {[
                  { key: "worker", label: "Worker Orders" },
                  { key: "transport", label: "Transport Orders" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setOrderTab(tab.key)}
                    className={[
                      "px-3 py-1 rounded-full text-xs font-medium transition",
                      orderTab === tab.key
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px]"
                onClick={() =>
                  router.push(
                    orderTab === "worker"
                      ? "/admin/orders"
                      : "/admin/orders?tab=transport",
                  )
                }
              >
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-72">
              <div className="divide-y">
                {(loading && !analytics
                  ? Array.from({ length: 5 })
                  : orderTab === "worker"
                    ? recentOrders
                    : recentTransportOrders
                ).map((b, idx) => (
                  <div
                    key={
                      loading && !analytics
                        ? `sk-${idx}`
                        : b?._id || b?.orderNumber || idx
                    }
                    className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs hover:bg-muted/60"
                  >
                    {loading && !analytics ? (
                      <div className="flex w-full items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                    ) : orderTab === "worker" ? (
                      /* ================= WORKER ORDER ROW ================= */
                      <>
                        <div className="flex flex-1 items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-[11px] font-semibold">
                            OR
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate text-[12px] font-medium">
                                {b?.orderNumber || "-"}
                              </span>
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[10px] font-normal"
                              >
                                {Array.isArray(b?.orderItems)
                                  ? `${b.orderItems.length} items`
                                  : "Order"}
                              </Badge>
                            </div>

                            <span className="truncate text-[11px] text-muted-foreground">
                              {b?.customerId?.fullName || "Customer"}
                              {b?.customerId?.mobile
                                ? ` • ${b.customerId.mobile}`
                                : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 text-right shrink-0">
                          <StatusPill status={b?.status} />
                          <span className="text-[11px] text-muted-foreground">
                            {formatWhen(b?.createdAt)}
                          </span>
                        </div>

                        <div className="ml-2 w-24 text-right text-[12px] font-semibold shrink-0">
                          {inr.format(Number(b?.pricingSummary?.total || 0))}
                        </div>
                      </>
                    ) : (
                      /* ================= TRANSPORT ORDER ROW ================= */
                      <>
                        <div className="flex flex-1 items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-[11px] font-semibold">
                            TR
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[12px] font-medium">
                              {b?.orderNumber || "-"}
                            </span>

                            <span className="truncate text-[11px] text-muted-foreground">
                              {b?.customerId?.fullName || "Customer"}
                              {b?.distanceKm ? ` • ${b.distanceKm} km` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 text-right shrink-0">
                          <StatusPill status={b?.bookingStatus} />
                          <span className="text-[11px] text-muted-foreground">
                            {formatWhen(b?.createdAt)}
                          </span>
                        </div>

                        <div className="ml-2 w-24 text-right text-[12px] font-semibold shrink-0">
                          {inr.format(Number(b?.totalPrice || 0))}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {!loading &&
                  analytics &&
                  (orderTab === "worker"
                    ? recentOrders.length === 0
                    : recentTransportOrders.length === 0) && (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                      No orders found.
                    </div>
                  )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right column: tabbed sections to keep things compact */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold">
                  {sideSection === "health"
                    ? "Order health"
                    : sideSection === "joins"
                      ? "Recent joins"
                      : "Insights"}
                </CardTitle>
                <div className="flex items-center gap-1 rounded-full bg-muted px-1 py-0.5">
                  {[
                    { key: "health", label: "Health" },
                    { key: "joins", label: "Joins" },
                    { key: "insights", label: "Insights" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSideSection(tab.key)}
                      className={[
                        "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                        sideSection === tab.key
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-[11px]">
              {sideSection === "health" && (
                <>
                  {/* Activity bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        Orders (last days)
                      </span>
                      <span className="font-medium">
                        {number.format(
                          orderTimeline.reduce(
                            (acc, x) => acc + Number(x?.count || 0),
                            0,
                          ),
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400"
                        style={{
                          width: `${
                            orderTimeline.length
                              ? Math.min(
                                  100,
                                  orderTimeline.reduce(
                                    (acc, x) => acc + Number(x?.count || 0),
                                    0,
                                  ) * 20,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Status breakdown
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => router.push("/admin/orders")}
                      >
                        Manage
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      {(statusBreakdown.length ? statusBreakdown : []).map(
                        (s) => (
                          <div
                            key={s?._id}
                            className="flex items-center justify-between rounded-lg border bg-muted/30 px-2.5 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <StatusPill status={s?._id} />
                              <span className="text-[11px] text-muted-foreground">
                                {String(s?._id || "-").replace(/_/g, " ")}
                              </span>
                            </div>
                            <span className="text-[12px] font-semibold">
                              {number.format(Number(s?.count || 0))}
                            </span>
                          </div>
                        ),
                      )}

                      {!loading && analytics && statusBreakdown.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">
                          No status data.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              )}

              {sideSection === "joins" && (
                <div className="space-y-3 text-xs">
                  {/* Staff */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Staff
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => router.push("/admin/staff")}
                      >
                        View
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(recentStaff.length ? recentStaff : [])
                        .slice(0, 3)
                        .map((a) => (
                          <div
                            key={a?._id}
                            className="flex items-center justify-between rounded-lg border bg-muted/40 p-2.5"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background/60 text-[11px] font-semibold">
                                {String(a?.fullName || "S")
                                  .split(" ")
                                  .map((x) => x[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-[12px] font-medium">
                                  {a?.fullName || "-"}
                                </span>
                                <span className="truncate text-[11px] text-muted-foreground">
                                  {a?.role
                                    ? String(a.role).replace(/_/g, " ")
                                    : "staff"}{" "}
                                  {a?.mobile ? `• ${a.mobile}` : ""}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px] font-normal"
                            >
                              new
                            </Badge>
                          </div>
                        ))}
                      {!loading && analytics && recentStaff.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">
                          No recent staff.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Customers */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Customers
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => router.push("/admin/customers")}
                      >
                        View
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(recentCustomers.length ? recentCustomers : [])
                        .slice(0, 3)
                        .map((c) => (
                          <div
                            key={c?._id}
                            className="flex items-center justify-between rounded-lg border bg-muted/40 p-2.5"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background/60 text-[11px] font-semibold">
                                {String(c?.fullName || "C")
                                  .split(" ")
                                  .map((x) => x[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-[12px] font-medium">
                                  {c?.fullName || "-"}
                                </span>
                                <span className="truncate text-[11px] text-muted-foreground">
                                  {c?.mobile ? c.mobile : "-"}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px] font-normal"
                            >
                              new
                            </Badge>
                          </div>
                        ))}
                      {!loading && analytics && recentCustomers.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">
                          No recent customers.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {sideSection === "insights" && (
                <div className="space-y-3">
                  {/* Popular services */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Popular services
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() =>
                          router.push(
                            "/admin/settings?tab=configure&section=services",
                          )
                        }
                      >
                        Manage
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      {popularServices.slice(0, 3).map((s) => (
                        <div
                          key={s?._id}
                          className="flex items-center justify-between rounded-lg border bg-muted/30 px-2.5 py-2"
                        >
                          <span className="truncate font-medium">
                            {s?.serviceName || "-"}
                          </span>
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px] font-normal"
                          >
                            {number.format(Number(s?.bookings || 0))} bookings
                          </Badge>
                        </div>
                      ))}
                      {!loading && analytics && popularServices.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">
                          No service insights yet.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Frequent customers */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Frequent customers
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => router.push("/admin/customers")}
                      >
                        View
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      {frequentCustomers.slice(0, 3).map((c) => (
                        <div
                          key={c?._id}
                          className="flex items-center justify-between rounded-lg border bg-muted/30 px-2.5 py-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {c?.name || "-"}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {c?.mobile || "-"} •{" "}
                              {number.format(Number(c?.totalOrders || 0))}{" "}
                              orders
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-semibold">
                              {inr.format(Number(c?.totalSpent || 0))}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              spent
                            </div>
                          </div>
                        </div>
                      ))}
                      {!loading &&
                      analytics &&
                      frequentCustomers.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">
                          No repeat-customer data yet.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardOverview;
