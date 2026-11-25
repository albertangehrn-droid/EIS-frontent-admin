"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAxios from "@/hooks/useAxios";
import { useAuthUser } from "@/contexts/AuthContext";
import AddEditOfferDialog from "@/components/_dialogs/AddEditOfferDialog";
import ViewOfferDialog from "@/components/_dialogs/ViewOfferDialog";
import OfferCard from "@/components/_cards/OfferCard";

export default function SpecialOffers() {
  const { authUser } = useAuthUser();
  const { request } = useAxios();

  const [offers, setOffers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [previewOffer, setPreviewOffer] = useState(null);
  const [editOffer, setEditOffer] = useState(null);

  useEffect(() => {
    if (authUser?.token) fetchOffers();
  }, [authUser]);

  const fetchOffers = async () => {
    const res = await request({
      method: "GET",
      url: "/admin/static/get-all-content",
      authRequired: true,
    });

    setOffers(
      res.data?.data?.filter((i) => i.type === "offer") || []
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Special Offers</h2>
          <p className="text-sm text-muted-foreground">
            Manage promotional offers visible on the home screen.
          </p>
        </div>

        <Button onClick={() => setOpenForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Offer
        </Button>
      </div>

      {/* Offers Grid */}
      {offers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers
            .sort((a, b) => a.order - b.order)
            .map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                onView={() => setPreviewOffer(offer)}
                onEdit={() => setEditOffer(offer)}
                onRefresh={fetchOffers}
              />
            ))}
        </div>
      )}

      {/* Dialogs */}
      <AddEditOfferDialog
        open={openForm || !!editOffer}
        initialOffer={editOffer}
        onOpenChange={() => {
          setOpenForm(false);
          setEditOffer(null);
        }}
        token={authUser?.token}
        onSuccess={fetchOffers}
      />

      <ViewOfferDialog
        open={!!previewOffer}
        offer={previewOffer}
        onOpenChange={() => setPreviewOffer(null)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed rounded-lg py-16 text-center text-muted-foreground">
      No offers created yet. Click <strong>Add Offer</strong> to get started.
    </div>
  );
}
