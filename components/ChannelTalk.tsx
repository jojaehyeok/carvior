"use client";

import { useEffect } from "react";

export default function ChannelTalk() {
  useEffect(() => {
    // 채널톡 스크립트 주입 (공식 가이드 코드)
    (function() {
      var w = window as any;
      if (w.ChannelIO) return;
      var ch = function() { ch.c(arguments); } as any;
      ch.q = [] as any[];
      ch.c = function(args: any) { ch.q.push(args); };
      w.ChannelIO = ch;
      function l() {
        if (w.ChannelIOInitialized) return;
        w.ChannelIOInitialized = true;
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
        var x = document.getElementsByTagName("script")[0];
        if (x.parentNode) x.parentNode.insertBefore(s, x);
      }
      if (document.readyState === "complete") l();
      else {
        window.addEventListener("DOMContentLoaded", l, false);
        window.addEventListener("load", l, false);
      }
    })();

    // 채널톡 초기화
    (window as any).ChannelIO('boot', {
      "pluginKey": "05a1c010-2e20-40f7-82d4-eeac8d09c879" // 여기에 실제 발급받은 키를 넣으세요
    });

    // 언마운트 시 종료 (선택 사항)
    return () => {
      (window as any).ChannelIO('shutdown');
    };
  }, []);

  return null;
}