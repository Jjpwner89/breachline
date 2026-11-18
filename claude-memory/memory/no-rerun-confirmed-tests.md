---
name: no-rerun-confirmed-tests
description: "Once a balance test has confirmed a result, don't re-run it just because there's spare time; spend the time on new value"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4959694c-5890-4645-90c6-6cbb8cc8ac9c
  modified: 2026-11-14T23:32:36.440Z
---

Once a simulation has confirmed something, don't run it again to firm it up just because there is time left. Use the time for work that adds something new: untested hypotheses, new deck or mechanic tests, or better write-ups.

**Why:** the creator said so on 2026-11-14, when leaving for a few hours during a long balance pass. They also cap extra compute (see [[quick-balance-check]]).

**How to apply:** when a result is settled, record it and move on. Spend leftover time and compute on open questions, not on bigger samples of answered ones.
