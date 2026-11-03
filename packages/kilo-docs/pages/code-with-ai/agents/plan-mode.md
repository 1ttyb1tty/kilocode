---
title: "Plan Mode and Plan Files"
description: "Where Kilo writes plan files, how the location is resolved, and how to keep plans reviewable"
---

# Plan Mode and Plan Files

Plan mode writes a Markdown plan before any code changes. The plan file is a real document: you
review it, refine it, and can commit it with the change it describes. This page covers where the
file is written and what to do when it is not where you expect.

## Where the plan file is written

The location follows the project, not the operating system:

| Project | Plan directory |
| --- | --- |
| A git repository | `<repository>/.kilo/plans/` |
| A workspace without git | `<workspace>/.kilo/plans/` |
| A filesystem root (`C:\`, `/`) | The global data directory, `~/.local/share/kilo/plans/` |

Kilo creates the directory when Plan mode starts. File names are
`<session-created-timestamp>-<slug>.md`. A refinement round may write a sibling with the same
timestamp and a different suffix; the newest one is the plan that `plan_exit` reports.

## Choosing a location

Set `plans.location` to override the default. A global value is the default for every project; a
project-level `kilo.json` overrides it.

```jsonc
// ~/.config/kilo/kilo.json — default for every project
{ "plans": { "location": "project" } }

// <repository>/kilo.json — override for this project
{ "plans": { "location": "docs/plans" } }
```

| Value | Where plans are written |
| --- | --- |
| `project` (default) | `<project>/.kilo/plans/` |
| `global` | The global data directory, `~/.local/share/kilo/plans/` |
| `~/design/plans` | The home-relative path |
| `docs/plans` | Relative to the project root |
| `/absolute/path` | That path |

A relative value declared in the global config still resolves against each project root, so one
default can give every repository its own `docs/plans/` folder. An absolute global value
centralises every plan at one path. The plan edit permissions follow the resolved directory.

You can also pass an explicit workspace-local path to `plan_exit` when the plan lives somewhere
else in the project, such as `docs/plans/`.

### Why a filesystem root falls back

A drive root is not a project directory. Writing `C:\.kilo\plans` would mix plans from every
repository opened under it, and the root is often not writable. Kilo keeps the global data
directory as a fallback for that one case. To get a repository-local plan, open the repository
folder (or the project directory) as the workspace.

## Review, version, and keep the plan

A plan in `.kilo/plans/` is inside the repository, so it can be reviewed and versioned with the
work:

- commit `.kilo/plans/` when plans are part of the change record;
- do not add that directory to `.gitignore` if you want the history;
- keep the edits in one place: the plan file is the document, the chat is not.

The global fallback has no history. If a plan is written there, copy it into the project before
you start implementing, and commit the copy.

## Windows, worktrees, and multiple sessions

Each repository and each Agent Manager worktree has its own `.kilo/plans/`, so plans do not
collide across checkouts. A session finds its plan through the path recorded when the plan is
finalized, so a refinement edits that file (or its newest sibling) rather than starting a second
plan in another directory.

## Troubleshooting

- **The plan is in `~/.local/share/kilo/plans/` but the project is a git repository.** The
  workspace root was not inside a repository, or it was a filesystem root, so the project
  resolved as non-git. Open the repository as the workspace.
- **No `.kilo/plans/` directory exists.** It is created when Plan mode starts. If it cannot be
  created, the plan cannot be saved; the agent reports the path it tried.
- **Two plan files look similar.** Refinement rounds write siblings named with the same session
  timestamp. The newest one is the plan that `plan_exit` reports.
