import { TerminalLoading } from "@/components/ui/terminal-loading";

const STEPS = [
  { text: "connecting to nexon_api...", done: "[200 OK]" },
  { text: "fetching match_detail...", done: "loaded" },
  { text: "resolving player_names...", done: "done" },
  { text: "parsing match_events...", done: "done" },
  { text: "building detail_view...", done: "" },
];

export default function Loading() {
  return <TerminalLoading title="loading match detail..." steps={STEPS} />;
}
