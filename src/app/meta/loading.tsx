import { TerminalLoading } from "@/components/ui/terminal-loading";

const STEPS = [
  { text: "connecting to nexon_api...", done: "[200 OK]" },
  { text: "fetching ranker_meta...", done: "loaded" },
  { text: "fetching general_meta...", done: "loaded" },
  { text: "resolving player_names...", done: "done" },
  { text: "building meta_dashboard...", done: "" },
];

export default function Loading() {
  return <TerminalLoading title="loading meta dashboard..." steps={STEPS} />;
}
