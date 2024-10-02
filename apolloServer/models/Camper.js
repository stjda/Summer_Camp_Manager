const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt')


class Camper extends Model{

  static async checkPassword(loginPw, email) {
    const user = await this.findOne({ where: { Email: email } });
    const Password = user.Password;

    console.log(`Checking camper password, Login PW: ${loginPw}, Stored Hash: ${Password}`);

    return bcrypt.compareSync(loginPw, Password);

  }

  static delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  // this hook creates a careData table when its called from the newUser Route, its for linking the camper to care data
  static async associateCamperWithCareData(email, careData, attempts = 5) {
    while (attempts > 0) {  
      try {
        const Camper = this.sequelize.model("Camper");
        const camper = await Camper.findOne({ where: { email: email } });

        if (!camper) {
        console.log("No camper found with that email, retrying...");
        attempts--;
        await this.delay(1000); // Wait for 1 second before the next attempt
        continue; // Skip to the next iteration of the loop
      }

      const CareData = this.sequelize.model('CareData');
      const careDataWithCamperID = { ...careData, CamperID: camper.ID };
      console.log("Creating CareData with: ", careDataWithCamperID);

      const cd = await CareData.create(careDataWithCamperID);
      if (cd) {
        console.log("CareData created successfully, updating Camper.");
        await camper.update({ CareDataID: cd.ID });
        return cd;  // Successfully return the CareData instance
      }

      console.log("Failed to create CareData, retrying...");
      attempts--;
      await this.delay(1000); // Wait for 1 second before the next attempt

      } catch (error) {
        console.error('Error in associateCamperWithCareData:', error);
        attempts--;
        if (attempts <= 0) throw error; // Throw error after last attempt
        await this.delay(1000); // Wait for 1 second before the next attempt
      }
    }
  
    console.log("Unable to create or find CareData after all retries.");
    return null; // Return null if all retries are exhausted without success
  }
}
  Camper.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    Photo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Banner: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // validates email format will send back an error is its wrong 400 error
      }
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8],
        //is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // the plus means there needs to be just one regular expression 
      },
    },
    Notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Phone: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    Notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    OriginsID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'OriginsData',
        key: 'ID'
      },
      unique: true
    }
  }, {
    // When adding hooks via the init() method, they go below
    hooks: {
      beforeCreate: (user, options) => {
        if (user.Password) {
          user.Password = bcrypt.hashSync(user.Password, 10);
        }
      },
      beforeUpdate: (user, options) => {
        if (user.changed('Password')) {
          user.Password = bcrypt.hashSync(user.Password, 10);
        }
      }
    },
    sequelize,
    tableName: 'Camper',
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
        name: "OriginsID",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "OriginsID" },
        ]
      },
    ]
  });
  module.exports = Camper
