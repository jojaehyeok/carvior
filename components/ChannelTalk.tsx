"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const PLUGIN_KEY = "05a1c010-2e20-40f7-82d4-eeac8d09c879";

export default function ChannelTalk() {
  const { data: session } = useSession();
  const user = session?.user as any;

  useEffect(() => {
    const w = window as any;
    if (!w.ChannelIO) {
      const ch: any = (...args: any[]) => ch.q.push(args);
      ch.q = [];
      w.ChannelIO = ch;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
      document.head.appendChild(s);
    }

    const bootOpts: Record<string, any> = { pluginKey: PLUGIN_KEY };
    if (user?.id) {
      bootOpts.memberId = String(user.id);
      bootOpts.profile = {
        name:  user.name  ?? undefined,
        email: user.email ?? undefined,
      };
    }

    w.ChannelIO("boot", bootOpts);
    return () => { w.ChannelIO?.("shutdown"); };
  }, [user?.id]);

  return null;
}