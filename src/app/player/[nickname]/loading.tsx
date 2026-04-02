import { TerminalLoading } from "@/components/ui/terminal-loading";

const STEPS = [
  { text: "connecting to nexon_api...", done: "[200 OK]" },
  { text: "fetching match_records...", done: "loaded" },
  { text: "computing statistics...", done: "done" },
  { text: "evaluating action_rules(15)...", done: "done" },
  { text: "classifying play_style...", done: "done" },
  { text: "generating suggestions...", done: "done" },
  { text: "building dashboard...", done: "" },
];

export default function Loading() {
  return <TerminalLoading title="analyzing player data..." steps={STEPS} />;
}
