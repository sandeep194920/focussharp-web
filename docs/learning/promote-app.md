# FocusSharp — Promotion Guide

A copy-paste guide for every platform. No theory — just what to post, where, and exactly how.

---

## Rules that apply everywhere

- Never put a direct link in the body on Reddit — post as a link post or put URL only in comments
- Never post the same thing in multiple places on the same day
- Always end with a question — it drives comments and engagement
- Don't reply to every comment with feature pitches — just have a conversation
- On Reddit you need karma before posting. Build it by commenting for a few days first.

---

## 1. Reddit — r/SideProject

**Status:** Already posted ✓

**Rules:** Links allowed as link posts. Self-promotion is the point of this sub.

**How to post:** Link post — paste https://focussharp.app as the URL, your story as the first comment.

**Title:**
```
I lost 6 months of focus tracking data. Built my own app after that.
```

**First comment (post this yourself immediately after):**
```
I wanted to track how much time I spend on different things — deep work, 
reading, gym, etc. Started with apps like Forest, Flow, Be Focused. 
They were fine at first.

But a few things started bothering me:

The forced breaks. If I'm in the middle of something and 40 minutes hits, 
the app wants me to stop. I'm not done. I don't want a break right now. 
But if I ignore it, the whole tracking goes off.

You also can't pause in some of these apps. Like if someone calls you or 
you need to step away for 5 minutes — you either let the timer run or you 
lose the session.

Then there's the gamification. Streaks, badges, growing trees. I get why 
people like it but it stressed me out more than it helped. Missing a day 
felt like failing.

And categories. Most apps either don't have them or make them complicated.

So I uninstalled everything and just used Apple's stopwatch. Start it, do 
the work, pause when done, open Notes and write "Deep Work — 52 mins". 
Ugly system but it worked.

Until I lost the notes. 6 months of data, gone.

That's when I decided to just build what I actually wanted. Something 
between a stopwatch and a proper tracker. You can do timed sessions with 
optional breaks, or just hit start with no duration and end it when you 
feel done — it counts up and logs everything automatically. Simple 
categories. No gamification. Pause works.

I know apps like this exist. But I've always wanted to build something of 
my own, and this felt like the right place to start — a problem I actually 
had, solved exactly the way I wanted it. Small app, but it's mine.

Also building a native Apple Watch app next. Most apps treat the watch as 
a remote control for the phone and the sync is unreliable. Want a proper 
play button on the watch that works independently.

Stack: Next.js, TypeScript, Tailwind, Supabase, Vercel.

Free to use, no account needed to start.

→ https://focussharp.app

Anyone else go through the "I'll just use the stopwatch" phase before 
building something?
```

---

## 2. Reddit — r/webdev weekly "What have you built?" thread

**Rules:** No standalone posts about your app. Find the pinned weekly thread and comment there.

**How to find it:** Go to r/webdev, sort by "Hot", look for a pinned post titled something like "What have you been working on?" or "Monthly Project Thread".

**Link:** Yes, direct link is fine inside these threads.

**What to write (comment, not a post):**
```
Built a focus timer called FocusSharp — https://focussharp.app

Started because I was using Apple's stopwatch + a notes app to track my 
deep work sessions and lost 6 months of data when I lost the notes.

The main thing I wanted that no other app had: a flow session mode where 
you don't set a duration, you just start and end it when you're done. 
Like a stopwatch but it logs everything automatically.

Stack: Next.js 14 App Router, TypeScript, Tailwind, Zustand, Supabase, Vercel. 
The circular ring animation is SVG strokeDashoffset — trickier than it looks.

Happy to answer any questions about the build.
```

---

## 3. Reddit — r/IndieHackers

**Karma needed:** ~50+. Build karma first if you're new.

**Rules:** No direct links in text posts. Post as a link post.

**How to post:** Link post with URL, story in comments.

**Title:**
```
Shipped my first product — a focus timer that works like a stopwatch
```

**First comment:**
```
I've been using Forest, Flow, and similar apps for years but always hit 
the same problems — forced breaks interrupting deep work, no proper 
categories, and gamification that made me feel like I was failing when 
I missed a day.

Ended up just using Apple's stopwatch + a notes app. Lost 6 months of 
session data when I lost the notes. That was the push I needed to build 
something properly.

FocusSharp — https://focussharp.app

Two modes: timed sessions with optional breaks, or flow mode where you 
start with no duration and end when you're done. Categories, clean stats, 
no gamification.

This is my first shipped product. I've always wanted to build something 
and this felt like the right starting point — a problem I actually had.

Also planning a native Apple Watch app where the watch is first-class, 
not just a remote for the phone.

Happy to answer questions or hear feedback.
```

