/* eligibilityController.js */

import { buildUserProfile } from "./userProfile.js";
import {
  getEligibleSchemes,
  getEligibleStartups
} from "./eligibilityEngine.js";

export function runEligibility(formData, mode) {
  const user = buildUserProfile(formData);

  if (mode === "schemes") {
    return {
      type: "schemes",
      results: getEligibleSchemes(user)
    };
  }

  if (mode === "startup") {
    return {
      type: "startup",
      results: getEligibleStartups(user)
    };
  }

  return {
    type: "none",
    results: []
  };
}
