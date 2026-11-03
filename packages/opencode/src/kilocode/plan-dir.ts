import os from "os"
import path from "path"
import { Global } from "@opencode-ai/core/global"
import type { InstanceContext } from "@/project/instance-context"

/**
 * Resolve where plan files live.
 *
 * The default keeps a plan with the project it describes. `global` restores the
 * pre-existing data-directory behaviour, and any path value is honoured as-is:
 * absolute and `~`-relative paths are used directly, a relative path is resolved
 * against the project root so a global default can still mean "this project's
 * folder". A filesystem root is the one directory not used for storage; it keeps
 * the global fallback.
 */
export namespace PlanDir {
  export function root(instance: InstanceContext) {
    return instance.project.vcs ? instance.worktree : instance.directory
  }

  export function resolve(input: { location?: string; instance: InstanceContext; dataDir?: string }) {
    const data = input.dataDir ?? Global.Path.data
    const fallback = path.join(data, "plans")
    const root = PlanDir.root(input.instance)
    const value = input.location?.trim()

    if (!value || value === "project") {
      return path.dirname(root) === root ? fallback : path.join(root, ".kilo", "plans")
    }
    if (value === "global") return fallback
    if (value === "~") return os.homedir()
    if (value.startsWith("~/") || value.startsWith("~\\")) return path.resolve(os.homedir(), value.slice(2))
    if (path.isAbsolute(value)) return path.normalize(value)
    return path.resolve(root, value)
  }
}
