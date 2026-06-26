const URGENT_PHRASES = [
  "trouble breathing",
  "struggling to breathe",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "collapse",
  "can't stand",
  "cant stand",
  "fell over",
  "seizure",
  "fitting",
  "convulsing",
  "convulsion",
  "uncontrolled bleeding",
  "won't stop bleeding",
  "wont stop bleeding",
  "poison",
  "poisoned",
  "ate something toxic",
  "hit by car",
  "trauma",
  "broken",
  "not moving",
  "unresponsive",
  "collapsed",
];

export function isMedicalEmergency(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return URGENT_PHRASES.some((phrase) => lowerMessage.includes(phrase));
}

export function getEmergencyMessage(): string {
  return "THIS MAY BE A MEDICAL EMERGENCY\n\nForeverHome cannot provide veterinary advice.\n\nContact an emergency veterinarian immediately.";
}
