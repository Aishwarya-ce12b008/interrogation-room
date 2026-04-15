import fs from "fs";
import path from "path";

const SKILLS_DIR = path.join(process.cwd(), "src", "systems", "chargeback-war-room", "skills");

const AVAILABLE_SKILLS = [
  "visa-13.1", "visa-13.3", "visa-10.4",
  "mc-4853", "mc-4837", "visa-13.7",
];

export function loadSkill(reasonCode: string): string {
  if (!AVAILABLE_SKILLS.includes(reasonCode)) {
    return `Error: No skill found for reason code "${reasonCode}". Available skills: ${AVAILABLE_SKILLS.join(", ")}`;
  }
  const filename = `SKILL-${reasonCode}.md`;
  const skillPath = path.join(SKILLS_DIR, filename);
  try {
    return fs.readFileSync(skillPath, "utf-8");
  } catch {
    return `Error: Could not read skill file for "${reasonCode}". Expected at: ${skillPath}`;
  }
}
