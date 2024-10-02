const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
class BGTargets extends Model{}

  BGTargets.init({
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
    BGTargetBreakfast: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    BGTargetLunch: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    BGTargetDinner: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    BGTargetOther: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'BGTargets',
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
  module.exports = BGTargets;
