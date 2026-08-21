/* eligibilityEngine.js */

/* ================= SCHEME RULES ================= */

export const SCHEME_RULES = [
  {
    name: "PM Kisan Samman Nidhi",
    type: "scheme",
    rules: {
      occupation: ["farmer"],
      maxIncome: 1000000,
      states: "ALL"
    }
  },
  {
    name: "Ujjwala Yojana",
    type: "scheme",
    rules: {
      gender: ["female"],
      maxIncome: 250000,
      states: "ALL"
    }
  },
  {
    name: "National Scholarship Portal",
    type: "scheme",
    rules: {
      occupation: ["student"],
      maxIncome: 500000
    }
  },
  {
    name: "Ayushman Bharat",
    type: "scheme",
    rules: {
      maxIncome: 500000
    }
  }
];

/* ================= STARTUP RULES ================= */

export const STARTUP_RULES = [
  {
    name: "Startup India",
    type: "startup",
    rules: {
      isStartup: true,
      stages: ["idea", "early", "growth"]
    }
  },
  {
    name: "PM Mudra Yojana",
    type: "startup",
    rules: {
      isStartup: true,
      maxIncome: 1000000
    }
  },
  {
    name: "Udyam Registration",
    type: "startup",
    rules: {
      isStartup: true
    }
  },
  {
    name: "Stand-Up India",
    type: "startup",
    rules: {
      isStartup: true,
      gender: ["female"],
      category: ["SC", "ST"]
    }
  }
];

/* ================= CORE CHECK ================= */

export function isEligible(user, rule) {
  const r = rule.rules;

  if (r.gender && !r.gender.includes(user.gender)) return false;
  if (r.category && !r.category.includes(user.category)) return false;
  if (r.occupation && !r.occupation.includes(user.occupation)) return false;

  if (r.maxIncome && user.income > r.maxIncome) return false;

  if (r.states && r.states !== "ALL" && !r.states.includes(user.state))
    return false;

  if (r.isStartup && !user.isStartup) return false;
  if (r.stages && !r.stages.includes(user.stage)) return false;

  return true;
}

/* ================= FILTERS ================= */

export function getEligibleSchemes(user) {
  return SCHEME_RULES
    .filter(s => isEligible(user, s))
    .map(s => s.name);
}

export function getEligibleStartups(user) {
  return STARTUP_RULES
    .filter(s => isEligible(user, s))
    .map(s => s.name);
}
