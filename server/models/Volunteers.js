const sequelize = require('../config/connection.js');
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt')

const hashPassword = async (newUserData) => {
 if (newUserData.Password) {

  console.log("Volunteer password: ",newUserData.Password)

    const newPassword = await bcrypt.hash(newUserData.Password, 10);
    newUserData.Password = newPassword;
  } else {
    throw new Error('Password is required');
  }
};

class Volunteers extends Model {
  
  static async checkPassword(loginPw, email) {
    
    const user = await this.findOne({ where: { Email: email } });
    const hashedPassword = user.Password;
    // console.log(`Checking volunteer password, Login PW: ${loginPw}, Stored Hash: ${hashedPassword}`);
    return bcrypt.compareSync(loginPw, hashedPassword);
  }

}
  Volunteers.init({
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.STRING(100),
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
    VolunteerType: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    FirstName: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    LastName: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    DateOfBirth: {
      type: DataTypes.DATE, 
      allowNull: true
    },
    Notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Phone: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
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
    tableName: 'Volunteers',
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
    ]
  });
  module.exports = Volunteers
