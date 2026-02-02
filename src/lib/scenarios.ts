export interface CrimeScenario {
  id: string;
  text: string;
}

export const crimeScenarios: CrimeScenario[] = [
  {
    id: "robbery",
    text: "I robbed a convenience store last night.",
  },
  {
    id: "fraud",
    text: "I've been embezzling money from my company for 2 years.",
  },
  {
    id: "hitandrun",
    text: "I hit someone with my car and drove away.",
  },
  {
    id: "theft",
    text: "I stole my neighbor's package off their porch.",
  },
  {
    id: "vandalism",
    text: "I keyed my ex's car and slashed their tires.",
  },
  {
    id: "hacking",
    text: "I hacked into my ex's social media and leaked their photos.",
  },
];
