// "use client";

// import { useEffect, useMemo, useState } from "react";
// import axiosInstance from "@/utils/axiosInstance";
// import { useAuthUser } from "@/contexts/AuthContext";
// import SimulationHeader from '@/components/common/SimulationHeader';
// import SimulationFooter from '@/components/common/SimulationFooter';
// import GameButton from '@/components/Buttons/GameButton';
// import { useSoundContext } from '@/contexts/SoundContext';
// import { useRouter, useSearchParams } from 'next/navigation';




// const emptyForm = {
//   accessType: "team",
//   teamName: "",
//   userName: "",
//   email: "",
//   password: "",
//   accessActive: true,
//   approvalStatus: "approved",
//   subscriptionStatus: "active",
//   expiresAt: "",
//   invitationCode: "",
//   notes: "",
// };

// export default function TeamAccessPage() {
//   const { authUser } = useAuthUser();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const [generatedPassword, setGeneratedPassword] = useState("");
//   const [form, setForm] = useState(emptyForm);
//   const { playClickSound } = useSoundContext();
//   const from = searchParams.get('from') || 'playDemo';

//   // const backDestination = from === 'starting' ? '/' : '/playDemo';





//   const stats = useMemo(() => {
//     return {
//       total: records.length,
//       active: records.filter((record) => record.accessActive).length,
//       pending: records.filter(
//         (record) => record.approvalStatus === "pending"
//       ).length,
//       expired: records.filter(
//         (record) => record.subscriptionStatus === "expired"
//       ).length,
//     };
//   }, [records]);

//   // ADD THIS FUNCTION INSIDE TeamAccessPage COMPONENT
//   const generatePassword = () => {
//     const chars =
//       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$_";

//     let password = "";

//     for (let i = 0; i < 12; i++) {
//       password += chars.charAt(
//         Math.floor(Math.random() * chars.length)
//       );
//     }

//     setForm((current) => ({
//       ...current,
//       password,
//     }));
//   };

//   const loadRecords = async () => {
//     setLoading(true);

//     try {
//       const response = await axiosInstance.get("/admin/team-access");

//       setRecords(response.data?.data?.teamAccess || []);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRecords();
//   }, []);

//   const handleChange = (field, value) => {
//     setForm((current) => ({
//       ...current,
//       [field]: value,
//     }));
//   };

//   const handleCreate = async (event) => {
//     event.preventDefault();

//     setSaving(true);
//     setMessage("");
//     setGeneratedPassword("");

//     try {
//       const payload = {
//         ...form,
//         expiresAt: form.expiresAt || null,
//         password: form.password || undefined,
//       };

//       const response = await axiosInstance.post(
//         "/admin/team-access",
//         payload
//       );

//       const created = response.data?.data?.teamAccess;
//       const password = response.data?.data?.generatedPassword;

//       setGeneratedPassword(password || "");
//       setMessage("Access record created successfully.");

//       setForm(emptyForm);

//       if (created) {
//         setRecords((current) => [created, ...current]);
//       } else {
//         await loadRecords();
//       }
//     } catch (error) {
//       setMessage(
//         error.response?.data?.message ||
//         "Unable to create access record."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (record) => {
//     await axiosInstance.patch(
//       `/admin/team-access/${record.id}/toggle`
//     );

//     await loadRecords();
//   };

//   const handleResetPassword = async (record) => {
//     const response = await axiosInstance.post(
//       `/admin/team-access/${record.id}/reset-password`,
//       {}
//     );

//     const password = response.data?.data?.generatedPassword;

//     setGeneratedPassword(password || "");

//     await loadRecords();
//   };

