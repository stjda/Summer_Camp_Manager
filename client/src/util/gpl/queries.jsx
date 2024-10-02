import { gql } from '@apollo/client';

export const GET_VOLUNTEERS = gql`
  query GetVolunteers {
    getAllVolunteers {
      _id
      isVolunteer
      photo
      banner
      email
      notes
      volunteerType
      firstName
      lastName
      dateOfBirth
      notifications
      phone
      volunteerAssignments {
        volunteer
        camperEmail
      }
    }
  }
`;

export const GET_CAMPERS = gql`
  query GetCampers {
    getAllCampers {
      _id
      isVolunteer
      photo
      banner
      email
      notifications
      phone
      notes
      firstName
      lastName
      volunteerAssignments {
        volunteer
        volunteerEmails
        volunteerType
      }
      careData {
        _id
        careType
        correctionFactor
        mdi
        cgm
        insulinPump
        insulinPumpModel
        insulinType
        allergies
        emergencyContact
        targetBG {
          breakfast
          lunch
          dinner
        }
        insulinCarbRatio {
          breakfast
          lunch
          dinner
        }
        longActingInsulin {
          _id
          care_id
          dosage
          lastAdministered
          name
        }
        rapidActingInsulin {
          _id
          care_id
          dosage
          lastAdministered
          name
        }
        specialNeed {
          _id
          specialNeedType
          notes
          specialNeedInstructions
        }
        mealReadings {
          _id
          care_id
          date
          timeLabel
          unixTime
          carbAmount
          glucoseLevel
          meal
          imageIdentifier
        }
        providers {
          _id
          care_id
          role
          providerName
          providerEmail
          providerPhone
        }
        overTheCounterMedications {
          _id
          care_id
          medicationName
          activeIngredients
          dosageAdult
          dosageChild
          instructions
          sideEffects
          warnings
          createdBy
        }
        prescriptions {
          _id
          care_id
          medicationName
          genericName
          form
          dosage
          frequency
          refills
          prescribedFor
          sideEffects
          interactions
          prescriptionDate
          instructions
        }
        medicalNotes {
          _id
          care_id
          noteType
          content
          injury
          createdBy
          updatedBy
        }
      }
      originsData {
        _id
        firstName
        lastName
        gender
        age
        dateOfBirth
        mother
        father
      }
      camperCamps {
        campID
        camperID
      }
    }
  }
`;

export const GET_VOLUNTEER_BY_EMAIL = gql`
  query GetVolunteerByEmail($email: String!) {
    volunteerByEmail(email: $email) {
      _id
      isVolunteer
      photo
      banner
      email
      notes
      volunteerType
      firstName
      lastName
      dateOfBirth
      notifications
      phone
      volunteerAssignments {
        volunteer
        camper
      }
    }
  }
`;


export const GET_CAMPER_BY_EMAIL = gql`
  query GetCamperByEmail($email: String!) {
    camperByEmail(email: $email) {
      _id
      isVolunteer
      photo
      banner
      email
      notifications
      phone
      notes
      firstName
      lastName
      volunteerAssignments {
        volunteer
        volunteerType
      }
      careData {
        _id
        careType
        correctionFactor
        mdi
        cgm
        insulinPump
        insulinPumpModel
        insulinType
        allergies
        emergencyContact
        targetBG {
          breakfast
          lunch
          dinner
        }
        insulinCarbRatio {
          breakfast
          lunch
          dinner
        }
        longActingInsulin {
          _id
          care_id
          dosage
          lastAdministered
          name
        }
        rapidActingInsulin {
          _id
          care_id
          dosage
          lastAdministered
          name
        }
        specialNeed {
          _id
          specialNeedType
          notes
          specialNeedInstructions
        }
        mealReadings {
          _id
          care_id
          date
          timeLabel
          unixTime
          carbAmount
          glucoseLevel
          meal
          imageIdentifier
        }
        providers {
          _id
          care_id
          role
          providerName
          providerEmail
          providerPhone
        }
        overTheCounterMedications {
          _id
          care_id
          medicationName
          activeIngredients
          dosageAdult
          dosageChild
          instructions
          sideEffects
          warnings
          createdBy
        }
        prescriptions {
          _id
          care_id
          medicationName
          genericName
          form
          dosage
          frequency
          refills
          prescribedFor
          sideEffects
          interactions
          prescriptionDate
          instructions
        }
        medicalNotes {
          _id
          care_id
          noteType
          content
          injury
          createdBy
          updatedBy
        }
      }
      originsData {
        _id
        firstName
        lastName
        gender
        age
        dateOfBirth
        mother
        father
      }
      camperCamps {
        campID
        camperID
      }
    }
  }
`;

export const GET_WHO_ACCEPTED_NOTIFICATIONS = gql`
  query GetAcceptedNotifications($confirm: Boolean) {
    acceptedNotifications(confirm: $confirm) {
      ... on Camper {
        _id
        email
        notifications
      }
      ... on Volunteer {
        _id
        email
        notifications
      }
    }
  }
`;

export const GET_ASSIGNMENTS = gql`
  query getAssignments($personID: ID!) {
    getAssignments(personID: $personID) {
      ... on Camper {
        _id
        firstName
        lastName
        email
        careData {
          careType
        }
      }
      ... on Volunteer {
        _id
        firstName
        lastName
        email
        volunteerType
      }
    }
  }
`;

export const GET_VOLUNTEERS_PAGINATED = gql`
  query GetVolunteersPaginated($page: Int, $pageSize: Int) {
    volunteers(page: $page, pageSize: $pageSize) {
      edges {
        node {
          _id
          email
          firstName
          lastName
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CAMPERS_PAGINATED = gql`
  query GetCampersPaginated($page: Int, $pageSize: Int) {
    campers(page: $page, pageSize: $pageSize) {
      edges {
        node {
          _id
          email
          originsData {
            firstName
            lastName
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;