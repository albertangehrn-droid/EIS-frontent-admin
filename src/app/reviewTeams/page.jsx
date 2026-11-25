"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import axiosInstance from "@/utils/axiosInstance";
import GameButton from "@/components/Buttons/GameButton";
import SimulationHeader from "@/components/common/SimulationHeader";
import SnapshotModal from "@/components/common/SnapshotModal";
import ReportModal from "@/components/common/ReportModal";
import IMAGES from "@/utils/imagePaths";

const ADMIN_SECRET_DROPDOWN_OPTIONS = [
  "Valid Passwords",
  "Professor Password",
  "RM Session Code",
];

const formatSessionTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
};

const normalizeTeamOverview = (item) => {
  return {
    sessionId: item.sessionId,
    team: item.teamName || "Unknown",
    sessionCode: item.sessionCode || "-",
    sessionKey: item.sessionKey || item.password || "",
    days: item.metrics?.daysSpent ?? 0,
    dec: item.metrics?.decisionsCount ?? 0,
    ads: item.metrics?.adoptedCount ?? 0,
    paps: item.metrics?.paps ?? 0,
    ratio: item.metrics?.daysPerAdopter ?? 120,
    score: item.metrics?.score ?? 0,
    snaps: "S R",
    include: item.status?.isActive ? "y" : "n",
    overviewed: !!item.overviewed,
    password: item.password || item.sessionKey || "",
    firstTime: formatSessionTime(item.createdAt),
    lastTime: formatSessionTime(item.updatedAt),
  };
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
};

const convertToISODate = (dateString) => {
  return `${dateString}T00:00:00Z`;
};

const formatDateMMDDYY = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
};

const formatValidPasswordRow = (item) => {
  const from = formatDateMMDDYY(item.validFrom);
  const till = formatDateMMDDYY(item.validTill);
  const pass = item.password || "";
  const label = item.label || "";
  const max = item.maxSessions ?? "";

  let license = item.license || "";
  let email = item.email || "";
  if (item.notes) {
    const licMatch = item.notes.match(/License:\s*([^,]+)/i);
    if (licMatch) license = licMatch[1].trim();
    const emailMatch = item.notes.match(/Email:\s*([^\s,]+)/i);
    if (emailMatch) email = emailMatch[1].trim();
  }

  return `${pass} ${from} ${till} ${label} ${license} ${max} ${email}`.replace(/\s+/g, " ").trim();
};

