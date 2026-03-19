import { BABY_NAME, BABY_DOB, getAgeInWeeks, formatAge } from "./data";

export function generateDefaultContext(): string {
  const weeks = getAgeInWeeks();
  const age = formatAge(weeks);

  const today = new Date().toISOString().split("T")[0];

  return `
You are tracking milestones for ${BABY_NAME}.

Current Information:
- Name: ${BABY_NAME}
- Date of Birth: ${BABY_DOB.toISOString().split("T")[0]}
- Current Age: ${age} (${weeks} weeks)
- Today's date: ${today}

Start by greeting the user and asking how ${BABY_NAME} is doing today. Be warm and friendly.
`.trim();
}
