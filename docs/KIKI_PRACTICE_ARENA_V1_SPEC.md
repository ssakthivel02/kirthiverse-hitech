# Kiki Practice Arena v1 — implementation specification

Branch: `feature/kiki-practice-arena-v1`

## Product purpose
Add a short, safe, original practice loop inspired by the strongest *patterns* seen across adaptive/gamified learning products, without copying their themes or interaction design. The first release remains local-only and uses existing KirthiVerse canonical assessment records.

## Learner experience
1. Entry from Home and Progress as **Kiki Practice Arena**.
2. Choose mission length: 3, 5 or 10 minutes.
3. **Calm Mode** is available and hides time pressure.
4. Questions are selected only from canonical `KV_ASSESSMENTS` linked to canonical lessons.
5. Priority order uses local signals where available: `Need more practice` confidence → unfinished lessons → other eligible canonical assessments.
6. One question at a time with Kiki coaching after reveal/submit.
7. Show private session summary: attempted, correct, concepts revisited, next recommended lesson.
8. Store session history locally only.
9. Suggest a break after sustained use; never create an infinite-play loop.
10. No public leaderboard, chat, ads, purchases or real-name exposure.

## Accessibility / wellbeing
- timer hidden in Calm Mode
- no speed-based scoring in v1
- keyboard-operable controls
- semantic headings, status feedback and focus-visible controls
- reduced-motion preference respected by existing shell
- bilingual English/Tamil labels for core guidance
- no autoplay voice

## Data contract
Local storage key: `kirthiverse.hitech.practice.v1`

Suggested shape:
```json
{
  "sessions": [
    {
      "startedAt": 0,
      "endedAt": 0,
      "minutes": 5,
      "calm": true,
      "attempted": 0,
      "correct": 0,
      "lessonIds": []
    }
  ],
  "lastMode": {"minutes": 5, "calm": true}
}
```

No name, email, school, teacher, device fingerprint or remote identifier is stored.

## V1 acceptance gates
- canonical corpus remains 135 lessons / 72 assessments / 11 worlds
- no fabricated assessment content
- assessment IDs/lesson IDs remain stable
- local-only storage
- session can start/pause/end cleanly
- Calm Mode works
- keyboard path works
- repeated SPA navigation does not duplicate the Arena
- no open chat/public ranking/child purchase surface
- current Kiki guide and profile/progress remain functional

## Later phases, not part of v1
- guardian-linked goals
- teacher assignments
- class/school challenges
- shared leaderboards
- cloud identity or sync

Those require separate consent, privacy, security, role/tenant-isolation and retention gates.
