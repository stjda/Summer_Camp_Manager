import { types, getSnapshot, applySnapshot, destroy } from "mobx-state-tree";
import { toJS } from 'mobx';

function createLocalDate(timeOrTimestamp) {
  let date;
  
  if (typeof timeOrTimestamp === 'number' || !isNaN(parseInt(timeOrTimestamp, 10))) {
    // It's a timestamp
    const timestamp = parseInt(timeOrTimestamp, 10);
    date = new Date(timestamp);
  } else {
    // It's a date string
    date = new Date(timeOrTimestamp);
  }

  // Adjust for the local timezone offset
  const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  date = new Date(date.getTime() + offset);

  // Format the date to YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const TargetBGModel = types.optional(types.model({
  breakfast: types.optional(types.integer, -1),
  lunch: types.optional(types.integer, -1),
  dinner: types.optional(types.integer, -1)
}), {})

const InsulinCarbRatioModel = types.optional(types.model({
  breakfast: types.maybeNull(types.string, 'String'),
  lunch: types.maybeNull(types.string, 'String'),
  dinner: types.maybeNull(types.string, 'String')
}), {})

const VolunteerAssignment = types.optional(types.model({
  name: types.optional(types.string, ''),
  type: types.optional(types.string, ''),
}), {})

const SpecialNeedsModel = types.optional(types.model({
  type: types.optional(types.string, 'String'),
  instructions: types.optional(types.string, 'String'),
  notes: types.optional(types.string, 'String')
  }), {})


const RapidActingInsulinModel = types.model('RapidActingInsulin', {
  _id: types.identifier,
  dosage: types.maybeNull(types.string),
  lastAdministered: types.maybeNull(types.string),
  name: types.optional(types.string, ''),
  care_id: types.maybeNull(types.string)
});

const BloodGlucoseRecord = types.optional(types.model({
  dateTaken: types.optional(types.string, 'String'),
  timeLabel: types.optional(types.string, 'String'),
  unixTime: types.optional(types.integer, 0),
  carbAmount: types.optional(types.integer, 0),
  glucoseLevel: types.optional(types.integer, 0),
  meal: types.optional(types.string, 'String'),
  imageIdentifier: types.optional(types.string, 'String'),
  camperID: types.maybeNull(types.string), 
  care_id: types.maybeNull(types.string)
}), {})

const LongActingInsulinModel = types.model('LongActingInsulin', {
  _id: types.identifier,
  dosage: types.maybeNull(types.string),
  lastAdministered: types.maybeNull(types.string),
  name: types.optional(types.string, ''),
  care_id: types.maybeNull(types.string), 
});

/// havent set these yet
const ProvidersModel = types.optional(types.model({
  role: types.optional(types.string, ''),
  providerName: types.optional(types.string, ''),
  providerEmail: types.optional(types.string, ''),
  providerPhone: types.optional(types.string, ''),
}), {})

const PrescriptionsModel = types.optional(types.model({
  medicationName: types.optional(types.string, ''),
  genericName: types.optional(types.string, ''),
  form: types.optional(types.string, ''),
  dosage: types.optional(types.string, ''),
  frequency: types.optional(types.string, ''),
  refills: types.optional(types.string, ''),
  prescribedFor: types.optional(types.string, ''),
  sideEffects: types.optional(types.string, ''),
  interactions: types.optional(types.string, ''),
  instructions: types.optional(types.string, ''),
  perscriptionDate: types.optional(types.string, ''),
  camperID: types.maybeNull(types.string),
  care_id: types.maybeNull(types.string)
}), {})

// medicationName, activeIngredients, dosageAdult, dosageChild, instructions, sideEffects, warnings, createdBy
const OverTheCounterMedsModel = types.optional(types.model({
  medicationName: types.optional(types.string, ''),
  activeIngredients: types.optional(types.string, ''),
  dosageAdult: types.optional(types.string, ''),
  dosageChild: types.optional(types.string, ''),
  instructions: types.optional(types.string, ''),
  sideEffects: types.optional(types.string, ''),
  warnings: types.optional(types.string, ''),
  createdBy: types.optional(types.string, ''),
  camperID: types.maybeNull(types.string),
  care_id: types.maybeNull(types.string)
}), {})

