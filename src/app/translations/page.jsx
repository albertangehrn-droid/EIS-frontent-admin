"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { Trash2, CheckCircle, AlertCircle } from "lucide-react";

import SimulationHeader from '@/components/common/SimulationHeader';

import GameButton from '@/components/Buttons/GameButton';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SUPPORTED_LANGUAGES = [
  { "name": "German", "code": "de", "longCode": "de" },
  { "name": "German (Germany)", "code": "de", "longCode": "de-DE" },
  { "name": "German (Austria)", "code": "de", "longCode": "de-AT" },
  { "name": "German (Swiss)", "code": "de", "longCode": "de-CH" },
  { "name": "English", "code": "en", "longCode": "en" },
  { "name": "English (US)", "code": "en", "longCode": "en-US" },
  { "name": "English (Australian)", "code": "en", "longCode": "en-AU" },
  { "name": "English (GB)", "code": "en", "longCode": "en-GB" },
  { "name": "English (Canadian)", "code": "en", "longCode": "en-CA" },
  { "name": "English (New Zealand)", "code": "en", "longCode": "en-NZ" },
  { "name": "English (South African)", "code": "en", "longCode": "en-ZA" },
  { "name": "Spanish", "code": "es", "longCode": "es" },
  { "name": "Spanish (voseo)", "code": "es", "longCode": "es-AR" },
  { "name": "French", "code": "fr", "longCode": "fr" },
  { "name": "French (Canada)", "code": "fr", "longCode": "fr-CA" },
  { "name": "French (Switzerland)", "code": "fr", "longCode": "fr-CH" },
  { "name": "French (Belgium)", "code": "fr", "longCode": "fr-BE" },
  { "name": "Dutch", "code": "nl", "longCode": "nl" },
  { "name": "Dutch (Belgium)", "code": "nl", "longCode": "nl-BE" },
  { "name": "Portuguese (Angola preAO)", "code": "pt", "longCode": "pt-AO" },
  { "name": "Portuguese (Brazil)", "code": "pt", "longCode": "pt-BR" },
  { "name": "Portuguese (Moçambique preAO)", "code": "pt", "longCode": "pt-MZ" },
  { "name": "Portuguese (Portugal)", "code": "pt", "longCode": "pt-PT" },
  { "name": "Portuguese", "code": "pt", "longCode": "pt" },
  { "name": "Arabic", "code": "ar", "longCode": "ar" },
  { "name": "Danish", "code": "da", "longCode": "da-DK" },
  { "name": "Greek", "code": "el", "longCode": "el-GR" },
  { "name": "Persian", "code": "fa", "longCode": "fa" },
  { "name": "Italian", "code": "it", "longCode": "it" },
  { "name": "Japanese", "code": "ja", "longCode": "ja-JP" },
  { "name": "Polish", "code": "pl", "longCode": "pl-PL" },
  { "name": "Romanian", "code": "ro", "longCode": "ro-RO" },
  { "name": "Russian", "code": "ru", "longCode": "ru-RU" },
  { "name": "Swedish", "code": "sv", "longCode": "sv" },
  { "name": "Ukrainian", "code": "uk", "longCode": "uk-UA" },
  { "name": "Chinese", "code": "zh", "longCode": "zh-CN" },
  { "name": "Norwegian (Bokmål)", "code": "nb", "longCode": "nb" },
  { "name": "Norwegian (Bokmål)", "code": "no", "longCode": "no" },
  { "name": "Dutch", "code": "nl", "longCode": "nl-NL" },
  { "name": "Spanish", "code": "es", "longCode": "es-ES" },
  { "name": "Italian", "code": "it", "longCode": "it-IT" },
  { "name": "Persian", "code": "fa", "longCode": "fa-IR" },
  { "name": "Swedish", "code": "sv", "longCode": "sv-SE" },
  { "name": "German", "code": "de", "longCode": "de-LU" },
  { "name": "French", "code": "fr", "longCode": "fr-FR" }
];

