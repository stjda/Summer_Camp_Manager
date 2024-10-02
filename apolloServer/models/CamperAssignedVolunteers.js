const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
class CamperAssignedVolunteers extends Model {}

CamperAssignedVolunteers.init({
    PK: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CamperID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Camper',
        key: 'ID'
      }
    },
    VolunteerID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('VolunteerID');
        if (Array.isArray(rawValue)) return rawValue;
        if (typeof rawValue === 'string') return rawValue.split(',');
      },
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue('VolunteerID', val.join(','));
        } else {
          this.setDataValue('VolunteerID', val);
        }
      }
    },
    VolunteerType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('VolunteerType');
        if (Array.isArray(rawValue)) return rawValue;
        if (typeof rawValue === 'string') return rawValue.split(',');
      },
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue('VolunteerType', val.join(','));
        } else {
          this.setDataValue('VolunteerType', val);
        }
      }
    },
  }, {
    sequelize,
    tableName: 'CamperAssignedVolunteers',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PK" },
        ]
      },
      {
        name: "CamperID",
        using: "BTREE",
        fields: [
          { name: "CamperID" },
        ]
      },
      {
        name: "VolunteerID",
        using: "BTREE",
        fields: [
          { name: "VolunteerID" },
        ]
      },
    ]
  });
  module.exports = CamperAssignedVolunteers
