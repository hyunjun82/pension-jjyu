"use client";

import { Link2, Check } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const shareKakao = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(
      `https://story.kakao.com/share?url=${url}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareNaver = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(
      `https://share.naver.com/web/shareView?url=${url}&title=${text}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={shareKakao}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-[10px] font-bold text-yellow-600 transition-colors hover:bg-yellow-50"
        title="카카오 공유"
      >
        K
      </button>
      <button
        onClick={shareNaver}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-[10px] font-bold text-green-600 transition-colors hover:bg-green-50"
        title="네이버 공유"
      >
        N
      </button>
      <button
        onClick={shareFacebook}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-[10px] font-bold text-blue-600 transition-colors hover:bg-blue-50"
        title="페이스북 공유"
      >
        f
      </button>
      <button
        onClick={shareX}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
        title="X 공유"
      >
        X
      </button>
      <button
        onClick={handleCopy}
        className="flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[10px] text-slate-500 transition-colors hover:bg-slate-50"
        title="URL 복사"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-500" />
            <span className="text-emerald-600">복사됨</span>
          </>
        ) : (
          <>
            <Link2 className="h-3 w-3" />
            <span>URL</span>
          </>
        )}
      </button>
    </div>
  );
}
