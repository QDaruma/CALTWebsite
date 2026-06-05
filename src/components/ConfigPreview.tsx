import { useEffect, useMemo, useRef, useState } from "react";
import { projectFileMap, type ProjectSettings, type ProjectSpec } from "../lib/zip";
import { type BuildConfig } from "../lib/codegen";
import { useT } from "../i18n";
import { Segmented } from "./ui/Segmented";
import { cn } from "../lib/utils";

// Keys the graphical controls write into each file. Matching lines get a
// persistent highlight so users can see which parts the controls edit.
const TRAIN_KEYS = new Set([
  "num_train_epochs",
  "num_encoder_layers",
  "num_decoder_layers",
  "num_encoder_heads",
  "num_decoder_heads",
  "d_model",
  "encoder_ffn_dim",
  "decoder_ffn_dim",
  "use_positional_embedding",
  "no_wandb",
]);
const DATA_KEYS = new Set(["num_train_samples", "num_test_samples"]);

type FileKey = "train" | "data" | "lexer";
const FILE_LABEL: Record<FileKey, string> = {
  train: "train.yaml",
  data: "data.yaml",
  lexer: "lexer.yaml",
};
const HIGHLIGHT: Record<FileKey, Set<string>> = {
  train: TRAIN_KEYS,
  data: DATA_KEYS,
  lexer: new Set(),
};
const ORDER: FileKey[] = ["train", "data", "lexer"];

function lineKey(line: string): string | null {
  const m = line.match(/^\s*([A-Za-z0-9_]+):/);
  return m ? m[1] : null;
}

/** Indices of lines that differ between two versions of a file. */
function changedLines(oldStr: string, newStr: string): Set<number> {
  const o = oldStr.split("\n");
  const n = newStr.split("\n");
  const s = new Set<number>();
  for (let i = 0; i < Math.max(o.length, n.length); i++) {
    if (o[i] !== n[i]) s.add(i);
  }
  return s;
}

export function ConfigPreview({
  taskId,
  settings,
  customConfig,
}: {
  taskId: string;
  settings: ProjectSettings;
  customConfig: BuildConfig | null;
}) {
  const t = useT();

  const files = useMemo<Record<FileKey, string>>(() => {
    const spec: ProjectSpec =
      taskId === "__custom"
        ? { projectName: "preview", selectedTasks: [], customConfig, mode: "tasks", settings }
        : { projectName: "preview", selectedTasks: [taskId], customConfig: null, mode: "tasks", settings };
    const map = projectFileMap(spec);
    const pick = (suffix: string) =>
      Object.entries(map).find(([p]) => p.endsWith(suffix))?.[1] ?? "";
    return {
      train: pick("experiments/toy/configs/train.yaml"),
      data: pick("experiments/toy/configs/data.yaml"),
      lexer: pick("experiments/toy/configs/lexer.yaml"),
    };
  }, [taskId, settings, customConfig]);

  const [tab, setTab] = useState<FileKey>("train");
  const [flash, setFlash] = useState<{ file: FileKey; lines: Set<number>; id: number }>({
    file: "train",
    lines: new Set(),
    id: 0,
  });
  const prev = useRef(files);

  // When a setting changes a value, jump to the file that changed and flash the line(s).
  useEffect(() => {
    for (const k of ORDER) {
      const ch = changedLines(prev.current[k] || "", files[k] || "");
      if (ch.size) {
        setTab(k);
        setFlash((f) => ({ file: k, lines: ch, id: f.id + 1 }));
        break;
      }
    }
    prev.current = files;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.train, files.data, files.lexer]);

  if (!files.train && !files.data) return null;

  const tabs = ORDER.filter((k) => files[k]);
  const content = files[tab] ?? "";
  const lines = content.replace(/\s+$/, "").split("\n");
  const hl = HIGHLIGHT[tab];

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-ink-400">{t.settings.previewLegend}</p>
      <Segmented
        ariaLabel={t.settings.previewFiles}
        value={tab}
        onChange={(v) => setTab(v as FileKey)}
        options={tabs.map((k) => ({ value: k, label: FILE_LABEL[k] }))}
      />
      <div className="overflow-hidden rounded-xl ring-1 ring-ink-200">
        <pre className="scroll-thin m-0 max-h-[420px] overflow-auto bg-[rgb(var(--code-bg))] py-2 text-[11.5px] leading-[1.7]">
          {lines.map((ln, i) => {
            const k = lineKey(ln);
            const hot = k !== null && hl.has(k);
            const flashed = flash.file === tab && flash.lines.has(i);
            return (
              <div
                key={flashed ? `${i}-f${flash.id}` : i}
                className={cn(
                  "border-l-2 px-3 font-mono",
                  hot
                    ? "border-brand-500 bg-brand-50/70 text-ink-800"
                    : "border-transparent text-ink-500",
                  flashed && "line-flash",
                )}
              >
                {ln || " "}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
