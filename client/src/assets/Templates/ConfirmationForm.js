export const formStructure = {
    "Personal Info": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "helperText": "Format: FirstName LastName",
        "required": true
      },
      {
        "name": "age",
        "label": "Age",
        "type": "text",
        "required": true
      },
      {
        "name": "dateOfBirth",
        "label": "Date of Birth",
        "type": "date",
        "helperText": "MM/DD/YYYY"
      },
      {
        "name": "preferredLanguage",
        "label": "Avery's - Preferred Language",
        "type": "text"
      },
      {
        "name": "gender",
        "label": "Gender",
        "type": "select",
        "options": ["Male", "Female", "Other"]
      },
      {
        "name": "parent1FirstName",
        "label": "Parent 1: First Name",
        "type": "text"
      },
      {
        "name": "parent1LastName",
        "label": "Parent 1: Last Name",
        "type": "text"
      },
      {
        "name": "parent1Mobile",
        "label": "Parent 1: Mobile",
        "type": "text"
      },
      {
        "name": "parent2FirstName",
        "label": "Parent 2: First Name",
        "type": "text"
      },
      {
        "name": "parent2LastName",
        "label": "Parent 2: Last Name",
        "type": "text"
      },
      {
        "name": "parent2Mobile",
        "label": "Parent 2: Mobile",
        "type": "text"
      },
      {
        "name": "consent",
        "label": "Consent to use images for promotion",
        "type": "switch",
      },
    ],
    "Camp Info": [
      {
        "name": "selectedCamps",
        "label": "Selected Camps",
        "type": "select",
        "options": ["Residential Camp", "Science Camp", "Robotics Camp", "Nature Camp"], // Add your camp options here
        "helperText": "Select multiple camps"
      },
      {
        "name": "tShirtSize",
        "label": "T-Shirt Size",
        "type": "select",
        "options": ["S", "M", "L", "XL", "XXL"]
      },
      {
        "name": "sessions",
        "label": "Camp Session",
        "type": "textarea"
      },
      {
        "name": "specialInstructions",
        "label": "Special Instructions",
        "type": "textarea"
      },
      {
        "name": "preferredRoommate",
        "label": "Preferred Roommate",
        "type": "text"
      },
    ],
    "Diabetes Management": [
      {
        "name": "isMDI",
        "label": "MDI or Pump?",
        "type": "switch"
      },
      {
        "name": "pumpModelBrand",
        "label": "Model/Brand of Pump",
        "type": "text"
      },
      {
        "name": "isCGM",
        "label": "On CGM?",
        "type": "switch"
      },
      {
        "name": "cgmModelBrand",
        "label": "Model/Brand of CGM",
        "type": "text"
      }
    ],
    "Contact Info": [
      {
        "name": "legalGuardian",
        "label": "Legal Guardian",
        "type": "text",
        "helperText": "Format: 'First Name' 'Last Name'"
      },
      {
        "name": "contactPhone",
        "label": "Contact Phone#",
        "type": "text",
        "required": true
      },
      { // physician is uniqley managed by a method in the form component
        "name": "Physician",
        "label": "Primary Care Physician",
        "type": "text",
        "helperText": "Format: 'Doctors Name' - dont include the 'Dr.' prefix"
      },
      {
        "name": "officePhoneNumber",
        "label": "Office Phone Number",
        "type": "text"
      },
      {
        "name": "diabetesPhysician",
        "label": "Diabetes Physician",
        "type": "text"
      },
    ],
    "Meal Plan": [
      {
        "name": "carbsBreakfast",
        "label": "Carbs for Breakfast",
        "type": "text"
      },
      {
        "name": "carbsLunch",
        "label": "Carbs for Lunch",
        "type": "text"
      },
      {
        "name": "carbsDinner",
        "label": "Carbs for Dinner",
        "type": "text"
      },
      {
        "name": "mealtimeRestrictions",
        "label": "Mealtime Restrictions",
        "type": "textarea"
      }
    ],
    "Insulin Management": [
      {
        "name": "insulinToCarbRatio",
        "label": "Insulin to Carb Ratio",
        "type": "text"
      },
      {
        "name": "correctionFactor",
        "label": "Correction Factor",
        "type": "text"
      },
      {
        "name": "target",
        "label": "Target",
        "type": "text"
      },
      {
        "name": "mdiInsulinType",
        "label": "MDI - Type of Insulin",
        "type": "text"
      },
      {
        "name": "rapidActingInsulinType",
        "label": "Rapid Acting Insulin",
        "type": "text"
      },
      {
        "name": "longActingInsulinType",
        "label": "Long Acting Insulin",
        "type": "text"
      }
    ],
    "Medical Info": [
      {
        "name": "allergies",
        "label": "Allergies",
        "type": "textarea",
        "helperText": "Format: Comma separated list (Allergy1, Allergy2 ...)"
      },
      {
        "name": "otherDiagnosis",
        "label": "Other Diagnosis",
        "type": "textarea"
      },
      {
        "name": "otcMedications",
        "label": "Over the Counter Medications",
        "type": "textarea"
      },
      {
        "name": "otherPrescriptions",
        "label": "Prescriptions (Other than Insulin)",
        "type": "textarea"
      },
      {
        "name": "diagnosisDate",
        "label": "Diagnosis Date",
        "type": "date",
        "helperText": "MM/DD/YYYY"
      }
    ],
    "Diabetes Details": [
      {
        "name": "insulinFor15gSnack",
        "label": "Do you give insulin for 15g snack?",
        "type": "switch"
      },
      {
        "name": "hypoglycemiaSymptoms",
        "label": "Signs and Symptoms of Hypoglycemia",
        "type": "textarea"
      },
      {
        "name": "correctWith15gOrLess",
        "label": "Do you correct with 15g or less?",
        "type": "switch"
      },
      {
        "name": "hyperglycemiaSymptoms",
        "label": "Signs and Symptoms of Hyperglycemia",
        "type": "textarea"
      },
      {
        "name": "hyperglycemiaTreatment",
        "label": "Best treatment for Hyperglycemia",
        "type": "textarea"
      },
      {
        "name": "hypoglycemiaTreatment",
        "label": "Best treatment for Hypoglycemia",
        "type": "textarea"
      }
    ],
    "Additional Info": [
      {
        "name": "diabetesManagementStruggles",
        "label": "Are there any struggles with diabetes management that you hope to overcome at camp?",
        "type": "textarea"
      },
      {
        "name": "glucoseSensitiveFoods",
        "label": "Are there any foods that your child's glucose is sensitive to?",
        "type": "textarea"
      },
      {
        "name": "submissionDate",
        "label": "Submission Date",
        "type": "date",
        "helperText": "MM/DD/YYYY"
      },
      {
        "name": "document",
        "label": "Upload additional Document",
        "type": "file"
      },
      {
        "name": "signature",
        "label": "This Form Completed By:",
        "type": "text",
        "required": true
      },
      {
        "name": "originalKey",
        "label": "Integrity Identifier",
        "type": "text",
        "multiple": false
      }
      
    ]
  }