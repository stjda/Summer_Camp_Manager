const db = require('../models/index') 
const seedData = require('./data'); // Adjust the path to your JSON file
const sequelize = require('../config/connection');

let t;
const seedDatabase = async () => {
  try {
      t = await sequelize.transaction();
      // Seed Volunteers
      for (const volunteerData of seedData.Volunteers) {
        await db.Volunteers.create(volunteerData, { transaction: t });
        console.log(`Volunteer ${volunteerData.Email} seeded successfully.`);
      }
      // Seed Campers and their related data
      for (const camperData of seedData.Campers) {
      // Create CareData
      const careData = await db.CareData.create({
        ID: camperData.CareData.ID,
        CareType: camperData.CareData.CareType,
        LastKnownBG: camperData.CareData.LastKnownBG,
        LastKnownBGTimestamp: camperData.CareData.LastKnownBGTimestamp,
        CorrectionFactor: camperData.CareData.CorrectionFactor,
        MDI: camperData.CareData.MDI,
        CGM: camperData.CareData.CGM,
        InsulinPump: camperData.CareData.InsulinPump,
        DoctorName: camperData.CareData.DoctorName,
        DoctorEmail: camperData.CareData.DoctorEmail,
        DoctorPhone: camperData.CareData.DoctorPhone,
        Allergies: camperData.CareData.Allergies,
        EmergencyContact: camperData.CareData.EmergencyContact,
      }, { transaction: t });

      console.log(`CareData for ${camperData.Email} created successfully.`);
      
      const OriginsData = await db.OriginsData.create({
        FirstName: camperData.OriginsData.FirstName,
        CamperID: camperData.OriginsData.CamperID,
        LastName: camperData.OriginsData.LastName,
        Gender: camperData.OriginsData.Gender,
        Age: camperData.OriginsData.Age,
        Mother: camperData.OriginsData.Mother,
        Father: camperData.OriginsData.Father
      }, { transaction: t });
      
      // Seed related data for CareData
      await db.BGTargets.create({ 
        ...camperData.CareData.BGTargets, 
        CareDataID: careData.ID 
      }, { transaction: t });

      await db.InsulinCarbRatios.create({ 
        ...camperData.CareData.InsulinCarbRatios, 
        CareDataID: careData.ID 
      }, { transaction: t });

      await db.CarbIntake.create({ 
        ...camperData.CareData.CarbIntake, 
        CareDataID: careData.ID 
      }, { transaction: t });

      await db.LongActingInsulin.create({ 
        ...camperData.CareData.LongActingInsulin, 
        CareDataID: careData.ID 
      }, { transaction: t });

      await db.RapidActingInsulin.create({ 
        ...camperData.CareData.RapidActingInsulin, 
        CareDataID: careData.ID 
      }, { transaction: t });

      await db.SpecialNeed.create({ 
        ...camperData.CareData.SpecialNeed, 
        CareDataID: careData.ID 
      }, { transaction: t });
      
      const camper = await db.Camper.create({
        Photo: camperData.Photo,
        Email: camperData.Email,
        Password: camperData.Password,
        Notes: camperData.Notes,
        CareDataID: careData.ID,
        OriginsID: OriginsData.ID,
      }, { transaction: t });
      
      // await db.CareData.update({
      //   CamperID: camper.ID,
      //   BGTargets: camperData.CareData.BGTargets, // Assuming BGTargets is nested within CareData in your seedData structure
      //   InsulinCarbRatios: camperData.CareData.InsulinCarbRatios,
      //   CarbIntake: camperData.CareData.CarbIntake,
      //   LongActingInsulin: camperData.CareData.LongActingInsulin,
      //   RapidActingInsulin: camperData.CareData.RapidActingInsulin,
      //   SpecialNeed: camperData.CareData.SpecialNeed,
      // },{
      //   where: { ID: careData.ID }, // Specify which CareData record to update
      //   transaction: t
      // });


      console.log(`Camper ${camperData.Email} and related data seeded successfully.`);
    }
    // Commit the transaction
    await t.commit();
    console.log('Database seeded successfully');
  } catch (error) {
    // Rollback the transaction
    // await t.rollback();
    console.error('Failed to seed database:', error);
  }
};

seedDatabase();