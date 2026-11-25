"use client";

import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import BannerSection from "@/components/_cards/BannerSection";
import { BANNER_TYPES } from "@/constants/settings.config";

export default function Banners() {
  const { request } = useAxios();
  const [banners, setBanners] = useState([]);

  const fetchBanners = async () => {
    const res = await request({
      method: "GET",
      url: "/admin/static/get-all-content?type=banner",
      authRequired: true,
    });

    setBanners(res.data?.data || []);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold">Banner Management</h2>
        <p className="text-sm text-muted-foreground">
          Control banners across placements.
        </p>
      </div>

      {BANNER_TYPES.map((type) => (
        <BannerSection
          key={type.bannerFor}
          config={type}
          banners={banners.filter(
            (b) => b.target?.placement === type.placement,
          )}
          onRefresh={fetchBanners}
          onUpdate={(id, updatedData) => {
            setBanners((prev) =>
              prev.map((b) => (b._id === id ? { ...b, ...updatedData } : b)),
            );
          }}
          onDelete={(id) => {
            setBanners((prev) => prev.filter((b) => b._id !== id));
          }}
          onToggle={(id, newStatus) => {
            setBanners((prev) =>
              prev.map((b) =>
                b._id === id ? { ...b, isActive: newStatus } : b,
              ),
            );
          }}
        />
      ))}
    </div>
  );
}
