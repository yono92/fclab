import { TerminalLoading } from "@/components/ui/terminal-loading";

const STEPS = [
  { text: "connecting to nexon_api...", done: "[200 OK]" },
  { text: "fetching player_stats...", done: "loaded" },
  { text: "querying ranker_data(top10)...", done: "done" },
  { text: "computing cohens_d...", done: "done" },
  { text: "generating comparison...", done: "" },
];

export default function Loading() {
  return <TerminalLoading title="comparing with rankers..." steps={STEPS} />;
}
