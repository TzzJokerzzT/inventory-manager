import { applyMovement } from "./service";
import type { Movement } from "./types";

export async function handleApplyMovement(repo: any, movement: Movement) {
  // minimal shim for application layer
  return applyMovement(repo, movement);
}
