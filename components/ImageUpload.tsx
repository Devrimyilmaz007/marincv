"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, Building2, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface ImageUploadProps {
  /** Mevcut resim URL'i (varsa önizleme gösterir) */
  currentUrl?:  string | null;
  /** Yükleme tamamlandığında public URL ile çağrılır */
  onUpload:     (url: string) => void;
  /** "avatar" → yuvarlak, "logo" → köşeli kare */
  variant?:     "avatar" | "logo";
  /** Storage'daki klasör yolu — genellikle user.id */
  folder:       string;
  /** Opsiyonel ek class */
  className?:   string;
  /** Resim yokken gösterilecek baş harf metni (örn: "DY") */
  placeholder?: string;
  /** Boyut class'ı — varsayılan "w-24 h-24" */
  size?:        string;
  /** Alt helper metni gizle */
  hideHint?:    boolean;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";
const MAX_MB   = 5;

function fileError(file: File): string | null {
  if (!ACCEPTED.split(",").includes(file.type))
    return "Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz.";
  if (file.size > MAX_MB * 1024 * 1024)
    return `Dosya boyutu ${MAX_MB} MB'ı geçemez.`;
  return null;
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function ImageUpload({
  currentUrl,
  onUpload,
  variant     = "avatar",
  folder,
  className   = "",
  placeholder,
  size        = "w-24 h-24",
  hideHint    = false,
}: ImageUploadProps) {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [preview,  setPreview]      = useState<string | null>(currentUrl ?? null);
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState<string | null>(null);

  /* currentUrl prop dışarıdan değiştiğinde (örn. context yüklendikten sonra)
     aktif bir yükleme yoksa preview'i güncelle */
  useEffect(() => {
    if (!loading) {
      setPreview(currentUrl ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl]);

  const isAvatar = variant === "avatar";

  /* ── Upload handler ──────────────────────────────────────────────────── */
  async function handleFile(file: File) {
    const err = fileError(file);
    if (err) { setError(err); return; }

    setError(null);
    setLoading(true);

    /* Lokal önizleme hemen göster */
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const supabase = createClient();
    const ext      = file.name.split(".").pop() ?? "jpg";
    const path     = `${folder}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setError("Yükleme başarısız: " + upErr.message);
      setPreview(currentUrl ?? null);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    onUpload(data.publicUrl);
    setLoading(false);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearImage(ev: React.MouseEvent) {
    ev.stopPropagation();
    setPreview(null);
    onUpload("");
  }

  /* ── Sizes ───────────────────────────────────────────────────────────── */
  const wrapperCls = isAvatar
    ? `${size} rounded-full`
    : `${size} rounded-2xl`;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>

      {/* ── Clickable area ────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Fotoğraf yükle"
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !loading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={[
          wrapperCls,
          "relative group cursor-pointer overflow-hidden",
          "bg-[#0D1629] border-2 border-dashed border-slate-700/60",
          "hover:border-[#00D2FF]/50 transition-all duration-200",
          loading ? "cursor-wait" : "",
        ].join(" ")}
      >
        {/* Preview image */}
        {preview ? (
          <img
            src={preview}
            alt="Profil fotoğrafı"
            className="w-full h-full object-cover"
          />
        ) : placeholder ? (
          /* Initials placeholder */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-[#00D2FF] text-white font-black text-lg select-none">
            {placeholder}
          </div>
        ) : (
          /* Icon placeholder */
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            {isAvatar
              ? <Camera size={28} strokeWidth={1.5} />
              : <Building2 size={28} strokeWidth={1.5} />
            }
          </div>
        )}

        {/* Hover / loading overlay */}
        <div className={[
          "absolute inset-0 flex flex-col items-center justify-center gap-1",
          "bg-black/60 transition-opacity duration-200",
          loading
            ? "opacity-100"
            : preview
              ? "opacity-0 group-hover:opacity-100"
              : "opacity-0 group-hover:opacity-100",
        ].join(" ")}>
          {loading ? (
            <Loader2 size={22} className="text-[#00D2FF] animate-spin" />
          ) : (
            <>
              <Camera size={20} className="text-white" />
              <span className="text-[10px] text-white font-medium leading-tight text-center px-1">
                {preview ? "Değiştir" : "Yükle"}
              </span>
            </>
          )}
        </div>

        {/* Clear button */}
        {preview && !loading && (
          <button
            type="button"
            onClick={clearImage}
            aria-label="Fotoğrafı kaldır"
            className={[
              "absolute top-0.5 right-0.5 w-5 h-5 rounded-full",
              "bg-red-500 text-white flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-red-400 z-10",
            ].join(" ")}
          >
            <X size={11} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* ── Helper text ───────────────────────────────────────────────── */}
      {!hideHint && (
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          JPG, PNG veya WEBP · Maks. {MAX_MB} MB
          <br />
          <span className="text-slate-600">Sürükle-bırak da çalışır</span>
        </p>
      )}

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error && (
        <p className="text-xs text-red-400 text-center max-w-[160px] leading-relaxed">
          {error}
        </p>
      )}

      {/* ── Hidden file input ─────────────────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={onChange}
        aria-hidden="true"
      />
    </div>
  );
}
