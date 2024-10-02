const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
class SpecialNeed extends Model {}

  SpecialNeed.init({
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
    SpecialNeedType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    SpecialNeedInstructions: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'SpecialNeed',
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
  module.exports = SpecialNeed
