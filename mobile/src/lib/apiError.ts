import { isAxiosError } from "axios";

/**
 * Pulls the backend's own error message out of an axios error.
 *
 * Worth showing verbatim when the backend already says exactly which field it
 * rejected — a generic "something went wrong" turns a fixable 400 into a
 * silent failure. `message` is a string for a single error and an array of
 * strings when a validation layer rejects several fields at once.
 */
export function extractApiErrorMessage(err: unknown, fallback = "Something went wrong. Try again."): string {
  if (isAxiosError(err)) {
    const message = (err.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message) && message.length > 0) return message.join(", ");
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
}
