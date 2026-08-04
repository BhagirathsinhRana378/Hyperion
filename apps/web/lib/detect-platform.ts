export type Platform = "windows" | "macos" | "linux" | "unknown";

const WIN_REGEX = /win/;
const MAC_REGEX = /mac/;
const LINUX_REGEX = /linux/;

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") {
    return "unknown";
  }
  const ua = navigator.userAgent.toLowerCase();

  if (WIN_REGEX.test(ua)) {
    return "windows";
  }
  if (MAC_REGEX.test(ua)) {
    return "macos";
  }
  if (LINUX_REGEX.test(ua)) {
    return "linux";
  }
  return "unknown";
}
