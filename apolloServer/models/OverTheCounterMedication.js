const sequelize = require('../config/connection.js'); // Ensure this points to your database connection settings
const { Model, DataTypes } = require('sequelize');
// new
class OverTheCounterMedication extends Model {}

OverTheCounterMedication.init({
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    CareDataID: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        references: {
            model: 'CareData', // This assumes 'CareData' is the correct table name as defined in Sequelize
            key: 'ID'
        }
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
    MedicationName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ActiveIngredients: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    DosageAdult: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    DosageChild: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Uses: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    SideEffects: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    Warnings: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    CreatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    CreatedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    UpdatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Instructions: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    UpdatedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    CamperID: {
        type: DataTypes.INTEGER,
        unique: false
    },
}, {
    hooks: {},
    sequelize,
    tableName: 'OverTheCounterMedication',
    timestamps: false, // Since you're manually managing `CreatedDate` and `UpdatedDate`
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
          name: "CareDataID",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "CareDataID" },
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
      ]
    });

module.exports = OverTheCounterMedication;
