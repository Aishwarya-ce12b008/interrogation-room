export * from "./types";
export { suspects, getRandomSuspect, getSuspectById } from "./suspects";
export { detectiveTools, executeTool, getToolsForAgent } from "./tools";
export { suspectCards, getRandomSuspectCard } from "./suspect-cards";

import { Suspect } from "./types";

/**
 * Slim context injected every turn — just enough to ground the agent.
 * Evidence, priors, and associates are accessed via tools.
 */
export function generateBasicSuspectContext(suspect: Suspect): string {
  return `
## SUSPECT: ${suspect.name} (Case ${suspect.id})

**Profile:** ${suspect.name}, ${suspect.age}yo ${suspect.gender}, ${suspect.city}
**Occupation:** ${suspect.occupation}${suspect.employer ? ` at ${suspect.employer}` : ""}

**Current Charge:** ${suspect.currentCase.crime}
${suspect.currentCase.description}
**Date/Location:** ${suspect.currentCase.date} — ${suspect.currentCase.location}
**Sentencing range:** ${suspect.currentCase.minSentence} to ${suspect.currentCase.maxSentence}
${suspect.currentCase.amount ? `**Amount involved:** ${suspect.currentCase.amount}` : ""}

**Tactical Brief:**
- Personality in the room: ${suspect.personality}
- Pressure point: ${suspect.weakness}
- Recommended approach: ${suspect.interrogationNotes}

*Use your tools (check_evidence, check_criminal_history, check_associates, verify_alibi, calculate_sentence) to pull specific details as needed.*
`;
}

/**
 * Generate the suspect context that gets injected into the detective's system prompt.
 * This gives the detective all the info they need without requiring tool calls for basics.
 */
export function generateSuspectContext(suspect: Suspect): string {
  const priorsList = suspect.priors.length > 0
    ? suspect.priors.map(p => `- ${p.crime} (${p.year}): ${p.outcome}. ${p.details}`).join("\n")
    : "Clean record — first time in an interrogation room.";

  const evidenceList = suspect.currentCase.evidence
    ? suspect.currentCase.evidence.map((e, i) => `${i + 1}. [${e.strength.toUpperCase()}] ${e.description}: ${e.details}`).join("\n")
    : suspect.currentCase.evidenceSummary.join(", ");

  const associatesList = suspect.associates.length > 0
    ? suspect.associates.map(a => `- ${a.name} (${a.relationship}): ${a.notes}${a.criminalRecord ? " [HAS CRIMINAL RECORD]" : ""}`).join("\n")
    : "None known.";

  return `
## SUSPECT DOSSIER: ${suspect.name} (Case ${suspect.id})

### Profile
Name: ${suspect.name} | Age: ${suspect.age} | ${suspect.gender} | ${suspect.city}
Occupation: ${suspect.occupation}${suspect.employer ? ` at ${suspect.employer}` : ""} | Income: ${suspect.income}
Family: ${suspect.maritalStatus}${suspect.dependents ? ` — ${suspect.dependents}` : ""}

### Criminal History
${priorsList}

### Current Charges: ${suspect.currentCase.crime}
${suspect.currentCase.description}
${suspect.currentCase.amount ? `Amount involved: ${suspect.currentCase.amount}` : ""}
${suspect.currentCase.victim ? `Victim: ${suspect.currentCase.victim}` : ""}
Date: ${suspect.currentCase.date} | Location: ${suspect.currentCase.location}
Sentencing range: ${suspect.currentCase.minSentence} to ${suspect.currentCase.maxSentence}

### Evidence in Your Possession
Use this evidence strategically — don't reveal everything at once. Lead with weaker evidence, save the strongest for when they deny.
${evidenceList}

### Known Associates
${associatesList}

### Tactical Brief
**Read this carefully — it's your key to breaking them.**
- **Personality in the room**: ${suspect.personality}
- **Their pressure point**: ${suspect.weakness}
- **Recommended approach**: ${suspect.interrogationNotes}
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

