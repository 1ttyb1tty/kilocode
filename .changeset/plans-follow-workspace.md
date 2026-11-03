---
"@kilocode/cli": patch
---

Write plan files under the workspace's `.kilo/plans/` directory in non-git workspaces instead of the global data directory, so a project keeps one plan location whether or not it uses git. Filesystem-root workspaces keep the global fallback. Add the `plans.location` setting (`project`, `global`, or a path) as a global default with a per-project override; relative values resolve against the project root.
