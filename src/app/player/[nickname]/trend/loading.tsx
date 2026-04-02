import { TerminalLoading } from "@/components/ui/terminal-loading";

const STEPS = [
  { text: "connecting to nexon_api...", done: "[200 OK]" },
  { text: "querying match_history...", done: "loaded" },
  { text: "computing weighted_moving_avg...", done: "done" },
  { text: "detecting trend_direction...", done: "done" },
  { text: "rendering charts...", done: "" },
];

export default function Loading() {
  return <TerminalLoading title="analyzing trend data..." steps={STEPS} />;
}
