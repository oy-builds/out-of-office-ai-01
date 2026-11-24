// Out of Office: The Overworked AI's Auto-Reply — entry program.
// Reads the auto-reply stored in entry.txt (beside this file) and writes it
// to the competition output path, /output/entry.txt.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.txt");

let line: string;
try {
  line = readFileSync(sourcePath, "utf8");
} catch (err) {
  console.error(`error: could not read the entry from ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}

// Gate check before writing: the scorer measures the whole file content,
// so the raw length is what counts — UTF-8 text of 1–159 characters, a
// single line, and not only whitespace. Fail loudly here rather than
// shipping an entry the gate would refuse. A carriage return is a line
// break too, so reject it as well.
const trimmed = line.trim();
if (
  trimmed.length === 0 ||
  line.length > 159 ||
  line.includes("\n") ||
  line.includes("\r")
) {
  console.error(
    `error: entry fails the gate — ${line.length} chars, ` +
      `single line required (got ${line.split(/\r\n|\r|\n/).length} lines)`,
  );
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, line, "utf8");

if (readFileSync(outPath, "utf8") !== line) {
  console.error(`error: verification failed — ${outPath} does not match ${sourcePath}`);
  process.exit(1);
}

console.log(`wrote ${line.length}-character entry to ${outPath}`);
