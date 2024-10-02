import { gql } from '@apollo/client';

// __typename field will be filled with "Camper" or "Volunteer" depending on which type is returned
export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($email: String!, $password: String) {
    updatePassword(email: $email, password: $password) {
      ... on Camper {
        __typename
        _id
        email
      } 
      ... on Volunteer {
        __typename
        _id
        email
      }
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($_id: ID, $email: String, $firstName: String, $lastName: String, $isVolunteer: Boolean, $photo: String, $banner: String, $notifications: Boolean, $phone: String) {
    updatePerson(_id: $_id, email: $email, firstName: $firstName, lastName: $lastName, isVolunteer: $isVolunteer, photo: $photo, banner: $banner, notifications: $notifications, phone: $phone) {
      ... on Camper {
        _id
        email
        firstName
        lastName
        isVolunteer
        photo
        banner
        notifications
        phone
      }
      ... on Volunteer {
        _id
        email
        firstName
        lastName
        isVolunteer
        photo
        banner
        notifications
        phone
      }
    }
  }
`

export const UPDATE_CAMPER_CARE_DATA = gql`
  mutation UpdateCamperCareData($camperInput: UpdateCamperInput!, $careDataInput: UpdateCareDataInput!) {
    updateCamperCareData(camperInput: $camperInput, careDataInput: $careDataInput) {
      _id
      email
      careData {
        _id
        careType
        correctionFactor
        mdi
        cgm
        insulinPump
        insulinPumpModel
        allergies
        emergencyContact
        insulinType
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
        providers {
          _id
          care_id
          role
          providerName
          providerEmail
          providerPhone
        }
        overTheCounterMedications{
          _id
          care_id
          camperID
          medicationName
          activeIngredients
          dosageAdult
          dosageChild
          instructions
          sideEffects
          warnings
          createdBy
        }
        prescriptions{
          _id
          care_id
          camperID
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
      }
    }
  }
`;
export const UPDATE_ALL_CAMPERS = gql`
  mutation UpdateAllCampers($campers: [UpdateAllCampersInput!]!) {
    updateAllCampers(campers: $campers) {
      _id
      isVolunteer
      photo
      banner
      email
      firstName
      lastName
      phone
      notifications
      notes
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
        specialNeed {
          _id
          specialNeedType
          notes
          specialNeedInstructions
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
        mealReadings {
          _id
          care_id
          camperID
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
          camperID
          medicationName
          activeIngredients
          dosageAdult
          dosageChild
          instructions
          sideEffects
          warnings
          created
        }
        prescriptions {
          _id
          care_id
          camperID
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
          camperID
          noteType
          content
          injury
          createdBy
          updatedBy
        }
      }
      originsData {
        _id
        gender
        age
        dateOfBirth
        mother
        father
        firstName
        lastName
      }
      volunteerAssignments {
        email
        type
        saved
      }
    }
  }
`;

export const UPDATE_ALL_VOLUNTEERS = gql`
  mutation updateAllVolunteers($campers: [UpdateAllVolunteersInput!]!) {
    updateAllVolunteers(campers: $campers){
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


export const ADD_ASSIGNMENT = gql`
  mutation AddVolunteerAssignment($camperEmail: String!, $volunteerEmail: String!, $volunteerType: String!) {
    addVolunteerAssignment(camperEmail: $camperEmail, volunteerEmail: $volunteerEmail, volunteerType: $volunteerType) {
      camper {
        _id
      }
      volunteer {
        _id
      }
      volunteerType
    }
  }
`;


export const REMOVE_ASSIGNMENT = gql`
 mutation RemoveAssignment($camperEmail: String!, $volunteerEmail: String!) {
  removeAssignment(camperEmail: $camperEmail, volunteerEmail: $volunteerEmail) {
    success
    message
  }
}
`
// this is specifically for new users who went through the intake process
export const REGISTER_NEW_USER = gql`
  mutation RegisterUser(
    $countryCode: String,
    $dateOfBirth: String!,
    $email: String!,
    $firstName: String!,
    $key: String!,
    $lastName: String!,
    $notifications: Boolean,
    $password: String!,
    $phone: String!,
    $profileImage: String,
    $role: String!,
  ) {
    registerUser( 
      countryCode: $countryCode,
      dateOfBirth: $dateOfBirth,
      email: $email,
      firstName: $firstName,
      key: $key,
      lastName: $lastName,
      notifications: $notifications,
      password: $password,
      phone: $phone,
      profileImage: $profileImage,
      role: $role
    ) { # the client does not get the data, because the data is sent between apollo server and express backend server to make the account
      success
      message
    }
  }
`;

/////////////////////////////////////////////////////////////
export const UPDATE_VOLUNTEER = gql`
  mutation UpdateVolunteer($volunteerInput: UpdateVolunteerInput!) {
    updateVolunteer(volunteerInput: $volunteerInput) {
      _id
      email
      photo
      banner
      notifications
      phone
    }
  }
`


export const DELETE_CAMPER = gql`
  mutation DeleteCamper($email: String!) {
    deleteCamper(email: $email)
  }
`

export const DELETE_VOLUNTEER = gql`
  mutation DeleteVolunteer($email: String!) {
    deleteVolunteer(email: $email)
  }
`