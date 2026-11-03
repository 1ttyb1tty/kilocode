import { describe, expect, test } from "bun:test"
import os from "os"
import path from "path"
import { ConfigV1 } from "@opencode-ai/core/v1/config/config"
import { ConfigParse } from "../../src/config/parse"
import { PlanDir } from "../../src/kilocode/plan-dir"
import type { InstanceContext } from "../../src/project/instance-context"

const drive = path.parse(process.cwd()).root
const data = path.join(drive, "data-dir")

function ctx(input: { directory: string; worktree?: string; vcs?: boolean }): InstanceContext {
  return {
    directory: input.directory,
    worktree: input.worktree ?? input.directory,
    project: { vcs: input.vcs } as InstanceContext["project"],
  }
}

describe("PlanDir.resolve", () => {
  test("a git project uses its worktree", () => {
    const root = path.join(drive, "repo")
    const instance = ctx({ directory: path.join(root, "src"), worktree: root, vcs: true })
    expect(PlanDir.resolve({ instance, dataDir: data })).toBe(path.join(root, ".kilo", "plans"))
  })

  test("a non-git workspace uses its own directory", () => {
    const dir = path.join(drive, "work")
    const instance = ctx({ directory: dir, worktree: "/" })
    expect(PlanDir.resolve({ instance, dataDir: data })).toBe(path.join(dir, ".kilo", "plans"))
  })

  test("a filesystem root keeps the global fallback", () => {
    const instance = ctx({ directory: drive, worktree: "/" })
    expect(PlanDir.resolve({ instance, dataDir: data })).toBe(path.join(data, "plans"))
  })

  test("global restores the data directory", () => {
    const instance = ctx({ directory: path.join(drive, "repo"), worktree: path.join(drive, "repo"), vcs: true })
    expect(PlanDir.resolve({ location: "global", instance, dataDir: data })).toBe(path.join(data, "plans"))
  })

  test("an absolute path is used as given", () => {
    const instance = ctx({ directory: path.join(drive, "repo"), worktree: path.join(drive, "repo"), vcs: true })
    const custom = path.join(drive, "design", "plans")
    expect(PlanDir.resolve({ location: custom, instance, dataDir: data })).toBe(custom)
  })

  test("a home-relative path resolves against the home directory", () => {
    const instance = ctx({ directory: path.join(drive, "repo"), worktree: path.join(drive, "repo"), vcs: true })
    expect(PlanDir.resolve({ location: "~/plans-demo", instance, dataDir: data })).toBe(
      path.join(os.homedir(), "plans-demo"),
    )
  })

  test("a relative path resolves against the project root", () => {
    const root = path.join(drive, "repo")
    const instance = ctx({ directory: root, worktree: root, vcs: true })
    expect(PlanDir.resolve({ location: "../shared-plans", instance, dataDir: data })).toBe(
      path.resolve(root, "../shared-plans"),
    )
  })

  test("the configuration schema accepts plans.location", () => {
    const parsed = ConfigParse.schema(ConfigV1.Info, { plans: { location: "docs/plans" } }, "test:plans")
    expect(parsed.plans?.location).toBe("docs/plans")
  })
})
