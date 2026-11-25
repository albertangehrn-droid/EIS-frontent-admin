"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuthUser } from "@/contexts/AuthContext";
import { showToast } from "@/components/_ui/toast-utils";

export default function useFileUpload({
  url,
  authRequired = false,
  allowedTypes = [],
  fieldName = "files",
  maxFileSize = 5,
  maxFiles = 5,
}) {
  const { authUser } = useAuthUser();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  /* ---------- PREVIEW ---------- */
  useEffect(() => {
    if (!selectedFiles.length) {
      setFilePreviews((prev) => (prev.length ? [] : prev));
      return;
    }

    const previews = selectedFiles.map((file) => ({
      name: file.name,
      url: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : getFileIcon(file),
      type: file.type.startsWith("image/") ? "image" : "icon",
    }));

    setFilePreviews(previews);

    return () => {
      previews
        .filter((p) => p.type === "image")
        .forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [selectedFiles]);

  /* ---------- VALIDATION ---------- */
  const validateFiles = (files) => {
    if (!files || files.length === 0) {
      showToast("error", "No files selected");
      return false;
    }

    if (files.length > maxFiles) {
      showToast("error", `Maximum ${maxFiles} files allowed`);
      return false;
    }

    for (let file of files) {
      if (allowedTypes.length && !allowedTypes.includes(file.type)) {
        showToast("error", `Invalid file type: ${file.name}`);
        return false;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        showToast("error", `${file.name} exceeds ${maxFileSize}MB`);
        return false;
      }
    }

    return true;
  };

  /* ---------- 🔥 SINGLE-CLICK SAFE UPLOAD ---------- */
 const uploadFile = async (filesOverride) => {
  const files = filesOverride ?? selectedFiles;

  if (!validateFiles(files)) return null;

  setLoading(true);
  setError(null);

  try {
    const formData = new FormData();
    files.forEach((file) => formData.append(fieldName, file));

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      formData,
      {
        headers: {
          ...(authRequired && authUser?.token
            ? { Authorization: `Bearer ${authUser.token}` }
            : {}),
        },
      }
    );

    if (response.data?.success || response.data?.statusCode === 200) {
      showToast("success", response.data.message || "Uploaded successfully");

      // ❌ yahan clear mat karo
      return { data: response.data, error: null };
    }

    throw new Error(response.data?.message || "Upload failed");
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Upload failed";
    showToast("error", msg);
    return { data: null, error: msg };
  } finally {
    setLoading(false);
  }
};


  const clearFiles = useCallback(() => setSelectedFiles([]), []);

  return {
    uploadFile,
    loading,
    progress,
    error,
    selectedFiles,
    filePreviews,
    validateFiles,
    setSelectedFiles,
    clearFiles,
  };
}

/* ---------- FILE ICON ---------- */
function getFileIcon(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  return (
    {
      pdf: "/icons/pdf.svg",
      doc: "/icons/doc.svg",
      docx: "/icons/doc.svg",
      xls: "/icons/xls.svg",
      xlsx: "/icons/xls.svg",
      csv: "/icons/csv.svg",
    }[ext] || "/icons/file.svg"
  );
}
