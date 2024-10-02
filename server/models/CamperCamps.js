const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');

class CamperCamps extends Model {}

CamperCamps.init({
    CamperID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Camper',
        key: 'ID'
      }
    },
    CampID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Camps',
        key: 'ID'
      }
    }
  }, {
    sequelize,
    tableName: 'CamperCamps',
    timestamps: false,
    indexes: [
      {
        name: "CamperID",
        using: "BTREE",
        fields: [
          { name: "CamperID" },
        ]
      },
      {
        name: "CampID",
        using: "BTREE",
        fields: [
          { name: "CampID" },
        ]
      },
    ]
  });

module.exports = CamperCamps;