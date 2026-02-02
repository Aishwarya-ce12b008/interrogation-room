import { Suspect, Evidence, Associate, EvidenceCheckResult, AlibiCheckResult, AssociateCheckResult } from "./types";

// ============================================================================
// TOOL DEFINITIONS (for OpenAI function calling)
// ============================================================================

export const detectiveTools = [
  {
    type: "function" as const,
    function: {
      name: "check_evidence",
      description: `Pull specific evidence from the case file to confront the suspect.

WHEN TO USE:
- Suspect denies involvement: "I wasn't there" → Pull CCTV/witness testimony
- Suspect lies about details: "I never touched the money" → Pull bank records/documents
- You need to break their confidence: Show them you have proof
- Suspect is getting cocky or dismissive: Slam evidence on the table

INTERROGATION TACTICS:
- For Goody: "Let me just check something... *pulls up file* Actually, we have..."
- For Baddy: "You think we're stupid? *slaps folder* Look at this!"

The evidence strength (strong/moderate/weak) tells you how hard you can push.
Strong evidence = nail them to the wall.
Weak evidence = use carefully, they might have an explanation.`,
      parameters: {
        type: "object",
        properties: {
          evidence_type: {
            type: "string",
            enum: ["physical", "digital", "testimony", "document", "all"],
            description: "physical = weapons, forensics, items found. digital = CCTV, phone records, emails, app data. testimony = witness statements, victim statements. document = bank records, contracts, official papers. all = show everything we have."
          },
          query: {
            type: "string",
            description: "Specific evidence to search for. Examples: 'CCTV', 'fingerprints', 'bank transfer', 'witness saw', 'phone location', 'email proof'"
          }
        },
        required: ["evidence_type"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "check_criminal_history",
      description: `Pull up the suspect's full criminal record to establish a pattern or destroy their "good person" defense.

WHEN TO USE:
- Suspect claims "This is out of character for me" → Show their priors
- Suspect plays the innocent victim → "This isn't your first rodeo, is it?"
- You want to show this is a pattern, not a mistake
- Establishing that they knew what they were doing
- When negotiating: "With your record, the judge won't go easy..."

PSYCHOLOGICAL IMPACT:
- Priors make them look like a repeat offender (judges hate this)
- Shows they haven't learned from past mistakes
- Destroys the "good person who made one mistake" narrative
- For first-time offenders: Can be used sympathetically by Goody

INTERROGATION TACTICS:
- For Goody: "I see you had some trouble back in [year]. Want to tell me about that?"
- For Baddy: "Oh, so this is a hobby for you? [Year], [year], and now this?"`,
      parameters: {
        type: "object",
        properties: {
          detail_level: {
            type: "string",
            enum: ["summary", "full"],
            description: "summary = quick list of crimes and outcomes (for casual mentions). full = complete details including circumstances (for confrontation)."
          }
        },
        required: ["detail_level"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "check_associates",
      description: `Look up known associates, accomplices, family, and connections to apply pressure or find co-conspirators.

WHEN TO USE:
- Suspect claims they acted alone: "Really? What about [associate name]?"
- You want to threaten to bring in their associates for questioning
- Looking for leverage: Family members, business partners, friends
- Suspect is protecting someone: "We already talked to [name]..."
- Building conspiracy charges: Show they had help

PRESSURE TACTICS:
- "Your friend [name] already talked to us"
- "Should we bring your [relationship] in for questioning too?"
- "We know [associate] has a criminal record. Interesting company you keep."
- "Your [family member] doesn't need to be involved... unless you make us"

For associates WITH criminal records: Extra leverage, implies organized crime
For associates WITHOUT criminal records: Use to show who they're dragging down`,
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            enum: ["all", "criminal_only", "family", "work"],
            description: "all = everyone we know about. criminal_only = associates with criminal records (co-conspirators). family = family members (emotional leverage). work = colleagues and business connections."
          }
        },
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "verify_alibi",
      description: `Cross-check any alibi the suspect provides against evidence in the case file. Catches them in lies.

WHEN TO USE:
- Suspect says "I was at [location] during that time"
- Suspect claims "I was with [person] all night"
- Any time they provide a specific location/time that sounds like an alibi
- You want to catch them in a lie to destroy credibility

HOW IT WORKS:
- Compares their claim against CCTV, witnesses, phone location data
- Returns CONFLICTS if evidence contradicts their story
- Returns UNVERIFIED if we can't prove or disprove (dig deeper)

INTERROGATION FOLLOW-UP:
- If conflicts found: "Interesting story. Except CCTV puts you at [actual location]"
- If no conflicts: "We'll verify that. If you're lying, it gets worse for you"

This is a LIE DETECTOR tool. Use it to catch them and then confront them with the truth.`,
      parameters: {
        type: "object",
        properties: {
          claimed_location: {
            type: "string",
            description: "Exact location they claim. Quote their words if possible. Example: 'home with my wife', 'at the office', 'friend's house in Andheri'"
          },
          claimed_time: {
            type: "string", 
            description: "Time period they claim. Example: 'between 10 PM and midnight', 'all evening', 'when the robbery happened'"
          }
        },
        required: ["claimed_location", "claimed_time"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "calculate_sentence",
      description: `Get detailed sentencing information to show the suspect what they're facing - or what they could avoid by cooperating.

WHEN TO USE:
- Suspect doesn't seem to grasp the seriousness: "Do you know what you're looking at?"
- Offering a deal: "Cooperate now, and we can talk to the prosecutor..."
- Suspect is stubborn: Show them maximum sentence to scare them
- Suspect seems ready to confess: Show mitigating factors as incentive
- Reality check moment: "Let me explain exactly what happens from here..."

TACTICAL OPTIONS:
- WITHOUT mitigating factors: Use for intimidation, show worst case
- WITH mitigating factors: Use when offering a deal, show how cooperation helps

INTERROGATION FLOW:
- For Baddy: "You're looking at [max sentence]. Think about that."
- For Goody: "Look, if you cooperate, there are mitigating factors... the judge considers these things"

This is your LEVERAGE tool. It makes consequences real and tangible.`,
      parameters: {
        type: "object",
        properties: {
          include_mitigating: {
            type: "boolean",
            description: "true = include how cooperation/guilty plea can reduce sentence (use when offering deals). false = just show the charges and max penalties (use for intimidation)."
          }
        },
        required: []
      }
    }
  }
];

// ============================================================================
// TOOL EXECUTION FUNCTIONS
// ============================================================================

export function executeCheckEvidence(
  suspect: Suspect,
  evidenceType: string,
  query?: string
): EvidenceCheckResult {
  const evidence = suspect.currentCase.evidence;
  
  let filtered: Evidence[];
  if (evidenceType === "all") {
    filtered = evidence;
  } else {
    filtered = evidence.filter(e => e.type === evidenceType);
  }
  
  // If query provided, try to match
  if (query) {
    const queryLower = query.toLowerCase();
    filtered = filtered.filter(e => 
      e.description.toLowerCase().includes(queryLower) ||
      e.details.toLowerCase().includes(queryLower)
    );
  }
  
  if (filtered.length === 0) {
    return {
      found: false,
      evidence: null,
      message: `No ${evidenceType} evidence found matching your query.`
    };
  }
  
  // Return the most relevant one (or first if multiple)
  const selected = filtered[0];
  return {
    found: true,
    evidence: selected,
    message: `[EVIDENCE FOUND - ${selected.strength.toUpperCase()} STRENGTH]\n${selected.description}: ${selected.details}`
  };
}

export function executeCheckCriminalHistory(
  suspect: Suspect,
  detailLevel: string
): string {
  if (suspect.priors.length === 0) {
    return "[CRIMINAL HISTORY CHECK]\nNo prior criminal record found. This is their first offense.";
  }
  
  if (detailLevel === "summary") {
    const summary = suspect.priors.map(p => 
      `• ${p.crime} (${p.year}) - ${p.outcome}`
    ).join("\n");
    return `[CRIMINAL HISTORY CHECK]\n${suspect.priors.length} prior offense(s):\n${summary}`;
  }
  
  // Full details
  const full = suspect.priors.map(p => 
    `• ${p.crime} (${p.year})\n  Outcome: ${p.outcome}\n  Details: ${p.details || "No additional details"}`
  ).join("\n\n");
  return `[CRIMINAL HISTORY CHECK - FULL RECORD]\n${suspect.priors.length} prior offense(s):\n\n${full}`;
}

export function executeCheckAssociates(
  suspect: Suspect,
  filter?: string
): AssociateCheckResult {
  let associates = suspect.associates;
  
  if (filter === "criminal_only") {
    associates = associates.filter(a => a.criminalRecord);
  }
  
  if (associates.length === 0) {
    return {
      associates: [],
      message: "[ASSOCIATES CHECK]\nNo known associates matching criteria."
    };
  }
  
  const list = associates.map(a => 
    `• ${a.name} (${a.relationship})${a.criminalRecord ? " ⚠️ HAS CRIMINAL RECORD" : ""}\n  Notes: ${a.notes}`
  ).join("\n\n");
  
  return {
    associates,
    message: `[ASSOCIATES CHECK]\n${associates.length} known associate(s):\n\n${list}`
  };
}

export function executeVerifyAlibi(
  suspect: Suspect,
  claimedLocation: string,
  claimedTime: string
): AlibiCheckResult {
  // Check against evidence
  const evidence = suspect.currentCase.evidence;
  const conflicts: string[] = [];
  
  // Look for any evidence that contradicts the alibi
  for (const e of evidence) {
    const detailsLower = e.details.toLowerCase();
    const locationLower = claimedLocation.toLowerCase();
    
    // Simple conflict detection
    if (detailsLower.includes("cctv") || detailsLower.includes("footage") || 
        detailsLower.includes("witness") || detailsLower.includes("seen")) {
      conflicts.push(`${e.description}: ${e.details}`);
    }
  }
  
  if (conflicts.length > 0) {
    return {
      verified: false,
      conflicts,
      message: `[ALIBI CHECK - CONFLICTS FOUND]\nClaimed: "${claimedLocation}" at "${claimedTime}"\n\n⚠️ CONTRADICTED BY:\n${conflicts.map(c => `• ${c}`).join("\n")}`
    };
  }
  
  return {
    verified: true,
    conflicts: [],
    message: `[ALIBI CHECK]\nClaimed: "${claimedLocation}" at "${claimedTime}"\nNo direct contradictions found in evidence. Recommend further verification.`
  };
}

export function executeCalculateSentence(
  suspect: Suspect,
  includeMitigating: boolean = false
): string {
  const currentCase = suspect.currentCase;
  const hasPriors = suspect.priors.length > 0;
  
  let message = `[SENTENCING INFORMATION]\n`;
  message += `Crime: ${currentCase.crime}\n`;
  message += `Maximum Sentence: ${currentCase.maxSentence}\n`;
  message += `Minimum Sentence: ${currentCase.minSentence}\n`;
  
  if (hasPriors) {
    message += `\n⚠️ REPEAT OFFENDER - ${suspect.priors.length} prior conviction(s) will be considered as aggravating factor.`;
  }
  
  if (includeMitigating) {
    message += `\n\n📋 POTENTIAL MITIGATING FACTORS:\n`;
    message += `• Full cooperation: May reduce sentence by 25-40%\n`;
    message += `• First offense: ${hasPriors ? "NOT APPLICABLE - has priors" : "Applicable - favorable consideration"}\n`;
    message += `• Guilty plea: Typically 30% reduction\n`;
    message += `• Restitution: May influence judge favorably\n`;
    
    if (currentCase.amount) {
      message += `\n💰 Financial restitution required: ${currentCase.amount}`;
    }
  }
  
  return message;
}

// ============================================================================
// TOOL ROUTER (called from API)
// ============================================================================

export function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  suspect: Suspect
): string {
  switch (toolName) {
    case "check_evidence":
      const evidenceResult = executeCheckEvidence(
        suspect,
        args.evidence_type as string,
        args.query as string | undefined
      );
      return evidenceResult.message;
      
    case "check_criminal_history":
      return executeCheckCriminalHistory(
        suspect,
        args.detail_level as string
      );
      
    case "check_associates":
      const associatesResult = executeCheckAssociates(
        suspect,
        args.filter as string | undefined
      );
      return associatesResult.message;
      
    case "verify_alibi":
      const alibiResult = executeVerifyAlibi(
        suspect,
        args.claimed_location as string,
        args.claimed_time as string
      );
      return alibiResult.message;
      
    case "calculate_sentence":
      return executeCalculateSentence(
        suspect,
        args.include_mitigating as boolean | undefined
      );
      
    default:
      return `[ERROR] Unknown tool: ${toolName}`;
  }
}