//   return (
//     <div className="min-h-screen overflow-hidden">
//       <SimulationHeader
//         leftContent={(
//           <GameButton
//             label="EIS Simulation"
//             onClick={() => {
//               playClickSound();
//               // handleInteraction();
//               router.push('/playDemo');
//             }}
//             variant="compact"
//             size="md"
//           />
//         )}
//         rightContent={(
//           <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
//             <GameButton
//               label="BACK"
//               onClick={() => {
//                 playClickSound();
//                 // handleInteraction();
//                 router.push('/');
//               }}
//               variant="nav"
//               size="sm"
//               className="flex sm:hidden"
//             />
//             <GameButton
//               label="BACK TO ACTION"
//               onClick={() => {
//                 playClickSound();
//                 // handleInteraction();
//                 router.push('/');
//               }}
//               variant="nav"
//               size="sm"
//               className="hidden sm:flex"
//             />

//           </div>
//         )}
//       />
//       <div className="mx-auto p-6">

//         <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
//           {/* FORM */}
//           <section className="overflow-hidden border border-[#d7dde8] bg-white shadow-sm">
//             <div className="h-10 bg-white"></div>

//             <div className="bg-[#9FB4CC] px-4 py-6">
//               <div className="mb-5 text-center">
//                 <h2 className="text-[34px] font-semibold tracking-wide text-[#111827]">
//                   CREATE ACCESS
//                 </h2>

//                 <p className="mt-2 text-sm text-[#374151]">
//                   Enter credentials to create access
//                 </p>
//               </div>

//               <form
//                 className="space-y-5"
//                 onSubmit={handleCreate}
//               >
//                 <Field label="Team Name">
//                   <input
//                     className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-black"
//                     value={form.teamName}
//                     onChange={(event) =>
//                       handleChange(
//                         "teamName",
//                         event.target.value
//                       )
//                     }
//                     placeholder="Alpha Team"
//                   />
//                 </Field>

//                 <Field label="Email">
//                   <input
//                     className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-black"
//                     value={form.email}
//                     onChange={(event) =>
//                       handleChange("email", event.target.value)
//                     }
//                     placeholder="team@example.com"
//                   />
//                 </Field>

//                 {/* PASSWORD */}
//                 <Field label="Password">
//                   <div>
//                     <input
//                       className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-black"
//                       value={form.password}
//                       onChange={(event) =>
//                         handleChange(
//                           "password",
//                           event.target.value
//                         )
//                       }
//                       placeholder="Leave blank to auto-generate"
//                     />

//                     {/* AUTO GENERATE BUTTON */}
//                     <button
//                       type="button"
//                       onClick={generatePassword}
//                       className="mt-2 h-[28px] border border-[#4b5563] bg-white px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#111827] transition hover:bg-black hover:text-white"
//                     >
//                       Auto Generate
//                     </button>
//                   </div>
//                 </Field>

//                 <Field label="Expires At">
//                   <input
//                     className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none focus:border-black"
//                     type="datetime-local"
//                     value={form.expiresAt}
//                     onChange={(event) =>
//                       handleChange(
//                         "expiresAt",
//                         event.target.value
//                       )
//                     }
//                   />
//                 </Field>

//                 <div className="flex items-center gap-3 pt-2">
//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="h-[46px] min-w-[150px] border border-black bg-[#111827] px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
//                   >
//                     {saving ? "Saving..." : "Create"}
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setForm(emptyForm)}
//                     className="h-[46px] min-w-[140px] border border-[#5d6470] bg-transparent px-6 text-sm font-medium text-[#111827] transition hover:bg-white/30"
//                   >
//                     Reset
//                   </button>
//                 </div>
//               </form>

//               {/* {message && (
//                 <div className="mt-6 border border-[#7d8797] bg-white/40 p-4 text-sm text-[#111827]">
//                   {message}
//                 </div>
//               )}

//               {generatedPassword && (
//                 <div className="mt-4 border border-green-600/30 bg-green-100 p-4 text-sm text-green-800">
//                   Generated password :{" "}
//                   <span className="font-semibold">
//                     {generatedPassword}
//                   </span>
//                 </div>
//               )} */}
//             </div>
//           </section>

//           {/* RECORDS */}
//           <section className="overflow-hidden rounded-[10px] border border-gray-300 bg-white shadow-sm">
//             {/* HEADER */}
//             <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
//               <div>
//                 <h2 className="text-[19px] font-semibold text-[#111827]">
//                   Access Records
//                 </h2>

