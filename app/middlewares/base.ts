import { os } from "@orpc/server";

export const base = os.$context<{ request: Request }>().errors({
  RATE_LIMITED: {
    message: "You have reached the limit.",
  },
  BAD_REQUEST: {
    message: "Invalid request.",
  },
  NOT_FOUND: {
    message: "Not found.",
  },
  FORBIDDEN: {
    message: "You do not have access.",
  },
  UNAUTHORIZED: {
    message: "You are not authorized.",
  },
  INTERNAL_SERVER_ERROR: {
    message: "Internal server error.",
  },
});
