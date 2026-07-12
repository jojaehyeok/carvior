"use client";

import { useEffect } from "react";

const PLUGIN_KEY = "05a1c010-2e20-40f7-82d4-eeac8d09c879";

export default function ChannelTalk() {
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
    w.ChannelIO("boot", { pluginKey: PLUGIN_KEY });
    return () => { w.ChannelIO?.("shutdown"); };
  }, []);

  return null;
}