//                 <p className="mt-[2px] text-[12px] text-gray-500">
//                   Authorized team and user login records.
//                 </p>
//               </div>

//               <button
//                 onClick={loadRecords}
//                 className="h-[34px] border border-gray-300 bg-white px-4 text-[12px] font-medium text-gray-700 transition hover:bg-gray-100"
//               >
//                 Refresh
//               </button>
//             </div>

//             {/* TABLE */}
//             <div className="w-full overflow-hidden">
//               <table className="w-full table-auto border-collapse">
//                 {/* TABLE HEAD */}
//                 <thead className="bg-[#eef2f6]">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Team
//                     </th>

//                     <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Type
//                     </th>

//                     <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Email
//                     </th>

//                     <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Password
//                     </th>

//                     <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Status
//                     </th>

//                     <th className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Logins
//                     </th>

//                     <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Expires
//                     </th>

//                     {/* <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
//                       Actions
//                     </th> */}
//                   </tr>
//                 </thead>

//                 {/* TABLE BODY */}
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={8}
//                         className="px-4 py-8 text-center text-sm text-gray-500"
//                       >
//                         Loading records...
//                       </td>
//                     </tr>
//                   ) : records.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={8}
//                         className="px-4 py-8 text-center text-sm text-gray-500"
//                       >
//                         No access records found.
//                       </td>
//                     </tr>
//                   ) : (
//                     records.map((record, index) => (
//                       <tr
//                         key={record.id}
//                         className={`transition hover:bg-gray-50 ${index !== records.length - 1
//                           ? "border-b border-gray-200"
//                           : ""
//                           }`}
//                       >
//                         {/* TEAM */}
//                         <td className="px-4 py-2 align-middle">
//                           <div className="max-w-[110px]">
//                             <h3 className="text-[13px] font-semibold leading-[18px] text-[#111827] break-words">
//                               {record.teamName ||
//                                 record.userName ||
//                                 "Untitled"}
//                             </h3>
//                           </div>
//                         </td>

//                         {/* TYPE */}
//                         <td className="px-2 py-2 align-middle">
//                           <span className="text-[12px] capitalize text-gray-700">
//                             {record.accessType}
//                           </span>
//                         </td>

//                         {/* EMAIL */}
//                         <td className="px-2 py-2 align-middle">
//                           <p className="max-w-[150px] break-words text-[12px] leading-[16px] text-gray-700">
//                             {record.email || "-"}
//                           </p>
//                         </td>

//                         {/* PASSWORD */}
//                         <td className="px-2 py-2 align-middle">
//                           <div className="flex items-center">
//                             <div className="rounded bg-black px-3 py-[5px] text-[10px] font-medium tracking-[0.08em] text-white">
//                               {record.generatedPassword || "-"}
//                             </div>
//                           </div>
//                         </td>

//                         {/* STATUS */}
//                         <td className="px-2 py-2 align-middle">
//                           <div>
//                             <p className="text-[12px] font-medium leading-[15px] capitalize text-[#111827]">
//                               {record.approvalStatus}
//                             </p>

//                             <p className="mt-[1px] text-[10px] capitalize leading-[13px] text-gray-500">
//                               {record.subscriptionStatus}
//                             </p>
//                           </div>
//                         </td>

//                         {/* LOGINS */}
//                         <td className="px-1 py-2 text-center align-middle">
//                           <div className="mx-auto flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#eef2f6] text-[11px] font-semibold text-[#111827]">
//                             {record.loginCount || 0}
//                           </div>
//                         </td>

//                         {/* EXPIRES */}
//                         <td className="px-2 py-2 align-middle">
//                           <p className="text-[11px] text-gray-700 whitespace-nowrap">
//                             {record.expiresAt
//                               ? new Date(
//                                 record.expiresAt
//                               ).toLocaleDateString()
//                               : "-"}
//                           </p>
//                         </td>

