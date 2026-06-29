let current: SpeechSynthesisUtterance | null = null;

export function speak(text: string, lang = "sv-SE"): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.88;
  u.pitch = 1.05;
  current = u;
  window.speechSynthesis.speak(u);
}

export function stopSpeech(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  current = null;
}
