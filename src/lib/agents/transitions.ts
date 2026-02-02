import { AgentId } from "./types";

interface TransitionTemplates {
  exits: string[];
  entrances: string[];
}

const goodyTransitions: TransitionTemplates = {
  exits: [
    "*Goody leans back and exchanges a look with Baddy* I think my partner has some questions.",
    "*Goody stands and walks toward the door* I'll let you two talk.",
    "*Goody closes their notepad* My colleague wants a word with you.",
    "*Goody steps aside* I tried the easy way.",
    "*Goody sighs and gestures to Baddy* Your turn, partner.",
  ],
  entrances: [
    "*Goody pulls up a chair* Okay, let's slow down here. Talk to me.",
    "*Door opens quietly* Mind if I take over for a bit?",
    "*Goody sits across from you* Look, I'm not here to yell at you. Just tell me what happened.",
    "*Goody walks in, hands up* Alright, alright. Let's try this differently.",
    "*Goody settles into the chair* I think we got off on the wrong foot. Start from the beginning.",
  ],
};

const baddyTransitions: TransitionTemplates = {
  exits: [
    "*Baddy slams their folder shut* Fine. See if the nice approach works better.",
    "*Baddy pushes back from the table* I've said my piece. Think about what I said.",
    "*Baddy heads for the door* You got lucky. My partner's more patient than me.",
    "*Baddy stands abruptly* We'll continue this later.",
    "*Baddy shrugs and walks out* Don't think this is over.",
  ],
  entrances: [
    "*Baddy kicks the door open* Enough with the friendly chat. Let's get real.",
    "*Door slams* I've been watching through the glass. Cut the crap.",
    "*Baddy enters, arms crossed* The soft approach isn't working. My turn.",
    "*Baddy drops a thick folder on the table* You know what's in here? Evidence. Start talking.",
    "*Baddy strides in* Okay, playtime's over. Tell me exactly what you did.",
  ],
};

const transitions: Record<AgentId, TransitionTemplates> = {
  goody: goodyTransitions,
  baddy: baddyTransitions,
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getExitMessage(agent: AgentId): string {
  return getRandomItem(transitions[agent].exits);
}

export function getEntranceMessage(agent: AgentId): string {
  return getRandomItem(transitions[agent].entrances);
}

export function generateTransition(
  exitingAgent: AgentId,
  enteringAgent: AgentId
): { exitMessage: string; entranceMessage: string } {
  return {
    exitMessage: getExitMessage(exitingAgent),
    entranceMessage: getEntranceMessage(enteringAgent),
  };
}
