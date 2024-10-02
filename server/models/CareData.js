const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
class CareData extends Model {}

  CareData.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false
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
    CareType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    TargetBG: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CorrectionFactor: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    MDI: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    CGM: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    InsulinPump: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    InsulinPumpModel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    InsulinType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Allergies: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    EmergencyContact: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    hooks: {},
    sequelize,
    tableName: 'CareData',
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
    ]
  });
  module.exports = CareData
