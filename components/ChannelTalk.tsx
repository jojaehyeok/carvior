"use client";

import { useEffect } from "react";
import ChannelService from "@channel.io/channel-web-sdk-loader";

const PLUGIN_KEY = "05a1c010-2e20-40f7-82d4-eeac8d09c879";

export default function ChannelTalk() {
  useEffect(() => {
    ChannelService.loadScript();
    ChannelService.boot({ pluginKey: PLUGIN_KEY });
    return () => { ChannelService.shutdown(); };
  }, []);

  return null;
}