function ReviewChart({ title, data, yDomain, dataKey = "value", height = 180 }) {
  return (
    <div className="rounded-sm border border-black/15 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-black/10 bg-neutral-50 px-3 py-1.5 text-center text-[12px] font-bold uppercase tracking-wider text-neutral-800">
        {title}
      </div>
      <div className="px-2 py-2" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 6, left: -15 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#444" }}
              axisLine={{ stroke: '#999' }}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={35}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 9, fill: "#444" }}
              axisLine={{ stroke: '#999' }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{ background: '#f5f5f5', border: '1px solid #ccc', fontSize: 11 }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Line
              type="linear"
              dataKey={dataKey}
              stroke="#0000ff"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0000ff', stroke: '#0000ff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ReviewTeamsPage() {
  const router = useRouter();
  const [sessionRows, setSessionRows] = useState([]);
  const [snapshotSessions, setSnapshotSessions] = useState([]);
  const [snapshotPage, setSnapshotPage] = useState(1);
  const [hasMoreSnapshots, setHasMoreSnapshots] = useState(false);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);
  const dateInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [todayOnly, setTodayOnly] = useState(false);
  const [snapshotSessionId, setSnapshotSessionId] = useState(null);
  const [reportSessionData, setReportSessionData] = useState(null);
  const [showGraphics, setShowGraphics] = useState(true);

  const [sessionKeySearch, setSessionKeySearch] = useState("");
  const [lastMinutes, setLastMinutes] = useState("");
  const [includeInOverview, setIncludeInOverview] = useState(true);

  // Secret Password Modal State (Triggered on double clicking 'w' of 'Review')
  const [showSecretPasswordModal, setShowSecretPasswordModal] = useState(false);
  const [secretPasswordInput, setSecretPasswordInput] = useState("");
  const [showSecretPassword, setShowSecretPassword] = useState(false);
  const [secretPasswordError, setSecretPasswordError] = useState("");
  const [isVerifyingSecretPassword, setIsVerifyingSecretPassword] = useState(false);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [selectedAdminOption, setSelectedAdminOption] = useState("Valid Passwords");
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef(null);

  const [activePasswords, setActivePasswords] = useState([]);
  const [loadingActivePasswords, setLoadingActivePasswords] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Professor Password State
  const [professorPassword, setProfessorPassword] = useState("");
  const [newProfessorPasswordInput, setNewProfessorPasswordInput] = useState("");
  const [confirmProfessorPasswordInput, setConfirmProfessorPasswordInput] = useState("");
  const [showCurrentProfPassword, setShowCurrentProfPassword] = useState(false);
  const [showNewProfPassword, setShowNewProfPassword] = useState(false);
  const [loadingProfPassword, setLoadingProfPassword] = useState(false);
  const [savingProfPassword, setSavingProfPassword] = useState(false);
  const [profPasswordError, setProfPasswordError] = useState("");
  const [profPasswordSuccess, setProfPasswordSuccess] = useState("");
  const [profPasswordCopied, setProfPasswordCopied] = useState(false);

  const fetchProfessorPassword = async () => {
    setLoadingProfPassword(true);
    setProfPasswordError("");
    try {
      const res = await axiosInstance.get("/admin/professor-password");
      const pass = res.data?.data?.currentPassword || "";
      setProfessorPassword(pass);
    } catch (err) {
      console.error("Failed to fetch professor password:", err);
      setProfPasswordError(err.response?.data?.message || "Failed to load professor password");
    } finally {
      setLoadingProfPassword(false);
    }
  };

  const handleSaveProfessorPassword = async (e) => {
    if (e) e.preventDefault();
    if (savingProfPassword) return;

    const trimmedNew = newProfessorPasswordInput.trim();
    const trimmedConfirm = confirmProfessorPasswordInput.trim();

    if (!trimmedNew) {
      setProfPasswordError("Please enter a new password");
      setProfPasswordSuccess("");
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setProfPasswordError("New password and confirm password do not match");
      setProfPasswordSuccess("");
      return;
    }

    setSavingProfPassword(true);
    setProfPasswordError("");
    setProfPasswordSuccess("");

    try {
      const res = await axiosInstance.post("/admin/professor-password", {
        password: trimmedNew,
      });

      const updated = res.data?.data?.currentPassword || trimmedNew;
      setProfessorPassword(updated);
      setNewProfessorPasswordInput("");
      setConfirmProfessorPasswordInput("");
      setProfPasswordSuccess("Professor password updated successfully!");
      setTimeout(() => setProfPasswordSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to update professor password:", err);
      setProfPasswordError(err.response?.data?.message || "Failed to update professor password");
    } finally {
      setSavingProfPassword(false);
    }
  };

  const handleCopyProfessorPassword = () => {
    if (!professorPassword) return;
    navigator.clipboard.writeText(professorPassword);
    setProfPasswordCopied(true);
    setTimeout(() => setProfPasswordCopied(false), 2000);
  };

  // RM Session Code State
  const [rmSessionCode, setRmSessionCode] = useState("");
  const [newRmSessionCodeInput, setNewRmSessionCodeInput] = useState("");
  const [loadingRmSessionCode, setLoadingRmSessionCode] = useState(false);
  const [savingRmSessionCode, setSavingRmSessionCode] = useState(false);
  const [rmSessionCodeError, setRmSessionCodeError] = useState("");
  const [rmSessionCodeSuccess, setRmSessionCodeSuccess] = useState("");
  const [rmSessionCodeCopied, setRmSessionCodeCopied] = useState(false);
  const [rmSessionDetails, setRmSessionDetails] = useState(null);

  const fetchRmSessionCode = async () => {
    setLoadingRmSessionCode(true);
    setRmSessionCodeError("");
    try {
      const res = await axiosInstance.get("/admin/rm-session-code");
      setRmSessionCode(res.data?.data?.currentSessionCode || "");
      setRmSessionDetails(res.data?.data?.sessionDetails || null);
    } catch (err) {
      console.error("Failed to fetch RM session code:", err);
      setRmSessionCodeError(err.response?.data?.message || "Failed to load RM session code");
    } finally {
      setLoadingRmSessionCode(false);
    }
  };

  const handleSaveRmSessionCode = async (e, force = false) => {
    if (e) e.preventDefault();
    if (savingRmSessionCode) return;

    const trimmed = newRmSessionCodeInput.trim();
    if (!trimmed) {
      setRmSessionCodeError("Please enter a session code");
      return;
    }

    setSavingRmSessionCode(true);
    setRmSessionCodeError("");
    setRmSessionCodeSuccess("");

    try {
      const res = await axiosInstance.post("/admin/rm-session-code", {
        sessionCode: trimmed,
        force,
      });

      setRmSessionCode(res.data?.data?.currentSessionCode || trimmed);
      setRmSessionDetails(res.data?.data?.sessionDetails || null);
      setNewRmSessionCodeInput("");
      setRmSessionCodeSuccess("RM starting session code updated successfully!");
      setTimeout(() => setRmSessionCodeSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to update RM session code:", err);
      setRmSessionCodeError(err.response?.data?.message || "Failed to update RM session code");
    } finally {
      setSavingRmSessionCode(false);
    }
  };

  const handleCopyRmSessionCode = () => {
    if (!rmSessionCode) return;
    navigator.clipboard.writeText(rmSessionCode);
    setRmSessionCodeCopied(true);
    setTimeout(() => setRmSessionCodeCopied(false), 2000);
  };

  useEffect(() => {
    if (isSecretUnlocked) {
      if (selectedAdminOption === "Valid Passwords") {
        setLoadingActivePasswords(true);
        axiosInstance
          .get("/admin/active-passwords")
          .then((res) => {
            const list = res.data?.data?.passwords || res.data?.passwords || [];
            setActivePasswords(list);
          })
          .catch((err) => {
            console.error("Failed to fetch active passwords:", err);
          })
          .finally(() => {
            setLoadingActivePasswords(false);
          });
      } else if (selectedAdminOption === "Professor Password") {
        fetchProfessorPassword();
      } else if (selectedAdminOption === "RM Session Code") {
        fetchRmSessionCode();
      }
    }
  }, [isSecretUnlocked, selectedAdminOption]);

  const handleSecretPasswordSubmit = async () => {
    if (!secretPasswordInput || isVerifyingSecretPassword) return;

    setIsVerifyingSecretPassword(true);
    setSecretPasswordError("");

    try {
      let email = null;
      try {
        const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        email = authData?.state?.user?.email;
      } catch (e) {}

      const res = await axiosInstance.post("/admin/verify-password", {
        password: secretPasswordInput,
        email,
      });

      if (res.data?.success) {
        setIsSecretUnlocked(true);
        setShowSecretPasswordModal(false);
        setSecretPasswordInput("");
        setSecretPasswordError("");
      } else {
        setSecretPasswordError(res.data?.message || "Incorrect password. Please try again.");
      }
    } catch (err) {
      setSecretPasswordError(
        err.response?.data?.message || "Incorrect password. Please try again."
      );
    } finally {
      setIsVerifyingSecretPassword(false);
    }
  };

  // UI Date
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [appliedSinceDate, setAppliedSinceDate] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadTeamOverview = async (
    page = 1,
    todayFilter = todayOnly,
    sinceDate = appliedSinceDate,
    searchQuery = sessionKeySearch,
    minsFilter = lastMinutes
  ) => {
    setLoading(true);
    setError("");

    try {
      let apiUrl = `/admin/teams-overview?page=${page}&limit=10`;

      if (todayFilter) {
        apiUrl += `&todayOnly=true`;
      }

      if (sinceDate) {
        apiUrl += `&since=${convertToISODate(sinceDate)}`;
      }

      if (searchQuery) {
        apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (minsFilter) {
        apiUrl += `&lastMinutes=${minsFilter}`;
      }

      const response = await axiosInstance.get(apiUrl);

      console.log("API RESPONSE:", response.data);

      const teams = response.data?.data?.teams || [];
      const paginationData = response.data?.data?.pagination;

      if (paginationData) {
        setPagination(paginationData);
      }

      if (teams.length > 0) {
        const formattedTeams = teams
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(normalizeTeamOverview);

        setSessionRows(formattedTeams);
        setCurrentPage(page);
      } else {
        setSessionRows([]);
      }
      loadSnapshots(1, false, todayFilter, sinceDate, searchQuery, minsFilter);
    } catch (fetchError) {
      console.error("Failed to load teams overview:", fetchError);
      setError(
        fetchError?.response?.data?.message ||
        "Unable to load team overview data."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshots = async (
    page = 1,
    append = false,
    todayFilter = todayOnly,
    sinceDate = appliedSinceDate,
    searchQuery = sessionKeySearch,
    minsFilter = lastMinutes
  ) => {
    setLoadingSnapshots(true);
    try {
      let apiUrl = `/admin/teams-overview?page=${page}&limit=7`;

      const accessPasswordId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('accessPasswordId') || localStorage.getItem('accessPasswordId') : null;
      if (accessPasswordId) {
        apiUrl += `&accessPasswordId=${encodeURIComponent(accessPasswordId)}`;
      }

      if (todayFilter) {
        apiUrl += `&todayOnly=true`;
      }

      if (sinceDate) {
        apiUrl += `&since=${convertToISODate(sinceDate)}`;
      }

      if (searchQuery) {
        apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (minsFilter) {
        apiUrl += `&lastMinutes=${minsFilter}`;
      }

      const response = await axiosInstance.get(apiUrl);
      const teams = response.data?.data?.teams || [];
      const paginationData = response.data?.data?.pagination;

      const formatted = teams.map(normalizeTeamOverview);

      if (append) {
        setSnapshotSessions((prev) => [...prev, ...formatted]);
      } else {
        setSnapshotSessions(formatted);
      }

      setSnapshotPage(page);
      setHasMoreSnapshots(paginationData ? paginationData.hasNextPage : false);
    } catch (err) {
      console.error("Failed to load snapshots list:", err);
    } finally {
      setLoadingSnapshots(false);
    }
  };

  const handleSnapshotListScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 5) {
      if (hasMoreSnapshots && !loadingSnapshots) {
        loadSnapshots(snapshotPage + 1, true);
      }
    }
  };

  const openSnapshotInNewTab = (sessionId) => {
    const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/$/, '');
    let cleanApiUrl = rawApiUrl;
    if (cleanApiUrl && !cleanApiUrl.startsWith('http://') && !cleanApiUrl.startsWith('https://')) {
      cleanApiUrl = `http://${cleanApiUrl}`;
    }
    if (!cleanApiUrl) {
      cleanApiUrl = "http://localhost:5000/api/v1";
    }
    
    let langVal = "";
    if (typeof window !== "undefined") {
      langVal = new URLSearchParams(window.location.search).get("lang") || "";
    }
    const langQuery = langVal ? `?lang=${encodeURIComponent(langVal)}` : "";
    const snapshotUrl = `${cleanApiUrl}/admin/sessions/${sessionId}/snapshot${langQuery}`;
    window.open(snapshotUrl, '_blank');
  };

  const handleSaveData = async () => {
    try {
      setLoading(true);
      let apiUrl = `/admin/teams-overview?limit=all`;

      if (todayOnly) {
        apiUrl += `&todayOnly=true`;
      }

      if (appliedSinceDate) {
        apiUrl += `&since=${convertToISODate(appliedSinceDate)}`;
      }

      if (sessionKeySearch) {
        apiUrl += `&search=${encodeURIComponent(sessionKeySearch)}`;
      }

      if (lastMinutes) {
        apiUrl += `&lastMinutes=${lastMinutes}`;
      }

      const response = await axiosInstance.get(apiUrl);
      const teams = response.data?.data?.teams || [];
      if (teams.length === 0) {
        alert("No session data available to save.");
        return;
      }

      const formattedTeams = teams
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(normalizeTeamOverview);

      // Header row matching requested structure
      const headers = [
        "SessionKey1",
        "SessionKey2",
        "Team Name",
        "#Days",
        "#Decisions",
        "#Adopters",
        "# Positive Attitude Points (PAPs)",
        "Score",
        "Snapshots",
        "Snapshot Image",
        "Report"
      ];

      // Read the backend URL from frontend configuration and remove trailing slashes
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const cleanApiUrl = rawApiUrl.trim().replace(/\/$/, "");

      // Map the session row data to CSV records
      const csvRows = formattedTeams.map((row) => {
        const snapshotUrl = `${cleanApiUrl}/admin/sessions/${row.sessionId}/snapshot`;
        const reportUrl = `${cleanApiUrl}/admin/sessions/${row.sessionId}/report`;

        return [
          `"${row.sessionCode}"`,
          `"${row.password}"`,
          `"${row.team.replace(/"/g, '""')}"`,
          row.days,
          row.dec,
          row.ads,
          row.paps,
          row.score,
          `"${row.firstTime} ${row.lastTime}"`,
          `"${snapshotUrl}"`,
          `"${reportUrl}"`
        ].join(",");
      });

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `SessionReport_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export all session data:", err);
      alert("Failed to export all session data: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    // Initial load: keep sessions empty when search box is empty until user searches or clicks Reset All
  }, []);

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      loadTeamOverview(currentPage + 1, todayOnly, appliedSinceDate, sessionKeySearch, lastMinutes);
    }
  };

  const handleToggleOverview = async (sessionId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axiosInstance.patch(`/admin/teams/${sessionId}/overviewed`, { overviewed: newStatus });
      setSessionRows(prev => prev.map(row => row.sessionId === sessionId ? { ...row, overviewed: newStatus } : row));
    } catch (err) {
      console.error('Failed to toggle overview:', err);
    }
  };

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const openReportInNewTab = async (sessionId, teamName) => {
    // Build report URL (use NEXT_PUBLIC_API_URL if provided, otherwise relative)
    const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/$/, '');
    const reportUrl = rawApiUrl ? `${rawApiUrl}/admin/sessions/${sessionId}/report` : `/admin/sessions/${sessionId}/report`;

    // Open a blank tab first so we can write content into it (same-origin required)
    const newTab = window.open('', '_blank');
    if (!newTab) return alert('Please allow popups for this site to open the report.');

    try {
      const resp = await axiosInstance.get(reportUrl, { responseType: 'text' });
      let text = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data, null, 2);

      // Frontend me report text dikhane se pehle usme API se data inject karenge
      try {
        const sessionUrl = rawApiUrl ? `${rawApiUrl}/admin/sessions/${sessionId}` : `/admin/sessions/${sessionId}`;
        const sessionResp = await axiosInstance.get(sessionUrl);
        if (sessionResp.data && sessionResp.data.data) {
          const sessionData = sessionResp.data.data;
          const fetchedTeamName = sessionData.teamName || teamName || "Info";
          const strategyText = (sessionData.strategyText && sessionData.strategyText.trim()) || (sessionData.gameState?.strategyText && sessionData.gameState.strategyText.trim()) || "";

          // Backend se aane wale is block ko dhoondh kar dynamic team name aur strategy se replace karenge
          const staticRegex = /Team [^\r\n]+\r?\n---- o ---- o ---- o ---- o ----\r?\n>[\s\S]*?\r?\n---- o ---- o ---- o ---- o ----/;

          const formattedStrategy = strategyText ? `>${strategyText}` : ">>";
          const newBlock = `Team ${fetchedTeamName}\n---- o ---- o ---- o ---- o ----\n${formattedStrategy}\n---- o ---- o ---- o ---- o ----`;

          text = text.replace(staticRegex, newBlock);
        }
      } catch (sessionErr) {
        console.error('Failed to fetch dynamic data for report:', sessionErr);
      }

      const blob = new Blob([text], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(blob);

      // Sanitize team name for filename (replace spaces with underscore, remove unsafe chars)
      const safeTeam = (teamName || 'file').toString().trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9\-_.]/g, '');
      const filename = `BAIReport_${safeTeam}.txt`;

      const safeText = escapeHtml(text);

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${teamName} - Report</title></head><body style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; margin:16px;">
        <div style="margin-bottom:12px; display:flex; gap:8px; align-items:center">
          <h2 style="margin:0; font-size:16px">${teamName} - Report</h2>
          <a id="dl" href="${downloadUrl}" download="${filename}" style="padding:6px 10px; background:#111; color:#f1c46b; text-decoration:none; border-radius:3px; font-weight:600; margin-left:8px">Download</a>
        </div>
        <pre style="white-space:pre-wrap; word-break:break-word; background:#fff; padding:12px; border:1px solid #ddd; border-radius:4px;">${safeText}</pre>
      </body></html>`;

      newTab.document.open();
      newTab.document.write(html);
      newTab.document.close();
    } catch (err) {
      console.error('Failed to load report:', err);
      try {
        newTab.document.open();
        newTab.document.write('<p style="font-family:system-ui">Failed to load report. See console for details.</p>');
        newTab.document.close();
      } catch (e) {
        // ignore
      }
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      loadTeamOverview(currentPage - 1, todayOnly, appliedSinceDate, sessionKeySearch, lastMinutes);
    }
  };

  // Process data for Recharts (Reversed for chronological progression left-to-right)
  const dynamicChartData = sessionRows.slice().reverse().map((row) => ({
    label: row.team.substring(0, 5),
    adopters: row.ads,
    decisions: row.dec,
    days: row.days,
    paps: row.paps,
    ratio: row.ratio,
  }));

  return (
    <div className="h-screen flex flex-col bg-[#f6f4ef] text-[#111] font-sans overflow-hidden">
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        html,
        body {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      <div className="sticky top-0 z-50 shadow-md">
        <SimulationHeader
          leftContent={(
            <div className="flex items-center gap-3">
              <div className="flex items-center mt-1">
                {/* Mobile: short title */}
                <h1 className="text-2xl font-extrabold tracking-tight text-black sm:hidden underline underline-offset-4 decoration-2">
                  Review Panel
                </h1>

                {/* Tablet / Desktop: full title */}
                <h1 className="hidden sm:block text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-black underline underline-offset-6 decoration-black decoration-[2.5px] whitespace-nowrap">
                  EIS Teams Revie
                  <span className="relative inline-block select-none underline underline-offset-6 decoration-black decoration-[2.5px] cursor-default">
                    {/* Secret 2px upper hit area - no hover cursor */}
                    <span
                      className="absolute -top-[8px] -left-[2px] -right-[2px] h-[14px] cursor-default"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setShowSecretPasswordModal(true);
                      }}
                    />
                    <span
                      className="cursor-default"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setShowSecretPasswordModal(true);
                      }}
                    >
                      w
                    </span>
                  </span>
                  {' '}Panel
                </h1>
              </div>

              {/* Secret Unlocked Dropdown Menu in Main Header (Bottom of header aligned with secret box) */}
              {isSecretUnlocked && (
                <div ref={adminDropdownRef} className="absolute right-[340px] sm:right-[364px] bottom-1 z-30 w-[170px] sm:w-[210px]">
                  <button
                    type="button"
                    onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-xs bg-[#c8d9e6] hover:bg-[#b8c9d6] text-black border border-[#7f9db9] font-sans font-medium cursor-pointer shadow-sm"
                  >
                    <span>{selectedAdminOption}</span>
                    <span className="ml-2 text-[10px]">▼</span>
                  </button>

                  {isAdminDropdownOpen && (
                    <div className="absolute left-0 top-full mt-0.5 w-full bg-white border border-[#7f9db9] shadow-lg z-50">
                      {ADMIN_SECRET_DROPDOWN_OPTIONS.map((opt, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedAdminOption(opt);
                            setIsAdminDropdownOpen(false);
                          }}
                          className={`px-2 py-0.5 text-xs cursor-pointer font-sans transition-colors ${selectedAdminOption === opt
                            ? "bg-neutral-300 text-black font-semibold"
                            : "hover:bg-neutral-200 text-neutral-800"
                            }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          rightContent={
            <div className="flex flex-col items-end justify-start gap-[2px]">
              <div
                id="review-teams-desktop-nav-buttons"
                className="flex items-center justify-end"
              >
                <GameButton
                  label={
                    <>
                      <span className="sm:hidden">BACK</span>
                      <span className="hidden sm:inline">BACK TO ACTION</span>
                    </>
                  }
                  onClick={() => router.push("/")}
                  variant="nav"
                  size="md"
                  className="px-4 sm:px-8 py-0 !text-[0.9rem] sm:!text-[1.25rem] !font-semibold !whitespace-nowrap w-[140px] sm:w-[215px] cursor-pointer"
                />
              </div>
              <GameButton
                id="shared-btn-print"
                label="PRINT"
                onClick={() => { window.print(); }}
                variant="nav"
                size="sm"
                className="text-[10px] sm:text-[13px] px-4 py-0 leading-none !h-[22px] !min-h-[22px] w-[140px] sm:w-[215px] mt-[2px] cursor-pointer"
              />
            </div>
          }
        />
      </div>

      <main className="flex-1 overflow-y-auto w-full relative">
        {/* ABSOLUTE FLOATING SECRET ADMIN DIALOG BOX (Aligned right-0) */}
        {isSecretUnlocked && (
          <div
            id="unlocked-admin-tool-floating-dialog"
            className="absolute top-0 right-0 z-40 w-[95%] sm:w-[502px] md:w-[562px] bg-white border border-gray-400 shadow-xl p-3 font-mono text-xs overflow-y-auto max-h-[calc(100vh-100px)] min-h-[352px] animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {/* TOP BAR WITH OPTION TITLE AND TOP-RIGHT CROSS (✕) CLOSE BUTTON */}
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-300 mb-2">
              <span className="font-bold text-neutral-800 text-xs tracking-wide uppercase font-mono">
                {selectedAdminOption}
              </span>
              <button
                onClick={() => setIsSecretUnlocked(false)}
                className="w-6 h-6 flex items-center justify-center text-sm font-extrabold text-black hover:text-neutral-600 transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* CONTENT AREA FOR SECRET ADMIN OPTION */}
            {selectedAdminOption === "Professor Password" ? (
              <div className="pt-1 space-y-4 font-sans text-neutral-800">
                {/* Information Header */}
                <div className="bg-[#f0f4f8] border border-[#bcd0e2] p-2.5 rounded-sm">
                  <div className="flex items-center gap-1.5 font-bold text-[#1f4e79] text-xs uppercase tracking-wide">
                    <span>🔑</span>
                    <span>Professor Admin Password</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-normal font-sans">
                    This password is used by professors on the Team Review page along with any team session key to access simulation reviews.
                  </p>
                </div>

                {/* Current Password Card */}
                <div className="border border-neutral-300 bg-neutral-50 p-3 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase font-mono">
                      Current Password:
                    </span>
                    <button
                      type="button"
                      onClick={fetchProfessorPassword}
                      disabled={loadingProfPassword}
                      className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-mono disabled:opacity-50 cursor-pointer"
                      title="Refresh current password"
                    >
                      <span>⟳</span>
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingProfPassword ? (
                    <div className="py-2 text-center text-neutral-500 text-xs italic font-mono">
                      ⟳ Fetching current password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white border border-neutral-300 px-3 py-2 rounded-sm font-mono text-sm">
                      <span className="select-all font-semibold tracking-wider text-black">
                        {showCurrentProfPassword ? (
                          professorPassword || <span className="text-neutral-400 italic">simadmin (default)</span>
                        ) : (
                          "•".repeat(Math.max(8, professorPassword?.length || 8))
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-sans">
                        <button
                          type="button"
                          onClick={() => setShowCurrentProfPassword(!showCurrentProfPassword)}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-700 cursor-pointer text-[11px]"
                        >
                          {showCurrentProfPassword ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyProfessorPassword}
                          className="px-2 py-0.5 bg-[#c8d9e6] hover:bg-[#b0c7d8] border border-[#7f9db9] rounded text-neutral-900 cursor-pointer font-medium text-[11px]"
                        >
                          {profPasswordCopied ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form to Set / Update Password */}
                <form onSubmit={handleSaveProfessorPassword} className="border border-neutral-300 bg-white p-3 rounded-sm space-y-3">
                  <div className="font-bold text-xs text-neutral-800 tracking-wider uppercase border-b border-neutral-200 pb-1 font-mono">
                    Set New Password
                  </div>

                  {/* Feedback alerts */}
                  {profPasswordError && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-2.5 py-1.5 rounded-sm text-xs flex items-center justify-between">
                      <span>{profPasswordError}</span>
                      <button
                        type="button"
                        onClick={() => setProfPasswordError("")}
                        className="text-red-500 hover:text-red-700 ml-2 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {profPasswordSuccess && (
                    <div className="bg-green-50 border border-green-300 text-green-800 px-2.5 py-1.5 rounded-sm text-xs flex items-center justify-between">
                      <span className="font-medium">{profPasswordSuccess}</span>
                      <button
                        type="button"
                        onClick={() => setProfPasswordSuccess("")}
                        className="text-green-600 hover:text-green-800 ml-2 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        New Password
                      </label>
                      <input
                        type={showNewProfPassword ? "text" : "password"}
                        value={newProfessorPasswordInput}
                        onChange={(e) => {
                          setNewProfessorPasswordInput(e.target.value);
                          if (profPasswordError) setProfPasswordError("");
                        }}
                        placeholder="Enter new professor password"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 text-black rounded-sm outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewProfPassword ? "text" : "password"}
                        value={confirmProfessorPasswordInput}
                        onChange={(e) => {
                          setConfirmProfessorPasswordInput(e.target.value);
                          if (profPasswordError) setProfPasswordError("");
                        }}
                        placeholder="Re-enter new professor password"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 text-black rounded-sm outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <input
                        type="checkbox"
                        id="toggle-show-new-pass"
                        checked={showNewProfPassword}
                        onChange={(e) => setShowNewProfPassword(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <label htmlFor="toggle-show-new-pass" className="text-[11px] text-neutral-600 cursor-pointer select-none">
                        Show password text
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setNewProfessorPasswordInput("");
                        setConfirmProfessorPasswordInput("");
                        setProfPasswordError("");
                      }}
                      className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded-sm text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfPassword || !newProfessorPasswordInput.trim()}
                      className="px-4 py-1 bg-[#1f4e79] hover:bg-[#163a5c] text-white border border-[#163a5c] rounded-sm text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingProfPassword ? "Saving..." : "Set Password"}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedAdminOption === "RM Session Code" ? (
              <div className="pt-1 space-y-4 font-sans text-neutral-800">
                {/* Description */}
                <div className="bg-[#f0f4f8] border border-[#bcd0e2] p-2.5 rounded-sm">
                  <div className="flex items-center gap-1.5 font-bold text-[#1f4e79] text-xs uppercase tracking-wide">
                    <span>🎮</span>
                    <span>RM Mode Starting Session Code</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-normal font-sans">
                    This session code defines the base simulation state that is cloned for students launching the game in RM (Restart / Replay) mode.
                  </p>
                </div>

                {/* Current Code Display */}
                <div className="border border-neutral-300 bg-neutral-50 p-3 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase font-mono">
                      Current RM Session Code:
                    </span>
                    <button
                      type="button"
                      onClick={fetchRmSessionCode}
                      disabled={loadingRmSessionCode}
                      className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-mono disabled:opacity-50 cursor-pointer"
                    >
                      <span>⟳</span>
                      <span>Refresh</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-neutral-300 px-3 py-2 rounded-sm font-mono text-sm">
                    <span className="select-all font-semibold tracking-wider text-black">
                      {rmSessionCode || <span className="text-neutral-400 italic">868204 (default)</span>}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRmSessionCode}
                      className="px-2 py-0.5 bg-[#c8d9e6] hover:bg-[#b0c7d8] border border-[#7f9db9] rounded text-neutral-900 cursor-pointer font-medium text-[11px]"
                    >
                      {rmSessionCodeCopied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  {rmSessionDetails && (
                    <div className="text-[11px] text-neutral-600 bg-white border border-neutral-200 px-2.5 py-1.5 rounded-sm font-mono space-y-0.5">
                      {rmSessionDetails.exists ? (
                        <>
                          <div className="text-green-700 font-semibold flex items-center gap-1">
                            <span>✓</span>
                            <span>Session verified in database</span>
                          </div>
                          {rmSessionDetails.teamName && (
                            <div>Team: <span className="font-semibold text-neutral-800">{rmSessionDetails.teamName}</span></div>
                          )}
                        </>
                      ) : (
                        <div className="text-amber-700 font-medium">
                          ⚠ Note: Session {rmSessionCode} not found in database records.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Set New Code Form */}
                <form onSubmit={(e) => handleSaveRmSessionCode(e, false)} className="border border-neutral-300 bg-white p-3 rounded-sm space-y-3">
                  <div className="font-bold text-xs text-neutral-800 tracking-wider uppercase border-b border-neutral-200 pb-1 font-mono">
                    Set New RM Session Code
                  </div>

                  {rmSessionCodeError && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-2.5 py-1.5 rounded-sm text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="break-all">{rmSessionCodeError}</span>
                        <button type="button" onClick={() => setRmSessionCodeError("")} className="text-red-500 hover:text-red-700 ml-2 font-bold cursor-pointer">✕</button>
                      </div>
                      {rmSessionCodeError.includes("does not exist") && (
                        <button
                          type="button"
                          onClick={(e) => handleSaveRmSessionCode(e, true)}
                          disabled={savingRmSessionCode}
                          className="mt-1 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Force Save Anyway
                        </button>
                      )}
                    </div>
                  )}

                  {rmSessionCodeSuccess && (
                    <div className="bg-green-50 border border-green-300 text-green-800 px-2.5 py-1.5 rounded-sm text-xs flex items-center justify-between">
                      <span>{rmSessionCodeSuccess}</span>
                      <button type="button" onClick={() => setRmSessionCodeSuccess("")} className="text-green-600 hover:text-green-800 ml-2 font-bold cursor-pointer">✕</button>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">New Session Code</label>
                    <input
                      type="text"
                      value={newRmSessionCodeInput}
                      onChange={(e) => {
                        setNewRmSessionCodeInput(e.target.value);
                        if (rmSessionCodeError) setRmSessionCodeError("");
                      }}
                      placeholder="Enter session code (e.g. 868204)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 text-black rounded-sm outline-none focus:border-blue-500 font-mono"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">Must be an existing session code with an initialized game state.</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setNewRmSessionCodeInput("");
                        setRmSessionCodeError("");
                      }}
                      className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded-sm text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={savingRmSessionCode || !newRmSessionCodeInput.trim()}
                      className="px-4 py-1 bg-[#1f4e79] hover:bg-[#163a5c] text-white border border-[#163a5c] rounded-sm text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {savingRmSessionCode ? "Saving..." : "Set Session Code"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-xs font-mono text-neutral-800 space-y-1.5 leading-relaxed pt-1 select-text">
                {loadingActivePasswords ? (
                  <div className="flex items-center justify-center py-10 text-neutral-500 italic">
                    ⟳ Loading valid passwords...
                  </div>
                ) : activePasswords.length > 0 ? (
                  activePasswords.map((item, idx) => (
                    <div key={item._id || idx} className="whitespace-nowrap overflow-x-auto py-0.5 hover:bg-neutral-100 font-mono">
                      {formatValidPasswordRow(item)}
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 italic py-4 text-center">
                    No active passwords found
                  </div>
                )}
                <div className="pt-3 font-bold text-neutral-700">
                  NL={activePasswords?.length || 0}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-4">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr] items-start">

            {/* LEFT SIDE: CONTROLS & TABLE & ADOPTER CHART */}
            <section className="flex flex-col gap-4">

              <div className="rounded-sm border border-black/10 bg-white shadow-sm overflow-hidden">

                {/* CONTROLS ROW */}
                <div className="flex flex-wrap items-center gap-4 border-b border-black/10 bg-neutral-50 px-3 py-2 text-xs">

                  {/* Session Key Search */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-black">Session Key:</span>
                    <input
                      type="text"
                      placeholder="Session Key"
                      value={sessionKeySearch}
                      onChange={(e) => setSessionKeySearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = e.target.value.trim();
                          if (val !== "") {
                            setTodayOnly(false);
                            setAppliedSinceDate("");
                            setSelectedDate("");
                            loadTeamOverview(1, false, "", val, lastMinutes);
                          } else if (todayOnly || appliedSinceDate || lastMinutes) {
                            loadTeamOverview(1, todayOnly, appliedSinceDate, "", lastMinutes);
                          } else {
                            setSessionRows([]);
                            setSnapshotSessions([]);
                            setPagination({ currentPage: 1, totalPages: 1, totalTeams: 0, hasNextPage: false, hasPrevPage: false });
                          }
                        }
                      }}
                      className="w-24 rounded-sm border border-black/30 bg-[#fbf5df] px-2 py-1 text-center font-bold text-black focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Update Info Button */}
                  <button
                    onClick={() => {
                      const val = sessionKeySearch.trim();
                      if (val !== "") {
                        setTodayOnly(false);
                        setAppliedSinceDate("");
                        setSelectedDate("");
                        loadTeamOverview(1, false, "", val, lastMinutes);
                      } else if (todayOnly || appliedSinceDate || lastMinutes) {
                        loadTeamOverview(1, todayOnly, appliedSinceDate, "", lastMinutes);
                      } else {
                        setSessionRows([]);
                        setSnapshotSessions([]);
                        setPagination({ currentPage: 1, totalPages: 1, totalTeams: 0, hasNextPage: false, hasPrevPage: false });
                      }
                    }}
                    disabled={loading}
                    className="rounded-sm bg-[#f5d98f] border border-black/30 px-3 py-1 font-bold text-black hover:bg-[#ebd083] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Update Info
                  </button>

                  {/* Today Only Button */}
                  <button
                    onClick={() => {
                      const newValue = !todayOnly;
                      setTodayOnly(newValue);
                      loadTeamOverview(1, newValue, appliedSinceDate, sessionKeySearch, lastMinutes);
                    }}
                    className={`rounded-sm border border-black/30 px-3 py-1 font-bold transition-colors ${todayOnly
                      ? "bg-red-700 text-white hover:bg-red-800"
                      : "bg-black text-white hover:bg-neutral-800"
                      }`}
                  >
                    Today Only
                  </button>

                  {/* Since Filter */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dateInputRef.current?.showPicker()}
                      className="font-bold text-black"
                    >
                      Since:
                    </button>
                    <button
                      onClick={() => dateInputRef.current?.showPicker()}
                      className="text-red-700 font-bold hover:underline"
                    >
                      {appliedSinceDate ? formatDisplayDate(appliedSinceDate) : "Select Date"}
                    </button>
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setSelectedDate(newDate);
                        setAppliedSinceDate(newDate);
                        loadTeamOverview(1, todayOnly, newDate, sessionKeySearch, lastMinutes);
                      }}
                      className="absolute opacity-0 pointer-events-none"
                    />
                  </div>

                  {/* Last Minutes Filter */}
                  <div className="flex items-center gap-1 text-[13px]">
                    <span className="font-semibold">Last</span>
                    <input
                      type="number"
                      value={lastMinutes}
                      placeholder="15"
                      min={1}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLastMinutes(val);
                        loadTeamOverview(1, todayOnly, appliedSinceDate, sessionKeySearch, val);
                      }}
                      className="w-12 border border-black/30 bg-white px-1 text-center font-bold text-black focus:outline-none"
                    />
                    <span className="font-semibold">min(s)</span>
                  </div>

                  {/* Reset All Button */}
                  <button
                    onClick={async () => {
                      setSessionKeySearch("");
                      setTodayOnly(false);
                      setSelectedDate(new Date().toISOString().split("T")[0]);
                      setAppliedSinceDate("");
                      setLastMinutes("");
                      try {
                        await axiosInstance.post("/admin/reset-all", { clearOverviewed: true }).catch(() => {});
                      } catch (e) {}
                      loadTeamOverview(1, false, "", "", "");
                    }}
                    disabled={loading}
                    className="rounded-sm bg-black border border-black/30 px-3 py-1 font-bold text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reset All
                  </button>

                  {/* Include in Overview checkbox */}
                  {/* <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="checkbox"
                        id="include-in-overview"
                        checked={includeInOverview}
                        onChange={(e) => setIncludeInOverview(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <label htmlFor="include-in-overview" className="cursor-pointer font-semibold select-none">
                        include in Overview (y)
                      </label>
                    </div> */}
                </div>

                {/* TABLE CONTAINER */}
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">

                    {/* Headers */}
                    <div className="grid grid-cols-[110px_60px_60px_45px_45px_45px_45px_50px_80px_160px_50px] border-b border-black/20 bg-[#f3f3f3] text-[12px] font-bold text-neutral-800">
                      <div className="px-2 py-2">Teams-{pagination.totalTeams || 0}</div>
                      <div className="text-center px-1 py-2">Code</div>
                      <div className="text-center px-1 py-2 whitespace-normal">Session<br />Key</div>
                      <div className="text-center px-1 py-2">#Days</div>
                      <div className="text-center px-1 py-2">#Dec</div>
                      <div className="text-center px-1 py-2">#Ad's</div>
                      <div className="text-center px-1 py-2">#PAPs</div>
                      <div className="text-center px-1 py-2">#D/#A</div>
                      <div className="text-center px-1 py-2 text-red-500 font-bold">Snaps & Reports</div>
                      <div className="col-span-2 text-center px-1 py-2">include in Overview (y)</div>
                    </div>

                    {/* Rows */}
                    <div className="min-h-[350px] divide-y divide-black/10">
                      {loading ? (
                        <div className="flex items-center justify-center py-20 text-[13px] font-medium text-neutral-500">
                          ⟳ Refreshing table data...
                        </div>
                      ) : sessionRows.length > 0 ? (
                        sessionRows.map((row) => (
                          <div
                            key={row.sessionId}
                            className="grid grid-cols-[110px_60px_60px_47px_47px_47px_47px_50px_70px_180px_50px] divide-x divide-black/10 text-[12px] items-center hover:bg-neutral-50/50"
                          >
                            <div
                              className="px-2 py-1.5 underline text-blue-600 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap font-semibold"
                              onClick={() => openSnapshotInNewTab(row.sessionId)}
                              title="Click to open session snapshot in new tab"
                            >
                              {row.team}
                            </div>
                            <div className="text-center px-1 py-1.5 text-neutral-600 font-mono">
                              {row.sessionCode}
                            </div>
                            <div className="text-center px-1 py-1.5 text-neutral-600 font-mono">{row.sessionKey}</div>
                            <div className="text-center px-1 py-1.5 text-neutral-600">{row.days}</div>
                            <div className="text-center px-1 py-1.5 text-neutral-600">{row.dec}</div>
                            <div className="text-center px-1 py-1.5 font-bold text-red-600">{row.ads}</div>
                            <div className="text-center px-1 py-1.5 font-bold text-red-600">{row.paps}</div>
                            <div className="text-center px-1 py-1.5 font-bold text-red-600">{row.ratio}</div>
                            <div className="flex justify-center gap-1.5 py-1.5 text-red-600 font-extrabold select-none">
                              <span
                                className="underline cursor-pointer hover:text-red-800"
                                onClick={() => openSnapshotInNewTab(row.sessionId)}
                                title="Click to open session snapshot in new tab"
                              >
                                S
                              </span>
                              <span
                                className="underline cursor-pointer hover:text-red-800"
                                onClick={() => openReportInNewTab(row.sessionId, row.team)}
                                title="Click to open session report in new tab"
                              >
                                R
                              </span>
                            </div>
                            <div className="text-center px-1 py-1.5 text-black-600 font-semibold select-none text-[10px] whitespace-nowrap">
                              {row.firstTime} {row.lastTime}
                            </div>
                            <div
                              className={`text-center px-1 py-1.5 font-bold select-none cursor-pointer transition-all ${row.overviewed ? 'opacity-0' : 'text-red-500 opacity-100 hover:text-red-700'}`}
                              onClick={() => handleToggleOverview(row.sessionId, row.overviewed)}
                              title={row.overviewed ? "Click to show in overview" : "Click to mark as overviewed (hide)"}
                            >
                              y
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center py-20 text-[13px] text-gray-500">
                          No sessions found
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/10 px-4 py-2.5 bg-neutral-50 text-[12px]">
                  <div className="text-neutral-500 font-medium">
                    Total Teams: {pagination.totalTeams || 0}
                  </div>
                  <div className="flex flex-wrap justify-center items-center gap-1.5">
                    <button
                      onClick={handlePrevPage}
                      disabled={!pagination.hasPrevPage}
                      className={`px-2 py-1 border rounded-sm font-semibold transition-colors ${pagination.hasPrevPage
                        ? "bg-white text-black hover:bg-neutral-100 border-black/20"
                        : "bg-transparent text-neutral-400 cursor-not-allowed border-transparent"
                        }`}
                    >
                      &lt;
                    </button>

                    {(() => {
                      const totalPages = pagination.totalPages || 1;
                      const current = pagination.currentPage || 1;
                      const maxVisible = 5;

                      let start = Math.max(1, current - 2);
                      let end = start + 4;

                      if (end > totalPages) {
                        end = totalPages;
                        start = Math.max(1, end - 4);
                      }

                      const pages = [];
                      if (start > 1) {
                        pages.push(1);
                        if (start > 2) pages.push('...');
                      }
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      if (end < totalPages) {
                        if (end < totalPages - 1) pages.push('...');
                        pages.push(totalPages);
                      }

                      return pages.map((page, index) => (
                        <button
                          key={`${page}-${index}`}
                          onClick={() => {
                            if (page !== '...') {
                              loadTeamOverview(page, todayOnly, appliedSinceDate, sessionKeySearch, lastMinutes);
                            }
                          }}
                          disabled={page === '...'}
                          className={`min-w-[28px] h-7 px-1 flex items-center justify-center rounded-sm font-semibold transition-colors ${page === current
                            ? "bg-black text-white"
                            : page === '...'
                              ? "bg-transparent text-black cursor-default"
                              : "bg-white text-black border border-black/20 hover:bg-neutral-100 cursor-pointer"
                            }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}

                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage}
                      className={`px-2 py-1 border rounded-sm font-semibold transition-colors ${pagination.hasNextPage
                        ? "bg-white text-black hover:bg-neutral-100 border-black/20"
                        : "bg-transparent text-neutral-400 cursor-not-allowed border-transparent"
                        }`}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>

              {/* ADOPTERS CHART BELOW THE TABLE */}
              {showGraphics && (
                <ReviewChart
                  title="# Adopters (22 max)"
                  data={dynamicChartData.map(d => ({ label: d.label, value: d.adopters }))}
                  yDomain={[0, 22]}
                  height={200}
                />
              )}
            </section>

            {/* RIGHT SIDE: SNAPSHOT PANEL & OTHER CHARTS */}
            <section className="flex flex-col gap-4">

              {/* Create Overview Snapshot card & controls */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:items-stretch">

                {/* Snapshot List Box */}
                <div className="border border-black/15 bg-[#ececec] w-full md:w-[320px] rounded-sm overflow-hidden flex flex-col shadow-sm">
                  <div className="bg-black px-3 py-1.5 text-[#efb860] text-[12px] font-bold uppercase tracking-wider">
                    Create Overview Snapshot
                  </div>
                  <div className="p-2 text-[12px] flex-1 flex flex-col justify-between">
                    <div>
                      <span className="block font-semibold mb-1">Your Snapshots (click to open):</span>
                      <div
                        onScroll={handleSnapshotListScroll}
                        className="bg-white border border-black/20 h-28 overflow-y-auto p-1 font-mono text-[10px] text-gray-700"
                      >
                        {loadingSnapshots && snapshotSessions.length === 0 ? (
                          <div className="text-gray-400 p-1">Loading snapshots...</div>
                        ) : snapshotSessions.length === 0 ? (
                          <div className="text-gray-400 p-1">No sessions found</div>
                        ) : (
                          <>
                            {snapshotSessions.map((row) => (
                              <div
                                key={row.sessionId}
                                onClick={() => openSnapshotInNewTab(row.sessionId)}
                                className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 text-neutral-800 hover:text-black truncate"
                                title={`Click to open snapshot for ${row.sessionCode}`}
                              >
                                {row.sessionCode} - Snapshot.jpg
                              </div>
                            ))}
                            {loadingSnapshots && (
                              <div className="text-gray-400 p-1 text-center border-t border-gray-100 mt-1">
                                Loading snapshots...
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {/* <p className="text-[9px] text-center italic text-gray-500 mt-2 select-none">
                        Snapshots are also stored automatically on your computer.
                      </p> */}
                  </div>
                </div>

                {/* Save/Graphics Buttons */}
                <div className="flex gap-1.5 md:self-start self-center">
                  <button
                    onClick={handleSaveData}
                    className="bg-black text-[#efb860] border border-black/40 px-3 py-1 text-[12px] font-bold hover:bg-neutral-800 transition-colors shadow-sm uppercase"
                  >
                    Save Data
                  </button>
                  <button
                    onClick={() => setShowGraphics(!showGraphics)}
                    className={`border border-black/40 px-3 py-1 text-[12px] font-bold transition-colors shadow-sm uppercase ${showGraphics
                      ? "bg-black text-[#efb860] hover:bg-neutral-800"
                      : "bg-neutral-300 text-neutral-600 hover:bg-neutral-400"
                      }`}
                  >
                    Graphics
                  </button>
                </div>
              </div>

              {/* S = #D/#A Ratio line chart */}
              {showGraphics && (
                <>
                  <ReviewChart
                    title="S = #D/#A"
                    data={dynamicChartData.map(d => ({ label: d.label, value: d.ratio }))}
                    yDomain={[0, 120]}
                  />

                  {/* Decisions and Days charts side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ReviewChart
                      title="# Decisions"
                      data={dynamicChartData.map(d => ({ label: d.label, value: d.decisions }))}
                      yDomain={[0, 'auto']}
                    />
                    <ReviewChart
                      title="# Days"
                      data={dynamicChartData.map(d => ({ label: d.label, value: d.days }))}
                      yDomain={[0, 120]}
                    />
                  </div>

                  {/* PAPs line chart */}
                  <ReviewChart
                    title="# PAPs (Pos. Attitude Points)"
                    data={dynamicChartData.map(d => ({ label: d.label, value: d.paps }))}
                    yDomain={[0, 243]}
                  />
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      {snapshotSessionId && (
        <SnapshotModal
          sessionId={snapshotSessionId}
          onClose={() => setSnapshotSessionId(null)}
        />
      )}

      {reportSessionData && (
        <ReportModal
          sessionId={reportSessionData.sessionId}
          teamName={reportSessionData.teamName}
          onClose={() => setReportSessionData(null)}
        />
      )}

      {/* Secret Password Input Popup Triggered by Double-Clicking 'w' */}
      {showSecretPasswordModal && (
        <div
          id="admin-secret-password-overlay"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-28 md:pt-32 bg-black/60 px-3 sm:px-4 font-sans cursor-pointer"
          onClick={() => {
            setShowSecretPasswordModal(false);
            setSecretPasswordInput('');
            setSecretPasswordError('');
          }}
        >
          <div
            id="admin-secret-password-container"
            className="w-full max-w-[360px] sm:max-w-[390px] rounded-sm overflow-hidden shadow-lg bg-[#c8d9e6] font-sans cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP WHITE STRIP */}
            <div className="bg-[#fcfbf9] h-6 w-full border-b border-[#e2e1df]"></div>

            {/* BODY */}
            <div className="py-3.5 sm:py-4 px-4 sm:px-5" style={{ backgroundColor: '#c8d9e6', color: '#000000' }}>
              <h2 className="text-sm mb-3 text-left font-medium">
                password
              </h2>
              <div className="mb-3 sm:mb-4">
                <div className="relative flex items-center">
                  <input
                    type={showSecretPassword ? "text" : "password"}
                    value={secretPasswordInput}
                    onChange={(e) => {
                      setSecretPasswordInput(e.target.value);
                      if (secretPasswordError) setSecretPasswordError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && secretPasswordInput && !isVerifyingSecretPassword) {
                        e.preventDefault();
                        handleSecretPasswordSubmit();
                      }
                    }}
                    placeholder="password"
                    className="w-full pl-2 pr-8 py-1 text-sm bg-white border border-[#4d86b8] text-black outline-none focus:border-blue-500 font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretPassword(!showSecretPassword)}
                    className="absolute right-2 text-gray-500 hover:text-gray-700 cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    {showSecretPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274-4.057 5.064-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {secretPasswordError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{secretPasswordError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSecretPasswordSubmit}
                  disabled={!secretPasswordInput || isVerifyingSecretPassword}
                  className="px-6 py-1 bg-white text-black border border-gray-400 text-xs font-semibold rounded-[1px] min-w-[75px] outline-none cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingSecretPassword ? "Checking..." : "OK"}
                </button>
                <button
                  onClick={() => {
                    setShowSecretPasswordModal(false);
                    setSecretPasswordInput('');
                    setSecretPasswordError('');
                  }}
                  className="px-6 py-1 bg-white text-black border border-gray-400 text-xs font-semibold rounded-[1px] min-w-[75px] outline-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