//  noteType, Content, injury, createdBy, updatedBy
const MedicalNotesModel = types.optional(types.model({
  noteType: types.optional(types.string, ''),
  content: types.optional(types.string, ''),
  injury: types.optional(types.string, ''),
  createdBy: types.optional(types.string, ''),
  updatedBy: types.optional(types.string, ''),
  camperID: types.maybeNull(types.string),
  care_id: types.maybeNull(types.string),
}), {})


export const UserProfileModel = types
  .model("profileDataModel", {
    // About card data
      id: types.optional(types.string, ""),
      isLoggedIn: types.optional(types.boolean, false),
      sessionExpiry: types.optional(types.integer, 0),
      name: types.optional(types.string, ""),
      avatar: types.optional(types.string, ""),
      coverPhoto: types.optional(types.string, ""),
      isAdmin: types.optional(types.boolean, false),
      isCamper: types.optional(types.boolean, false),
      isVolunteer: types.optional(types.boolean, false),
      selectedSection: types.optional(types.string, "Profile"),
      volunteerAssignments: types.optional(types.array(VolunteerAssignment), []),
      
    aboutUser: types.optional(types.model({
      email: types.optional(types.string,""),
      phoneNumber: types.optional(types.string,""),
      primaryCarePhysician: types.optional(types.string, ""),
      emergencyContact: types.optional(types.string, ""),
      notifications: types.optional(types.boolean, false),
      volunteerType: types.optional(types.string, ""),
    }), {}),
      // fields for each camp
    camps: types.optional(types.model({
      current: types.optional(types.array(types.string), []),
      past: types.optional(types.array(types.string), [])
    }),{}),
      // fields for CareProfile section
    careProfile: types.optional(types.model({
      // using the target bg model
      targetBG: types.optional(TargetBGModel, {}),
      insulinCarbRatio: types.optional(InsulinCarbRatioModel, {}),
      rapidActingInsulin: types.optional(types.array(RapidActingInsulinModel), []),
      longActingInsulin: types.optional(types.array(LongActingInsulinModel), []),
      mealHistory: types.optional(types.array(BloodGlucoseRecord), []),
      specialNeeds: types.optional(types.array(SpecialNeedsModel), []),
      careType: types.optional(types.string, ""),
      correctionFactor: types.optional(types.string, ""),
      mdi: types.optional(types.boolean, false),
      cgm: types.optional(types.string, ""),
      insulinPump: types.optional(types.boolean, false),
      insulinPumpModel: types.optional(types.string, ""),
      insulinType: types.optional(types.string, ""), 
      allergies: types.optional(types.array(types.string), []),
      notes: types.optional(types.array(types.string), []),

      providers: types.optional(types.array(ProvidersModel), []),
      prescriptions: types.optional(types.array(PrescriptionsModel), []),
      overTheCounterMeds: types.optional(types.array(OverTheCounterMedsModel), []),
      medicalNotes: types.optional(types.array(MedicalNotesModel), []),
    }), {}),
    // volunteer assignments here
      //fields for origins section
    origins: types.optional(types.model({
      age: types.optional(types.integer, -1),
      dob: types.optional(types.string, ""),
      mother: types.optional(types.string, ""),
      father: types.optional(types.string, ""),
      gender: types.optional(types.string, ""),
    }), {}),
    // data for rapid acting insulin
    forms: types.optional(types.model({
      staff: types.array(types.string),
      camper: types.array(types.string),
      participation: types.array(types.string)
    }), { staff: [], camper: [], participation: [] })
  })
  .actions((self) => ({
    setId(id) {
      if (!id) return
      self.id = id;
  },
  getId(){
      return self.id;
  },

  setName(name) {
      if (!name) name='Missing'
      self.name = name;
  },
  getName() {
      return self.name;
  },
  
  getEmail() {
      return self.aboutUser.email;
  },
  setEmail(email) {
      if (!email) return
      self.aboutUser.email = email;
  },

  getSessionsExpiry() {
      return self.sessionExpiry;
  },
  setSessionsExpiry(sessionExpiry) {
      if (!sessionExpiry) return
      self.sessionExpiry = sessionExpiry;
  },

  setAvatar(avatar) {
      if (!avatar) return
      self.avatar = avatar;
  },
  getAvatar() {
      return self.avatar;
  },

  setCoverPhoto(coverPhoto) {
      if (!coverPhoto) return
      self.coverPhoto = coverPhoto || "";
  },
  getCoverPhoto() {
      return self.coverPhoto;
  },
  
  setPhone(phoneNumber){
      if(!phoneNumber) return
      self.aboutUser.phoneNumber = phoneNumber;
  },
  getPhone(){
    return self.aboutUser.phoneNumber;
  },

  getNotifications(){
    return self.aboutUser.notifications;
  },
  setNotifications(notifications){
    if (notifications === null || notifications === undefined) {
      self.aboutUser.notifications = false;  // or true, depending on your default preference
    } else {
      self.aboutUser.notifications = Boolean(notifications);
    }
  },

  setIsAdmin(isAdmin) {
    if (isAdmin === null || isAdmin === undefined) {
      self.isAdmin = false;  // or true, depending on your default preference
    } else {
      self.isAdmin = Boolean(isAdmin);
    }
  },
  getIsAdmin() {
      return self.isAdmin;
  },

  getIsCamper(){
      return self.isCamper;
  },
  setIsCamper(isCamper){
    if (isCamper === null || isCamper === undefined) {
      self.isCamper = false;  // or true, depending on your default preference
    } else {
      self.isCamper = Boolean(isCamper);
    }
  },

  setNotes(note){
    if(!note) return
    self.careProfile.notes.push(note);;
  },
  getNotes() {
    return self.careProfile?.notes || [];
  },

  getisVolunteer() {
      return self.isVolunteer;
  },
  setIsVolunteer(isVolunteer) {
    if (isVolunteer === null || isVolunteer === undefined) {
      self.isVolunteer = false;  // or true, depending on your default preference
    } else {
      self.isVolunteer = Boolean(isVolunteer);
    }
  },

  setSelectedSection(section) {
      if (!section) return
      self.selectedSection = section;
  },
 /////////////////////////////////////////////////////////
  // Method to add a volunteer assignment
  addVolunteerAssignment(name, type) {
    if(type == "" || type == null){
      type = "N/A"
    }
    if (!name) return;  // Check for valid inputs
    let a = VolunteerAssignment.create({ name, type })
    self.volunteerAssignments.push(a);
  },
  
  // Method to remove a volunteer assignment
  removeVolunteerAssignment(name, type) {
    const index = self.volunteerAssignments.findIndex(assignment =>
      assignment.name === name && assignment.type === type
    );
    if (index !== -1) {
      destroy(self.volunteerAssignments[index]);  // Proper way to remove items in MST
    }
  },
/////////////////////////////////////////////////////////
  setIsLoggedIn(value){
    if (value === null || value === undefined) {
      self.isLoggedIn = false;  // or true, depending on your default preference
    } else {
      self.isLoggedIn = Boolean(value);
    }
  },

  getIsLoggedIn(){
      return self.isLoggedIn;
  },

  getAge(){
      return self.origins.age;
  },
  setAge(age){
    if(!age){
      return
    }
      self.origins.age = age;
  },

  setDob(dob){
      if(!dob){
        return
      }
      self.origins.dob = dob;
  },
  getDob(){
      return self.origins.dob;
  },
  
  getFather(){
      return self.origins.father;
  },
  setFather(father){
    if(!father){
      return
    }
      self.origins.father = father;
  },

  getMother(){
      return self.origins.mother;
  },
  setMother(mother){
    if(!mother){
      return
    }
      self.origins.mother = mother;
  },

  setGender(gender){
    if(!gender){
      return
    }
      self.origins.gender = gender;
  },
  getGender(){
      return self.origins.gender;
  },

  getAllergies(){
    const plainArray = toJS(self.careProfile.allergies)
      return plainArray;
  },
  setAllergies(data) {
    if (!data) {
      return;
    }
    
    // Add the new data to the array
    self.careProfile.allergies.push(data);
    
    // Remove duplicates and update the state
    self.careProfile.allergies = Array.from(new Set(self.careProfile.allergies.map(allergy => allergy.toLowerCase())))
      .map(allergy => allergy.charAt(0).toUpperCase() + allergy.slice(1));
  },

  getCareType(){
      return self.careProfile.careType;
  },
  setCareType(careType){
    if(!careType){
      return
    }
      self.careProfile.careType = careType;
  },

  getCorrectionFactor(){
      return self.careProfile.correctionFactor;
  },
  setCorrectionFactor(correctionFactor){
    if(!correctionFactor){
      return
    }
      self.careProfile.correctionFactor = correctionFactor;
  },

  getMdi(){
      return self.careProfile.mdi;
  },
  setMdi(mdi){
    if (mdi === null || mdi === undefined) {
      self.careProfile.mdi = false;  // or true, depending on your default preference
    } else {
      self.careProfile.mdi = Boolean(mdi);
    }
  },

  getCgm(){
      return self.careProfile.cgm;
  },
  setCgm(cgm){
    if(!cgm){
      return
    }
      self.careProfile.cgm = cgm;
  },

  getInsulinPump(){
      return self.careProfile.insulinPump;
  },
  setInsulinPump(insulinPump){
    if (insulinPump === null || insulinPump === undefined) {
      self.careProfile.insulinPump = false;  // or whatever default you prefer
    } else {
      self.careProfile.insulinPump = Boolean(insulinPump);
    }
  },
  setEmergencyContact(emergencyContact){
    if(!emergencyContact){
      return
    }
      self.aboutUser.emergencyContact = emergencyContact;
  },
  getEmergencyContact(){
      return self.aboutUser.emergencyContact;
  },

  getInsulinPumpModel(){
      return self.careProfile.insulinPumpModel;
  },
  setInsulinPumpModel(insulinPumpModel){
    if(!insulinPumpModel){
      return
    }
      self.careProfile.insulinPumpModel = insulinPumpModel;
  },
  getInsulinType(){
      return self.careProfile.insulinType;
  },
  setInsulinType(insulinType){
    if(!insulinType){
      return
    }
      self.careProfile.insulinType = insulinType;
  },

  setVolunteerType(type){
      if(!type){
        return
      }
      self.aboutUser.volunteerType = type;
  },
  
  getVolunteerType(){
    return self.aboutUser.volunteerType;
  },
  //////////////////////////////////////////////
  getTargetBGBreakfast(){
    return self.careProfile.targetBG.breakfast;
  },
  getTargetBGLunch(){
    return self.careProfile.targetBG.lunch;
  },
  getTargetBGDinner(){
    return self.careProfile.targetBG.dinner;
  },

  setTargetBGBreakfast(value) {
    self.careProfile.targetBG.breakfast = value;
  },
  setTargetBGLunch(value) {
    self.careProfile.targetBG.lunch = value;
  },
  setTargetBGDinner(value) {
    self.careProfile.targetBG.dinner = value;
  },
  //////////////////////////////////////////////
  setInsulinToCarbRatioBreakfast(value) {
    self.careProfile.insulinCarbRatio.breakfast = value;
  },
  setInsulinToCarbRatioLunch(value) {
    self.careProfile.insulinCarbRatio.lunch = value;
  },
  setInsulinToCarbRatioDinner(value) {
    self.careProfile.insulinCarbRatio.dinner = value;
  },
  
  getInsulinToCarbRatioBreakfast(){
    return self.careProfile.insulinCarbRatio.breakfast;
  },
  getInsulinToCarbRatioLunch(){
    return self.careProfile.insulinCarbRatio.lunch;
  },
  getInsulinToCarbRatioDinner(){
    return self.careProfile.insulinCarbRatio.dinner;
  },
  //////////////////Rapid acting////////////////////////////
  setRapidActingInsulin(insulinData) {
    if (!Array.isArray(self.careProfile.rapidActingInsulin)) {
      self.careProfile.rapidActingInsulin = [];
    }
  
    const existingIndex = insulinData._id ? self.careProfile.rapidActingInsulin.findIndex(insulin => insulin._id === insulinData._id) : -1;
    
    if (existingIndex !== -1) {
      self.careProfile.rapidActingInsulin[existingIndex] = {
        ...self.careProfile.rapidActingInsulin[existingIndex],
        ...insulinData
      };
    } else {
      const newInsulin = RapidActingInsulinModel.create({
        _id: insulinData._id || '',
        dosage: insulinData.dosage || '',
        lastAdministered: insulinData.lastAdministered || '',
        name: insulinData.name || '',
        care_id: insulinData.care_id || ''
      });
      self.careProfile.rapidActingInsulin.push(newInsulin);
    }
  },

  updateRapidActingInsulin(id, updates) {
    const index = self.rapidActingInsulin.findIndex(insulin => insulin._id === id);
    if (index !== -1) {
      self.rapidActingInsulin[index] = {
        ...self.rapidActingInsulin[index],
        ...updates,
        lastAdministered: updates.lastAdministered ? createLocalDate(updates.lastAdministered) : self.rapidActingInsulin[index].lastAdministered
      };
    } else {
      console.warn(`Rapid acting insulin with id ${id} not found`);
    }
  },

  getRapidActingInsulin(id) {
    return self.rapidActingInsulin.find(insulin => insulin._id === id);
  },

  getAllRapidActingInsulin() {
    return self.rapidActingInsulin.slice();
  },

  getRapidActingInsulinDosage(id) {
    const insulin = self.getRapidActingInsulin(id);
    return insulin ? insulin.dosage : '';
  },

  getRapidActingInsulinLastAdministered(id) {
    const insulin = self.getRapidActingInsulin(id);
    return insulin ? insulin.lastAdministered : '';
  },
  ////////////////Long Acting//////////////////////////////
  setLongActingInsulin(insulinData) {
    if (!Array.isArray(self.careProfile.longActingInsulin)) {
      self.careProfile.longActingInsulin = [];
    }
  
    const existingIndex = insulinData._id ? self.careProfile.longActingInsulin.findIndex(insulin => insulin._id === insulinData._id) : -1;
    
    if (existingIndex !== -1) {
      self.careProfile.longActingInsulin[existingIndex] = {
        ...self.careProfile.longActingInsulin[existingIndex],
        ...insulinData
      };
    } else {
      const newInsulin = LongActingInsulinModel.create({
        _id: insulinData._id || '',
        dosage: insulinData.dosage || '',
        lastAdministered: insulinData.lastAdministered || '',
        name: insulinData.name || '',
        care_id: insulinData.care_id || ''
      });
      self.careProfile.longActingInsulin.push(newInsulin);
    }
  },

  updateLongActingInsulin(id, updates) {
    const index = self.longActingInsulin.findIndex(insulin => insulin._id === id);
    if (index !== -1) {
      self.longActingInsulin[index] = {
        ...self.longActingInsulin[index],
        ...updates,
        lastAdministered: updates.lastAdministered ? createLocalDate(updates.lastAdministered) : self.longActingInsulin[index].lastAdministered
      };
    } else {
      console.warn(`Long acting insulin with id ${id} not found`);
    }
  },
  getLongActingInsulin(id) {
    return self.longActingInsulin.find(insulin => insulin._id === id);
  },

  getAllLongActingInsulin() {
    return self.longActingInsulin.slice();
  },

  //////////////////////////////////////////////
  setBloodGlucoseRecord(
    timeLabel = null, 
    unixTime = null, 
    carbAmount = null, 
    glucoseLevel = null, 
    meal = null, 
    imageIdentifier = null,
    camperID, 
    care_id
  ) {
    const newTime = createLocalDate(unixTime ?? Date.now());
    const dateTaken = newTime;
    const newRecord = BloodGlucoseRecord.create({
      dateTaken,
      timeLabel: timeLabel ?? '',
      unixTime: unixTime ?? Date.now(),
      carbAmount: carbAmount ?? 0,
      glucoseLevel: glucoseLevel ?? 0,
      meal: meal ?? '',
      imageIdentifier: imageIdentifier ?? '',
      camperID, 
      care_id,
    });
    self.careProfile.mealHistory.push(newRecord);
  },
  //////////////////////////////////////////////
setProvider(role = null, providerName = null, providerEmail = null, providerPhone = null) {
  const newProvider = ProvidersModel.create({
    role: role ?? '',
    providerName: providerName ?? '',
    providerEmail: providerEmail ?? '',
    providerPhone: providerPhone ?? ''
  });
  self.careProfile.providers.push(newProvider);
},
  //////////////////////////////////////////////
  setMedicalNote(camperID, care_id, noteType = null, content = null, injury = null, createdBy = null, updatedBy = null) {
    const newNote = MedicalNotesModel.create({
      noteType: noteType ?? '',
      content: content ?? '',
      injury: injury ?? '',
      createdBy: createdBy ?? '',
      updatedBy: updatedBy ?? '',
      camperID,
      care_id
    });
    self.careProfile.medicalNotes.push(newNote);
  },
  /////////////////////////////////////////////
  setPrescription(
    medicationName = null, genericName = null, form = null, dosage = null, 
    frequency = null, refills = null, prescribedFor = null, sideEffects = null, 
    interactions = null, prescriptionDate = null, instructions = null, camperID, 
    care_id
  ) {
    const newPrescription = PrescriptionsModel.create({
      medicationName: medicationName ?? '',
      genericName: genericName ?? '',
      form: form ?? '',
      dosage: dosage ?? '',
      frequency: frequency ?? '',
      refills: refills ?? '',
      prescribedFor: prescribedFor ?? '',
      sideEffects: sideEffects ?? '',
      interactions: interactions ?? '',
      prescriptionDate: prescriptionDate ?? '',
      instructions: instructions ?? '',
      camperID,
      care_id
    });
    self.careProfile.prescriptions.push(newPrescription);
  },
  //////////////////////////////////////////////
  setOverTheCounterMedication(
    medicationName = null, activeIngredients = null, dosageAdult = null, 
    dosageChild = null, instructions = null, sideEffects = null, 
    warnings = null, createdBy = null, camperID, 
    care_id
  ) {
    const newMedication = OverTheCounterMedsModel.create({
      medicationName: medicationName ?? '',
      activeIngredients: activeIngredients ?? '',
      dosageAdult: dosageAdult ?? '',
      dosageChild: dosageChild ?? '',
      instructions: instructions ?? '',
      sideEffects: sideEffects ?? '',
      warnings: warnings ?? '',
      createdBy: createdBy ?? '',
      camperID,
      care_id
    });
    self.careProfile.overTheCounterMeds.push(newMedication);
  },
  //////////////////////////////////////////////
  setSpecialNeeds(type = null, instructions = null, note = null) {
    const newRecord = SpecialNeedsModel.create({
      type: type ?? '',
      instructions: instructions ?? '',
      notes: note ?? ''
    });
    self.careProfile.specialNeeds.push(newRecord);
  },
  getSpecialNeeds(){
    return self.careProfile.specialNeeds;
  },
  //////////////////////////////////////////////
  addCurrentCamp(camp) {
    if (!self.camps.current.includes(camp)) {
      self.camps.current.push(camp);
    }
  },
  addPastCamp(camp) {
    if (!self.camps.past.includes(camp)) {
      self.camps.past.push(camp);
    }
  },

  getcurrentCamp() {
    return self.camps.current[0] || "";
  },
  getpastCamp() {
    return self.camps.past[0] || "";
  },
  //////////////////////////////////////////////
  serializeState() {
      return JSON.stringify(toJS(this));
  },
  saveToLocalStorage() {
    const snapshot = getSnapshot(self);
    console.log('Saving snapshot:', snapshot);
    localStorage.setItem('STJDA_StoreSnapshot', JSON.stringify(snapshot));
  },
  loadFromLocalStorage() {
    const snapshot = localStorage.getItem('STJDA_StoreSnapshot');
    if (snapshot) {
      console.log('Loading snapshot:', JSON.parse(snapshot));
      applySnapshot(self, JSON.parse(snapshot));
    } else {
      console.log('No snapshot found in local storage');
    }
  },

  debugState() {
    console.log('UserProfileStore state:', toJS(self));
  },

  clearAllData() {
    // Reset all fields to their default values
    self.id = "";
    self.isLoggedIn = false;
    self.sessionExpiry = 0;
    self.name = "";
    self.avatar = "";
    self.coverPhoto = "";
    self.isAdmin = false;
    self.isCamper = false;
    self.isVolunteer = false;
    self.selectedSection = "Profile";

    self.aboutUser = {
      email: "",
      phoneNumber: "",
      primaryCarePhysician: "",
      emergencyContact: "",
      notifications: false,
      volunteerType: "",
    };

    self.camps = {
      current: [],
      past: []
    };

    self.careProfile = {
      careType: "",
      correctionFactor: "",
      mdi: false,
      cgm: "",
      insulinPump: false,
      insulinPumpModel: "",
      insulinType: "",
      allergies: [],
      notes: [],
      targetBG: {
        breakfast: -1,
        lunch: -1,      
        dinner: -1, 
      },
      insulinCarbRatio: {
        breakfast: '',
        lunch: '',
        dinner: ''
      },
      mealHistory: [],  // Changed from an object to an empty array
    };
    
    self.volunteerAssignments.clear();

    self.origins = {
      age: -1,
      dob: "",
      mother: "",
      father: "",
      gender: "",
    };
    // these should be arrays
    self.careProfile.rapidActingInsulin.clear();

    self.careProfile.longActingInsulin.clear();

    self.forms = {
      staff: [],
      camper: [],
      participation: [],
    };
  },
  }));

