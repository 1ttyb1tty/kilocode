import { describe, expect, test } from "bun:test"
import path from "path"
import * as KiloAgent from "../../src/kilocode/agent"
import { Permission } from "../../src/permission"
import { tmpdir } from "../fixture/fixture"

describe("plan edit permissions", () => {
  test("a non-git workspace allows its own .kilo/plans directory", async () => {
    await using tmp = await tmpdir()
    const item = { native: true, permission: Permission.fromConfig({ edit: { "*": "deny" } }) }
    KiloAgent.hardenPlan("plan", item, "/", tmp.path)

    const plan = path.join(tmp.path, ".kilo", "plans", "plan.md")
    expect(Permission.evaluate("edit", path.relative("/", plan), item.permission).action).toBe("allow")

    const source = path.join(tmp.path, "src", "index.ts")
    expect(Permission.evaluate("edit", path.relative("/", source), item.permission).action).toBe("deny")
  })
})
