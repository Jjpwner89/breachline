---
name: breachline-large-pushes
description: Pushing big art commits to GitHub times out (HTTP 408) unless forced to HTTP/1.1
metadata:
  node_type: memory
  type: reference
  originSessionId: 40e2a450-cdd5-46bc-aa19-726a580be4d8
  modified: 2026-11-18T12:43:33.890Z
---

The Breachline repo (public as of 2026-11-18, https://github.com/Jjpwner89/breachline) only has HTTPS access; SSH keys aren't set up. A ~215 MB art commit failed with HTTP 408 even with a large `http.postBuffer`, and succeeded once forced to HTTP/1.1:

`git -c http.version=HTTP/1.1 -c http.postBuffer=1048576000 push origin main`

**How to apply:** use this for any push carrying a batch of paintings. If several big commits are queued, push them one at a time (`git push origin <sha>:refs/heads/main`). Other sessions commit to main often, so don't split or rewrite a commit once something sits on top of it. See [[breachline-project]].