//                         {/* ACTIONS */}
//                         {/* <td className="px-3 py-2 align-middle">
//                           <div className="flex flex-col gap-1">
//                             <button
//                               onClick={() => handleToggle(record)}
//                               className="h-[26px] whitespace-nowrap border border-gray-300 bg-white px-2 text-[10px] font-medium text-gray-700 transition hover:bg-gray-100"
//                             >
//                               Toggle
//                             </button>

//                             <button
//                               onClick={() =>
//                                 handleResetPassword(record)
//                               }
//                               className="h-[26px] whitespace-nowrap bg-black px-2 text-[10px] font-medium text-white transition hover:opacity-90"
//                             >
//                               Reset
//                             </button>
//                           </div>
//                         </td> */}
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <label className="block">
//       <span className="mb-2 block text-sm font-medium text-[#111827]">
//         {label}
//       </span>

//       {children}
//     </label>
//   );
// }

// function StatCard({ label, value }) {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm">
//       <div className="text-2xl font-bold text-gray-900">
//         {value}
//       </div>

//       <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
//         {label}
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useAuthUser } from "@/contexts/AuthContext";
import SimulationHeader from "@/components/common/SimulationHeader";
import SimulationFooter from "@/components/common/SimulationFooter";
import GameButton from "@/components/Buttons/GameButton";
import { useSoundContext } from "@/contexts/SoundContext";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

const emptyForm = {
  accessType: "team",
  teamName: "",
  userName: "",
  email: "",
  password: "",
  accessActive: true,
  approvalStatus: "approved",
  subscriptionStatus: "active",
  expiresAt: "",
  invitationCode: "",
  notes: "",
};

// ZOD SCHEMA
const teamAccessSchema = z.object({
  accessType: z.literal("team"),

  teamName: z
    .string()
    .min(1, { message: "Team name is required" })
    .refine((value) => !/\s/.test(value), {
      message: "Team name cannot contain spaces",
    }),

  userName: z.string().optional(),

  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" }),

  // password: optional, but if filled then must be strong enough
  password: z
    .string()

    .min(1, {
      message: "Password is required",
    })

    .min(8, {
      message:
        "Password must be at least 8 characters",
    })

    .regex(/[A-Z]/, {
      message:
        "Password must contain an uppercase letter",
    })

    .regex(/[a-z]/, {
      message:
        "Password must contain a lowercase letter",
    })

    .regex(/[0-9]/, {
      message:
        "Password must contain a number",
    }),

  accessActive: z.boolean(),
  approvalStatus: z.string(),
  subscriptionStatus: z.string(),

  expiresAt: z.string().optional().nullable(),

  invitationCode: z.string().optional(),
  notes: z.string().optional(),
});

