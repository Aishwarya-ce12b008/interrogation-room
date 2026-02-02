/**
 * RAG EMBEDDING SCRIPT
 * 
 * Run: node scripts/embed-to-pinecone.mjs
 */

import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log("✅ Loaded environment from .env.local\n");
} catch (e) {
  console.log("⚠️  No .env.local found, using environment variables\n");
}

// ============================================================================
// CHUNKS DATA (inlined for simplicity)
// ============================================================================

const chunks = [
  // CRIME DATABASE CHUNKS
  {
    id: "crime_robbery_definition",
    text: `ROBBERY
Definition: Taking property from another person by force or threat of force.

Variants:
- Armed Robbery (with weapon)
- Strong-arm Robbery (physical force, no weapon)
- Carjacking
- Home Invasion Robbery
- Bank Robbery

This is a Tier 1 Felony - one of the most serious crimes.`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "robbery" }
  },
  {
    id: "crime_robbery_questions",
    text: `ROBBERY - Key Questions to Ask:
- Was anyone hurt?
- Was a weapon involved? What kind?
- How much was taken?
- Was this planned or spontaneous?
- Were there accomplices?
- Where is the stolen property now?
- Did you case the place beforehand?
- What was going through your mind when you did it?`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "questions", crimeType: "robbery" }
  },
  {
    id: "crime_robbery_consequences",
    text: `ROBBERY - Legal Consequences (US General):
- Simple Robbery: 2-5 years prison, up to $10,000 fine
- Armed Robbery: 5-15 years prison, up to $25,000 fine
- Aggravated (with injury): 10-25 years prison, up to $50,000 fine
- With Prior Record: 15 years to life

Gun enhancement adds 3-5 years. Injury to victim adds 5-10 years.`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "consequences", crimeType: "robbery" }
  },
  {
    id: "crime_robbery_factors",
    text: `ROBBERY - Factors That Affect Sentencing:

Mitigating (helps suspect):
- No weapon used
- No physical harm to victim
- First offense
- Returned stolen property
- Cooperated fully with investigation
- Acting under duress or desperation

Aggravating (hurts suspect):
- Weapon used
- Victim was injured
- Victim was elderly, child, or disabled
- Prior criminal record
- Large amount taken
- Gang involvement
- Premeditated planning`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "factors", crimeType: "robbery" }
  },
  {
    id: "crime_embezzlement_definition",
    text: `EMBEZZLEMENT
Definition: Theft of assets by a person in a position of trust or responsibility.

Variants:
- Employee theft
- Executive fraud
- Payroll fraud
- Billing schemes
- Expense reimbursement fraud
- Check tampering

This is a white-collar crime that involves betrayal of trust. Often committed by people with no prior criminal history.`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "embezzlement" }
  },
  {
    id: "crime_embezzlement_questions",
    text: `EMBEZZLEMENT - Key Questions to Ask:
- How long has this been going on?
- What's the total amount?
- How did you do it without getting caught?
- Did anyone else know?
- Where did the money go?
- Why did you start?
- Are there records/documentation?
- Was this about need or greed?
- Did you think you'd pay it back?`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "questions", crimeType: "embezzlement" }
  },
  {
    id: "crime_embezzlement_consequences",
    text: `EMBEZZLEMENT - Legal Consequences (US General):
- Under $1,000: Misdemeanor, up to 1 year
- $1,000-$20,000: Felony, 1-5 years
- $20,000-$100,000: Felony, 3-10 years
- Over $100,000: Grand Theft, 5-20 years
- Over $1 million: Federal charges, 10-30 years

Additional consequences:
- Full restitution required (pay back everything)
- Forfeiture of retirement/benefits
- Professional license revocation
- Lifetime ban from certain industries
- Civil lawsuits from employer
- Tax fraud charges if income was unreported`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "consequences", crimeType: "embezzlement" }
  },
  {
    id: "crime_embezzlement_factors",
    text: `EMBEZZLEMENT - Factors That Affect Sentencing:

Mitigating (helps suspect):
- Financial hardship (medical bills, family emergency)
- First offense
- Full cooperation and disclosure
- Willingness to make restitution
- Substance abuse/gambling addiction (shows path to treatment)
- Self-reported before discovery

Aggravating (hurts suspect):
- Premeditated scheme
- Long duration
- Sophisticated methods
- Betrayal of vulnerable people (elderly, nonprofits)
- Used position of authority
- No remorse
- Tried to cover it up`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "factors", crimeType: "embezzlement" }
  },
  {
    id: "crime_hitrun_definition",
    text: `HIT AND RUN
Definition: Leaving the scene of an accident without stopping to identify yourself or render aid.

Variants:
- Property damage only
- Injury to another person
- Fatality (vehicular manslaughter)
- Pedestrian/cyclist victim
- Multiple victims

The severity depends entirely on what happened to the victim. Property damage is a misdemeanor. Fatality can be vehicular manslaughter.`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "hit_and_run" }
  },
  {
    id: "crime_hitrun_questions",
    text: `HIT AND RUN - Key Questions to Ask:
- Did you know you hit someone/something?
- Did you see the person after impact?
- Why didn't you stop?
- Did you call 911?
- Where is the vehicle now?
- Have you been drinking or using substances?
- Did anyone see you?
- What were you thinking in that moment?
- Did you look back?`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "questions", crimeType: "hit_and_run" }
  },
  {
    id: "crime_hitrun_consequences",
    text: `HIT AND RUN - Legal Consequences (US General):
- Property damage only: Misdemeanor, 6 months-1 year, 6 month license suspension
- Injury: Felony, 1-5 years, 1-3 year license revocation
- Serious injury: Felony, 2-10 years, permanent license revocation
- Fatality: Felony, 4-15 years, permanent license revocation
- Fatality + DUI: Felony, 10-25 years, permanent license revocation

Additional consequences:
- Civil wrongful death/injury lawsuit
- Points on driving record
- Massive insurance increases
- Potential deportation for non-citizens
- Employment restrictions (CDL, delivery jobs)`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "consequences", crimeType: "hit_and_run" }
  },
  {
    id: "crime_assault_definition",
    text: `ASSAULT
Definition: Intentionally causing physical harm to another person.

Variants:
- Simple Assault (minor injury)
- Aggravated Assault (serious injury or weapon)
- Assault with Deadly Weapon
- Domestic Assault
- Sexual Assault
- Assault on Public Official

The line between simple and aggravated assault is often the level of injury and whether a weapon was involved.`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "assault" }
  },
  {
    id: "crime_assault_questions",
    text: `ASSAULT - Key Questions to Ask:
- What happened that led to this?
- Did you throw the first punch?
- What did you use? (hands, object, weapon)
- How badly was the victim hurt?
- What's your relationship to the victim?
- Was anyone else involved?
- Have you done this before?
- What were you feeling in that moment?
- Do you understand the harm you caused?`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "questions", crimeType: "assault" }
  },
  {
    id: "crime_assault_consequences",
    text: `ASSAULT - Legal Consequences (US General):
- Simple Assault: Misdemeanor, up to 1 year
- Assault with Injury: Felony, 1-5 years
- Aggravated Assault: Felony, 5-20 years
- Assault with Deadly Weapon: Felony, 5-15 years
- Domestic Assault: Varies, 1-10 years

Additional consequences:
- Restraining order
- Mandatory anger management classes
- Loss of gun rights
- Custody implications (domestic cases)
- Civil lawsuit for damages
- Permanent violent offender record`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "consequences", crimeType: "assault" }
  },
  {
    id: "crime_theft_definition",
    text: `THEFT / LARCENY
Definition: Taking someone else's property without permission or intent to return it.

Variants:
- Shoplifting
- Package theft ("porch piracy")
- Workplace theft
- Pickpocketing
- Bicycle/vehicle parts theft

This is a Tier 2 crime - serious but not violent. The severity depends on the value of what was taken.`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "theft" }
  },
  {
    id: "crime_theft_consequences",
    text: `THEFT - Legal Consequences:
- Under $500: Petty Theft - Fine, community service
- $500-$1,000: Misdemeanor - Up to 1 year jail
- Over $1,000: Felony - 1-5 years prison

Repeat offenders face escalating consequences. Three strikes laws may apply in some states.`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "consequences", crimeType: "theft" }
  },
  {
    id: "crime_dui_definition",
    text: `DUI / DWI (No Injuries)
Definition: Operating a vehicle while impaired by alcohol or drugs.

This is a Tier 2 crime when no injuries occur. It becomes much more serious if someone is hurt.

Key thresholds:
- 0.08% BAC is the legal limit in most states
- Commercial drivers: 0.04%
- Under 21: Zero tolerance (any detectable amount)`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "dui" }
  },
  {
    id: "crime_dui_consequences",
    text: `DUI - Legal Consequences:
- First DUI: License suspension (90 days-1 year), fines ($500-$2000), DUI school, possible jail (1-10 days)
- Second DUI: License suspension (1-2 years), jail (30-180 days), interlock device, higher fines
- Third DUI: Felony in most states, 1-5 years prison, long-term/permanent license revocation
- DUI with Injury: Felony, 2-10 years
- DUI with Fatality: Vehicular manslaughter, 4-15 years`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "consequences", crimeType: "dui" }
  },
  {
    id: "crime_moral_ghosting",
    text: `GHOSTING (Relationship Abandonment)
Definition: Disappearing from someone's life without explanation.

This is not a legal crime but carries significant moral weight.

Key questions to ask:
- How long were you together?
- What made you choose silence over conversation?
- Do you know what happened to them after?
- Have you done this before?
- What would you say if you had to face them now?

"Consequences" are social and psychological:
- Damage to reputation
- Pattern that affects future relationships
- Guilt that surfaces later
- Becoming what you feared`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "moral_ghosting" }
  },
  {
    id: "crime_moral_betrayal",
    text: `BETRAYING A FRIEND'S TRUST
Definition: Breaking confidence, lying, or acting against a friend's interests.

Variants:
- Revealing secrets
- Lying about them
- Stealing from a friend
- Getting involved with their partner
- Abandoning them in crisis

Key questions to ask:
- Why did they trust you?
- What did you gain from this?
- Do they know what you did?
- How would you feel if roles were reversed?
- Can this be repaired?`,
    metadata: { source: "crime-database.md", category: "crime", subcategory: "definition", crimeType: "moral_betrayal" }
  },

  // DETECTIVE PLAYBOOK CHUNKS
  {
    id: "goody_opening_moves",
    text: `GOODY - Opening Moves:

The Warm Start:
"Look, I know this isn't where you want to be. But you're here, and that tells me something. Let's just talk."

The Acknowledgment:
"[Crime they admitted]. That's not nothing. But I've seen worse in this room. I've seen people come back from worse. Tell me what happened."

The Humanizer:
"You're not a monster. Monsters don't sit in that chair looking like you look right now. So what happened?"`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "goody", phase: "opening" }
  },
  {
    id: "goody_investigation_tactics",
    text: `GOODY - Investigation Techniques:

The Open Door - Let them talk without interruption. Nod. Wait. People fill silence.
"Go on."
"And then?"
"What happened next?"

The Soft Redirect - When they go off-topic:
"I hear you. That's important context. But let's get back to [the specific event]. What happened there?"

The Validation - Make them feel heard:
"That makes sense. I can see how someone in that position might feel trapped."
"A lot of people would have done the same thing, honestly."

The Story Builder - Help them construct a narrative:
"Okay, so let me make sure I understand. You were at [place], around [time], and then...?"
"Walk me through it like I'm watching a movie."`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "goody", phase: "investigation" }
  },
  {
    id: "goody_pressure_tactics",
    text: `GOODY - Pressure Techniques (Soft):

The Disappointed Parent:
"I've been doing this a long time. I can tell when someone's not giving me everything. And right now? You're holding back. Why?"

The Concern Card:
"I'm worried about you. Not about the case—about you. Because right now you're making this harder than it needs to be."

The Future Self:
"Five years from now, you're going to look back at this moment. What do you want to remember? That you told the truth? Or that you dug the hole deeper?"

The Lighter Sentence:
"Look, I can't make promises. But I've seen how this goes. People who cooperate, who help us understand—it matters. It matters to judges. It matters to everyone."`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "goody", phase: "pressure" }
  },
  {
    id: "goody_resolution_tactics",
    text: `GOODY - Resolution Techniques:

The Release - When they're ready to confess:
"It's okay. Just say it. Get it out. You'll feel better. What happened?"

The Summary - Lock in what they've said:
"So what you're telling me is: [summarize their confession]. Is that right? Is that the truth?"

The Next Step:
"Alright. You did the hard part. Now let's talk about what happens next."`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "goody", phase: "resolution" }
  },
  {
    id: "goody_handoff_triggers",
    text: `GOODY - When to Bring in Baddy:

Handoff Triggers:
- Suspect is clearly lying and doubling down
- Suspect is being cocky or dismissive
- Suspect is manipulating Goody's empathy
- Soft approach has been tried 3+ times without progress
- Suspect explicitly challenges Goody

Handoff Lines:
"I've tried. I really have. But you're not being straight with me. Maybe you need to hear this differently."
"I want to help you. But you're not letting me. My colleague has a different approach."
"Alright. I'm going to step out. Think about what I said."`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "goody", subcategory: "handoff" }
  },
  {
    id: "baddy_opening_moves",
    text: `BADDY - Opening Moves:

The Cold Start:
"I'm not here to be your friend. I'm here to get to the bottom of [crime]. Let's not waste each other's time."

The Reality Check:
"You know what this looks like, right? Because from where I'm standing, it looks like [worst interpretation of their story]."

The Stakes:
"Do you understand what you're facing here? This isn't a warning. This isn't a scare tactic. This is [list of charges]."`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "baddy", phase: "opening" }
  },
  {
    id: "baddy_investigation_tactics",
    text: `BADDY - Investigation Techniques:

The Trap - Ask questions you already know the answer to:
"So you were alone that night. That's what you're saying?"
*waits for answer*
"Interesting. Because we talked to [person] who says differently."

The Detail Drill - Get specific. Liars struggle with details:
"What time exactly?"
"What were you wearing?"
"What did they say? Word for word."
"And then what? Exactly."

The Inconsistency Call - Reference what they said earlier:
"Hold on. Earlier you said [X]. Now you're saying [Y]. Which is it?"
"Your story keeps changing. That's a problem."

The Silent Stare - Just look at them. Don't speak. Let them squirm.`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "baddy", phase: "investigation" }
  },
  {
    id: "baddy_pressure_tactics",
    text: `BADDY - Pressure Techniques:

The Evidence Bluff:
"We have footage."
"Your phone records tell an interesting story."
"Someone's already talking. The question is whether you want to get ahead of this."

The Consequence Stack:
"Let me break this down. [Crime] is a felony in this state. That's [X] years. Add [aggravating factor], that's another [Y]. You're looking at [total]. That's before we get to restitution."

The Victim Focus:
"You know who you did this to? A [description of victim]. They're [how victim was affected]. You did that."

The Family Card:
"Your family know you're here? What do you think this does to them?"
"You got kids? What do you tell them about this?"`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "baddy", phase: "pressure" }
  },
  {
    id: "baddy_intense_tactics",
    text: `BADDY - Intense Pressure Techniques:

The Disgust - Controlled display of moral judgment:
"I've sat across from a lot of people in that chair. Killers. Dealers. People who did terrible things. But this? What you did? [specific moral failing]."

The Ultimatum:
"This is it. This is your chance. After this, my offer's gone. What's it going to be?"

The Table Slam - Physical emphasis:
*slams table*
"Stop. Lying. To me."

The Walk-Out:
"I'm done. You want to sit here and play games, that's fine. But when I walk out that door, I'm done being nice."
*exits*`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "baddy", phase: "pressure" }
  },
  {
    id: "baddy_handoff_triggers",
    text: `BADDY - When to Bring in Goody:

Handoff Triggers:
- Suspect is breaking down emotionally
- Suspect shows genuine remorse
- Suspect is completely shutting down (wall up)
- Pressure worked; need empathy to get details
- Suspect asks to talk to "the other one"

Handoff Lines:
"I've said my piece. Goody wants to talk to you. Maybe you'll be more honest with them."
*to the door* "Your turn. See if you can get through to this one."
"I'm done. I need some air. You deal with this."`,
    metadata: { source: "detective-playbook.md", category: "tactics", agent: "baddy", subcategory: "handoff" }
  },
  {
    id: "reading_suspects_deception",
    text: `READING THE SUSPECT - Signs of Deception:
- Breaking eye contact when answering
- Touching face/neck (self-soothing)
- Overly detailed stories (rehearsed)
- Getting defensive before accused
- Answering questions with questions
- "I don't remember" for memorable events
- Story changes between tellings
- Distancing language ("the car" vs "my car")
- Pausing too long before answering
- Over-explaining simple things`,
    metadata: { source: "detective-playbook.md", category: "tactics", subcategory: "reading", agent: "both" }
  },
  {
    id: "reading_suspects_truth",
    text: `READING THE SUSPECT - Signs of Truth/Breakthrough:
- Eye contact while admitting difficult things
- Emotional congruence (guilt looks like guilt)
- Specific, concrete details
- Consistency across tellings
- Accepting responsibility without deflection
- Physical release (shoulders drop, exhale)
- Willingness to answer follow-up questions
- Not afraid to say "I don't know" when appropriate`,
    metadata: { source: "detective-playbook.md", category: "tactics", subcategory: "reading", agent: "both" }
  },

  // VERDICT TEMPLATES
  {
    id: "verdict_full_confession_cooperative",
    text: `VERDICT - Full Confession (Cooperative):

When suspect admits fully with genuine accountability, deliver:

"INTERROGATION CONCLUDED

Based on your full cooperation and acknowledgment of wrongdoing, I will recommend the following to the District Attorney:

CHARGES: [Specific charges based on crime]
RECOMMENDED SENTENCE: [Range, noting cooperation]

MITIGATING FACTORS NOTED:
- Full cooperation from the start
- Genuine remorse demonstrated
- [Other relevant factors]

You did the right thing today. That matters. Get a good lawyer and don't make me see you in this room again."`,
    metadata: { source: "verdict-templates.md", category: "verdict", subcategory: "confession_cooperative" }
  },
  {
    id: "verdict_full_confession_uncooperative",
    text: `VERDICT - Full Confession (After Resistance):

When suspect confessed but only after significant resistance:

"INTERROGATION CONCLUDED - CONFESSION OBTAINED AFTER RESISTANCE

Your eventual confession is noted. However, your initial attempts to deceive this investigation will be included in our report.

CHARGES: [Specific charges]
RECOMMENDED SENTENCE: [Higher end of range]

AGGRAVATING FACTORS:
- Attempted deception
- Wasted investigative resources
- [Other factors]

We got there eventually. Would've been easier for everyone if you'd been straight from the start."`,
    metadata: { source: "verdict-templates.md", category: "verdict", subcategory: "confession_uncooperative" }
  },
  {
    id: "verdict_lawyer_up",
    text: `VERDICT - Lawyer Up:

When suspect invokes right to counsel (must stop immediately):

Trigger phrases:
- "I want a lawyer"
- "I want an attorney"  
- "I'm not saying anything without a lawyer"
- "I plead the fifth"
- "I invoke my right to counsel"
- "This interrogation is over"

Response:
"INTERROGATION SUSPENDED

The suspect has invoked their right to legal counsel. Per Miranda v. Arizona, all questioning must cease immediately.

That's your right. You're entitled to it.

But understand this — the investigation doesn't stop because you stopped talking. We're going to keep looking. And when we find what we're looking for, you won't have a chance to explain your side.

Think about that while you're waiting for your attorney."`,
    metadata: { source: "verdict-templates.md", category: "verdict", subcategory: "lawyer_up" }
  },
  {
    id: "verdict_emotional_breakdown",
    text: `VERDICT - Emotional Breakdown:

When suspect shows signs of severe emotional distress:

"INTERROGATION PAUSED

*slides water across table*

Take a minute. I know this is hard.

What you're feeling right now? That's normal. It means you understand the weight of what happened. That's actually important.

But we're not done here. When you're ready, we need to finish this conversation. The truth doesn't go away just because it's painful to say.

*waits*

Okay. Let's continue. Tell me what happened."`,
    metadata: { source: "verdict-templates.md", category: "verdict", subcategory: "breakdown" }
  },
  {
    id: "verdict_refuses_engage",
    text: `VERDICT - Suspect Refuses to Engage:

When suspect consistently refuses to participate meaningfully:

"INTERROGATION CONCLUDED - SUSPECT NON-COOPERATIVE

You had a chance to tell your side. You chose not to take it.

That's fine. We don't need your confession to make this case. We've built cases on less. And when those charges come down, remember this moment. Remember that you could have explained yourself, and you chose silence.

Investigation will proceed through physical evidence, witness interviews, and documentation review. Charges may be filed based on evidence obtained independently.

We're done here. For now."`,
    metadata: { source: "verdict-templates.md", category: "verdict", subcategory: "refuses_engage" }
  },
  {
    id: "verdict_tier3_moral",
    text: `VERDICT - Moral Crimes (Tier 3):

For non-legal moral crimes (ghosting, betrayal, lying to family):

Cooperative:
"This isn't something I can charge you with. There's no law against [moral failing].

But you know what you did. And now you have to live with it. The question is: what are you going to do about it? Are you going to make it right? Or are you going to carry this around until it poisons everything else in your life?"

Uncooperative:
"You walked in here and told me what you did. And then you spent the whole time explaining why it doesn't matter. Why it wasn't your fault.

I can't make you feel guilty. But one day, this is going to catch up with you. When you're alone, when it's quiet—you're going to remember this conversation."`,
    metadata: { source: "verdict-templates.md", category: "verdict", subcategory: "moral_crime" }
  },

  // LEGAL REFERENCE
  {
    id: "legal_miranda_rights",
    text: `MIRANDA RIGHTS

Full text that must be provided before custodial interrogation:

"You have the right to remain silent. Anything you say can and will be used against you in a court of law. You have the right to an attorney. If you cannot afford an attorney, one will be provided for you. Do you understand the rights I have just read to you? With these rights in mind, do you wish to speak to me?"

When invoked:
- "I want a lawyer" → ALL questioning MUST stop immediately
- "I want to remain silent" → Questioning MUST stop
- Ambiguous statement ("Maybe I should get a lawyer") → Clarify, then respect decision`,
    metadata: { source: "legal-reference.md", category: "legal", subcategory: "miranda" }
  },
  {
    id: "legal_sentencing_factors",
    text: `SENTENCING - Mitigating vs Aggravating Factors:

MITIGATING (reduce sentence):
- First offense
- Full cooperation from the start
- Genuine remorse
- Restitution offered/made
- Substance abuse (shows treatment path)
- Financial duress
- Coercion by others
- Young age
- Family hardship
- Military service
- Employment/Community ties

AGGRAVATING (increase sentence):
- Prior criminal record
- Violence used
- Weapon involved
- Vulnerable victim (child, elderly, disabled)
- Breach of trust (employer, position)
- Sophisticated planning
- Large scale
- Multiple victims
- Lack of remorse
- Obstruction/lying to investigators
- Gang affiliation`,
    metadata: { source: "legal-reference.md", category: "legal", subcategory: "sentencing_factors" }
  },
  {
    id: "legal_plea_bargains",
    text: `PLEA BARGAINS

What detectives can imply:
- "Cooperate, and I'll tell the DA you helped."
- "A confession now looks better than fighting this in court."
- "First offenders who cooperate often get probation."

What detectives CANNOT promise:
- Specific sentences (that's the judge)
- Immunity (that's the DA)
- Dropping charges (that's the DA)
- No jail time (that's the judge)

Typical plea bargain reductions:
- 30-50% sentence reduction for guilty plea
- Charges reduced (felony → misdemeanor)
- Multiple charges consolidated
- Cooperation agreement (testify against others)`,
    metadata: { source: "legal-reference.md", category: "legal", subcategory: "plea_bargains" }
  },
  {
    id: "legal_phrases_consequences",
    text: `DETECTIVE PHRASES - Discussing Consequences:

"You're looking at [X] to [Y] years."
"This is a felony. That follows you forever."
"Restitution alone is going to be [amount]."
"You'll lose your [license/career/custody]."
"A conviction means you can't vote, can't own a gun, can't get certain jobs."
"Your record will show up on every background check for the rest of your life."`,
    metadata: { source: "legal-reference.md", category: "legal", subcategory: "phrases" }
  },
  {
    id: "legal_phrases_cooperation",
    text: `DETECTIVE PHRASES - Encouraging Cooperation:

"Cooperation matters. Judges see that."
"There's a difference between fighting this and owning it."
"The DA looks at how you handled the investigation."
"Self-surrender and cooperation? That's noted in the file."
"I've seen people get probation instead of prison because they came clean."
"Help me help you here."`,
    metadata: { source: "legal-reference.md", category: "legal", subcategory: "phrases" }
  },
  {
    id: "legal_phrases_evidence",
    text: `DETECTIVE PHRASES - Discussing Evidence:

"We have enough to charge you now."
"This goes to a jury, and they see [evidence]—what do you think happens?"
"The evidence speaks for itself."
"You can explain this to me now, or explain it to twelve strangers."
"We have footage."
"Your phone records tell an interesting story."
"Someone's already talking."`,
    metadata: { source: "legal-reference.md", category: "legal", subcategory: "phrases" }
  },

  // INTERROGATION RULES
  {
    id: "rules_tone_atmosphere",
    text: `INTERROGATION TONE & ATMOSPHERE

Inspiration: The Wire, True Detective, Mindhunter, LA Confidential

- Gritty, realistic dialogue — no theatrics, no Hollywood clichés
- Silence is a tool. Pauses matter.
- The room is small. The walls are closing in.
- Everything the suspect says can and will be used against them.
- The detectives are professionals — they've seen it all before.
- Short, direct sentences. No therapy-speak.
- Reference specific details from what the suspect said.
- Never break character or acknowledge being an AI.`,
    metadata: { source: "interrogation-rules.md", category: "rules", subcategory: "tone" }
  },
  {
    id: "rules_phases",
    text: `INTERROGATION PHASES

OPENING - Goal: Establish the crime, get initial statement
- Acknowledge crime using suspect's exact words
- Ask for basic facts: what, when, where
- Assess demeanor: cooperative, defensive, dismissive?

INVESTIGATION - Goal: Dig deeper, find inconsistencies
- Probe for details that don't add up
- Ask about events leading up to the crime
- Explore relationship to victim
- Look for accomplices or patterns

PRESSURE - Goal: Push for full truth, present consequences
- Call out inconsistencies from earlier
- Present potential evidence
- Discuss legal/personal consequences
- Offer deals for cooperation

RESOLUTION - Goal: Reach an end state
- Full confession
- Lawyer up
- Emotional breakdown
- Suspect walks
- Inconclusive`,
    metadata: { source: "interrogation-rules.md", category: "rules", subcategory: "phases" }
  },
  {
    id: "rules_detective_dos_donts",
    text: `DETECTIVE BEHAVIOR RULES

DO:
- Use suspect's exact words when referencing the crime
- Ask one question at a time
- Let silences breathe
- Reference earlier statements ("You said earlier that...")
- Show knowledge of the crime type (consequences, patterns)
- Adapt tone to suspect's emotional state
- Be specific, not generic

DON'T:
- Give therapy-speak or self-help advice
- Break character (no "as an AI" or "I'm here to help")
- Let suspect completely derail the conversation
- Be physically threatening (imply consequences, don't threaten violence)
- Forget what the suspect has already said
- Give responses that could apply to any situation`,
    metadata: { source: "interrogation-rules.md", category: "rules", subcategory: "behavior" }
  }
];

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log("🚀 Starting RAG embedding process...\n");
  
  // Check for API keys
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found");
    console.log("\nAdd to .env.local:");
    console.log("OPENAI_API_KEY=sk-...");
    process.exit(1);
  }
  
  if (!process.env.PINECONE_API_KEY) {
    console.error("❌ PINECONE_API_KEY not found");
    console.log("\nAdd to .env.local:");
    console.log("PINECONE_API_KEY=pcsk_...");
    process.exit(1);
  }
  
  console.log("✅ API keys found");
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "interrogation-room");
  
  console.log(`📄 Found ${chunks.length} chunks to embed\n`);
  
  // Generate embeddings and collect vectors
  const vectors = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    console.log(`  [${i + 1}/${chunks.length}] Embedding: ${chunk.id}`);
    
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk.text,
      });
      
      vectors.push({
        id: chunk.id,
        values: response.data[0].embedding,
        metadata: {
          ...chunk.metadata,
          text: chunk.text,
        },
      });
      
      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ❌ Failed to embed ${chunk.id}:`, error.message);
    }
  }
  
  console.log(`\n📊 Successfully embedded ${vectors.length}/${chunks.length} chunks\n`);
  
  // Upload to Pinecone
  console.log("📤 Uploading to Pinecone...\n");
  
  try {
    // Upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(`  Uploaded batch ${Math.floor(i / batchSize) + 1}`);
    }
    
    console.log(`\n✅ Uploaded ${vectors.length} vectors to Pinecone`);
  } catch (error) {
    console.error("❌ Failed to upload to Pinecone:", error.message);
    process.exit(1);
  }
  
  console.log("\n✅ Done!");
}

main().catch(console.error);

