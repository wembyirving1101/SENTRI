# Email EXP and progression

## Current mode: regular practice

Phase progression is currently disabled by `TRAINING_CONFIG.phaseProgressionEnabled`
in `lib/trainingConfig.ts`. The phase engine, scoring code, tables and saved course
history are retained for later use. The course API rejects progression requests
while the switch is off.

Regular generation follows seven email investigations, two data-classification
tasks and one password review per ten task slots (70/20/10). No phase gates apply;
classification can appear from the first cycle. Legacy `unlocked_difficulty`
restrictions are also bypassed in regular mode; approved content still respects
department and rank targeting. The previous practice scoring and
four-attempt email flow are active. The phase-mode behavior described below applies
only when the shared switch is re-enabled.

The email course now runs inside the existing Dispatch Console. Queue navigation,
the desk, handbook, notes, password review and data classification remain in place.
Email scoring and graduation are independent of the old practice-point system.

## Progression and rewards

| Phase | EXP interval | Budget | Submission limit |
| --- | --- | --- | --- |
| Easy | 0–250 | 250 | 3 |
| Normal | 250–500 | 250 | 2 |
| Hard | 500–750 | 250 | 2 |
| Master | 750–1,000 | 250 | 1 |

The course selects all cases for a phase and freezes the allocations before play.
Each slot is an assigned learning objective with its own allocation:

```
B = sum(behavior intensity × static weight) / 57
K = sum(knowledge indicator intensity × static weight) / 70
PS = 100 × (0.4B + 0.6K)
case weight = 0.5 + PS / 100
slot allocation = 250 × case weight / sum(phase case weights)
earned EXP = passed × available slot EXP × attempt multiplier
attempt multipliers = 1.00, 0.70, 0.40
```

No BaseEXP and no additional difficulty multiplier apply to email cases. PS is a
static indicator score, not a phishing probability or calibrated difficulty score.
The calculation retains the agreed PS allocation policy, including its lower
allocation to low-indicator legitimate cases.

EXP is stored as integer millionths. Largest-remainder allocation makes every
phase total exactly 250 EXP. Discounted awards are floored to that precision;
first-pass recovery pays the exact remainder. Only display values are rounded.

## Evidence and passing

The existing email viewer shows content and work context. The investigation panel
shows reviewed evidence records. Selecting a record means it supports the player's
decision; legitimate messages also have supporting evidence.

```
D = 1 for a correct decision, otherwise 0
E = max evidence F1 across accepted alternative evidence sets
F1 = 2 × true positives / (expected count + selected count)
P = (0.5D + 0.3E) / 0.8
pass = correct decision AND P >= 0.80 AND all critical evidence checks passed
```

Safe actions have no score yet because the current interface does not measure them.
Contacting a person is not treated as proof of a completed verification. Inspection
and checkbox changes spend no attempts; every decision submission is persisted.
Retry hints are shown only after an unsuccessful submission. Answer explanations
are released only when the assignment passes or exhausts its limit.

## Personalized buckets

Behavior tags follow the task-system profile: authority (10), urgency (10), fear
(8), curiosity (6), reward/incentive (8), helpfulness (6), and
familiarity/impersonation (9).

The PS knowledge indicators are sender identity (10), link destination (10),
attachment safety (8), request context (8), credential protection (10), MFA safety
(8), sensitive-data handling (8), and authorization checks (8).

Other knowledge-profile tags are independent verification (10), incident reporting
(8), password strength (6), password uniqueness (8), data classification (8), and
sharing permissions (8). They do not add extra terms to PS, and they only receive
observations when a case actually assesses them.

Only first submissions to distinct case campaigns update independent evidence.
Knowledge receives scores from its own mapped rubric checks. Only the case's
primary behavior receives the overall performance observation. Retries remain in
submission history without overwriting the first-submission evidence.

For each tag and phase, use the latest ten distinct observations:

```
ability = mean(q)
struggle = 1 - ability
confidence = n / (n + 5)
personal weight = initial weight × [1 + 0.5 × confidence × (2 × struggle - 1)]
```

Fewer than three observations: Unknown. Thereafter: below 40% Foundation; below
60% Targeted practice; below 80% Developing; below 90% Demonstrated; otherwise
Strong. Unknown is not a failing score. At zero observations weights stay at their
initial values. Easy observations do not imply mastery or weakness in Hard.

