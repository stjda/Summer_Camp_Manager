export const medCheckInFormStructure = {
    "Medical Check-In": [
      {
        "name": "lastDoseGiven",
        "label": "Last Dose Given",
        "type": "datetime-local",
        "helperText": "Date and time of the last dose"
      },
      {
        "name": "nextDoseDue",
        "label": "Next Dose Due",
        "type": "datetime-local",
        "helperText": "Date and time of the next dose"
      },
      {
        "name": "lastSiteChangePump",
        "label": "Last Site Change (Pump)",
        "type": "datetime-local",
        "helperText": "Date of the last pump site change"
      },
      {
        "name": "lastSiteChangeCGM",
        "label": "Last Site Change (CGM)",
        "type": "datetime-local",
        "helperText": "Date of the last CGM site change"
      },
      {
        "name": "currentBloodGlucose",
        "label": "Current Blood Glucose Level",
        "type": "text",
        "helperText": "Current blood glucose reading"
      },
      {
        "name": "lastCalibration",
        "label": "Last Calibration",
        "type": "datetime-local",
        "helperText": "Date and time of the last calibration"
      },
      {
        "name": "mensesStarted",
        "label": "Have they started their menses? (For Females)",
        "type": "switch",
        "helperText": "Toggle if applicable"
      },
      {
        "name": "counselorConsent",
        "label": "Consent to speak with a counselor if struggling",
        "type": "switch",
        "helperText": "Do you consent to your child speaking to a counselor if we recognize they are struggling?"
      },
      {
        "name": "selfCareTasks",
        "label": "Self-care tasks",
        "type": "textarea",
        "helperText": "Describe any self-care tasks your child does on their own"
      },
      {
        "name": "legalGuardianSignature",
        "label": "Legal Guardian Signature",
        "type": "text",
        "required": true
      },
      {
        "name": "signatureDate",
        "label": "Date",
        "type": "datetime-local",
        "required": true
      }
    ]
  }