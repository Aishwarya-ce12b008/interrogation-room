export * from "./types";
export { suspects, getRandomSuspect, getSuspectById } from "./suspects";
export { detectiveTools, executeTool } from "./tools";
export { suspectCards, getRandomSuspectCard } from "./suspect-cards";

import { Suspect } from "./types";

/**
 * Generate the suspect context that gets injected into the detective's system prompt.
 * This gives the detective all the info they need without requiring tool calls for basics.
 */
export function generateSuspectContext(suspect: Suspect): string {
  const priorsSummary = suspect.priors.length > 0
    ? suspect.priors.map(p => `${p.crime} (${p.year}) - ${p.outcome}`).join("; ")
    : "None - first offense";

  return `
## SUSPECT FILE - ${suspect.id}

**Personal Information:**
- Name: ${suspect.name}
- Age: ${suspect.age}, ${suspect.gender}
- City: ${suspect.city}
- Address: ${suspect.address}
- Occupation: ${suspect.occupation}${suspect.employer ? ` at ${suspect.employer}` : ""}
- Income: ${suspect.income}
- Marital Status: ${suspect.maritalStatus}
${suspect.dependents ? `- Dependents: ${suspect.dependents}` : ""}

**Criminal History:**
${priorsSummary}

**Current Case:**
- Crime: ${suspect.currentCase.crime}
- Description: ${suspect.currentCase.description}
${suspect.currentCase.amount ? `- Amount: ${suspect.currentCase.amount}` : ""}
${suspect.currentCase.victim ? `- Victim: ${suspect.currentCase.victim}` : ""}
- Date: ${suspect.currentCase.date}
- Location: ${suspect.currentCase.location}
- Evidence (summary): ${suspect.currentCase.evidenceSummary.join(", ")}
- Max Sentence: ${suspect.currentCase.maxSentence}
- Min Sentence: ${suspect.currentCase.minSentence}

**Interrogation Notes:**
- Personality: ${suspect.personality}
- Weakness: ${suspect.weakness}
- Notes: ${suspect.interrogationNotes}

---
You have access to tools to look up detailed evidence, verify alibis, and check associates. Use them when needed.
`;
}

/**
 * Generate the minimal suspect card shown to the user in the UI.
 */
export function generateSuspectCard(suspect: Suspect): {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  occupation: string;
  employer?: string;
  priorCount: number;
  currentCrime: string;
  caseAmount?: string;
  maxSentence: string;
} {
  return {
    id: suspect.id,
    name: suspect.name,
    age: suspect.age,
    gender: suspect.gender,
    city: suspect.city,
    occupation: suspect.occupation,
    employer: suspect.employer,
    priorCount: suspect.priors.length,
    currentCrime: suspect.currentCase.crime,
    caseAmount: suspect.currentCase.amount,
    maxSentence: suspect.currentCase.maxSentence,
  };
}

