import { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Box } from "@mui/material";

/**
 * Custom hook for fetching and processing medical check-in data.
 * 
 * @param {string} endpoint - The API endpoint for fetching data (not used in current implementation).
 * @param {string} [prefix=''] - Prefix for the API endpoint.
 * @param {string} [bucket='stjda-signup-forms'] - The bucket name for fetching intake form data.
 * @param {boolean} isCompleted - Flag to fetch completed or incomplete forms.
 * @returns {Object} An object containing the fetched data, loading state, error state, and a loading component.
 * @property {Array|null} data - The combined and processed medical check-in and intake form data.
 * @property {boolean} loading - Indicates whether the data is currently being fetched.
 * @property {Error|null} error - Any error that occurred during data fetching.
 * @property {Function} LoadingComponent - A React component for displaying a loading spinner.
 */
export const useMedCheckInData = (endpoint, prefix = '', bucket = 'stjda-signup-forms', isCompleted) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from med-checkin-forms bucket
        const responseFromMedCheckInFormsBucket = await axios.get(`http://localhost:3000/api/forms/med-checkin-filtering/${prefix}`, {
          params: {
            bucket: 'med-checkin-forms',
            formCompletionStatus: isCompleted.toString(),
            additionThingsToFilter: JSON.stringify([])
          }
        });

        let flatMedCheckIn = [];
        if (responseFromMedCheckInFormsBucket.status === 200) {
          flatMedCheckIn = parseMedCheckInData(responseFromMedCheckInFormsBucket.data.objects);
        }

        // Fetch data from stjda-signup-forms bucket
        const responseFromIntakeFormsBucket = await axios.get(`http://localhost:3000/api/forms/med-checkin-filter`, {
          params: { 
            bucket: bucket, 
            objectsToFilterAginst: JSON.stringify(flatMedCheckIn)
          } 
        });

        let intakeFormsData = [];
        if (responseFromIntakeFormsBucket.status === 200) {
          intakeFormsData = parseDataFromIntakeFormBucket(responseFromIntakeFormsBucket.data.filteredEntries);
        }

        // Combine both datasets
        setData([...flatMedCheckIn, ...intakeFormsData]);
        console.log([...flatMedCheckIn, ...intakeFormsData]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [bucket, prefix, isCompleted]);

    /**
   * Parses data from the intake form bucket.
   * 
   * @param {Array} rawData - The raw data from the intake form bucket.
   * @returns {Array} Parsed and formatted intake form data.
   */
  const parseDataFromIntakeFormBucket = (rawData) => {
    return rawData.map(item => {
      const registrationData = item.registrationFormData || {};
      return {
        name: `${registrationData?.firstName || ''} ${registrationData?.lastName || ''}`.trim(),
        firstName: registrationData?.firstName || '',
        lastName: registrationData?.lastName || '',
        age: item?.age || '',
        primaryCarePhysician: registrationData?.primaryCarePhysician || '',
        documentKey: item.document?.key || '',
        isCompleted: !registrationData.isCompleted,
        contactPhone: registrationData.contactPhone || registrationData.parent1Mobile || registrationData.parent2Mobile || '',
        email: item.email || registrationData.parent1Email || '',
        preferredLanguage: registrationData.preferredLanguage || ''
      };
    });
  };

    /**
   * Parses data from the medical check-in forms.
   * 
   * @param {Array} rawData - The raw data from the medical check-in forms.
   * @returns {Array} Parsed and formatted medical check-in data.
   */
  const parseMedCheckInData = (rawData) => {
    console.log(rawData);
    return rawData.map(item => {
      const itemEl = item;
      console.log(itemEl);
      return {
        id: item.id,
        name: item.name || '',
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        age: item.age || '',
        email: item.email || '',
        documentKey: item.documentKey || '',
        contactPhone: item.contactPhone || '',
        lastDoseGiven: item.lastDoseGiven || '',
        nextDoseDue: item.nextDoseDue || '',
        lastSiteChangePump: item.lastSiteChangePump || '',
        lastSiteChangeCGM: item.lastSiteChangeCGM || '',
        currentBloodGlucose: item.currentBloodGlucose || '',
        lastCalibration: item.lastCalibration || '',
        mensesStarted: !!item.mensesStarted,
        counselorConsent: !!item.counselorConsent,
        selfCareTasks: item.selfCareTasks || '',
        legalGuardianSignature: item.legalGuardianSignature || '',
        signatureDate: item.signatureDate || '',
        isCompleted: !!item.isCompleted
      };
    });
  };

  const LoadingComponent = () => (
    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  );

  return { data, loading, error, LoadingComponent };
};