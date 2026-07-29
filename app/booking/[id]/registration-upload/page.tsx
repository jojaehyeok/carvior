"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function RegistrationUploadPage() {
  const { id } = useParams();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleUpload = async () => {
    if (!file || !id) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(
        `https://carvior.store/api/v1/external/request/${id}/transferred-registration`,
        { method: "POST", body: form },
      );
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 pt-16 pb-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-black text-gray-900 mb-1">등록증 업로드</h1>
        <p className="text-sm text-gray-500 mb-6">
          명의이전이 완료된 자동차등록증 사진을 올려주세요.
        </p>

        {done ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-bold text-gray-900">업로드가 완료됐어요.</p>
            <p className="text-sm text-gray-400 mt-1">감사합니다!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="block">
              <input type="file" accept="image/*" capture="environment" onChange={handleSelect} className="hidden" />
              <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="선택한 등록증 사진" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-sm text-gray-400">탭해서 사진 선택 / 촬영</span>
                )}
              </div>
            </label>

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full mt-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl text-sm transition-colors"
            >
              {uploading ? "업로드 중..." : "업로드하기"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
