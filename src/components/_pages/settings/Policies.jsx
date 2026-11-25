"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { FileText, Plus, Eye, Edit, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAxios from "@/hooks/useAxios";
import { useAuthUser } from "@/contexts/AuthContext";
import AddEditPolicyDialog from "@/components/_dialogs/AddEditPolicyDialog";
import ViewPolicyDialog from "@/components/_dialogs/ViewPolicyDialog";
import { ALLOWED_POLICIES } from "@/constants/settings.config";

const AUDIENCE_GROUPS = [
  {
    key: "customer",
    title: "Customer Policies",
    description: "Legal documents shown to customers",
    icon: Users,
  },
  {
    key: "staff",
    title: "Staff Policies",
    description: "Policies applicable to workers & transport vendors",
    icon: Briefcase,
  },
];

export default function Policies() {
  const { authUser } = useAuthUser();
  const { request } = useAxios();

  const [policies, setPolicies] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);

  /* ================================
   * FETCH POLICIES
   * ================================ */
  const fetchPolicies = useCallback(async () => {
    const res = await request({
      method: "GET",
      url: "/admin/static/get-all-content",
      authRequired: true,
    });

    const policyData =
      res?.data?.data?.filter((item) => item.type === "policy") || [];

    setPolicies(policyData);
  }, []);

  useEffect(() => {
    if (authUser?.token) fetchPolicies();
  }, [authUser?.token, fetchPolicies]);

  /* ================================
   * POLICY MAP (FAST LOOKUP)
   * ================================ */
  const policyMap = useMemo(() => {
    const map = {};
    policies.forEach((p) => {
      map[p.key] = p;
    });
    return map;
  }, [policies]);

  /* ================================
   * HANDLERS
   * ================================ */
  const handleAdd = (config) => {
    setSelectedConfig(config);
    setSelectedPolicy(null);
    setOpenForm(true);
  };

  const handleEdit = (policy, config) => {
    setSelectedPolicy(policy);
    setSelectedConfig(config);
    setOpenForm(true);
  };

  /* ================================
   * RENDER
   * ================================ */
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Policies</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Manage mandatory legal policies for customers and staff. Each policy
          can be configured once per audience.
        </p>
      </div>

      {AUDIENCE_GROUPS.map(({ key, title, description, icon: Icon }) => {
        const configs = ALLOWED_POLICIES.filter((p) =>
          p.key.startsWith(`${key}.`),
        );

        const completed = configs.filter((c) => policyMap[c.key]).length;

        return (
          <section key={key} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>

              <Badge variant="outline">
                {completed} / {configs.length} configured
              </Badge>
            </div>

            {/* Policy List */}
            <div className="divide-y rounded-lg border bg-white">
              {configs.map((config) => {
                const existing = policyMap[config.key];

                return (
                  <div
                    key={config.key}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{config.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Key: {config.key}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {existing ? (
                        <>
                          <Badge className="bg-green-100 text-green-800">
                            Configured
                          </Badge>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPolicy(existing);
                              setPreviewOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(existing, config)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleAdd(config)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Dialogs */}
      <AddEditPolicyDialog
        open={openForm}
        onOpenChange={setOpenForm}
        policyConfig={selectedConfig}
        initialPolicy={selectedPolicy}
        token={authUser?.token}
        onSuccess={fetchPolicies}
      />

      <ViewPolicyDialog
        open={previewOpen}
        policy={selectedPolicy}
        onOpenChange={() => setPreviewOpen(false)}
      />
    </div>
  );
}
