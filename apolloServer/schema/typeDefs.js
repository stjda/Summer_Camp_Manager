const gql = require('graphql-tag');
const typeDefs = gql` #graphql

type Volunteer {
  _id: ID!
  isVolunteer: Boolean
  photo: String
  banner: String
  email: String!
  notes: String
  volunteerType: String
  firstName: String
  lastName: String
  dateOfBirth: String
  notifications: Boolean
  phone: String
  volunteerAssignments: CamperAssignments
}

type Camper {
  _id: ID!
  isVolunteer: Boolean
  photo: String
  banner: String
  email: String!
  notifications: Boolean
  phone: String
  notes: String
  firstName: String
  lastName: String
  careData: CareData
  originsData: OriginsData
  volunteerAssignments: VolunteerAssignments
  camperCamps: CamperCamps
}

type CareData {
  _id: ID!
  careType: String
  correctionFactor: String
  mdi: Boolean
  cgm: String
  insulinPump: Boolean
  insulinPumpModel: String
  insulinType: String
  allergies: String
  emergencyContact: String
  targetBG: TargetBG
  insulinCarbRatio: InsulinCarbRatio
  specialNeed: SpecialNeed
  longActingInsulin: [LongActingInsulin]
  rapidActingInsulin: [RapidActingInsulin]
  mealReadings: [MealReading]
  providers: [Provider]
  overTheCounterMedications: [OverTheCounterMedication]
  prescriptions: [Prescription]
  medicalNotes: [MedicalNote]
}

type Prescription {
  _id: ID
  care_id: ID
  camperID: ID
  medicationName: String,
  genericName: String,
  form: String,
  dosage: String,
  frequency: String,
  refills: Int,
  prescribedFor: String,
  sideEffects: String,
  interactions: String,
  prescriptionDate: String,
  instructions: String,
}

type OverTheCounterMedication {
  _id: ID
  care_id: ID
  camperID: ID
  medicationName: String,
  activeIngredients: String,
  dosageAdult: String,
  dosageChild: String,
  instructions: String,
  sideEffects: String,
  warnings: String,
  createdBy: String,
}

type MedicalNote {
  _id: ID
  care_id: ID
  camperID: ID
  noteType: String,
  content: String,
  injury: String,
  createdBy: String,
  updatedBy: String,
}

type Provider {
  _id: ID
  care_id: ID
  role: String
  providerName: String
  providerEmail: String
  providerPhone: String
}

type MealReading {
  _id: ID
  care_id: ID
  camperID: ID
  date: String
  timeLabel: String
  unixTime: Int
  carbAmount: Int
  glucoseLevel: Int
  meal: String
  imageIdentifier: String
}

type LongActingInsulin {
  _id: ID
  care_id: ID
  dosage: String
  lastAdministered: String
  name: String
}

type RapidActingInsulin {
  _id: ID
  care_id: ID
  dosage: String
  lastAdministered: String
  name: String
}

type TargetBG {
  breakfast: Int
  lunch: Int
  dinner: Int
}

type InsulinCarbRatio {
  breakfast: String
  lunch: String
  dinner: String
}

type SpecialNeed {
  _id: ID
  specialNeedType: String
  notes: String
  specialNeedInstructions: String
}

type OriginsData {
  _id: ID!
  gender: String
  age: Int
  dateOfBirth: String
  mother: String
  father: String
  firstName: String
  lastName: String
}

type VolunteerAssignments {
  volunteer: [ID]
  volunteerEmails: [String]
  volunteerType: [String!]
}

type CamperAssignments {
  volunteer: ID
  camper: [String]
  camperEmail: [String]
}

type VolunteerAssignment2 {
  camper: Camper
  volunteer: Volunteer
  volunteerType: String
}

type RegisterUserResponse {
  success: Boolean!
  message: String!
}

union Person = Camper | Volunteer

####################

type CamperCamps {
  camperID: Int
  campID: Int
}

type RemoveAssignmentResponse {
  success: Boolean!
  message: String!
}

type VolunteerConnection {
  edges: [VolunteerEdge!]!
  pageInfo: PageInfo!
}

type VolunteerEdge {
  node: Volunteer!
  cursor: String!
}

type CamperConnection {
  edges: [CamperEdge!]!
  pageInfo: PageInfo!
}

type CamperEdge {
  node: Camper!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}


type Query {
  getAllVolunteers: [Volunteer]!
  getAllCampers: [Camper]!

  volunteerByEmail(email: String!): Volunteer
  camperByEmail(email: String!): Camper

  acceptedNotifications(confirm: Boolean): [Person]
  getAssignments(personID: ID!): [Person!]!

  paginatedVolunteers(page: Int, pageSize: Int): VolunteerConnection!
  paginatedCampers(page: Int, pageSize: Int): CamperConnection!
}

input UpdateAllCampersInput {
  _id: ID!
  isVolunteer: Boolean
  photo: String
  banner: String
  email: String
  firstName: String
  lastName: String
  phone: String
  notifications: Boolean
  notes: String
  careData: UpdateCareDataInput
  originsData: UpdateOriginsDataInput
  volunteerAssignments: [UpdateVolunteerAssignmentInput]
}

input UpdateAllCareDataInput {
  _id: ID
  careType: String
  correctionFactor: String
  mdi: Boolean
  cgm: String
  insulinPump: Boolean
  insulinPumpModel: String
  insulinType: String
  allergies: String
  emergencyContact: String
  targetBG: UpdateTargetBGInput
  insulinCarbRatio: UpdateInsulinCarbRatio
  specialNeed: UpdateSpecialNeed
  longActingInsulin: [LongActingInsulinInput]
  rapidActingInsulin: [RapidActingInsulinInput]
  mealReadings: [UpdateMealReadingInput]
  providers: [UpdateProviderInput]
  overTheCounterMedications: [UpdateOverTheCounterMedicationInput]
  prescriptions: [UpdatePrescriptionInput]
  medicalNotes: [UpdateMedicalNoteInput]
}

input UpdateAllVolunteersInput {
  _id: ID!
  isVolunteer: Boolean
  photo: String
  banner: String
  email: String
  firstName: String
  lastName: String
  phone: String
  notifications: Boolean
  notes: String
  dateOfBirth: String
  volunteerType: String
  volunteerAssignments: [UpdateCamperAssignmentInput]
}

input UpdateVolunteerAssignmentInput {
  email: String!
  type: String!
  saved: Boolean!
}

input UpdateCamperAssignmentInput {
  email: String!
  type: String!
  saved: Boolean!
}

input UpdateCamperInput {
  _id: ID!
  photo: String
  banner: String
  email: String
  notifications: Boolean
  phone: String
}

input UpdateVolunteerInput {
  _id: ID!
  photo: String
  banner: String
  email: String
  notifications: Boolean
  phone: String
}
########
input UpdateCareDataInput {
  _id: ID!
  careType: String
  correctionFactor: String
  mdi: Boolean
  cgm: String
  insulinPump: Boolean
  insulinPumpModel: String
  doctorName: String
  doctorEmail: String
  doctorPhone: String
  allergies: String
  emergencyContact: String
  targetBG: UpdateTargetBGInput
  insulinCarbRatio: UpdateInsulinCarbRatio
  insulinType: String
  longActingInsulin: [LongActingInsulinInput]
  rapidActingInsulin: [RapidActingInsulinInput]
}

input UpdateOriginsDataInput {
  _id: ID
  gender: String
  age: Int
  dateOfBirth: String
  mother: String
  father: String
  firstName: String
  lastName: String
}

input LongActingInsulinInput {
  _id: ID
  care_id: ID
  dosage: String
  lastAdministered: String
  name: String
}

input RapidActingInsulinInput {
  _id: ID
  care_id: ID
  dosage: String
  lastAdministered: String
  name: String
}

input UpdateInsulinCarbRatio {
  breakfast: String
  lunch: String
  dinner: String
}

input UpdateTargetBGInput {
  breakfast: Int
  lunch: Int
  dinner: Int
}

input UpdateSpecialNeed {
  _id: ID
  specialNeedType: String
  notes: String
  specialNeedInstructions: String
}

input UpdateMealReadingInput {
  _id: ID
  care_id: ID
  camperID: ID
  date: String
  timeLabel: String
  unixTime: Int
  carbAmount: Int
  glucoseLevel: Int
  meal: String
  imageIdentifier: String
}

input UpdateProviderInput {
  _id: ID
  care_id: ID
  role: String
  providerName: String
  providerEmail: String
  providerPhone: String
}

input UpdatePrescriptionInput {
  _id: ID
  care_id: ID
  camperID: ID
  medicationName: String,
  genericName: String,
  form: String,
  dosage: String,
  frequency: String,
  refills: Int,
  prescribedFor: String,
  sideEffects: String,
  interactions: String,
  prescriptionDate: String,
  instructions: String,
}

input UpdateOverTheCounterMedicationInput {
  _id: ID
  care_id: ID
  camperID: ID
  medicationName: String,
  activeIngredients: String,
  dosageAdult: String,
  dosageChild: String,
  instructions: String,
  sideEffects: String,
  warnings: String,
  createdBy: String,
}

input UpdateMedicalNoteInput {
  _id: ID
  care_id: ID
  camperID: ID
  noteType: String
  content: String
  injury: String
  createdBy: String
  updatedBy: String
}

type Mutation {
  updatePassword(email: String!, password: String): Person
  updatePerson(_id: ID, email: String, firstName: String, lastName: String, isVolunteer: Boolean, photo: String, banner: String, notifications: Boolean, phone: String): Person

  updateCamperCareData(camperInput: UpdateCamperInput!, careDataInput: UpdateCareDataInput!): Camper
  updateVolunteer(volunteerInput: UpdateVolunteerInput!): Volunteer

  addVolunteerAssignment(camperEmail: String!, volunteerEmail: String!, volunteerType: String!): VolunteerAssignment2
  removeAssignment(camperEmail: String!, volunteerEmail: String!): RemoveAssignmentResponse!

  deleteCamper(email: String!): Boolean
  deleteVolunteer(email: String!): Boolean

  updateAllCampers(campers: [UpdateAllCampersInput!]!): [Camper!]!
  updateAllVolunteers(volunteers: [UpdateAllVolunteersInput!]!): [Volunteer!]!

  registerUser(
    countryCode: String
    dateOfBirth: String!
    email: String!
    firstName: String!
    key: String!
    lastName: String!
    notifications: Boolean
    password: String!
    phone: String!
    profileImage: String
    role: String!
  ): RegisterUserResponse!
}
`;

module.exports = typeDefs;