export default function TranslationManager() {
  const router = useRouter();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [languageName, setLanguageName] = useState("");
  const [languageCodeInput, setLanguageCodeInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedLanguage, setCopiedLanguage] = useState("");

  const getClientUrl = (langName) => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    let clientOrigin = origin;
    
    if (origin.includes("localhost:3001") || origin.includes("localhost:3002") || origin.includes("localhost:5173")) {
      clientOrigin = "http://localhost:3000";
    } else if (origin.includes("127.0.0.1:3001") || origin.includes("127.0.0.1:3002")) {
      clientOrigin = "http://127.0.0.1:3000";
    } else {
      clientOrigin = origin.replace("admin.", "play.").replace("-admin", "");
    }
    
    return `${clientOrigin}/?lang=${encodeURIComponent(langName.toLowerCase())}`;
  };

  const handleCopyUrl = (langName) => {
    const url = getClientUrl(langName);
    navigator.clipboard.writeText(url);
    setCopiedLanguage(langName);
    setTimeout(() => setCopiedLanguage(""), 2000);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/translations/list");
      if (res.data.success) {
        setLanguages(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch languages");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/$/, '');
      const cleanApiUrl = rawApiUrl || "http://localhost:5000/api/v1";
      window.open(`${cleanApiUrl}/translations/export`, "_blank");
    } catch (err) {
      console.error(err);
      setError("Failed to export translations");
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file || !languageName || !languageCodeInput) {
      setError("Please select a file, language name, and language code.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("languageName", languageName);
      formData.append("languageCode", languageCodeInput);

      const res = await axiosInstance.post("/translations/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setSuccess("Language imported successfully!");
        setFile(null);
        setLanguageName("");
        setLanguageCodeInput("");
        fetchLanguages();
      } else {
        setError(res.data.error || "Import failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetActive = async (id) => {
    try {
      const res = await axiosInstance.put("/translations/active", { id });
      if (res.data.success) {
        setSuccess("Active language updated!");
        fetchLanguages();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to set active language");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axiosInstance.delete(`/translations/${id}`);
      if (res.data.success) {
        setSuccess("Language deleted!");
        fetchLanguages();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete language");
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#e8e8e8]" style={{ fontFamily: 'Tahoma, Arial, Helvetica, sans-serif' }}>
      
      <SimulationHeader 
        leftContent={
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              label="EIS Simulation"
              onClick={() => router.push('/')}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            />
          </div>
        }
        rightContent={
          <div className="flex items-center gap-1 mt-2 sm:mt-3">
            <div className="flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="translations-desktop-nav-buttons"
                className="flex items-center justify-end w-full"
              >
                <GameButton
                  id="shared-btn-back-to-action"
                  label="BACK TO ACTION"
                  onClick={() => router.push('/')}
                  variant="nav"
                  size="md"
                  className="px-4 sm:px-6 py-0 !text-[0.9rem] sm:!text-[1.2rem] !font-semibold !whitespace-nowrap w-[120px] sm:w-[180px]"
                />
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => { window.print(); }}
                variant="nav"
                size="sm"
                className="text-[10px] sm:text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] w-[120px] sm:w-[180px] mt-[2px]"
              />
            </div>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          
          <h1 className="text-[26px] font-bold text-[#1e3a8a] uppercase mb-6 tracking-wide">
            TRANSLATION MANAGER
          </h1>

          {error && (
            <div className="flex items-center gap-2 bg-white border-l-4 border-red-600 text-red-700 px-4 py-3 shadow-sm mb-6">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-white border-l-4 border-green-600 text-green-700 px-4 py-3 shadow-sm mb-6">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-sm">{success}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* EXPORT BOX */}
            <div className="bg-white border border-[#ccc] p-6 shadow-sm">
              <h2 className="text-[16px] font-bold text-black uppercase border-b border-[#ddd] pb-2 mb-4">
                Export Base Template
              </h2>
              <p className="text-[13px] text-gray-700 mb-6 leading-relaxed">
                Download the base English translation template (Excel format) containing all texts, including database strings.
              </p>
              <GameButton label="DOWNLOAD TEMPLATE" onClick={handleExport} variant="nav" size="sm" />
            </div>

            {/* IMPORT BOX */}
            <div className="bg-white border border-[#ccc] p-6 shadow-sm">
              <h2 className="text-[16px] font-bold text-black uppercase border-b border-[#ddd] pb-2 mb-4">
                Import Translation
              </h2>
              <p className="text-[13px] text-gray-700 mb-4 leading-relaxed">
                Upload a translated Excel file to add a new language or update an existing one.
              </p>
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">SELECT PRESET LANGUAGE</label>
                  <select 
                    onChange={(e) => {
                      const selected = SUPPORTED_LANGUAGES.find(l => l.longCode === e.target.value);
                      if (selected) {
                        setLanguageCodeInput(selected.longCode);
                        // Auto populate name (e.g. "French (Canada)" -> "French (Canada)")
                        setLanguageName(selected.name);
                      } else {
                        setLanguageCodeInput("");
                        setLanguageName("");
                      }
                    }}
                    value={languageCodeInput}
                    className="w-full border border-[#aaa] p-2 text-[13px] outline-none focus:border-[#1e3a8a] bg-[#fafafa]"
                  >
                    <option value="">-- Choose a Preset (optional) --</option>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.longCode} value={lang.longCode}>
                        {lang.name} ({lang.longCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">LANGUAGE NAME (E.G. FRENCH)</label>
                  <input 
                    type="text"
                    value={languageName}
                    onChange={(e) => setLanguageName(e.target.value)}
                    required
                    placeholder="e.g. French"
                    className="w-full border border-[#aaa] p-2 text-[13px] outline-none focus:border-[#1e3a8a] bg-[#fafafa]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">LANGUAGE CODE FOR TTS (E.G. FR-FR, HI-IN)</label>
                  <input 
                    type="text"
                    value={languageCodeInput}
                    onChange={(e) => setLanguageCodeInput(e.target.value)}
                    placeholder="e.g. fr-FR"
                    required
                    className="w-full border border-[#aaa] p-2 text-[13px] outline-none focus:border-[#1e3a8a] bg-[#fafafa]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">EXCEL FILE (.XLSX)</label>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                    className="w-full text-[13px] text-gray-700 file:mr-4 file:py-1 file:px-3 file:border-0 file:text-[12px] file:font-bold file:bg-[#1e3a8a] file:text-white hover:file:bg-blue-800 file:cursor-pointer"
                  />
                </div>
                <div className="pt-2">
                  <GameButton 
                    label={uploading ? "UPLOADING..." : "UPLOAD & SAVE"} 
                    disabled={uploading}
                    variant="nav" 
                    size="sm"
                    className="!w-full"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* LIST BOX */}
          <div className="bg-white border border-[#ccc] p-6 mb-12 shadow-sm">
            <h2 className="text-[16px] font-bold text-black uppercase border-b border-[#ddd] pb-2 mb-4">
              Available Languages
            </h2>
            
            {loading ? (
              <div className="py-8 text-center text-gray-500 text-[13px]">Loading languages...</div>
            ) : languages.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-[13px]">No languages uploaded yet.</div>
            ) : (
              <div className="w-full border border-[#ddd] overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f5] text-[11px] font-bold text-gray-700 uppercase tracking-wider border-b border-[#ddd]">
                      <th className="px-4 py-3">Language</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Simulation URL</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {languages.map((lang, index) => (
                      <tr key={lang._id} className={index !== languages.length - 1 ? "border-b border-[#eee]" : ""}>
                        <td className="px-4 py-3 font-bold text-black">{lang.language}</td>
                        <td className="px-4 py-3">
                          {lang.isActive ? (
                            <span className="bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 text-[11px] font-bold uppercase">Active</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 border border-gray-300 px-2 py-0.5 text-[11px] font-bold uppercase">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <a 
                              href={getClientUrl(lang.language)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 underline font-mono text-[11px] break-all"
                            >
                              {getClientUrl(lang.language)}
                            </a>
                            <button
                              onClick={() => handleCopyUrl(lang.language)}
                              className="text-gray-500 hover:text-black border border-[#ccc] hover:border-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#fafafa] whitespace-nowrap"
                            >
                              {copiedLanguage === lang.language ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {lang.isActive ? (
                              <button 
                                onClick={() => handleSetActive(null)}
                                className="text-gray-500 hover:text-gray-700 text-[11px] font-bold uppercase underline"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleSetActive(lang._id)}
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-bold uppercase underline"
                              >
                                Set Active
                              </button>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="text-red-600 hover:text-red-800 p-1">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-[#333] rounded-none">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="uppercase font-bold text-[#1e3a8a] border-b border-[#ddd] pb-2 text-[16px]">
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-[13px] text-gray-700 pt-2">
                                    This will permanently delete the <strong className="text-black">{lang.language}</strong> translation. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                  <AlertDialogCancel className="rounded-none text-[12px] font-bold uppercase h-9">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="rounded-none bg-red-600 hover:bg-red-700 text-[12px] font-bold uppercase h-9"
                                    onClick={() => handleDelete(lang._id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>


      
    </div>
  );
}
