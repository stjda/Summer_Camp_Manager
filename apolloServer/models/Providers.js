const sequelize = require('../config/connection.js'); // Ensure this points to your database connection settings
const { Model, DataTypes } = require('sequelize');
// new
class Provider extends Model {}

Provider.init({
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    CareDataID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'CareData', // Ensure 'CareData' is correctly defined and migrated in Sequelize
            key: 'ID'
        }
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
    Role: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Phone: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    CreatedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    UpdatedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    },
    CamperID: {
        type: DataTypes.INTEGER,
        unique: false
    }
}, {
    hooks: {},
    sequelize,
    tableName: 'Providers',
    timestamps: false, // Manually handling timestamps with CreatedDate and UpdatedDate
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

module.exports = Provider;
