const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
class LongActingInsulin extends Model {}

  LongActingInsulin.init({
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
    Dosage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    LastAdministered: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'LongActingInsulin',
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
  module.exports = LongActingInsulin