---

## 4. Hacker News — Show HN

**Rules:** Title must start with "Show HN:". Link goes in the URL field, not the body. No body text at all — your first comment is your pitch.

**How to post:** Go to news.ycombinator.com → submit → paste URL → title below.

**Best time:** Tuesday–Thursday, 8–10am EST.

**Title:**
```
Show HN: FocusSharp – focus timer with flow mode and category tracking
```

**URL field:** https://focussharp.app

**First comment (post immediately after submitting):**
```
I built this after losing 6 months of focus session data — I was tracking 
everything manually with Apple's stopwatch + a notes app and lost the notes.

The main thing I wanted that didn't exist: a flow session mode. You don't 
set a duration, you just start, work until you're done, and end it. It 
counts up and logs automatically. Most apps force you into 25 or 40 minute 
blocks which interrupts deep work.

Other things I cared about: proper categories, pause support, no 
gamification, clean stats.

Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand for state, 
Supabase for auth and session sync, deployed on Vercel.

Free tier with no signup needed — sessions save to localStorage until you 
create an account. Working on a native Apple Watch app next where the watch 
is first-class, not just a phone remote.

Happy to answer questions about the build or the product decisions.
```

**Warning:** HN is brutal. If someone says "this already exists" just say "yep, built it for myself anyway." Don't get defensive.

---

## 5. dev.to

**Rules:** Full blog post. Links everywhere are fine. Longer is better here — 500-800 words ideal.

**How to post:** dev.to → Dashboard → New Post

**Tags to use:** `showdev` `webdev` `productivity` `nextjs`

**Title:**
```
I lost 6 months of focus tracking data. So I built my own app.
```

**Full post:**
```
I've been trying to track my deep work hours for a while now. Not for 
anyone else — just for myself. I wanted to know where my time actually 
goes each week.

## What I tried first

I started with pomodoro apps — Forest, Flow, Be Focused. They worked 
initially. But a few things kept bothering me.

**Forced breaks.** When I'm 35 minutes into something and fully focused, 
the last thing I want is an app telling me to stop. But if I ignore the 
break, the whole session tracking gets messed up.

**No pause.** Some of these apps don't let you pause. Someone calls you 
or you need to step away for 5 minutes — you either let the timer run 
or lose the session entirely.

**Gamification.** Streaks, badges, growing trees. I get why people like 
it. But missing a day made me feel like I was failing, not just missing 
a day.

**Categories.** Either non-existent or buried under settings.

## The stopwatch phase

So I uninstalled everything and used Apple's built-in stopwatch. Start it, 
work, pause when done, open Notes and write "Deep Work — 52 mins". Ugly 
but functional.

Until I lost the notes. 6 months of data, gone.

## Building something better

That was the push I needed. I wanted something between a stopwatch and 
a proper time tracker.

The result is **FocusSharp** — https://focussharp.app

Two modes:
- **Timed sessions** — pick 25/40/60/90 min, optional breaks built in
- **Flow sessions** — no duration, starts counting up, you end it when 
  you're done. Logs everything automatically.

Simple categories. Clean stats (today, this week, last 30 days). 
No gamification. Pause works.

## The technical side

- **Next.js 14** App Router with TypeScript
- **Tailwind CSS** for styling, dark mode via `.dark` class strategy
- **Zustand** for state with localStorage persistence
- **Supabase** for auth and session sync across devices
- **Framer Motion** for the circular ring animation
- **Recharts** for the stats charts
- Deployed on **Vercel**

The circular progress ring was the trickiest part. SVG strokeDashoffset 
animation with smooth transitions — ended up wrapping it in Framer Motion 
which cleaned it up significantly.

## What's next

Native Apple Watch app. Most apps treat the watch as a remote control for 
the phone and the sync is laggy. I want a proper first-class watch app 
where you can start and stop sessions from your wrist independently.

## Honest note

I know apps like this exist. But I've always wanted to build something of 
my own, and this felt like the right starting point — a real problem I had, 
solved the way I wanted. First shipped product.

Free to use, no account needed to start.

→ https://focussharp.app

Would love to hear if anyone else went through a similar "I'll just use 
the stopwatch" phase.
```

---

