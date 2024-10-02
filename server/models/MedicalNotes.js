const sequelize = require('../config/connection.js'); // Ensure this points to your database connection settings
const { Model, DataTypes } = require('sequelize');
// new
class MedicalNotes extends Model {}

MedicalNotes.init({
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
            model: 'CareData', // This references the table name as defined in Sequelize
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
    NoteType: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Injury: {
        type: DataTypes.TEXT,
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
    UpdatedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    CamperID: {
        type: DataTypes.INTEGER,
        unique: false
    }
}, {
    hooks: {},
    sequelize,
    tableName: 'MedicalNotes',
    timestamps: false, // You're manually managing `CreatedDate` and `UpdatedDate`
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
module.exports = MedicalNotes;