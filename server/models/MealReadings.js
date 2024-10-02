const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');

class MealReadings extends Model {
  // Static method to update TimeLabel based on UnixTime
  static async updateTimeLabel() {
    const t = await sequelize.transaction();

    try {
      const currentUnixTime = Math.floor(Date.now() / 1000);
      const twentyFourHoursAgo = currentUnixTime - 86400; // 24 hours in seconds
      const fortyEightHoursAgo = currentUnixTime - 172800; // 48 hours in seconds

      const [updatedCount] = await MealReadings.update(
        {
          TimeLabel: sequelize.literal(`CASE 
            WHEN UnixTime >= ${twentyFourHoursAgo} THEN 'within24'
            WHEN UnixTime >= ${fortyEightHoursAgo} THEN 'within48'
            ELSE TimeLabel
          END`)
        },
        {
          where: {
            UnixTime: { [Op.gte]: fortyEightHoursAgo }
          },
          transaction: t
        }
      );

      await t.commit();
      console.log(`Updated ${updatedCount} records.`);
      return updatedCount;
    } catch (error) {
      await t.rollback();
      console.error('Error updating TimeLabel:', error);
      throw error;
    }
  }
}

MealReadings.init({
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
    CamperID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Camper',
        key: 'ID'
      },
      unique: true
    },
    DateTaken: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    TimeLabel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    UnixTime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    CarbAmount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    GlucoseReading:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Meal: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ImageIdentifier: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'MealReadings',
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
  module.exports = MealReadings
