import { apiClient } from "./apiClient";

export type SeenTutorialsMap = Record<string, boolean>;

/** All recognised tutorial page keys */
export const TUTORIAL_KEYS = [
  "search",
  "booking",
  "customer-dashboard",
  "owner-dashboard",
  "business-edit",
  "schedule-editor",
  "staff-home",
  "date-exceptions",
] as const;

export type TutorialKey = (typeof TUTORIAL_KEYS)[number];

/** Fetch the seen-tutorial map for the currently authenticated user. */
export async function getSeenTutorials(): Promise<SeenTutorialsMap> {
  const res = await apiClient.get<SeenTutorialsMap>("/users/me/tutorials");
  return res.data;
}

/** Mark a single tutorial key as seen on the backend. */
export async function markTutorialSeenOnServer(tutorialKey: string): Promise<void> {
  await apiClient.patch("/users/me/tutorials", { tutorialKey });
}
