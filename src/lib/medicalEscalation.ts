const URGENT_PHRASES = [
  // Breathing emergencies
  "trouble breathing",
  "struggling to breathe",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "not breathing",
  "stopped breathing",
  "labored breathing",
  // Collapse / unresponsive
  "collapse",
  "can't stand",
  "cant stand",
  "fell over",
  "collapsed",
  "unresponsive",
  "not moving",
  "can't move",
  "cant move",
  "paralyzed",
  "limp",
  // Seizures
  "seizure",
  "fitting",
  "convulsing",
  "convulsion",
  // Bleeding / trauma
  "uncontrolled bleeding",
  "won't stop bleeding",
  "wont stop bleeding",
  "vomiting blood",
  "throwing up blood",
  "blood in vomit",
  "blood in stool",
  "bleeding from",
  "pale gums",
  "hit by car",
  "trauma",
  // Poisoning
  "poison",
  "poisoned",
  "ate something toxic",
  // Common layperson emergency language
  "broken bone",
  "broken leg",
  "broken paw",
  "dying",
  "not responding",
  "unconscious",
  "passed out",
  "emergency vet",
  "emergency room",
];

export function isMedicalEmergency(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return URGENT_PHRASES.some((phrase) => lowerMessage.includes(phrase));
}

export function getEmergencyMessage(): string {
  return "THIS MAY BE A MEDICAL EMERGENCY\n\nForeverHome cannot provide veterinary advice.\n\nContact an emergency veterinarian immediately.";
}
