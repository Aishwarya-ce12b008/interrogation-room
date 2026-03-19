export const BABY_DOB = new Date("2025-10-01");
export const BABY_NAME = "Agastya";

export function getAgeInWeeks(dob: Date = BABY_DOB): number {
  const now = new Date();
  const diffTime = now.getTime() - dob.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}

export function formatAge(weeks: number): string {
  if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? "s" : ""} old`;
  }
  const months = Math.floor(weeks / 4.33);
  const remainingWeeks = Math.round(weeks % 4.33);
  if (remainingWeeks === 0) {
    return `${months} month${months !== 1 ? "s" : ""} old`;
  }
  return `${months} month${months !== 1 ? "s" : ""} and ${remainingWeeks} week${remainingWeeks !== 1 ? "s" : ""} old`;
}

export function weeksToMonthsLabel(weeks: number): string {
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(weeks / 4.33);
  return `${months}mo`;
}
