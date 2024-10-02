const seedData =
{
  "Campers": [
      {
          "ID": 1,
          "Photo": "base64EncodedString",
          "Email": "camper1@example.com",
          "Password": "hashedPassword1",
          "Notes": "Very enthusiastic about the upcoming camp activities.",
          "CareDataID": "1",
          "OriginsID": 1,
          "CareData": {
              "ID": "1",
              "CareType": "Type 1 Diabetes",
              "LastKnownBG": 120,
              "LastKnownBGTimestamp": "2023-01-01T08:00:00Z",
              "CorrectionFactor": "1:15",
              "MDI": true,
              "CGM": "Dexcom G6",
              "InsulinPump": false,
              "DoctorName": "Dr. Sarah Lee",
              "DoctorEmail": "sarah.lee@medicenter.com",
              "DoctorPhone": "555-0102",
              "Allergies": "None",
              "EmergencyContact": "Jane Doe, 555-0103",
              "BGTargets": {
                  "TimeLabel": "Morning",
                  "BGTargetBreakfast": 100,
                  "BGTargetLunch": 110,
                  "BGTargetDinner": 120,
                  "BGTargetOther": 130
              },
              "InsulinCarbRatios": {
                  "TimeLabel": "Breakfast",
                  "RatioBreakfast": "1:15",
                  "RatioLunch": "1:15",
                  "RatioDinner": "1:15"
              },
              "CarbIntake": {
                  "DateTaken": "2023-01-01",
                  "TimeLabel": "Breakfast",
                  "CarbAmount": 45
              },
              "LongActingInsulin": {
                  "Dosage": 20,
                  "LastAdministered": "2023-01-01T08:00:00Z",
                  "LastAdministeredDosage": "20 units"
              },
              "RapidActingInsulin": {
                  "Dosage": 5,
                  "LastAdministered": "2023-01-01T08:30:00Z",
                  "LastAdministeredDosage": "5 units"
              },
              "SpecialNeed": {
                  "SpecialNeedType": 1,
                  "Notes": "Gluten-free diet required.",
                  "SpecialNeedInstructions": "Ensure all meals are gluten-free."
              },
            },
            "OriginsData": {
                "FirstName": "Camper",
                "CamperID": "1",
                "LastName": "One",
                "Gender": "Female",
                "Age": 10,
                "Mother": "Jane Doe",
                "Father": "John Doe"
            }
      },
      {
          "ID": "2",
          "Photo": "base64EncodedString",
          "Email": "camper2@example.com",
          "Password": "hashedPassword2",
          "Notes": "Needs special attention to diet.",
          "CareDataID": "2",
          "OriginsID": 2,
          "CareData": {
              "ID": "2",
              "CareType": "Type 2 Diabetes",
              "LastKnownBG": 140,
              "LastKnownBGTimestamp": "2023-01-02T09:00:00Z",
              "CorrectionFactor": "1:10",
              "MDI": true,
              "CGM": "Freestyle Libre",
              "InsulinPump": true,
              "InsulinPumpModel": "Medtronic MiniMed",
              "DoctorName": "Dr. John Carter",
              "DoctorEmail": "john.carter@medicenter.com",
              "DoctorPhone": "555-0204",
              "Allergies": "Peanuts",
              "EmergencyContact": "Michael Smith, 555-0205",
              "BGTargets": {
                  "TimeLabel": "Evening",
                  "BGTargetBreakfast": 90,
                  "BGTargetLunch": 100,
                  "BGTargetDinner": 110,
                  "BGTargetOther": 120
              },
              "InsulinCarbRatios": {
                  "TimeLabel": "Dinner",
                  "RatioBreakfast": "1:10",
                  "RatioLunch": "1:12",
                  "RatioDinner": "1:10"
              },
              "CarbIntake": {
                  "DateTaken": "2023-01-02",
                  "TimeLabel": "Dinner",
                  "CarbAmount": 60
              },
              "LongActingInsulin": {
                  "Dosage": 25,
                  "LastAdministered": "2023-01-02T20:00:00Z",
                  "LastAdministeredDosage": "25 units"
              },
              "RapidActingInsulin": {
                  "Dosage": 7,
                  "LastAdministered": "2023-01-02T20:30:00Z",
                  "LastAdministeredDosage": "7 units"
              },
              "SpecialNeed": {
                  "SpecialNeedType": 2,
                  "Notes": "Daily physical therapy needed.",
                  "SpecialNeedInstructions": "Assist with exercises every morning."
              },
            },
            "OriginsData": {
                "FirstName": "Camper",
                "CamperID": "2",
                "LastName": "Two",
                "Gender": "Male",
                "Age": 12,
                "Mother": "Anna Smith",
                "Father": "Michael Smith"
            }
          }
  ],
  "Volunteers": [
      {
          "ID": "101",
          "Photo": "base64EncodedString",
          "Email": "volunteer1@example.com",
          "Password": "hashedPassword101",
          "VolunteerType": "Medical",
          "FirstName": "Alice",
          "LastName": "Johnson"
      },
      {
          "ID": "102",
          "Photo": "base64EncodedString",
          "Email": "volunteer2@example.com",
          "Password": "hashedPassword102",
          "VolunteerType": "General",
          "FirstName": "Bob",
          "LastName": "Smith"
      }
  ],
  "CamperAssignedVolunteers": [
      {
          "CamperID": 1,
          "VolunteerID": 101
      },
      {
          "CamperID": 2,
          "VolunteerID": 102
      }
  ],
  "Camps": [
      {
          "ID": 201,
          "Name": "Diabetes Adventure Camp",
          "Description": "A fun and safe environment for children with diabetes."
      },
      {
          "ID": 202,
          "Name": "Special Needs Discovery Camp",
          "Description": "Exploring new skills in a supportive setting."
      }
  ],
  "CamperCamps": [
      {
          "CamperID": 1,
          "CampID": 201
      },
      {
          "CamperID": 2,
          "CampID": 202
      }
  ]
}
  module.exports = seedData;