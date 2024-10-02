const { 
  Camper, 
  CareData, 
  OriginsData, 
  Volunteers,
  BGTargets,
  InsulinCarbRatios,
  RapidActingInsulin,
  LongActingInsulin,
  SpecialNeed,
  MealReadings,
  Providers,
  OverTheCounterMedication,
  Prescriptions,
  MedicalNotes,
  Camps,
  CamperAssignedVolunteers,
  CamperCamps } = require('../models');
const { Sequelize, Op, where } = require('sequelize');

const resolvers = {
  Person: {
    __resolveType(obj, context, info) {
      if (obj.personType === 1) {
        return 'Camper';
      }
      if (obj.personType === 0) {
        return 'Volunteer';
      }
      return null;
    },
  },
  Query: {
    camperByEmail: async (_, { email }, context) => {
      
      try {
        const camper = await Camper.findOne({
          where: { Email: email }
        });
    
        if (!camper) {
          throw new Error(`No camper found with email: ${email}`);
        }
    
        const careData = await CareData.findOne({
          where: { CamperID: camper.ID }
        });
    
        const originsData = await OriginsData.findOne({
          where: { CamperID: camper.ID }
        });
    
        const bgTargets = careData ? await BGTargets.findOne({
          where: { CareDataID: careData.ID }
        }) : null;
    
        
        const insulinCarbRatios = careData ? await InsulinCarbRatios.findOne({
          where: { CareDataID: careData.ID }
        }) : null;
        
        const spNeed = careData ? await SpecialNeed.findOne({
          where: { CareDataID: careData.ID }
        }) : null;
        
        const camperCamps = camper ? await CamperCamps.findOne({
          where: { CamperID: camper.ID }
        }) : null;
        
        const assignedVolunteers = await CamperAssignedVolunteers.findOne({
          where: { CamperID: camper.ID }
        });
        
        const mealReadingsHistory = careData ? await MealReadings.findAll({
          where: { CareDataID: careData.ID }
        }) : null;

        const rapidActing = careData ? await RapidActingInsulin.findAll({
          where: { CareDataID: careData.ID }
        }) : null;
    
        const longActing = careData ? await LongActingInsulin.findAll({
          where: { CareDataID: careData.ID }
        }) : null;

        const medicalProviders = await Providers.findAll({
          where: { CareDataID: careData.ID  }
        })

        const prescriptionMeds = await Prescriptions.findAll({
          where: { CareDataID: careData.ID }
        })

        const overTheCounter = await OverTheCounterMedication.findAll({
          where: { CareDataID: careData.ID }
        })

        const notes = await MedicalNotes.findAll({
          where: { CareDataID: careData.ID }
        })

        // assignedVolunteers is a comma separated list, so we parse it
        let volunteerAssignments = null;
        if (assignedVolunteers) {
        
          const volunteerIds = Array.isArray(assignedVolunteers.VolunteerID) 
            ? assignedVolunteers.VolunteerID 
            : (typeof assignedVolunteers.VolunteerID === 'string' 
              ? assignedVolunteers.VolunteerID.split(',') 
              : []);
        
          const volunteerTypes = Array.isArray(assignedVolunteers.VolunteerType) 
            ? assignedVolunteers.VolunteerType 
            : (typeof assignedVolunteers.VolunteerType === 'string' 
              ? assignedVolunteers.VolunteerType.split(',') 
              : []);
        
          // Fetch volunteer names for each ID
          const volunteerNames = await Promise.all(volunteerIds.map(async (id) => {
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) {
              console.log(`Invalid volunteer ID: ${id}`);
              return null;
            }
            const volunteer = await Volunteers.findOne({
              attributes: ['FirstName', 'LastName'],
              where: { ID: numericId }
            });
            return volunteer ? `${volunteer.FirstName} ${volunteer.LastName}` : null;
          }));
        
          // Filter out any null values in case a volunteer wasn't found
          const validVolunteerNames = volunteerNames.filter(name => name !== null);
        
          volunteerAssignments = {
            volunteer: validVolunteerNames,
            volunteerType: volunteerTypes
          };
        }

        return {
          _id: camper.ID,
          photo: camper.Photo,
          isVolunteer: false,
          banner: camper.Banner,
          email: camper.Email,
          notifications: camper.Notifications,
          notes: camper.Notes,
          phone: camper.Phone,
          firstName: originsData ? originsData.FirstName : null,
          lastName: originsData ? originsData.LastName : null,
          volunteerAssignments: volunteerAssignments ? volunteerAssignments : { volunteer: [], volunteerType: [] },
          careData: careData ? {
            _id: careData.ID,
            careType: careData.CareType,
            targetBG: careData.TargetBG,
            correctionFactor: careData.CorrectionFactor,
            mdi: careData.MDI,
            cgm: careData.CGM,
            insulinPump: careData.InsulinPump,
            insulinPumpModel: careData.InsulinPumpModel,
            insulinType: careData.InsulinType,
            allergies: careData.Allergies,
            emergencyContact: careData.EmergencyContact,
            targetBG: bgTargets ? {
              breakfast: bgTargets.BGTargetBreakfast,
              lunch: bgTargets.BGTargetLunch,
              dinner: bgTargets.BGTargetDinner
            } : null,
            insulinCarbRatio: insulinCarbRatios ? {
              breakfast: insulinCarbRatios.RatioBreakfast,
              lunch: insulinCarbRatios.RatioLunch,
              dinner: insulinCarbRatios.RatioDinner,
            } : null,
            specialNeed: spNeed ? {
              _id: spNeed.ID,
              specialNeedType: spNeed.SpecialNeedType,
              notes: spNeed.Notes,
              specialNeedInstructions: spNeed.SpecialNeedInstructions,
            } : null,
            prescriptions: prescriptionMeds ? prescriptionMeds.map(med => ({
              _id: med.ID || null,
              care_id: med.CareDataID || null,
              camperID: med.CamperID || null,
              medicationName: med.MedicineName || null,
              genericName: med.GenericName || null,
              form: med.Form || null,
              dosage: med.Dosage || null,
              frequency: med.Frequency || null,
              refills: med.Refills || null,
              prescribedFor: med.PrescribedFor || null,
              sideEffects: med.SideEffects || null,
              interactions: med.Interactions || null,
              prescriptionDate: med.PrescriptionDate || null,
              instructions: med.Instructions || null,
            })) : [],
            overTheCounterMedications: overTheCounter ? overTheCounter.map(med => ({
              _id: med.ID || null,
              care_id: med.CareDataID || null,
              camperID: med.CamperID || null,
              medicationName: med.MedicationName || null,
              activeIngredients: med.ActiveIngredients || null,
              dosageAdult: med.DosageAdult || null,
              dosageChild: med.DosageChild || null,
              instructions: med.Uses || null,
              sideEffects: med.SideEffects || null,
              warnings: med.Warnings || null,
              createdBy: med.CreatedBy || null,
            })) : [],
            longActingInsulin: longActing ? longActing.map(reading => ({
              _id: reading.ID || null,
              care_id: reading.CareDataID || null,
              dosage: reading.Dosage || null,
              lastAdministered: reading.LastAdministeredDosage || null,
              name: reading.Name || null,
            })) : [],
            rapidActingInsulin: rapidActing ? rapidActing.map(reading => ({
              _id: reading.ID || null,
              care_id: reading.CareDataID || null,
              dosage: reading.Dosage || null,
              lastAdministered: reading.LastAdministeredDosage || null,
              name: reading.Name || null,
            })) : [],
            mealReadings: mealReadingsHistory ? mealReadingsHistory.map(reading => ({
              _id: reading.ID  || null,
              care_id: reading.CareDataID || null,
              camperID: reading.CamperID || null,
              date: reading.DateTaken ? new Date(reading.DateTaken).toISOString() : null,
              timeLabel: reading.TimeLabel || null,
              unixTime: reading.UnixTime || null,
              carbAmount: reading.CarbAmount || null,
              glucoseLevel: reading.GlucoseLevel || null,
              meal: reading.Meal || null,
              imageIdentifier: reading.ImageIdentifier || null,
            })) : [],
            providers: medicalProviders ? medicalProviders.map(provider => ({
              _id: provider.ID || null,
              care_id: provider.CareDataID || null,
              camperID: provider.CamperID || null,
              role: provider.Role || null,
              providerName: provider.Name || null,
              providerEmail: provider.Email || null,
              providerPhone: provider.Phone || null,
            })) : [],
            medicalNotes: notes ? notes.map(note => ({
              _id: note.ID || null,
              care_id: note.CareDataID || null,
              camperID: note.CamperID || null,
              noteType: note.NoteType || null,
              content: note.Content || null,
              injury: note.Injury || null,
              createdBy: note.CreatedBy || null,
              updatedBy: note.UpdatedBy || null,
            })) : [],
          } : null,
          originsData: originsData ? {
            _id: originsData.ID,
            firstName: originsData.FirstName,
            lastName: originsData.LastName,
            gender: originsData.Gender,
            age: originsData.Age,
            dateOfBirth: originsData.DateOfBirth,
            mother: originsData.Mother,
            father: originsData.Father
          } : null,
          camperCamps: camperCamps ? {
            campID: camperCamps.CampID,
            camperID: camper.ID ? camper.ID : null,
          } : null,
        };
       
      } catch (error) {
        console.error('Error in camperByEmail resolver:', error);
        if (error instanceof Sequelize.ConnectionError) {
          throw new Error('Database connection error. Please try again later.');
        } else if (error instanceof Sequelize.DatabaseError) {
          throw new Error('A database error occurred. Please try again later.');
        } else if (error instanceof Sequelize.ValidationError) {
          throw new Error('Invalid data provided.');
        } else {
          throw new Error(`Failed to fetch camper with email: ${email}`);
        }
      }
    },
    getAllVolunteers: async (_, __, context) => {
      try {
    
        // Get all volunteers
        const volunteers = await Volunteers.findAll();

        // Process each volunteer
        const volunteersWithAssignments = await Promise.all(volunteers.map(async (volunteer) => {

          // Find assignments for this volunteer
          const assignments = await CamperAssignedVolunteers.findAll({
            where: {
              VolunteerID: {
                [Op.like]: `%${volunteer.ID}%`
              }
            }
          });
    
          let camperEmails = [];
          if (assignments.length > 0) {
            // Process assignments
            camperEmails = await Promise.all(assignments.map(async (assignment) => {
              const camper = await Camper.findByPk(assignment.CamperID);
              return camper ? camper.Email : null;
            }));
    
            // Filter out null values
            camperEmails = camperEmails.filter(email => email !== null);
          }
          return {
            _id: volunteer.ID,
            isVolunteer: true,
            photo: volunteer.Photo,
            banner: volunteer.Banner,
            email: volunteer.Email,
            notes: volunteer.Notes,
            volunteerType: volunteer.VolunteerType,
            firstName: volunteer.FirstName,
            lastName: volunteer.LastName,
            dateOfBirth: volunteer.DateOfBirth,
            notifications: volunteer.Notifications,
            phone: volunteer.Phone,
            volunteerAssignments: {
              volunteer: volunteer.ID,
              camperEmail: camperEmails
            }
          };
        }));

        return volunteersWithAssignments;
      } catch (error) {
        console.error('Error in getAllVolunteers resolver:', error);
        throw new Error('Failed to fetch volunteers');
      }
    },
    getAllCampers: async (_, __, context) => { // sends the data to the DirectSearchGrid and its saved into indexDB
      try {
        const campers = await Camper.findAll();

        return Promise.all(campers.map(async (camper) => {
          const careData = await CareData.findOne({
            where: { CamperID: camper.ID }
          });
    
          const originsData = await OriginsData.findOne({
            where: { CamperID: camper.ID }
          });
    
          const camperCamps = await CamperCamps.findOne({
            where: { CamperID: camper.ID }
          });
    
          const assignedVolunteers = await CamperAssignedVolunteers.findOne({
            where: { CamperID: camper.ID }
          });

          let volunteerAssignments = null;
          if (assignedVolunteers) {
           // Handle VolunteerID whether it's a string or an array
            const volunteerIds = Array.isArray(assignedVolunteers.VolunteerID) 
            ? assignedVolunteers.VolunteerID 
            : assignedVolunteers.VolunteerID.split(',');

          // Handle VolunteerType whether it's a string or an array
          const volunteerTypes = Array.isArray(assignedVolunteers.VolunteerType)
            ? assignedVolunteers.VolunteerType
            : assignedVolunteers.VolunteerType.split(',');

          const volunteerData = await Promise.all(volunteerIds.map(async (id) => {
            const trimmedId = id.trim();
            const volunteer = await Volunteers.findOne({
              attributes: ['ID', 'Email'],
              where: { ID: parseInt(trimmedId, 10) }
            });
            return volunteer ? {
              id: volunteer.ID,
              email: volunteer.Email
            } : null;
          }));

          const validVolunteerData = volunteerData.filter(data => data !== null);

          volunteerAssignments = {
            volunteer: validVolunteerData.map(data => data.id),
            volunteerEmails: validVolunteerData.map(data => data.email),
            volunteerType: volunteerTypes.map(type => type.trim())
          };
          }
    
          let careDatDetails = null;
          if (careData) {
            const targetBG = await BGTargets.findOne({
              where: { CareDataID: careData.ID }
            });

            const insulinCarbRatio = await InsulinCarbRatios.findOne({
              where: { CareDataID: careData.ID }
            });

            const longActingInsulin = await LongActingInsulin.findAll({
              where: { CareDataID: careData.ID }
            });

            const rapidActingInsulin = await RapidActingInsulin.findAll({
              where: { CareDataID: careData.ID }
            });

            const mealReadings = await MealReadings.findAll({
              where: { CareDataID: careData.ID }
            });

            const providers = await Providers.findAll({
              where: { CareDataID: careData.ID }
            });

            const overTheCounterMedications = await OverTheCounterMedication.findAll({
              where: { CareDataID: careData.ID }
            });

            const prescriptions = await Prescriptions.findAll({
              where: { CareDataID: careData.ID }
            });

            const medicalNotes = await MedicalNotes.findAll({
              where: { CareDataID: careData.ID }
            });

            const specialNeed = await SpecialNeed.findOne({
              where: { CareDataID: careData.ID }
            });

            careDatDetails = {
              _id: careData.ID,
              careType: careData.CareType,
              correctionFactor: careData.CorrectionFactor,
              mdi: careData.MDI,
              cgm: careData.CGM,
              insulinPump: careData.InsulinPump,
              insulinPumpModel: careData.InsulinPumpModel,
              insulinType: careData.InsulinType,
              allergies: careData.Allergies,
              emergencyContact: careData.EmergencyContact,
              targetBG: targetBG ? {
                breakfast: targetBG.BGTargetBreakfast,
                lunch: targetBG.BGTargetLunch,
                dinner: targetBG.BGTargetDinner
              } : null,
              insulinCarbRatio: insulinCarbRatio ? {
                breakfast: insulinCarbRatio.RatioBreakfast,
                lunch: insulinCarbRatio.RatioLunch,
                dinner: insulinCarbRatio.RatioDinner,
              } : null,
              longActingInsulin: longActingInsulin?.map(insulin => ({
                _id: insulin.ID,
                care_id: insulin.CareDataID,
                dosage: insulin.Dosage,
                lastAdministered: insulin.LastAdministered,
                name: insulin.Name
              })),
              rapidActingInsulin: rapidActingInsulin?.map(insulin => ({
                _id: insulin.ID,
                care_id: insulin.CareDataID,
                dosage: insulin.Dosage,
                lastAdministered: insulin.LastAdministered,
                name: insulin.Name
              })),
              mealReadings: mealReadings?.map(reading => ({
                _id: reading.ID,
                care_id: reading.CareDataID,
                camperID: reading.CamperID,
                date: reading.Date,
                timeLabel: reading.TimeLabel,
                unixTime: reading.UnixTime,
                carbAmount: reading.CarbAmount,
                glucoseLevel: reading.GlucoseLevel,
                meal: reading.Meal,
                imageIdentifier: reading.ImageIdentifier
              })),
              providers: providers?.map(provider => ({
                _id: provider.ID,
                care_id: provider.CareDataID,
                role: provider.Role,
                providerName: provider.ProviderName,
                providerEmail: provider.ProviderEmail,
                providerPhone: provider.ProviderPhone
              })),
              overTheCounterMedications: overTheCounterMedications?.map(med => ({
                _id: med.ID,
                care_id: med.CareDataID,
                camperID: med.CamperID,
                medicationName: med.MedicationName,
                activeIngredients: med.ActiveIngredients,
                dosageAdult: med.DosageAdult,
                dosageChild: med.DosageChild,
                instructions: med.Instructions,
                sideEffects: med.SideEffects,
                warnings: med.Warnings,
                createdBy: med.CreatedBy
              })),
              prescriptions: prescriptions?.map(prescription => ({
                _id: prescription.ID,
                care_id: prescription.CareDataID,
                camperID: prescription.CamperID,
                medicationName: prescription.MedicineName,
                genericName: prescription.GenericName,
                form: prescription.Form,
                dosage: prescription.Dosage,
                frequency: prescription.Frequency,
                refills: prescription.Refills,
                prescribedFor: prescription.PrescribedFor,
                sideEffects: prescription.SideEffects,
                interactions: prescription.Interactions,
                prescriptionDate: prescription.PrescriptionDate,
                instructions: prescription.Instructions
              })),
              medicalNotes: medicalNotes?.map(note => ({
                _id: note.ID,
                care_id: note.CareDataID,
                camperID: note.CamperID,
                noteType: note.NoteType,
                content: note.Content,
                injury: note.Injury,
                createdBy: note.CreatedBy,
                updatedBy: note.UpdatedBy
              })),
              specialNeed: specialNeed ? {
                _id: specialNeed.ID,
                specialNeedType: specialNeed.SpecialNeedType,
                notes: specialNeed.Notes,
                specialNeedInstructions: specialNeed.SpecialNeedInstructions
              } : null
            };
          }

          return {
            _id: camper.ID,
            isVolunteer: false,
            photo: camper.Photo,
            banner: camper.Banner,
            email: camper.Email,
            notifications: camper.Notifications,
            phone: camper.Phone,
            notes: camper.Notes,
            firstName: originsData ? originsData.FirstName : null,
            lastName: originsData ? originsData.LastName : null,
            volunteerAssignments: volunteerAssignments,
            careData: careDatDetails,
            originsData: originsData ? {
              _id: originsData.ID,
              firstName: originsData.FirstName,
              lastName: originsData.LastName,
              gender: originsData.Gender,
              age: originsData.Age,
              dateOfBirth: originsData.DateOfBirth,
              mother: originsData.Mother,
              father: originsData.Father
            } : null,
            camperCamps: camperCamps ? {
              campID: camperCamps.CampID,
              camperID: camper.ID,
            } : null,
          };
      }));
      } catch (error) {
        console.error('Error in campers resolver:', error);
        if (error instanceof Sequelize.ConnectionError) {
          throw new Error('Database connection error. Please try again later.');
        } else if (error instanceof Sequelize.DatabaseError) {
          throw new Error('A database error occurred. Please try again later.');
        } else if (error instanceof Sequelize.ValidationError) {
          throw new Error('Invalid data provided.');
        } else {
          throw new Error('Failed to fetch campers');
        }
      }
    },
    volunteerByEmail: async (_, { email }) => {
      try {
        // Get the volunteer by email, grab the ID
        const volunteer = await Volunteers.findOne({
          where: { Email: email }
        });

        if (!volunteer) {
          throw new Error(`No volunteer found with email: ${email}`);
        }

        // Using the volunteer ID we now have, for every row, if that ID is present, get the CamperID that is also in that row
        const assignments = await CamperAssignedVolunteers.findAll({
          where: {
            VolunteerID: {
              [Op.like]: `%${volunteer.ID}%`
            }
          }
        });

        const camperNames = await Promise.all(assignments.map(async (assignment) => {
          // Handle VolunteerID and VolunteerType, considering they might be arrays or strings
          let volunteerIds = Array.isArray(assignment.VolunteerID) 
            ? assignment.VolunteerID 
            : String(assignment.VolunteerID).split(',').map(id => id.trim());

          let volunteerTypes = Array.isArray(assignment.VolunteerType)
            ? assignment.VolunteerType
            : String(assignment.VolunteerType).split(',').map(type => type.trim());

          const index = volunteerIds.indexOf(volunteer.ID.toString());
          const volunteerType = volunteerTypes[index];

          // Using each camper ID, take care to parse it by checking if it's a string
          const camperId = typeof assignment.CamperID === 'string' ? assignment.CamperID.trim() : assignment.CamperID;
          
          // Get the camper table for each camperID and grab the OriginsID from it
          const camper = await Camper.findByPk(camperId, {
            attributes: ['OriginsID']
          });

          if (camper && camper.OriginsID) {
            // Get the FirstName and LastName from the Origins table
            const origins = await OriginsData.findByPk(camper.OriginsID, {
              attributes: ['FirstName', 'LastName']
            });

            if (origins) {
              // Return as a string with camper name only
              return `${origins.FirstName}, ${origins.LastName}`;
            }
          }
          return null;
        }));

        // Filter out null values
        const validCamperNames = camperNames.filter(name => name !== null);

        return {
          _id: volunteer.ID,
          isVolunteer: true,
          photo: volunteer.Photo,
          banner: volunteer.Banner,
          email: volunteer.Email,
          notes: volunteer.Notes,
          volunteerType: volunteer.VolunteerType,
          firstName: volunteer.FirstName,
          lastName: volunteer.LastName,
          dateOfBirth: volunteer.DateOfBirth,
          notifications: volunteer.Notifications,
          phone: volunteer.Phone,
          volunteerAssignments: {
            volunteer: volunteer.ID,
            camper: validCamperNames  // This is now an array of strings, each representing a camper
          },
        };

      } catch (error) {
        console.error('Error in volunteerByEmail resolver:', error);
        throw new Error('Failed to fetch volunteer data');
      }
    },
  getAssignments: async (_, { personID }, { models }) => {
    try {
      // First, try to find the person as a volunteer
      let person = await models.Volunteer.findByPk(personID);
      let isVolunteer = true;

      // If not found as a volunteer, try to find as a camper
      if (!person) {
        person = await models.Camper.findByPk(personID);
        isVolunteer = false;
      }

      if (!person) {
        throw new Error('Person not found');
      }

      let assignments;

      if (isVolunteer) {
        // If it's a volunteer, get assigned campers
        assignments = await person.getCampers({
          attributes: ['id', 'firstName', 'lastName', 'email', 'photo', 'banner', 'phone', 'notes', 'notifications'],
          include: [
            {
              model: models.CareData,
              as: 'careData',
            },
            {
              model: models.OriginsData,
              as: 'originsData',
            },
          ],
        });

        return assignments.map(camper => ({
          __typename: 'Camper',
          _id: camper.id,
          isVolunteer: false,
          photo: camper.photo,
          banner: camper.banner,
          email: camper.email,
          notifications: camper.notifications,
          phone: camper.phone,
          notes: camper.notes,
          firstName: camper.firstName,
          lastName: camper.lastName,
          careData: camper.careData,
          originsData: camper.originsData,
          volunteerAssignments: [], // You might need to fetch this separately if needed
        }));
      } else {
        // If it's a camper, get assigned volunteers
        assignments = await person.getVolunteers({
          attributes: ['id', 'email', 'firstName', 'lastName', 'isVolunteer', 'photo', 'banner', 'notes', 'volunteerType', 'dateOfBirth', 'notifications', 'phone'],
        });

        return assignments.map(volunteer => ({
          __typename: 'Volunteer',
          _id: volunteer.id,
          isVolunteer: volunteer.isVolunteer,
          photo: volunteer.photo,
          banner: volunteer.banner,
          email: volunteer.email,
          notes: volunteer.notes,
          volunteerType: volunteer.volunteerType,
          firstName: volunteer.firstName,
          lastName: volunteer.lastName,
          dateOfBirth: volunteer.dateOfBirth,
          notifications: volunteer.notifications,
          phone: volunteer.phone,
          volunteerAssignments: [], // fetch this separately if needed
        }));
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw new Error('Failed to fetch assignments');
    }
  },
}, // end of Queries
  Mutation: {
    updatePerson: async (_, args, context) => {
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;
      const MAX_NOTES_LENGTH = 65535; // for TEXT type, or 255 for VARCHAR(255)
      try{
        const { _id, email, photo, banner, notifications, phone, notes, firstName, lastName, isVolunteer } = args;
        let person = await Camper.findOne({
          where: { Email: email }
        });
        let isC = true;
        
        if (!person) {
            person = await Volunteers.findOne({
              where: { Email: email }
            });
            isC = false;
        }

        if (!isVolunteer){
          // not a volunteer
          const camperOrigin = await OriginsData.findOne({ where: { ID: _id} })
          // if its not a volunteer its a camper, update the name if it doesnt atch whats already in the database
          if (camperOrigin) {
            if (firstName !== camperOrigin.FirstName && firstName !=="") camperOrigin.FirstName = firstName;
            if (lastName !== camperOrigin.LastName && lastName !== "") camperOrigin.LastName = lastName;
            camperOrigin.save();
          }
        }
        else if(isVolunteer && (isC == false)){
          // they are volunteer, update the name
          if (firstName !== person.FirstName && firstName !=="") person.FirstName = firstName;
          if (lastName !== person.LastName && lastName !== "") person.LastName = lastName;
        }

        // check each feild and updates it as necessary
        if (person) {
          if ((email !== "") && !emailPattern.test(email)) {
            throw new GraphQLError('Invalid email format', {
              extensions: { code: 'BAD_USER_INPUT' },
            });
          }
          if (photo !== "") person.Photo = photo;
          if (banner !== "") person.Banner = banner;
          if (notifications !== "") person.Notifications = notifications;
          if (phone !== "") person.Phone = phone;
          // if (notes !== "") {
          //   let updatedNotes = person.Notes ? person.Notes + " " + notes : notes;
            
          //   // Truncate the notes if they exceed the maximum length
          //   if (updatedNotes.length > MAX_NOTES_LENGTH) {
          //     updatedNotes = updatedNotes.substring(0, MAX_NOTES_LENGTH);
          //     console.warn(`Notes for person ${person.ID} were truncated to fit within database limits.`);
          //   }
            
          //   person.Notes = updatedNotes;
          // }
  
          // Save the updated person
          await person.save();

          // Add a non-persistent property to distinguish between Camper and Volunteer
          const flaggedPersonType = {
            _id: person.ID, 
            email: person.Email,
            photo: person.Photo,
            firstName: firstName,
            lastName: lastName,
            banner: person.Banner,
            notifications: person.Notifications,
            phone: person.Phone,
            isVolunteer: isVolunteer ? 1 : 0,
            personType: isC ? 1 : 0, /// this is important, it is linked to the __resolveType at the top so graphql retrn the right type
          };
  
          return flaggedPersonType;
        }
  
        throw new Error('Person not found');

      }catch(error){
        throw error;
      }
    },
    updateCamperCareData: async (_, args, context) => {
      try {
        const { camperInput, careDataInput } = args;
        const { _id: camperId } = camperInput;
        const {
          _id: careId,
          careType,
          correctionFactor,
          mdi,
          cgm,
          insulinPump,
          insulinPumpModel,
          doctorName,
          doctorEmail,
          doctorPhone,
          allergies,
          emergencyContact,
          targetBG,
          insulinCarbRatio,
          longActingInsulin,
          rapidActingInsulin,
          insulinType
        } = careDataInput;
        
        // Validate date fields
        const validateDate = (date) => {
          return date instanceof Date && !isNaN(date) ? date : null;
        };

        let longActing;
        let rapidActing;

        let careData = await CareData.findOne({ where: { CamperID: camperId } });
        let camper = await Camper.findOne({ where: { ID: camperId } });
        
        if (!careData) {
          throw new Error('Care data not found');
        }
    
        // Fetch related data (these might be empty)
        let BGTable = await BGTargets.findOne({ where: { CareDataID: careData.ID } });
        let providerTable = await Providers.findOne({
          where: {
            CareDataID: careData.ID,
            Email: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Email')), 'LIKE', `%${doctorEmail.toLowerCase()}%`)
          }
        });
        let insulinCarbRatioTable = await InsulinCarbRatios.findOne({ where: { CareDataID: careData.ID } });

        // Update CareData
        if (careData) {
          careData._id = careId;
          if (careType !== undefined) careData.CareType = careType || null;
          if (correctionFactor !== undefined) careData.CorrectionFactor = correctionFactor || null;
          if (mdi !== undefined) careData.MDI = mdi;
          if (cgm !== undefined) careData.CGM = cgm || null;
          if (insulinPump !== undefined) careData.InsulinPump = insulinPump;
          if (insulinPumpModel !== undefined) careData.InsulinPumpModel = insulinPumpModel || null;
          if (doctorName !== undefined) careData.DoctorName = doctorName || null;
          if (doctorEmail !== undefined) careData.DoctorEmail = doctorEmail || null;
          if (doctorPhone !== undefined) careData.DoctorPhone = doctorPhone || null;
          if (allergies !== undefined) careData.Allergies = allergies || null;
          if (emergencyContact !== undefined) careData.EmergencyContact = emergencyContact || null;
          if (insulinType !== undefined) careData.InsulinType = insulinType || null;
        }
            // Update or create Provider
          if (doctorName || doctorEmail || doctorPhone) {
            if (!providerTable) {
                providerTable = await Providers.findOne({
                  where: { CareDataID: careData.ID }
                });
                if (!providerTable) {
                  providerTable = await Providers.create({
                    CareDataID: careData.ID,
                    CamperID: camperId,
                    Role: 'Provider',
                    Name: doctorName || "",
                    Email: doctorEmail || "",
                    Phone: doctorPhone || ""
                  });
                }else{
                  if (doctorName !== undefined) providerTable.Name = doctorName || providerTable.Name;
                  if (doctorEmail !== undefined) providerTable.Email = doctorEmail || providerTable.Email;
                  if (doctorPhone !== undefined) providerTable.Phone = doctorPhone || providerTable.Phone;
                }
            }else{
               // Update existing provider
               if (doctorName !== undefined) providerTable.Name = doctorName || providerTable.Name;
               if (doctorEmail !== undefined) providerTable.Email = doctorEmail || providerTable.Email;
               if (doctorPhone !== undefined) providerTable.Phone = doctorPhone || providerTable.Phone;
            }
        }
    
        // Update BGTargets
        if (targetBG) {
          if (targetBG.breakfast !== undefined) BGTable.BGTargetBreakfast = targetBG.breakfast !== -1 ? targetBG.breakfast : null;
          if (targetBG.lunch !== undefined) BGTable.BGTargetLunch = targetBG.lunch !== -1 ? targetBG.lunch : null;
          if (targetBG.dinner !== undefined) BGTable.BGTargetDinner = targetBG.dinner !== -1 ? targetBG.dinner : null;
        }
    
        // Update InsulinCarbRatios
        if (insulinCarbRatio) {
          if (insulinCarbRatio.breakfast !== undefined) insulinCarbRatioTable.RatioBreakfast = insulinCarbRatio.breakfast || null;
          if (insulinCarbRatio.lunch !== undefined) insulinCarbRatioTable.RatioLunch = insulinCarbRatio.lunch || null;
          if (insulinCarbRatio.dinner !== undefined) insulinCarbRatioTable.RatioDinner = insulinCarbRatio.dinner || null;
        }

        if (longActingInsulin && longActingInsulin.length > 0) {
          for (let i = 0; i < longActingInsulin.length; i++) {
            const insulin = longActingInsulin[i];
            longActing = await LongActingInsulin.findOne({
              where: {
                CareDataID: careData.ID,
                Name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Name')), 'LIKE', `%${insulin.name.toLowerCase()}%`)
              }
            });

            if (!longActing) {
              longActing = await LongActingInsulin.findOne({
                where: { CareDataID: careData.ID }
              });
              if (!longActing) {
                longActing = await LongActingInsulin.create({
                  CareDataID: careData.ID,
                  Dosage: insulin.dosage !== "-1" ? insulin.dosage : null,
                  LastAdministeredDosage: validateDate(insulin.LastAdministered),
                  Name: insulin.name || ""
                });
              } else {
                if (insulin.name !== undefined) longActing.Name = insulin.name || longActing.Name;
                if (insulin.LastAdministered !== undefined) longActing.LastAdministeredDosage = validateDate(insulin.LastAdministered) || longActing.LastAdministeredDosage;
                if (insulin.dosage !== undefined) longActing.Dosage = insulin.dosage !== "-1" ? insulin.dosage : null;
              }
            } else {
              // Update existing entry
              if (insulin.name !== undefined) longActing.Name = insulin.name || longActing.Name;
              if (insulin.LastAdministered !== undefined) longActing.LastAdministeredDosage = validateDate(insulin.LastAdministered) || longActing.LastAdministeredDosage;
              if (insulin.dosage !== undefined) longActing.Dosage = insulin.dosage !== "-1" ? insulin.dosage : null;
            }
        
            await longActing.save();
          }
        }


        if (rapidActingInsulin && rapidActingInsulin.length > 0) {
          for (let i = 0; i < rapidActingInsulin.length; i++) {
            const insulin = rapidActingInsulin[i];
            rapidActing = await RapidActingInsulin.findOne({
              where: {
                CareDataID: careData.ID,
                Name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Name')), 'LIKE', `%${insulin.name.toLowerCase()}%`)
              }
            });

            if (!rapidActing) {
              rapidActing = await RapidActingInsulin.findOne({
                where: { CareDataID: careData.ID }
              });
              if (!rapidActing) {
                rapidActing = await RapidActingInsulin.create({
                  CareDataID: careData.ID,
                  Dosage: insulin.dosage !== "-1" ? insulin.dosage : null,
                  LastAdministeredDosage: validateDate(insulin.LastAdministered),
                  Name: insulin.name || ""
                });
              } else {
                if (insulin.name !== undefined) rapidActing.Name = insulin.name || rapidActing.Name;
                if (insulin.LastAdministered !== undefined) rapidActing.LastAdministeredDosage = validateDate(insulin.LastAdministered) || rapidActing.LastAdministeredDosage;
                if (insulin.dosage !== undefined) rapidActing.Dosage = insulin.dosage !== "-1" ? insulin.dosage : null;
              }
            } else {
              // Update existing entry
              if (insulin.name !== undefined) rapidActing.Name = insulin.name || rapidActing.Name;
              if (insulin.LastAdministered !== undefined) rapidActing.LastAdministeredDosage = validateDate(insulin.LastAdministered) || rapidActing.LastAdministeredDosage;
              if (insulin.dosage !== undefined) rapidActing.Dosage = insulin.dosage !== "-1" ? insulin.dosage : null;
            }
        
            await rapidActing.save();
          }
        }
              
        // Save all updated data
        await Promise.all([
          careData.save(),
          BGTable ? BGTable.save() : Promise.resolve(),
          providerTable ? providerTable.save() : Promise.resolve(),
          insulinCarbRatioTable ? insulinCarbRatioTable.save() : Promise.resolve(),
        ]);

        // // Fetch meal readings
        // let mealReadings = await MealReadings.findAll({ where: { CareDataID: careData.ID } });
        // // If mealReadings is null or undefined, set it to an empty array
        // mealReadings = mealReadings || [];
        // // Map meal readings to the expected format, handling potential null values
        // const formattedMealReadings = mealReadings.map(reading => ({
        //   date: reading.DateTaken ? reading.DateTaken.toISOString() : null,
        //   timeLabel: reading.TimeLabel || null,
        //   unixTime: reading.UnixTime || null,
        //   carbAmount: reading.CarbAmount || null,
        //   glucoseLevel: reading.GlucoseReading || null,
        //   meal: reading.Meal || null,
        //   imageIdentifier: reading.ImageIdentifier || null,
        // }));

        // Return updated data
        return {
          _id: camper.ID,
          email: camper.Email,
          careData: {
            _id: careId,
            careType: careData.CareType,
            correctionFactor: careData.CorrectionFactor,
            mdi: careData.MDI,
            cgm: careData.CGM,
            insulinPump: careData.InsulinPump,
            insulinPumpModel: careData.InsulinPumpModel,
            allergies: careData.Allergies,
            emergencyContact: careData.EmergencyContact,
            insulinType: careData.InsulinType,
            targetBG: {
              breakfast: BGTable.BGTargetBreakfast,
              lunch: BGTable.BGTargetLunch,
              dinner: BGTable.BGTargetDinner,
            },
            insulinCarbRatio: {
              breakfast: insulinCarbRatioTable.RatioBreakfast,
              lunch: insulinCarbRatioTable.RatioLunch,
              dinner: insulinCarbRatioTable.RatioDinner,
            },
            providers: Array.isArray(providerTable) ? providerTable.map(provider => ({
                _id: provider.ID,
                care_id: provider.CareDataID,
                role: provider.Role,
                providerName: provider.Name,
                providerEmail: provider.Email,
                providerPhone: provider.Phone
              })) : providerTable ? [{
                  _id: providerTable.ID,
                  care_id: providerTable.CareDataID,
                  role: providerTable.Role,
                  providerName: providerTable.Name,
                  providerEmail: providerTable.Email,
                  providerPhone: providerTable.Phone
                }] : [],
            longActingInsulin: longActing ? (Array.isArray(longActing) ? longActing.map(insulin => ({
                    _id: insulin.ID,
                    care_id: insulin.CareDataID,
                    dosage: insulin.Dosage,
                    lastAdministered: insulin.LastAdministeredDosage,
                    name: insulin.Name
                  })) : [{
                    _id: longActing.ID,
                    care_id: longActing.CareDataID,
                    dosage: longActing.Dosage,
                    lastAdministered: longActing.LastAdministeredDosage,
                    name: longActing.Name
                  }]) : [],
            rapidActingInsulin: rapidActing ? (Array.isArray(rapidActing) ? rapidActing.map(insulin => ({
                    _id: insulin.ID,
                    care_id: insulin.CareDataID,
                    dosage: insulin.Dosage,
                    lastAdministered: insulin.LastAdministeredDosage,
                    name: insulin.Name
                  })) : [{
                    _id: rapidActing.ID,
                    care_id: rapidActing.CareDataID,
                    dosage: rapidActing.Dosage,
                    lastAdministered: rapidActing.LastAdministeredDosage,
                    name: rapidActing.Name
                  }]) : [],
          },
        };
      } catch (error) {
        console.error('Error in campers resolver:', error);
        if (error instanceof Sequelize.ConnectionError) {
          throw new Error('Database connection error. Please try again later.');
        } else if (error instanceof Sequelize.DatabaseError) {
          throw new Error('A database error occurred. Please try again later.');
        } else if (error instanceof Sequelize.ValidationError) {
          throw new Error('Invalid data provided.');
        } else {
          throw new Error('Failed to fetch campers');
        }
      }
    },
    removeAssignment: async (_, { camperEmail, volunteerEmail }, context) => {
      try {
        // Find the camper
        const camper = await Camper.findOne({ where: { email: camperEmail } });
        if (!camper) {
          return { success: false, message: 'Camper not found' };
        }
    
        // Find the volunteer
        const volunteer = await Volunteers.findOne({ where: { email: volunteerEmail } });
        if (!volunteer) {
          return { success: false, message: 'Volunteer not found' };
        }
    
        // Find the camper's volunteer assignments
        const volunteerAssignments = await CamperAssignedVolunteers.findOne({
          where: {
            CamperID: camper.ID
          }
        });
    
        if (!volunteerAssignments) {
          return { success: false, message: 'No volunteer assignments found for this camper' };
        }

        // Handle VolunteerID and VolunteerType, considering they might not be strings
        let volunteerIds = Array.isArray(volunteerAssignments.VolunteerID) 
          ? volunteerAssignments.VolunteerID 
          : String(volunteerAssignments.VolunteerID).split(',').map(id => id.trim());
    
        let volunteerTypes = Array.isArray(volunteerAssignments.VolunteerType)
          ? volunteerAssignments.VolunteerType
          : String(volunteerAssignments.VolunteerType).split(',').map(type => type.trim());
    
        // Find the index of the volunteer to remove
        const indexToRemove = volunteerIds.indexOf(volunteer.ID.toString());
    
        if (indexToRemove !== -1) {
          // Remove the volunteer ID and type at the found index
          volunteerIds.splice(indexToRemove, 1);
          volunteerTypes.splice(indexToRemove, 1);
    
          if (volunteerIds.length === 0) {
            // If no volunteers left, remove the entire row
            await CamperAssignedVolunteers.destroy({
              where: {
                CamperID: camper.ID
              }
            });
          } else {
            // Update the CamperAssignedVolunteers record
            await CamperAssignedVolunteers.update(
              {
                VolunteerID: Array.isArray(volunteerAssignments.VolunteerID) ? volunteerIds : volunteerIds.join(','),
                VolunteerType: Array.isArray(volunteerAssignments.VolunteerType) ? volunteerTypes : volunteerTypes.join(',')
              },
              {
                where: {
                  CamperID: camper.ID
                }
              }
            );
            console.log(`Updated assignments for camper ID: ${camper.ID}`);
          }
    
          return {
            success: true,
            message: 'Assignment removed successfully'
          };
        } else {
          console.log(`Volunteer ID ${volunteer.ID} not found in assignments for camper ID: ${camper.ID}`);
          return {
            success: false,
            message: 'Volunteer not found in camper\'s assignments'
          };
        }
      } catch (error) {
        console.error('Error in removeAssignment:', error);
        return {
          success: false,
          message: error.message
        };
      }
    },
    addVolunteerAssignment: async (parent, { camperEmail, volunteerEmail, volunteerType }, context) => {
      try {
        
        // 1. Find the Camper and Volunteer based on their emails
        const camper = await Camper.findOne({ where: { Email: camperEmail } });
        const volunteer = await Volunteers.findOne({ where: { Email: volunteerEmail } });
    
        if (!camper) {
          throw new Error(`Camper with email ${camperEmail} not found`);
        }
        if (!volunteer) {
          throw new Error(`Volunteer with email ${volunteerEmail} not found`);
        }
    
        // 2. Check if an assignment already exists
        let assignment = await CamperAssignedVolunteers.findOne({
          where: {
            CamperID: camper.ID
          }
        });
    
        if (assignment) {
          // 3a. If assignment exists, update it
          let volunteerIds = assignment.VolunteerID; // This will use the getter method
          let volunteerTypes = assignment.VolunteerType; // This will use the getter method
    
          if (!volunteerIds.includes(volunteer.ID.toString())) {
            volunteerIds.push(volunteer.ID.toString());
            volunteerTypes.push(volunteerType);
          } else {
            const index = volunteerIds.indexOf(volunteer.ID.toString());
            volunteerTypes[index] = volunteerType;
          }
    
          assignment = await assignment.update({
            VolunteerID: volunteerIds, // This will use the setter method
            VolunteerType: volunteerTypes // This will use the setter method
          });
        } else {
          // 3b. If assignment doesn't exist, create a new one
          assignment = await CamperAssignedVolunteers.create({
            CamperID: camper.ID,
            VolunteerID: [volunteer.ID.toString()], // This will use the setter method
            VolunteerType: [volunteerType] // This will use the setter method
          });
        }
    
        // 4. Return the upserted assignment with the required fields
        return {
          camper: {
            _id: camper.ID.toString(),
          },
          volunteer: {
            _id: volunteer.ID.toString(),
          },
          volunteerType: volunteerType
        };
      } catch (error) {
        console.error('Detailed error in addVolunteerAssignment:', error);
        throw new Error(`Failed to add volunteer assignment: ${error.message}`);
      }
    },
  updateAllVolunteers: async (_, { volunteers }, context) => {
    const updatedVolunteers = [];
  
    for (const volunteerInput of volunteers) {
      const { _id, ...otherFields } = volunteerInput;
  
      try {
        // Update the main volunteer fields
        let updatedVolunteer = await Volunteers.findOne({
          where: { ID: _id }
        });
        if (!updatedVolunteer) {
          throw new Error(`Volunteer with id ${_id} not found`);
        }
        await updatedVolunteer.update(otherFields);
  
        // Format the volunteer assignments to match the expected output
          // Using the volunteer ID we now have, for every row, if that ID is present, get the CamperID that is also in that row
          const assignments = await CamperAssignedVolunteers.findAll({
            where: {
              VolunteerID: {
                [Op.like]: `%${updatedVolunteer.ID}%`
              }
            }
          });

          const camperNames = await Promise.all(assignments.map(async (assignment) => {
            // Handle VolunteerID and VolunteerType, considering they might be arrays or strings
            let volunteerIds = Array.isArray(assignment.VolunteerID) 
              ? assignment.VolunteerID 
              : String(assignment.VolunteerID).split(',').map(id => id.trim());

            let volunteerTypes = Array.isArray(assignment.VolunteerType)
              ? assignment.VolunteerType
              : String(assignment.VolunteerType).split(',').map(type => type.trim());

            const index = volunteerIds.indexOf(updatedVolunteer.ID.toString());
            const volunteerType = volunteerTypes[index];

            // Using each camper ID, take care to parse it by checking if it's a string
            const camperId = typeof assignment.CamperID === 'string' ? assignment.CamperID.trim() : assignment.CamperID;
            
            // Get the camper table for each camperID and grab the OriginsID from it
            const camper = await Camper.findByPk(camperId, {
              attributes: ['OriginsID']
            });

            if (camper && camper.OriginsID) {
              // Get the FirstName and LastName from the Origins table
              const origins = await OriginsData.findByPk(camper.OriginsID, {
                attributes: ['FirstName', 'LastName']
              });

              if (origins) {
                // Return as a string with camper name only
                return `${origins.FirstName}, ${origins.LastName}`;
              }
            }
            return null;
          }));

          // Filter out null values
          const validCamperNames = camperNames.filter(name => name !== null);
          const volunteerObject = {
            _id: updatedVolunteer.ID,
            isVolunteer: true,
            photo: updatedVolunteer.Photo,
            banner: updatedVolunteer.Banner,
            email: updatedVolunteer.Email,
            notes: updatedVolunteer.Notes,
            volunteerType: updatedVolunteer.VolunteerType,
            firstName: updatedVolunteer.FirstName,
            lastName: updatedVolunteer.LastName,
            dateOfBirth: updatedVolunteer.DateOfBirth,
            notifications: updatedVolunteer.Notifications,
            phone: updatedVolunteer.Phone,
            volunteerAssignments: {
              volunteer: updatedVolunteer.ID,
              camper: validCamperNames  // This is now an array of strings, each representing a camper
            },
          };

        updatedVolunteers.push(volunteerObject);
      }  catch (error) {
        console.error('Error in campers resolver:', error);
        if (error instanceof Sequelize.ConnectionError) {
          throw new Error('Database connection error. Please try again later.');
        } else if (error instanceof Sequelize.DatabaseError) {
          throw new Error('A database error occurred. Please try again later.');
        } else if (error instanceof Sequelize.ValidationError) {
          throw new Error('Invalid data provided.');
        } else {
          throw new Error('Failed to fetch campers');
        }
      }
    } // end of for loop
    return updatedVolunteers;
  },
  updateAllCampers: async (parent, { campers }, context) => {
    const updatedCampers = [];

    for (const camperInput of campers) {
      const { _id, careData, originsData, volunteerAssignments, ...mainFields } = camperInput;

      try {
        // Update main camper fields
        let updatedCamper = await Camper.findOne({
          where: { ID: _id }
        })
        if (!updatedCamper) {
          throw new Error(`Camper with id ${_id} not found`);
        }
        await updatedCamper.update(mainFields);

        // Update care data if provided
        if (careData) {
          const {
            longActingInsulin,
            rapidActingInsulin,
            mealReadings,
            providers,
            overTheCounterMedications,
            prescriptions,
            medicalNotes,
            insulinCarbRatio,
            ...otherCareDataFields
          } = careData;

          let updatedCareData = await CareData.findOne({
            where: { ID: updatedCamper.CareDataID }
          });
          if (updatedCareData) {
            await updatedCareData.update(otherCareDataFields);
          // Update nested arrays in care data
          if (longActingInsulin) {
            updatedCareData.longActingInsulin = await updateCreateOrDeleteManySequelize(LongActingInsulin, longActingInsulin, 'CareDataID', updatedCareData.ID);
          }
          if (rapidActingInsulin) {
            updatedCareData.rapidActingInsulin = await updateCreateOrDeleteManySequelize(RapidActingInsulin, rapidActingInsulin, 'CareDataID', updatedCareData.ID);
          }
          if (mealReadings) {
            updatedCareData.mealReadings = await updateCreateOrDeleteManySequelize(MealReadings, mealReadings, 'CareDataID', updatedCareData.ID);
          }
          if (providers) {
            updatedCareData.providers = await updateCreateOrDeleteManySequelize(Providers, providers, 'CareDataID', updatedCareData.ID);
          }
          if (overTheCounterMedications) {
            updatedCareData.overTheCounterMedications = await updateCreateOrDeleteManySequelize(OverTheCounterMedication, overTheCounterMedications, 'CareDataID', updatedCareData.ID);
          }
          if (prescriptions) {
            updatedCareData.prescriptions = await updateCreateOrDeleteManySequelize(Prescriptions, prescriptions, 'CareDataID', updatedCareData.ID);
          }
          if (medicalNotes) {
            updatedCareData.medicalNotes = await updateCreateOrDeleteManySequelize(MedicalNotes, medicalNotes, 'CareDataID', updatedCareData.ID);
          }

          updatedCamper.careData = updatedCareData;
        }

      // Update origins data if provided
        if (originsData) {
          const updatedOriginsData = await models.OriginsData.findOne({
            where: { ID: updatedCamper.OriginsID }
          });
          if (updatedOriginsData) {
            // Use originsData instead of otherCareDataFields
            await updatedOriginsData.update(originsData);
          }
          updatedCamper.originsData = updatedOriginsData;
        }else{
          updatedCamper.originsData = originsData;
          console.log("no updates to origins data")
        }

        // Update volunteer assignments if provided
        if (volunteerAssignments && Array.isArray(volunteerAssignments) && volunteerAssignments.length > 0) {
          try {
              // Find all volunteers by their emails
            const volunteerEmails = volunteerAssignments.map(va => va.email);
            const volunteers = await Volunteers.findAll({ where: { Email: volunteerEmails } });

              // Create a map of email to volunteer ID for quick lookup
            const emailToIdMap = new Map(volunteers.map(v => [v.Email, v.ID.toString()]));
             
              // Get the volunteer IDs and types in the same order as the input
            const volunteerIds = [];
            const volunteerTypes = [];
            for (const va of volunteerAssignments) {
              const volunteerId = emailToIdMap.get(va.email);
              if (volunteerId) {
                volunteerIds.push(volunteerId);
                volunteerTypes.push(va.type || ''); // Use empty string if type is not provided
              }
            }

              // Find or create the assignment
            let assignment = await CamperAssignedVolunteers.findOne({
              where: { CamperID: updatedCamper.ID }
            });
            
            if (assignment) {
              // 3a. If assignment exists, update it
              let volunteerIdsInDB = assignment.VolunteerID; // This will use the getter method
              let volunteerTypesInDB = assignment.VolunteerType; // This will use the getter method
                // Check for new volunteer IDs
              const newVolunteerIds = volunteerIds.filter(id => !volunteerIdsInDB.includes(id));
              const removedVolunteerIds = volunteerIdsInDB.filter(id => !volunteerIds.includes(id));

              if (newVolunteerIds.length > 0) {
                // There are new volunteers to add
                newVolunteerIds.forEach((id, index) => {
                  volunteerIdsInDB.push(id);
                  volunteerTypesInDB.push(volunteerTypes[volunteerIds.indexOf(id)]);
                });
              }
                // Remove deleted volunteers: Explination of whats happening here
                // If the id is not in volunteerIds, the function returns true, and that id is included in the removedVolunteerIds array.
                // After this, removedVolunteerIds contains all the IDs that are in the database but not in the new input.
                // Then we remove these IDs:
                // ex: 
                //    volunteerIds = ["2", "3", "4"]
                //    volunteerTypes= ["Counselor", "Nurse", "Doctor"]
                //    volunteerIdsInDB = ["1", "2", "3"]
                //    volunteerTypesInDB =  ["Helper", "Counselor", "Nurse"]
                //    const newVolunteerIds = volunteerIds.filter(id => !volunteerIdsInDB.includes(id));
                //    const removedVolunteerIds = volunteerIdsInDB.filter(id => !volunteerIds.includes(id));
                // now: newVolunteerIds: ["4"]
                //      removedVolunteerIds: ["1"]
                //   if (newVolunteerIds.length > 0) {
                //     newVolunteerIds.forEach((id, index) => {
                //       volunteerIdsInDB.push(id);
                //       volunteerTypesInDB.push(volunteerTypes[volunteerIds.indexOf(id)]);
                //     });
                //   }
                //   After this:
                //     volunteerIdsInDB: ["1", "2", "3", "4"]
                //     volunteerTypesInDB: ["Helper", "Counselor", "Nurse", "Doctor"]
                // Next:
                //   removedVolunteerIds.forEach(id => {
                //     const index = volunteerIdsInDB.indexOf(id);
                //     if (index !== -1) {
                //       volunteerIdsInDB.splice(index, 1);
                //       volunteerTypesInDB.splice(index, 1);
                //     }
                //   });
                //   After this well make sure the types line up, then save to the DB:
                //     volunteerIdsInDB: ["2", "3", "4"]
                //     volunteerTypesInDB: ["Counselor", "Nurse", "Doctor"]
              removedVolunteerIds.forEach(id => {
                const index = volunteerIdsInDB.indexOf(id);
                if (index !== -1) {
                  volunteerIdsInDB.splice(index, 1);
                  volunteerTypesInDB.splice(index, 1);
                }
              });

                // Update existing volunteer types
              volunteerIds.forEach((id, index) => {
                const dbIndex = volunteerIdsInDB.indexOf(id);
                if (dbIndex !== -1) {
                  volunteerTypesInDB[dbIndex] = volunteerTypes[index];
                }
              });
        
              assignment = await assignment.update({
                VolunteerID: volunteerIdsInDB, // This will use the setter method
                VolunteerType: volunteerTypesInDB // This will use the setter method
              });
            } else {
              // 3b. If assignment doesn't exist, create a new one
              assignment = await CamperAssignedVolunteers.create({
                CamperID: updatedCamper.ID,
                VolunteerID: volunteerIds.toString(), // This will use the setter method
                VolunteerType: volunteerTypes // This will use the setter method
              });
            }
          } catch (error) {
            console.error(`Error updating volunteer assignments for camper ${updatedCamper.ID}:`, error);
            // Handle the error as appropriate for your application
          }
        }
      }
        // Save the updated camper
        updatedCamper = await updatedCamper.save();

        updatedCampers.push(updatedCamper);
      } catch (error) {
        console.error('Error in campers resolver:', error);
        if (error instanceof Sequelize.ConnectionError) {
          throw new Error('Database connection error. Please try again later.');
        } else if (error instanceof Sequelize.DatabaseError) {
          throw new Error('A database error occurred. Please try again later.');
        } else if (error instanceof Sequelize.ValidationError) {
          throw new Error('Invalid data provided.');
        } else {
          throw new Error('Failed to fetch campers');
        }
      }
    }
    return updatedCampers;
    },
    registerUser: async (_, args, context) => {
      const {
        countryCode,
        dateOfBirth,
        email,
        firstName,
        key,
        lastName,
        notifications,
        password,
        phone,
        profileImage,
        role
      } = args;
    
      try {
        // Check if the key exists in Minio and get the object data
        const bucket = 'stjda-signup-forms';
        const minioResponse = await fetch(`http://34.135.9.49:3000/api/minioG/getObjectByKey/${bucket}/${key}`);
        const minioData = await minioResponse.json();
    
        if (!minioData.exists) {
          return {
            success: false,
            message: "Invalid registration key."
          };
        }
    
        // Log the data from Minio
        console.log("Data from Minio: ", minioData.data);
    
        // Prepare the data to be sent to the signup endpoint
        const signupData = {
          ...minioData.data[0], // Spread the data from Minio
          email,
          password,
          firstName,
          lastName,
          role,
          countryCode,
          dateOfBirth,
          notifications,
          phone,
          profileImage
        };
        // apollo server is runnin on its own docker overlay network so we must adjust the endpoint
        /**
         * If you're running on Linux, 'host.docker.internal' might not work out of the box. In this case, you have two options:
            a. Use the host's network IP address (usually starts with 172.17.0.1) instead of 'host.docker.internal'.
            b. Add '--add-host=host.docker.internal:host-gateway' to your Docker run command.
            c. an example implmentation is in the readme.md
         */
        // 'host.docker.internal' is a special DNS name that resolves to the host machine's localhost on Docker for Windows and macOS.
        // Send the data to the signup endpoint
        const signupResponse = await fetch('http://host.docker.internal:3000/api/signup/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData),
        });
        const signupResult = await signupResponse.json();

        console.log("Signup result: ", signupResult);

        // Check the response from the signup endpoint
        if (signupResult.success) {
          return {
            success: true,
            message: "User registered successfully."
          };
        } else {
          return {
            success: false,
            message: signupResult.message || "Failed to register user."
          };
        }
    
      } catch (error) {
        console.error("Error in registerUser resolver:", error);
        return {
          success: false,
          message: "An error occurred during registration."
        };
      }
    }
  }
}

// helper for sorting and updating
async function updateCreateOrDeleteManySequelize(Model, data, foreignKey, foreignId) {
  // Get all existing records for this foreign key
  const existingRecords = await Model.findAll({
    where: { [foreignKey]: foreignId }
  });

  // Create a Set of existing IDs for quick lookup
  const existingIds = new Set(existingRecords.map(record => record.ID));

  // Create a Set of incoming IDs
  const incomingIds = new Set(data.filter(item => item.ID).map(item => item.ID));

  // Update or create records
  for (const item of data) {
    if (item.ID) {
      // If the item has an ID, update it
      await Model.update(item, { where: { ID: item.ID } });
      existingIds.delete(item.ID); // Remove from existingIds set
    } else {
      // If the item doesn't have an ID, create a new record
      await Model.create({ ...item, [foreignKey]: foreignId });
    }
  }

  // Delete records that weren't in the incoming data
  for (const idToDelete of existingIds) {
    if (!incomingIds.has(idToDelete)) {
      await Model.destroy({ where: { ID: idToDelete } });
    }
  }
}
module.exports = resolvers;