export default function TeamAccessPage() {
  const { authUser } = useAuthUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const { playClickSound } = useSoundContext();
  const from = searchParams.get("from") || "playDemo";

  const stats = useMemo(() => {
    return {
      total: records.length,
      active: records.filter((record) => record.accessActive).length,
      pending: records.filter(
        (record) => record.approvalStatus === "pending"
      ).length,
      expired: records.filter(
        (record) => record.subscriptionStatus === "expired"
      ).length,
    };
  }, [records]);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$_";

    let password = "";

    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setForm((current) => ({
      ...current,
      password,
    }));
  };

  const loadRecords = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get("/admin/team-access");

      setRecords(response.data?.data?.teamAccess || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleChange = (field, value) => {
    let newValue = value;

    if (field === "teamName") {
      // remove all spaces while typing
      newValue = value.replace(/\s+/g, "");
    }

    setForm((current) => ({
      ...current,
      [field]: newValue,
    }));

    // clear field error as user types
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setGeneratedPassword("");
    setErrors({});

    try {
      // 1) Zod validation
      const parsed = teamAccessSchema.parse(form);

      // 2) payload
      const payload = {
        ...parsed,
        expiresAt: parsed.expiresAt || null,
        password: parsed.password || undefined,
      };

      // 3) API call
      const response = await axiosInstance.post(
        "/admin/team-access",
        payload
      );

      const created = response.data?.data?.teamAccess;
      const password = response.data?.data?.generatedPassword;

      setGeneratedPassword(password || "");
      setMessage("Access record created successfully.");
      setForm(emptyForm);

      if (created) {
        setRecords((current) => [created, ...current]);
      } else {
        await loadRecords();
      }
    } catch (error) {
      const isZodError =
        error instanceof z.ZodError || error?.name === "ZodError";

      if (isZodError) {
        const fieldErrors = {};
        const issues = error.errors ?? error.issues ?? [];

        issues.forEach((err) => {
          const field = err.path?.[0];
          if (field && !fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });

        setErrors(fieldErrors);
        setMessage("Please fix the highlighted errors.");
      } else {
        setMessage(
          error.response?.data?.message ||
          error.message ||
          "Unable to create access record."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (record) => {
    await axiosInstance.patch(`/admin/team-access/${record.id}/toggle`);
    await loadRecords();
  };

  const handleResetPassword = async (record) => {
    const response = await axiosInstance.post(
      `/admin/team-access/${record.id}/reset-password`,
      {}
    );

    const password = response.data?.data?.generatedPassword;

    setGeneratedPassword(password || "");

    await loadRecords();
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <SimulationHeader
        leftContent={
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              label="EIS Simulation"
              onClick={() => {
                playClickSound();
                router.push("/playDemo");
              }}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            />
          </div>
        }
        rightContent={
          <div className="flex items-center gap-1 mt-3">
            <div className="hidden lg:flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="team-access-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    label="BACK TO ACTION"
                    onClick={() => {
                      playClickSound();
                      router.push("/");
                    }}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        }
      />
      <div className="mx-auto p-6">
        <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
          {/* FORM */}
          <section className="overflow-hidden border border-[#d7dde8] bg-white shadow-sm">
            <div className="h-10 bg-white"></div>

            <div className="bg-[#9FB4CC] px-4 py-6">
              <div className="mb-5 text-center">
                <h2 className="text-[34px] font-semibold tracking-wide text-[#111827]">
                  CREATE ACCESS
                </h2>

                <p className="mt-2 text-sm text-[#374151]">
                  Enter credentials to create access
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleCreate}>
                <Field label="Team Name">
                  <input
                    className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-black"
                    value={form.teamName}
                    onChange={(event) =>
                      handleChange("teamName", event.target.value)
                    }
                    placeholder="AlphaTeam"
                  />
                  {errors.teamName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.teamName}
                    </p>
                  )}
                </Field>

                <Field label="Email">
                  <input
                    className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-black"
                    value={form.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    placeholder="team@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </Field>

                {/* PASSWORD */}
                <Field label="Password">
                  <div>
                    {/* INPUT + BUTTON */}

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                      {/* LEFT SIDE */}

                      <div className="flex-1">
                        <input
                          className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-black"
                          value={form.password}
                          onChange={(event) =>
                            handleChange(
                              "password",
                              event.target.value
                            )
                          }
                          placeholder="Leave blank to auto-generate"
                        />

                        {/* ERROR MESSAGE */}

                        {errors.password && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* BUTTON */}

                      <button
                        type="button"
                        onClick={generatePassword}
                        className="h-[42px] w-full sm:w-auto border border-[#4b5563] bg-white px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#111827] transition hover:bg-black hover:text-white whitespace-nowrap">
                        Auto Generate
                      </button>
                    </div>
                  </div>
                </Field>

                <Field label="Expires At">
                  <input
                    className="w-full border border-[#4b5563] bg-white px-4 py-2 text-[15px] text-[#111827] outline-none focus:border-black"
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) =>
                      handleChange("expiresAt", event.target.value)
                    }
                  />
                </Field>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-[46px] min-w-[150px] border border-black bg-[#111827] px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Create"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm(emptyForm);
                      setErrors({});
                    }}
                    className="h-[46px] min-w-[140px] border border-[#5d6470] bg-transparent px-6 text-sm font-medium text-[#111827] transition hover:bg-white/30"
                  >
                    Reset
                  </button>
                </div>

                {/* {message && (
                  <div className="mt-4 border border-[#7d8797] bg-white/40 p-3 text-sm text-[#111827]">
                    {message}
                  </div>
                )}

                {generatedPassword && (
                  <div className="mt-3 border border-green-600/30 bg-green-100 p-3 text-sm text-green-800">
                    Generated password: <span className="font-semibold">
                      {generatedPassword}
                    </span>
                  </div>
                )} */}
              </form>
            </div>
          </section>

          {/* RECORDS */}
          <section className="overflow-hidden rounded-[10px] border border-gray-300 bg-white shadow-sm">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <h2 className="text-[19px] font-semibold text-[#111827]">
                  Access Records
                </h2>

                <p className="mt-[2px] text-[12px] text-gray-500">
                  Authorized team and user login records.
                </p>
              </div>

              <button
                onClick={loadRecords}
                className="h-[34px] border border-gray-300 bg-white px-4 text-[12px] font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Refresh
              </button>
            </div>

            {/* TABLE */}
            <div className="w-full overflow-hidden">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-[#eef2f6]">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
                      Team
                    </th>
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
                      Type
                    </th>
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
                      Email
                    </th>
                    {/* <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
                      Password
                    </th> */}
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
                      Status
                    </th>
                    <th className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
                      Logins
                    </th>
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#111827]">
                      Expires
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        Loading records...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No access records found.
                      </td>
                    </tr>
                  ) : (
                    records.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`transition hover:bg-gray-50 ${index !== records.length - 1
                          ? "border-b border-gray-200"
                          : ""
                          }`}
                      >
                        {/* TEAM */}
                        <td className="px-4 py-2 align-middle">
                          <div className="max-w-[110px]">
                            <h3 className="text-[13px] font-semibold leading-[18px] text-[#111827] break-words">
                              {record.teamName ||
                                record.userName ||
                                "Untitled"}
                            </h3>
                          </div>
                        </td>

                        {/* TYPE */}
                        <td className="px-2 py-2 align-middle">
                          <span className="text-[12px] capitalize text-gray-700">
                            {record.accessType}
                          </span>
                        </td>

                        {/* EMAIL */}
                        <td className="px-2 py-2 align-middle">
                          <p className="max-w-[150px] break-words text-[12px] leading-[16px] text-gray-700">
                            {record.email || "-"}
                          </p>
                        </td>

                        {/* PASSWORD */}
                        {/* <td className="px-2 py-2 align-middle">
                          <div className="flex items-center">
                            <div className="rounded bg-black px-3 py-[5px] text-[10px] font-medium tracking-[0.08em] text-white">
                              {record.generatedPassword || "-"}
                            </div>
                          </div>
                        </td> */}

                        {/* STATUS */}
                        <td className="px-2 py-2 align-middle">
                          <div>
                            <p className="text-[12px] font-medium leading-[15px] capitalize text-[#111827]">
                              {record.approvalStatus}
                            </p>

                            <p className="mt-[1px] text-[10px] capitalize leading-[13px] text-gray-500">
                              {record.subscriptionStatus}
                            </p>
                          </div>
                        </td>

                        {/* LOGINS */}
                        <td className="px-1 py-2 text-center align-middle">
                          <div className="mx-auto flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#eef2f6] text-[11px] font-semibold text-[#111827]">
                            {record.loginCount || 0}
                          </div>
                        </td>

                        {/* EXPIRES */}
                        <td className="px-2 py-2 align-middle">
                          <p className="text-[11px] text-gray-700 whitespace-nowrap">
                            {record.expiresAt
                              ? new Date(
                                record.expiresAt
                              ).toLocaleDateString()
                              : "-"}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#111827]">
        {label}
      </span>

      {children}
    </label>
  );
}