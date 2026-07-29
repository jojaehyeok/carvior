"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const PLUGIN_KEY = "05a1c010-2e20-40f7-82d4-eeac8d09c879";

// 특정 페이지(예: /inspection 결제 폼)에서 플로팅 버튼이 결제 버튼 등을 가려서
// 방해될 때, 그 페이지가 이 이벤트로 노출 여부를 직접 제어할 수 있게 함.
// ChannelIO SDK 자체(boot)는 그대로 유지되므로 ChannelIO('show') 호출은 계속 동작한다.
export const CHANNEL_BUTTON_VISIBILITY_EVENT = "cvr:channel-button-visibility";

export default function ChannelTalk() {
  const { data: session } = useSession();
  const user = session?.user as
    | { id?: string | number; name?: string | null; email?: string | null; image?: string | null }
    | undefined;

  const userId = user?.id;
  const userName = user?.name;
  const userEmail = user?.email;

  const [buttonVisible, setButtonVisible] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      const visible = (e as CustomEvent<boolean>).detail;
      setButtonVisible(visible !== false);
    };
    window.addEventListener(CHANNEL_BUTTON_VISIBILITY_EVENT, handler);
    return () => window.removeEventListener(CHANNEL_BUTTON_VISIBILITY_EVENT, handler);
  }, []);

  useEffect(() => {
    const w = window as Window & typeof globalThis & { ChannelIO?: any };
    if (!w.ChannelIO) {
      const ch: any = (...args: any[]) => ch.q.push(args);
      ch.q = [];
      w.ChannelIO = ch;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
      document.head.appendChild(s);
    }

    const bootOpts: Record<string, any> = {
      pluginKey: PLUGIN_KEY,
      hideChannelButtonOnBoot: true,
      customLauncherSelector: ".ch-custom-launcher",
    };
    if (userId) {
      bootOpts.memberId = String(userId);
      bootOpts.profile = {
        name: userName ?? undefined,
        email: userEmail ?? undefined,
      };
    }

    w.ChannelIO?.("boot", bootOpts);
    return () => {
      w.ChannelIO?.("shutdown");
    };
  }, [userId, userName, userEmail]);

  const handleClick = () => {
    const ch = (window as Window & typeof globalThis & { ChannelIO?: any }).ChannelIO;
    ch?.("show");
  };

  if (!buttonVisible) return null;

  return (
    <button
      type="button"
      className="ch-custom-launcher"
      aria-label="채팅 문의"
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 999,
        boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
        padding: "8px 16px 8px 8px",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "linear-gradient(135deg,#7c3aed,#a855f7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {user?.image ? (
          <img src={user.image} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>
        채팅 문의
      </span>
    </button>
  );
}