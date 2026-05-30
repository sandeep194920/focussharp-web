# How We Added Sounds to FocusSharp

## What we built

When your focus session ends, you hear a three-note ascending chime.  
When your break ends, you hear a softer two-note ping.  
There's a toggle button (speaker icon) to mute/unmute at any time.

No audio files. No npm packages. Just the browser's built-in sound engine.

---

## The key idea: Web Audio API

Every modern browser ships with a sound synthesizer built in. It's called the **Web Audio API**. You can ask it to:

- Generate a tone at a specific pitch (frequency)
- Control how loud it is
- Control how long it plays and how it fades out

Think of it like playing a note on a keyboard — you tell it the note, the volume, and the duration.

---

## Step 1: Create the AudioContext

```ts
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}
```

`AudioContext` is the entry point to the Web Audio API. It's like opening a connection to the browser's sound engine.

We store it in a module-level variable (`ctx`) so we only create it once — creating a new one every time you play a sound would be wasteful.

---

## Step 2: The `playTone` helper

This is the core function. Everything else calls this.

```ts
function playTone(
  frequency: number,   // pitch of the note, in Hz (e.g. 440 = A4 on a piano)
  gainPeak: number,    // max volume (0.0 = silent, 1.0 = full blast — we use ~0.1-0.2)
  duration: number,    // how long the note lasts, in seconds
  type: OscillatorType = "sine",  // wave shape — "sine" is the smoothest/softest
  delay = 0            // wait this many seconds before playing (lets us chain notes)
) {
```

Inside, three things happen:

### 1. Create an Oscillator
```ts
const osc = ac.createOscillator();
osc.type = type;
osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
```
An oscillator generates the raw sound wave. `frequency` controls the pitch.

### 2. Create a Gain node
```ts
const gain = ac.createGain();
```
A gain node controls volume. Think of it as a volume knob.

### 3. Connect them like a signal chain
```ts
osc.connect(gain);
gain.connect(ac.destination);
```
Sound flows: **Oscillator → Gain → Speakers**

`ac.destination` is the browser's actual audio output (your speakers/headphones).

### 4. Shape the volume envelope
```ts
gain.gain.setValueAtTime(0, ac.currentTime + delay);
gain.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + delay + 0.01);
gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
```
This is what makes it sound like a chime instead of a harsh beep:

- Starts at 0 (silent)
- Jumps to peak volume almost instantly (0.01 seconds)
- Fades out exponentially (like a piano note naturally decaying)

### 5. Start and stop
```ts
osc.start(ac.currentTime + delay);
osc.stop(ac.currentTime + delay + duration + 0.05);
```
The `+0.05` gives a tiny buffer after the fade so the oscillator doesn't cut off abruptly.

---

## Step 3: Compose the two sounds

```ts
export function playSessionEndSound() {
  playTone(523.25, 0.18, 0.6);               // C5
  playTone(659.25, 0.15, 0.5, "sine", 0.22); // E5 — starts 0.22s later
  playTone(783.99, 0.12, 0.8, "sine", 0.44); // G5 — starts 0.44s later
}
```

Three notes of a C major chord played one after another — the `delay` parameter staggers them. Ascending pitch = "well done" feeling.

```ts
export function playBreakEndSound() {
  playTone(880, 0.14, 0.5);                   // A5
  playTone(1046.5, 0.10, 0.7, "sine", 0.25); // C6
}
```

Two higher-pitched softer notes — lighter than the session end sound. "Hey, time to get back" rather than "congratulations".

The frequencies are real piano note values (A5 = 880 Hz is a standard tuning reference).

---

## Step 4: Store the preference

In `lib/store.ts` we added two things:

```ts
soundEnabled: boolean;
setSoundEnabled: (val: boolean) => void;
```

And we added `soundEnabled` to the `partialize` list so it's saved to `localStorage`:

```ts
partialize: (s) => ({
  isPro: s.isPro,
  theme: s.theme,
  soundEnabled: s.soundEnabled,  // <-- persisted
  ...
})
```

This means if you mute sounds and refresh the page, they stay muted.

---

## Step 5: Trigger sounds on phase changes

In `app/app/page.tsx` we track the previous timer phase with a ref:

```ts
const prevPhaseRef = useRef(timer.phase);
```

Then a `useEffect` watches `timer.phase` for changes:

```ts
useEffect(() => {
  const prev = prevPhaseRef.current;
  prevPhaseRef.current = timer.phase;
  if (!soundEnabled) return;

  const wasRunning = prev === "running" || prev === "open-running";
  const wasBreak   = prev === "break"   || prev === "open-break";

  if (wasRunning && (timer.phase === "break" || timer.phase === "open-break")) {
    playSessionEndSound();
  } else if (wasBreak && timer.phase === "idle") {
    playBreakEndSound();
  }
}, [timer.phase, soundEnabled]);
```

**Why a ref instead of just comparing in the effect?**  
A `useEffect` only gives you the *current* value. A ref lets you remember what the value *was* on the previous render, so you can detect the transition (e.g. "it just went from running → break").

---

## Step 6: The toggle button

A simple inline component renders a speaker icon from Heroicons (SVG):

```tsx
const SoundToggle = () => (
  <button onClick={() => setSoundEnabled(!soundEnabled)}>
    {soundEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
  </button>
);
```

It renders on both the timer screen and the break screen, top-right.

---

## Why Web Audio API over audio files?

| | Web Audio API | Audio files (.mp3) |
|---|---|---|
| Files to manage | None | Need to host/bundle files |
| Works offline | Yes | Only if cached |
| Customizable | Fully — change pitch, duration, volume in code | Fixed — need new files |
| Browser support | All modern browsers | All modern browsers |
| Size added to app | ~0 bytes | ~50–200 KB per sound |

For simple UI chimes, synthesized tones are strictly better.

---

## Files changed

| File | What changed |
|---|---|
| `lib/sounds.ts` | New file — all Web Audio API logic |
| `lib/store.ts` | Added `soundEnabled` + `setSoundEnabled`, persisted to localStorage |
| `app/app/page.tsx` | Phase-transition effect, `SoundToggle` component, imported sound functions |
