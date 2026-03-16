import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | null | undefined): string {
  if (num == null) return "-";
  return num.toLocaleString("ko-KR");
}

export function formatWon(amount: number | null | undefined): string {
  if (amount == null) return "-";
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatManWon(amount: number | null | undefined): string {
  if (amount == null) return "-";
  const manWon = Math.round(amount / 10_000);
  if (Math.abs(manWon) >= 10_000) {
    const eok = Math.floor(Math.abs(manWon) / 10_000);
    const rest = Math.abs(manWon) % 10_000;
    const sign = manWon < 0 ? "-" : "";
    if (rest === 0) return `${sign}${eok.toLocaleString("ko-KR")}억원`;
    return `${sign}${eok.toLocaleString("ko-KR")}억 ${rest.toLocaleString("ko-KR")}만원`;
  }
  return `${manWon.toLocaleString("ko-KR")}만원`;
}

export function formatManWonValue(manWon: number | null | undefined): string {
  if (manWon == null) return "-";
  const rounded = Math.round(manWon);
  if (Math.abs(rounded) >= 10_000) {
    const eok = Math.floor(Math.abs(rounded) / 10_000);
    const rest = Math.abs(rounded) % 10_000;
    const sign = rounded < 0 ? "-" : "";
    if (rest === 0) return `${sign}${eok.toLocaleString("ko-KR")}억원`;
    return `${sign}${eok.toLocaleString("ko-KR")}억 ${rest.toLocaleString("ko-KR")}만원`;
  }
  return `${rounded.toLocaleString("ko-KR")}만원`;
}

export function formatPercent(rate: number | null | undefined, decimals = 2): string {
  if (rate == null) return "-";
  return `${(rate * 100).toFixed(decimals)}%`;
}
