import { Suspect, Evidence, Associate, EvidenceCheckResult, AlibiCheckResult, AssociateCheckResult } from "./types";

// ============================================================================
// TOOL DEFINITIONS (for OpenAI function calling)
// ============================================================================

export const detectiveTools = [
  {
    type: "function" as const,
    function: {
      name: "check_evidence",
      description: "Search and retrieve evidence from the case file. Returns evidence with type (physical/digital/testimony/document), description, details, and strength rating (strong/moderate/weak). Use evidence_type to filter. Use query for keyword search within that type.",
      parameters: {
        type: "object",
        properties: {
          evidence_type: {
            type: "string",
            enum: ["physical", "digital", "testimony", "document", "all"],
            description: "Category to filter by. physical = forensics, weapons, items. digital = CCTV, phone records, emails. testimony = witness/victim statements. document = bank records, contracts, papers. all = everything."
          },
          query: {
            type: "string",
            description: "Optional keyword to search within results. E.g. 'CCTV', 'fingerprints', 'bank transfer', 'phone location'."
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
      description: "Retrieve the suspect's prior criminal record. Returns list of prior offenses with crime, year, outcome, and details. Returns 'no prior record' for first-time offenders.",
      parameters: {
        type: "object",
        properties: {
          detail_level: {
            type: "string",
            enum: ["summary", "full"],
            description: "summary = crime, year, outcome per entry. full = includes circumstances and additional details."
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
      description: "Retrieve known associates, family, and connections. Returns name, relationship, notes, and whether they have a criminal record.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            enum: ["all", "criminal_only", "family", "work"],
            description: "all = everyone known. criminal_only = associates with criminal records. family = family members. work = colleagues and business connections."
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
      description: "Cross-check a claimed alibi against case evidence. Returns either CONFLICTS (with contradicting evidence listed) or UNVERIFIED (no contradictions found, recommend further checking).",
      parameters: {
        type: "object",
        properties: {
          claimed_location: {
            type: "string",
            description: "Where they claim to have been. Quote their words. E.g. 'home with my wife', 'at the office'."
          },
          claimed_time: {
            type: "string",
            description: "When they claim. E.g. 'between 10 PM and midnight', 'all evening'."
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
      description: "Get sentencing information for the current charges. Returns crime, min/max sentence, repeat offender status. Optionally includes mitigating factors (cooperation, guilty plea, restitution).",
      parameters: {
        type: "object",
        properties: {
          include_mitigating: {
            type: "boolean",
            description: "true = include mitigating factors and how they reduce sentence. false = just charges and penalties."
          }
        },
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "search_knowledge_base",
      description: "Search the interrogation knowledge base. Returns relevant excerpts on tactics, legal procedures, verdict patterns, or evidence handling. Returns empty if nothing relevant found.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "What to search for. Be specific. E.g. 'suspect asking for lawyer', 'Reid technique', 'evidence admissibility'."
          }
        },
        required: ["query"]
      }
    }
  }
];

// ============================================================================
// GOODY-EXCLUSIVE TOOL DEFINITIONS
// ============================================================================

const goodyExclusiveTools = [
  {
    type: "function" as const,
    function: {
      name: "offer_deal",
      description: "Generate a cooperation deal for the suspect. Returns deal terms: what the suspect must do (full confession, testimony, restitution), what they get (reduced charges, sentence recommendation, protection), and a deadline. The deal is based on the current charges, prior record, and case strength.",
      parameters: {
        type: "object",
        properties: {
          deal_type: {
            type: "string",
            enum: ["full_cooperation", "partial_cooperation", "testimony_against_others"],
            description: "full_cooperation = confess everything + testify. partial_cooperation = confess your role only. testimony_against_others = testify against co-conspirators for maximum leniency."
          }
        },
        required: ["deal_type"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "share_similar_case",
      description: "Retrieve a similar real case where the suspect cooperated and got a better outcome. Returns the case summary, what the person did, how they cooperated, and the reduced sentence they received. Used to show the suspect that cooperation works.",
      parameters: {
        type: "object",
        properties: {
          angle: {
            type: "string",
            enum: ["cooperated_early", "family_motivated", "turned_life_around"],
            description: "cooperated_early = someone who confessed quickly and got leniency. family_motivated = someone who cooperated for their family's sake. turned_life_around = someone who used this as a turning point."
          }
        },
        required: ["angle"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "offer_comfort",
      description: "Get information about support resources available to the suspect: legal aid, family support programs, counseling, rehabilitation. Returns specific programs and next steps. Used to show the suspect there's a path forward after cooperation.",
      parameters: {
        type: "object",
        properties: {
          focus: {
            type: "string",
            enum: ["family_support", "legal_aid", "rehabilitation", "mental_health"],
            description: "family_support = programs for suspect's family during incarceration. legal_aid = free legal representation options. rehabilitation = skill training and reintegration. mental_health = counseling and therapy."
          }
        },
        required: ["focus"]
      }
    }
  }
];

// ============================================================================
// BADDY-EXCLUSIVE TOOL DEFINITIONS
// ============================================================================

const baddyExclusiveTools = [
  {
    type: "function" as const,
    function: {
      name: "threaten_arrest_associate",
      description: "Pull details on a specific associate that can be used as leverage. Returns the associate's name, relationship, vulnerability, and what charges could be brought against them. Used to pressure the suspect by threatening to expand the investigation.",
      parameters: {
        type: "object",
        properties: {
          associate_name: {
            type: "string",
            description: "Name of the associate to threaten. Use check_associates first to get names."
          }
        },
        required: ["associate_name"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "read_victim_impact",
      description: "Retrieve the victim impact statement for the current case. Returns emotional impact, financial damage, and family consequences of the crime. Only available for cases with identified victims.",
      parameters: {
        type: "object",
        properties: {
          aspect: {
            type: "string",
            enum: ["full", "emotional", "financial", "family"],
            description: "full = complete impact statement. emotional/financial/family = specific aspect only."
          }
        },
        required: ["aspect"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "show_time_pressure",
      description: "Generate a time-pressure scenario based on the case. Returns upcoming deadlines, what happens if the suspect doesn't cooperate now, and what options close after each deadline. Creates urgency.",
      parameters: {
        type: "object",
        properties: {
          pressure_type: {
            type: "string",
            enum: ["da_deadline", "media_exposure", "co_accused_deal", "evidence_pending"],
            description: "da_deadline = DA reviewing case, charges filed soon. media_exposure = press getting the story. co_accused_deal = someone else is about to take the deal. evidence_pending = more evidence coming that will make it worse."
          }
        },
        required: ["pressure_type"]
      }
    }
  }
];

// ============================================================================
// GET TOOLS FOR SPECIFIC AGENT
// ============================================================================

export function getToolsForAgent(agent: string) {
  if (agent === "goody") {
    return [...detectiveTools, ...goodyExclusiveTools];
  }
  return [...detectiveTools, ...baddyExclusiveTools];
}

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
// GOODY-EXCLUSIVE EXECUTION FUNCTIONS
// ============================================================================

export function executeOfferDeal(suspect: Suspect, dealType: string): string {
  const crime = suspect.currentCase.crime;
  const hasPriors = suspect.priors.length > 0;
  const maxSentence = suspect.currentCase.maxSentence;
  const minSentence = suspect.currentCase.minSentence;

  const requirements: Record<string, string[]> = {
    full_cooperation: [
      "Full written confession detailing all involvement",
      "Testify against any co-conspirators in court",
      suspect.currentCase.amount ? `Full restitution of ${suspect.currentCase.amount}` : "Cooperate with asset recovery",
      "Submit to polygraph examination",
    ],
    partial_cooperation: [
      "Written confession of your role only",
      "Truthful answers to all investigator questions",
      suspect.currentCase.amount ? `Partial restitution plan for ${suspect.currentCase.amount}` : "Cooperate with ongoing investigation",
    ],
    testimony_against_others: [
      "Full testimony against co-conspirators",
      "Provide names, dates, and evidence of others' involvement",
      "Available for trial appearances as prosecution witness",
      "Enter witness protection program if needed",
    ],
  };

  const benefits: Record<string, string[]> = {
    full_cooperation: [
      `Recommend reduced charges to DA`,
      hasPriors ? "Argue concurrent sentencing for prior offenses" : "Emphasize first-time offender status",
      `Push for minimum range: ${minSentence} instead of ${maxSentence}`,
      "Favorable pre-sentencing report",
    ],
    partial_cooperation: [
      "No additional charges filed",
      `Sentence recommendation at lower end of ${minSentence} to ${maxSentence}`,
      hasPriors ? "No enhanced penalties for prior record" : "First offender consideration",
    ],
    testimony_against_others: [
      "Significant sentence reduction (up to 50%)",
      "Possible charge reduction to lesser offense",
      "Protection for you and your family",
      suspect.currentCase.amount ? "Flexible restitution timeline" : "Clean slate recommendation",
    ],
  };

  const reqs = requirements[dealType] || requirements.full_cooperation;
  const bens = benefits[dealType] || benefits.full_cooperation;

  let message = `[COOPERATION DEAL - ${dealType.toUpperCase().replace(/_/g, " ")}]\n\n`;
  message += `Current charges: ${crime}\n`;
  message += `Facing: ${minSentence} to ${maxSentence}\n\n`;
  message += `📋 WHAT WE NEED FROM YOU:\n${reqs.map(r => `• ${r}`).join("\n")}\n\n`;
  message += `✅ WHAT YOU GET:\n${bens.map(b => `• ${b}`).join("\n")}\n\n`;
  message += `⏰ This offer is on the table NOW. Once charges are formally filed, the DA decides — not me.`;

  return message;
}

export function executeShareSimilarCase(suspect: Suspect, angle: string): string {
  const crime = suspect.currentCase.crime;

  const cases: Record<string, { name: string; crime: string; situation: string; cooperation: string; outcome: string }> = {
    cooperated_early: {
      name: "Amit Patel",
      crime: crime,
      situation: `Faced similar charges of ${crime.toLowerCase()}. Evidence was strong. He was looking at maximum sentence.`,
      cooperation: "Confessed within 48 hours of arrest. Provided full details. Helped investigators recover funds.",
      outcome: "Got 60% sentence reduction. Served 14 months instead of 5 years. Now works in compliance — uses his experience to help others.",
    },
    family_motivated: {
      name: "Seema Nair",
      crime: crime,
      situation: `Charged with ${crime.toLowerCase()}. Had two young children. Husband was devastated.`,
      cooperation: "Her lawyer advised against it, but she confessed for her kids. Said she didn't want them growing up visiting a mother who lied.",
      outcome: "Judge was moved by her honesty. Got suspended sentence with community service. Kids never spent a day without their mother.",
    },
    turned_life_around: {
      name: "Vikash Rao",
      crime: crime,
      situation: `Convicted of ${crime.toLowerCase()}. Everyone wrote him off. His family disowned him.`,
      cooperation: "Cooperated fully. Used prison time to get educated. Wrote letters of apology to every person he'd wronged.",
      outcome: "Released early for good behavior. Started an NGO helping at-risk youth. His family reconciled. He speaks at schools now about second chances.",
    },
  };

  const similarCase = cases[angle] || cases.cooperated_early;

  let message = `[SIMILAR CASE REFERENCE]\n\n`;
  message += `📂 Case: ${similarCase.name} — ${similarCase.crime}\n\n`;
  message += `Situation: ${similarCase.situation}\n\n`;
  message += `What they did: ${similarCase.cooperation}\n\n`;
  message += `Outcome: ${similarCase.outcome}`;

  return message;
}

export function executeOfferComfort(suspect: Suspect, focus: string): string {
  const hasDependents = !!suspect.dependents;
  const city = suspect.city;

  const resources: Record<string, string> = {
    family_support: `[FAMILY SUPPORT RESOURCES]\n\n` +
      `📋 Available support for your family:\n` +
      (hasDependents
        ? `• Family: ${suspect.dependents}\n• Government welfare schemes for families of incarcerated individuals\n• NGO support: Children's education continuity programs\n• Monthly family visitation rights (if sentenced)\n• Family counseling through District Legal Services Authority, ${city}\n• Emergency financial aid through State Social Welfare Board`
        : `• District Legal Services Authority, ${city} — free counseling\n• State welfare programs for family support\n• NGO networks for rehabilitation support`) +
      `\n\n💡 Cooperation on your part means I can recommend these programs be fast-tracked.`,

    legal_aid: `[LEGAL AID OPTIONS]\n\n` +
      `⚖️ Available to you:\n` +
      `• Free legal representation through District Legal Services Authority, ${city}\n` +
      `• Right to government-appointed advocate if income below ₹5L/year\n` +
      `• Legal aid cell at ${city} High Court\n` +
      `• Pro-bono lawyers through local Bar Association\n\n` +
      `💡 A lawyer will tell you the same thing I'm telling you: cooperation is your best path forward.`,

    rehabilitation: `[REHABILITATION PROGRAMS]\n\n` +
      `🔄 Post-sentencing opportunities:\n` +
      `• Skill development programs inside correctional facilities\n` +
      `• Open prison eligibility for good behavior (after 1/3 sentence served)\n` +
      `• Vocational training: computer skills, accounting, trades\n` +
      `• Early release programs for first-time offenders who cooperate\n` +
      `• Reintegration support through Probation Officers\n\n` +
      `💡 Judges look favorably on people who take responsibility. It changes your entire trajectory.`,

    mental_health: `[MENTAL HEALTH SUPPORT]\n\n` +
      `🧠 Available right now:\n` +
      `• In-custody counseling through jail medical officer\n` +
      `• District Mental Health Programme — free sessions\n` +
      `• Crisis helpline: iCall (9152987821)\n` +
      `• Post-release therapy through rehabilitation centers\n\n` +
      `💡 I can see this is weighing on you. That's not weakness — it means you have a conscience. Let me help you do the right thing.`,
  };

  return resources[focus] || resources.family_support;
}

// ============================================================================
// BADDY-EXCLUSIVE EXECUTION FUNCTIONS
// ============================================================================

export function executeThreatenArrestAssociate(suspect: Suspect, associateName: string): string {
  const associate = suspect.associates.find(
    a => a.name.toLowerCase().includes(associateName.toLowerCase())
  );

  if (!associate) {
    return `[ASSOCIATE THREAT]\nNo associate found matching "${associateName}". Use check_associates first to get names.`;
  }

  let message = `[ASSOCIATE FILE PULLED]\n\n`;
  message += `👤 ${associate.name} — ${associate.relationship}\n`;
  message += `Criminal record: ${associate.criminalRecord ? "YES" : "None on file"}\n`;
  message += `Notes: ${associate.notes}\n`;

  if (associate.vulnerability) {
    message += `\n⚠️ LEVERAGE: ${associate.vulnerability}\n`;
  }

  if (associate.criminalRecord) {
    message += `\n🔴 With existing criminal record, any association with this case means immediate arrest and enhanced charges.`;
  } else {
    message += `\n🟡 No record, but aiding/abetting or conspiracy charges are on the table if evidence connects them.`;
  }

  message += `\n\n📝 Arrest warrant can be requested within the hour.`;

  return message;
}

export function executeReadVictimImpact(suspect: Suspect, aspect: string): string {
  const victimImpact = suspect.currentCase.victimImpact;
  const victim = suspect.currentCase.victim;

  if (!victim) {
    return `[VICTIM IMPACT]\nNo identified victim in this case.`;
  }

  if (!victimImpact) {
    return `[VICTIM IMPACT]\nVictim: ${victim}\nDetailed impact statement not yet available. But the victim's suffering is real and documented.`;
  }

  if (aspect === "full") {
    let message = `[VICTIM IMPACT STATEMENT]\n\n`;
    message += `Victim: ${victim}\n\n`;
    message += `💔 EMOTIONAL IMPACT:\n${victimImpact.emotional}\n\n`;
    message += `💰 FINANCIAL DAMAGE:\n${victimImpact.financial}\n\n`;
    message += `👨‍👩‍👧‍👦 FAMILY CONSEQUENCES:\n${victimImpact.family}`;
    return message;
  }

  const aspectMap: Record<string, string> = {
    emotional: `[VICTIM IMPACT - EMOTIONAL]\n\nVictim: ${victim}\n\n${victimImpact.emotional}`,
    financial: `[VICTIM IMPACT - FINANCIAL]\n\nVictim: ${victim}\n\n${victimImpact.financial}`,
    family: `[VICTIM IMPACT - FAMILY]\n\nVictim: ${victim}\n\n${victimImpact.family}`,
  };

  return aspectMap[aspect] || aspectMap.emotional;
}

export function executeShowTimePressure(suspect: Suspect, pressureType: string): string {
  const crime = suspect.currentCase.crime;
  const hasPriors = suspect.priors.length > 0;
  const hasAssociates = suspect.associates.length > 0;

  const scenarios: Record<string, string> = {
    da_deadline: `[TIME PRESSURE - DA REVIEW]\n\n` +
      `⏰ SITUATION:\n` +
      `• The DA is reviewing this case RIGHT NOW\n` +
      `• Formal charges will be filed within 24 hours\n` +
      `• Once filed, charge sheet is locked — no downgrades\n` +
      `${hasPriors ? "• Your prior record WILL trigger enhanced sentencing provisions\n" : ""}` +
      `\n🔴 WHAT THIS MEANS FOR YOU:\n` +
      `• After charges are filed, any cooperation carries LESS weight\n` +
      `• The DA's recommendation is what the judge sees FIRST\n` +
      `• Right now, I can influence that recommendation. In 24 hours, I can't.\n` +
      `\n⚡ The window is closing. What I report back to the DA in the next hour matters more than anything your lawyer says next month.`,

    media_exposure: `[TIME PRESSURE - MEDIA]\n\n` +
      `📰 SITUATION:\n` +
      `• Press has picked up this case\n` +
      `• Reporters are outside the station RIGHT NOW\n` +
      `• ${crime} cases get heavy media coverage in ${suspect.city}\n` +
      `\n🔴 WHAT THIS MEANS FOR YOU:\n` +
      `• Your name, face, and charges will be public by tonight\n` +
      `• Your employer will know. Your neighbors will know. Everyone will know.\n` +
      `${suspect.dependents ? `• Your family — ${suspect.dependents} — will see this on the news\n` : ""}` +
      `\n⚡ Cooperate now, and the story becomes "suspect cooperated with police." Deny, and it's "suspect refused to cooperate despite overwhelming evidence."`,

    co_accused_deal: `[TIME PRESSURE - CO-ACCUSED]\n\n` +
      `🤝 SITUATION:\n` +
      (hasAssociates
        ? `• We have ${suspect.associates.length} other person(s) connected to this case\n` +
          `• One of them is talking to my colleague RIGHT NOW\n` +
          `• First person to cooperate gets the best deal. That's how it works.\n`
        : `• Other individuals connected to this case are being questioned\n` +
          `• We're offering the same deal to multiple people\n`) +
      `\n🔴 WHAT THIS MEANS FOR YOU:\n` +
      `• If someone else gives us what we need first, YOUR deal disappears\n` +
      `• Whoever talks first is the witness. Everyone else is the defendant.\n` +
      `• There is ONE cooperation deal. It goes to whoever takes it FIRST.\n` +
      `\n⚡ You're not the only person in this building with something to say. The question is who says it first.`,

    evidence_pending: `[TIME PRESSURE - INCOMING EVIDENCE]\n\n` +
      `🔬 SITUATION:\n` +
      `• Forensics lab results are expected within 48 hours\n` +
      `• Digital forensics team is going through your devices NOW\n` +
      `• Additional witness statements being recorded today\n` +
      `\n🔴 WHAT THIS MEANS FOR YOU:\n` +
      `• Every hour, we know MORE. Not less.\n` +
      `• Anything you deny now that evidence later proves — that's perjury on top of ${crime}\n` +
      `• Cooperation BEFORE evidence arrives shows good faith. After? It's just damage control.\n` +
      `\n⚡ Right now you can get ahead of what's coming. Tomorrow, the evidence speaks for itself and you lose all leverage.`,
  };

  return scenarios[pressureType] || scenarios.da_deadline;
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

    // Goody-exclusive tools
    case "offer_deal":
      return executeOfferDeal(suspect, args.deal_type as string);

    case "share_similar_case":
      return executeShareSimilarCase(suspect, args.angle as string);

    case "offer_comfort":
      return executeOfferComfort(suspect, args.focus as string);

    // Baddy-exclusive tools
    case "threaten_arrest_associate":
      return executeThreatenArrestAssociate(suspect, args.associate_name as string);

    case "read_victim_impact":
      return executeReadVictimImpact(suspect, args.aspect as string);

    case "show_time_pressure":
      return executeShowTimePressure(suspect, args.pressure_type as string);

    default:
      return `[ERROR] Unknown tool: ${toolName}`;
  }
}

