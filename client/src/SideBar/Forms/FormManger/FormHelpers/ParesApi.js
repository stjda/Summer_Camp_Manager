/**
 * Parses API data and formats it for form filling.
 * 
 * @param {Object|Array} apiData - The data received from the API. Can be an object or an array containing a single object.
 * @param {string} [key=''] - An optional key associated with the data.
 * @returns {Object} An object containing parsed and formatted data for form filling.
 */
export const parseApiData = (apiData, key = '') => {
  console.log(apiData)
    // setAllData(apiData);
    const content = Array.isArray(apiData) ? apiData[0] : apiData;

      /**
   * Calculates age based on birthdate.
   * 
   * @param {string} birthDate - The birthdate in a format parseable by the Date constructor.
   * @returns {number} The calculated age.
   */
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
    };
    console.log("data inside parse acontentpi ",content)
  return {
    // This state controls what is displayed on the screen, in the form and what the user sees
      originalKey: key,
      name: `${content.registrationFormData.firstName} ${content.registrationFormData.lastName}`,
      age: calculateAge(content.registrationFormData.birthDate),
      dateOfBirth: content.registrationFormData.birthDate,
      isMDI: content.registrationFormData.isMDI || false,
      isCompleted: content.registrationFormData.isCompleted || false,
      pumpModelBrand: content.registrationFormData.pumpModelBrand || '',
      isCGM: content.registrationFormData.isCGM || false,
      cgmModelBrand: content.registrationFormData.cgmModelBrand || '',
      legalGuardian: content.guardianName || '',
      contactPhone: content.registrationFormData.contactPhone || '',
      carbsBreakfast: content.registrationFormData.carbsBreakfast || '',
      carbsLunch: content.registrationFormData.carbsLunch || '',
      carbsDinner: content.registrationFormData.carbsDinner || '',
      mealtimeRestrictions: content.registrationFormData.mealtimeRestrictions || '',
      insulinToCarbRatio: content.registrationFormData.insulinToCarbRatio || '',
      correctionFactor: content.registrationFormData.correctionFactor || '',
      target: content.registrationFormData.target || '',
      mdiInsulinType: content.registrationFormData.mdiInsulinType || '',
      rapidActingInsulinType: content.registrationFormData.rapidActingInsulinType || '', 
      longActingInsulinType: content.registrationFormData.longActingInsulinType || '',
      allergies: content.registrationFormData.allergies || '',
      otherDiagnosis: content.registrationFormData.otherDiagnosis || '',
      otcMedications: content.registrationFormData.otcMedications || '',
      otherPrescriptions: content.registrationFormData.otherPrescriptions || '',
      insulinFor15gSnack: content.registrationFormData.insulinFor15gSnack || false,
      hypoglycemiaSymptoms: content.registrationFormData.hypoglycemiaSymptoms || '',
      correctWith15gOrLess: content.registrationFormData.correctWith15gOrLess || false,
      hyperglycemiaSymptoms: content.registrationFormData.hyperglycemiaSymptoms || '',
      hyperglycemiaTreatment: content.registrationFormData.hyperglycemiaTreatment || '',
      hypoglycemiaTreatment: content.registrationFormData.hypoglycemiaTreatment || '',
      diabetesManagementStruggles: content.registrationFormData.diabetesManagementStruggles || '',
      glucoseSensitiveFoods: content.registrationFormData.glucoseSensitiveFoods || '',
      //
      diabetesPhysician: content.registrationFormData.diabetesPhysician || '',
      primaryCarePhysician: content.registrationFormData.primaryCarePhysician || '',
      officePhoneNumber: content.registrationFormData.officePhoneNumber || '',
      diagnosisDate: content.registrationFormData.diagnosisDate || '',
      gender: content.registrationFormData.gender || '',
      insulinType: content.registrationFormData.insulinType || '',
      parent1Email: content.registrationFormData.parent1Email || '',
      parent1FirstName: content.registrationFormData.parent1FirstName || '',
      parent1LastName: content.registrationFormData.parent1LastName || '',
      parent1Mobile: content.registrationFormData.parent1Mobile || '',
      parent2FirstName: content.registrationFormData.parent2FirstName || '',
      parent2LastName: content.registrationFormData.parent2LastName || '',
      parent2Mobile: content.registrationFormData.parent2Mobile || '',
      preferredLanguage: content.registrationFormData.preferredLanguage || '',
      preferredRoommate: content.registrationFormData.preferredRoommate || '',
      sessions: content.registrationFormData.sessions && content.registrationFormData.sessions.length > 0 
      ? [...content.registrationFormData.sessions] : [],
      specialInstructions: content.registrationFormData.specialInstructions,
      submissionDate: content.registrationFormData.submissionDate,
      tShirtSize: content.registrationFormData.tShirtSize,
      selectedCamps: content.selectedCamps,
      consent: content.consent,
      document: content.registrationFormData.document || null,
      signature: content.registrationFormData.signature || null,
      role: content.registrationFormData.role || null
  };
};