## 6. Hashnode

**Same content as dev.to.** Hashnode and dev.to have different audiences so posting both is fine — just wait 2-3 days between them.

**Tags:** `productivity` `nextjs` `webdev` `showdev` `indiehacking`

---

## 7. IndieHackers.com (the website, not the subreddit)

**How to post:** indiehackers.com → Products → Add a product → then write a milestone post.

**First:** Add FocusSharp as a product with this description:
```
A minimal focus timer and time tracker. Set a duration or start a flow 
session with no end time — like a stopwatch that logs everything 
automatically. Category tracking, clean stats, no gamification.
```

**Then write a milestone post titled:**
```
Shipped my first product after losing 6 months of tracking data
```

**Body:** Same story as Reddit, conversational tone. Links are fine everywhere on IH.

---

## 8. AlternativeTo.net

**What it is:** People search "alternative to Forest" or "alternative to Flow app" — your listing shows up.

**How to post:** alternativeto.net → Add Software

**App name:** FocusSharp

**Description:**
```
A minimal focus timer and time tracker. Works like a stopwatch but logs 
everything automatically. Two modes: timed sessions (25/40/60/90 min) 
with optional breaks, or flow sessions where you start with no duration 
and end when you're done.

No gamification, no streaks, no badges. Simple category tagging so you 
know where your time goes. Clean stats — today, this week, last 30 days.

Free to use with no account needed.
```

**Add as alternative to:** Forest, Flow - Focus & Pomodoro Timer, Be Focused, Toggl Track, Clockify

This is the highest passive traffic source — people already searching for alternatives will find you.

---

## 9. Uneed.app

**What it is:** Free Product Hunt alternative. Less competitive, easier to get featured.

**How to post:** uneed.app → Submit product

**Tagline (under 60 chars):**
```
Focus timer that works like a stopwatch — logs everything
```

**Description:**
```
FocusSharp is a minimal focus timer and time tracker built for people 
who want to know where their time goes without the gamification.

Two modes: timed sessions with optional breaks, or flow sessions — 
no duration set, starts counting up, you end it when you're done. 
Simple categories. Clean stats. No streaks, no badges, no noise.

Free to use. No account needed to start.
```

**Link:** https://focussharp.app

---

## 10. Twitter/X — #buildinpublic thread

**How to post:** Thread of 4-5 tweets. First tweet is the hook.

```
Tweet 1:
I lost 6 months of focus tracking data because I was using Apple's 
stopwatch + a notes app.

So I built something better.

Tweet 2:
The problem with every focus app I tried:
— Forced breaks interrupt deep work
— No pause button
— Gamification that made missing a day feel like failing
— Categories either missing or complicated

Tweet 3:
So I went back to basics. Apple stopwatch + Notes app.
"Deep Work — 52 mins"
"Reading — 28 mins"

Until I lost the notes file. 6 months of data. Gone.

Tweet 4:
Built FocusSharp — something between a stopwatch and a proper tracker.

Timed sessions or flow mode (no duration, counts up, end when you're done).
Categories. Clean stats. No gamification.

Free, no account needed: https://focussharp.app

Tweet 5:
First thing I've ever shipped.
Built it for myself, solving my own problem, exactly the way I wanted.

Working on a native Apple Watch app next — proper wrist controls, 
not just a phone remote.

#buildinpublic #indiehacker #webdev
```

---

## Posting schedule

| Day | Action |
|---|---|
| Day 1 | r/SideProject ✓ done |
| Day 2 | dev.to post |
| Day 3 | AlternativeTo listing (do this early — passive traffic forever) |
| Day 4 | r/webdev weekly thread comment |
| Day 5 | Twitter/X thread |
| Day 6 | Hashnode post |
| Week 2 | IndieHackers.com product + milestone post |
| Week 2 | Uneed.app submission |
| Week 3 | Hacker News Show HN (once you have some users/feedback to reference) |
| Week 4 | Product Hunt (prep assets first — see below) |

---

## Product Hunt — prep checklist (do before launching)

- [ ] 3-4 clean screenshots (timer, stats, dark mode)
- [ ] One GIF of the ring animation counting down
- [ ] Tagline under 60 chars: `Focus timer that works like a stopwatch — logs everything`
- [ ] Tell people in r/IndieHackers and Twitter 1 week before launch day
- [ ] Launch on a Monday at 12:01am PST
- [ ] Post your founder comment immediately after launch (same story as Reddit)
