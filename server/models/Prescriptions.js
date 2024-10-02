const sequelize = require('../config/connection.js'); // Ensure this points to your database connection settings
const { Model, DataTypes } = require('sequelize');

class Prescriptions extends Model {}

Prescriptions.init({
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    CareDataID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
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
    MedicineName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    GenericName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Form: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Refills: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Dosage: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Frequency: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    PrescribedFor: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    SideEffects: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Interactions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Instructions: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PrescriptionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    CreatedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    UpdatedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    },
    CamperID: {
        type: DataTypes.INTEGER,
        unique: false
    },
}, {
    hooks: {},
    sequelize,
    tableName: 'Prescriptions',
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
          name: "CamperID",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "CamperID" },
          ]
        },
      ]
    });

module.exports = Prescriptions;
