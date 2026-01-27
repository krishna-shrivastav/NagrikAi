/* userProfile.js */

export function buildUserProfile(formData) {
  return {
    // Common details
    gender: formData.gender || null,        // male / female
    category: formData.category || null,    // General / OBC / SC / ST
    occupation: formData.occupation || null,// farmer / student / business
    income: Number(formData.income) || 0,
    state: formData.state || null,

    // Startup specific
    isStartup: formData.isStartup || false,
    registration: formData.registration || false,
    stage: formData.stage || null           // idea / early / growth
  };
}
