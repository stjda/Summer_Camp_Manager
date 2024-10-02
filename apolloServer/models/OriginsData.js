const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');

const delay = (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

class OriginsData extends Model {}
// after a delay run a hook that links OriginsData ID to the camper table
  OriginsData.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    CamperID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Camper',
        key: 'ID'
      },
      unique: true
    },
    FirstName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    LastName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Gender: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DateOfBirth: {
      type: DataTypes.DATE, 
      allowNull: true
    },
    Mother: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Father: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    hooks: {
      afterCreate: async (record, options) => {
        let attempts = 5;
        while(attempts > 0){
          try {

            const Camper = record.sequelize.model('Camper');
            // Attempt to find the Camper on the primary database if possible
            const camper = await Camper.findOne({ where: { ID: record.CamperID } });

            if (!camper) {
              console.log("No camper found with that email, retrying...");
              attempts--;
              await delay(1000); // Wait for 1 second before the next attempt
              continue; // Skip to the next iteration of the loop
            }
           
            // Update the Camper's OriginsID with the new OriginsData ID
            const success = await camper.update({ OriginsID: record.ID });
            
            if(!success){
              console.log("Failed to update Camper, retrying...");
              attempts--;
              await delay(1000); // Wait for 1 second before the next attempt
              continue; // Skip to the next iteration of the loop
            }else{
              console.log(`Updated Camper ${camper.ID} with OriginsID: ${record.ID}`);
              console.log("success: ", success)
              break;
            }
          } catch (error) {
            console.error('Error updating Camper record:', error);
          }
        };
      }
    },
    sequelize,
    tableName: 'OriginsData',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID" },
        ]
      },
      {
        name: "CamperID",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CamperID" },
        ]
      },
    ],
  });
  module.exports = OriginsData