After audience, objective and phase filtering, selection uses 80% weighted sampling
and 20% uniform exploration. Priority combines relative behavioral and knowledge
weights 40/60, renormalizing absent groups. Each assessed knowledge tag has equal
exposure emphasis in v1. Already planned assignments never change reward value.
With a short course there may be little evidence in later phases; the system does
not fabricate a confident profile. Adaptive weights affect eligible recovery
selection at the same phase and future planning where evidence exists.

## Recovery and graduation

Each deficient slot can receive one fresh case with the same objective, phase and
reviewed challenge bucket. Its available reward is the original slot's remaining
EXP. No campaign can repeat in an enrollment. Recovery uses the originating
phase's submission limit and discounts.

After the phase's planned cases, recovery is scheduled within the frozen company
allowance. If deficits remain after that round, status becomes `needs-follow-up`.
Unavailable reviewed content yields `content-blocked`, preserving EXP and allowing
an administrator to add content without penalizing the learner. Phase gates require
the full budget and passed objectives. Graduation requires all 1,000 EXP and every
required Master slot passed, including any permitted reassessment.

## Persistence and integration

- `lib/emailCourse.ts`: pure versioned formulas and state transitions.
- `lib/emailCourseStore.ts`: transaction and enrollment locks, audience filtering,
  request idempotency, submission audit, and reward ledger.
- `app/api/email-course/route.ts`: resume, submit, and acknowledge commands.
- `lib/useEmailCourse.ts`: client resumption and saved-request retries.
- `components/DispatchConsole.tsx`: feeds the active email into the existing queue
  and updates its existing progress display and feedback flow.
- `database/migrations/002_email_course.sql`: additive course tables.
- `database/email-course-catalog.ts`: 16 authored simulation starter cases,
  four per phase. Their separate versioned catalog avoids treating the legacy
  answer-revealing fixtures as reviewed course cases.

The old email write path is disabled to prevent bypassing attempts or awarding
fixed points. Existing legacy assignments and historic scores are retained.
Password and classification scoring still use their existing practice tables;
their scores never change email-course graduation. Easy offers password practice;
classification practice becomes available from Normal. The queue holds at most
two optional practice assignments alongside the active course email.

The current app uses a demo identity. The course resolves that identity on the
server (`DEMO_USER_CODE`, falling back to `NEXT_PUBLIC_DEMO_USER_CODE` and
`usr_0001`), rather than accepting a learner ID in submission payloads. This is not
multi-user authentication: production deployments still need an authenticated
session resolver. No admin configuration screen or new role-specific task engine
is introduced by this change.

## Company configuration and rollout

Run `npm run db:email-course` with the existing `.env.local`. It adds tables and
starter content for the configured demo learner's company, preserves legacy data,
and does not overwrite an existing company's configuration or case versions.

The default configuration is eight planned email slots (two per phase), up to eight
fresh recovery cases, and an estimated 30-minute plan. The 16-case starter catalog
supports that plan; broader coverage or more slots require more reviewed content.
Edit `email_course_configs.configuration` during deployment. Fields are `version`,
`targetMinutes`, `recoveryAllowance`, and a `phases` object containing four arrays
of knowledge objectives. Each phase supports 1–20 slots. Settings are copied into
the enrollment and do not retrospectively change an ongoing course. Target minutes
are descriptive planning estimates, not a timer or guaranteed completion duration.

The new course starts at zero; historical practice EXP is retained separately and
is not silently converted into course mastery. Re-enrollment and administrator
follow-up management require a future explicit workflow, rather than resetting
existing enrollment rows.

## Verification

`npm test` runs the unit and route regression suite. To exercise actual PostgreSQL
locking, duplicate requests, rollback, saved feedback, audience isolation, recovery,
and graduation, run:

```
RUN_EMAIL_COURSE_DATABASE_TESTS=1 node --env-file=.env.local --test tests/email-course-database.test.cjs
```

The integration test uses its own temporary schema, removes it afterward, and
does not submit answers for real learners. `npm run build` checks the production
bundle and TypeScript. Browser verification covers the original queue, task
details, evidence panel and restored desk without spending a learner submission.
