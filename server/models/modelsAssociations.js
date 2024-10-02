
var BGTargets = require('./BGTargets');
var Camper = require('./Camper');
var CamperAssignedVolunteers = require('./CamperAssignedVolunteers');
var CamperCamps = require('./CamperCamps');
var Camps = require('./Camps');
var MealReadings = require('./MealReadings');
var Prescriptions = require('./Prescriptions')
var MedicalNotes = require('./MedicalNotes');
var Providers = require('./Providers');
var OverTheCounterMedication = require('./OverTheCounterMedication');
var CareData = require('./CareData');
var InsulinCarbRatios = require('./InsulinCarbRatios');
var LongActingInsulin = require('./LongActingInsulin');
var OriginsData = require('./OriginsData');
var RapidActingInsulin = require('./RapidActingInsulin');
var SpecialNeed = require('./SpecialNeed');
var Volunteers = require('./Volunteers');

CamperAssignedVolunteers.belongsTo(Camper, { as: "Camper", foreignKey: "CamperID"});
Camper.hasMany(CamperAssignedVolunteers, { as: "CamperAssignedVolunteers", foreignKey: "CamperID"});
CamperCamps.belongsTo(Camper, { as: "Camper", foreignKey: "CamperID"});
Camper.hasMany(CamperCamps, { as: "CamperCamps", foreignKey: "CamperID"});
CareData.belongsTo(Camper, { as: "camper", foreignKey: "CamperID"});
Camper.hasOne(CareData, { as: "careData", foreignKey: "CamperID"});
OriginsData.belongsTo(Camper, { as: "Camper_Camper", foreignKey: "CamperID"});
Camper.hasOne(OriginsData, { as: "originsData", foreignKey: "CamperID"});
CamperCamps.belongsTo(Camps, { as: "Camp", foreignKey: "CampID"});
Camps.hasMany(CamperCamps, { as: "CamperCamps", foreignKey: "CampID"});
BGTargets.belongsTo(CareData, { as: "CareDatum", foreignKey: "CareDataID"});
CareData.hasOne(BGTargets, { as: "BGTarget", foreignKey: "CareDataID"});
Camper.belongsTo(CareData, { as: "CareDatum", foreignKey: "CareDataID"});
CareData.hasOne(Camper, { as: "Camper", foreignKey: "CareDataID"});

// Define the one-to-many relationship
MealReadings.belongsTo(CareData, { as: "CareDatum", foreignKey: "CareDataID"});
CareData.hasMany(MealReadings, { as: "MealReadings", foreignKey: "CareDataID"});

InsulinCarbRatios.belongsTo(CareData, { as: "CareDatum", foreignKey: "CareDataID"});
CareData.hasOne(InsulinCarbRatios, { as: "InsulinCarbRatio", foreignKey: "CareDataID"});

LongActingInsulin.belongsTo(CareData, { as: "CareDatum", foreignKey: "CareDataID"});
CareData.hasMany(LongActingInsulin, { as: "LongActingInsulin", foreignKey: "CareDataID"});

RapidActingInsulin.belongsTo(CareData, { as: "CareDatum", foreignKey: "CareDataID"});
CareData.hasMany(RapidActingInsulin, { as: "RapidActingInsulin", foreignKey: "CareDataID"});

Prescriptions.belongsTo(CareData, { as: 'CareDatum', foreignKey: 'CareDataID' });
CareData.hasMany(Prescriptions, { as: 'Prescriptions', foreignKey: 'CareDataID' });

OverTheCounterMedication.belongsTo(CareData, { as: 'CareDatum', foreignKey: 'CareDataID' });
CareData.hasMany(OverTheCounterMedication, { as: 'OverTheCounterMedication', foreignKey: 'CareDataID' });

Providers.belongsTo(CareData, { as: 'CareDatum', foreignKey: 'CareDataID' });
CareData.hasMany(Providers, { as: 'Providers', foreignKey: 'CareDataID' });

MedicalNotes.belongsTo(CareData, { as: 'CareDatum', foreignKey: 'CareDataID' });
CareData.hasMany(MedicalNotes, { as: 'MedicalNotes', foreignKey: 'CareDataID' });

SpecialNeed.belongsTo(CareData, { as: "CareDatum", foreignKey: "CareDataID"});
CareData.hasOne(SpecialNeed, { as: "SpecialNeed", foreignKey: "CareDataID"});
Camper.belongsTo(OriginsData, { as: "Origin", foreignKey: "OriginsID"});
OriginsData.hasOne(Camper, { as: "camper", foreignKey: "OriginsID"});
CamperAssignedVolunteers.belongsTo(Volunteers, { as: "Volunteer", foreignKey: "VolunteerID"});
Volunteers.hasMany(CamperAssignedVolunteers, { as: "CamperAssignedVolunteers", foreignKey: "VolunteerID"});

module.exports = {    
BGTargets,
Camper,
CamperAssignedVolunteers,
CamperCamps,
Camps,
MealReadings,
CareData,
InsulinCarbRatios,
LongActingInsulin,
OriginsData,
RapidActingInsulin,
SpecialNeed,
Volunteers,
Prescriptions,
OverTheCounterMedication,
Providers,
MedicalNotes
};

