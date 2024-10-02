const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
class InsulinCarbRatios extends Model {}

  InsulinCarbRatios.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CareDataID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'CareData',
        key: 'ID'
      },
      unique: true
    },
    TimeLabel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RatioBreakfast: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RatioLunch: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RatioDinner: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'InsulinCarbRatios',
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
        name: "CareDataID",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CareDataID" },
        ]
      },
    ]
  });
  module.exports = InsulinCarbRatios
