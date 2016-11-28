// we need to export the file

var Sequelize = require('sequelize');

/**
 * Sets up a connection pool on initializtion.
 * Created with aid of Sequelize tutorial...
 */
var sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'|'mariadb'|'sqlite'|'postgres'|'mssql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

/**
 * Database table for User
 */
var User = sequelize.define('user', {
    userID: {
        type: Sequelize.INTEGER,
        field: 'user_id',
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    passwordHash: {
        type: Sequelize.STRING,
        field: 'password_hash',
        allowNull: false
    },
    authToken: {
        type: Sequelize.INTEGER,
        field: 'auth_token'
    },
    universityID: {
        // Is this necessary? Since the FK will be set with belongTo/hasOne/hasMany, etc.
        type: Sequelize.INTEGER,
        field: 'university_id',
        allowNull: false
    },
    adminOrgID: {
        // Is this necessary? Since the FK will be set with belongTo/hasOne/hasMany, etc.
        type: Sequelize.INTEGER,
        field: 'admin_org_id'
    }
});

/**
 * Database table for university
 */
var University = sequelize.define('university', {
    universityID: {
        type: Sequelize.INTEGER,
        field: 'university_id',
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

/**
 * Database table for organization
 */
 var Organization = sequelize.define('organization', {
     orgID: {
         type: Sequelize.INTEGER,
         field: 'org_id',
         primaryKey: true,
         autoIncrement: true
     },
     name: {
         type: Sequelize.STRING,
         allowNull: false
     },
     description: {
         type: Sequelize.TEXT
     },
     universityID: {
        // Is this necessary? Since the FK will be set with belongTo/hasOne/hasMany, etc.
        type: Sequelize.INTEGER,
        field: 'university_id',
        allowNull: false
    }
 });
 
/**
 * Database table for event
 */
 var Event = sequelize.define('event', {
     eventID: {
         type: Sequelize.INTEGER,
         field: 'event_id',
         primaryKey: true,
         autoIncrement: true
     },
     name: {
         type: Sequelize.STRING,
         allowNull: false
     },
     description: {
         type: Sequelize.TEXT
     },
     date: {
         type: Sequelize.DATE,
         allowNull: false
     },
     location: {
         type: Sequelize.STRING, // type = string?
         allowNull: false
     },
     orgID: {
        // Is this necessary? Since the FK will be set with belongTo/hasOne/hasMany, etc.
        type: Sequelize.INTEGER,
        field: 'org_id',
        allowNull: false
    }
 });
 // do we need a user for the event
 // yeah we do
 
/**
 * Foreign keys for User-Organization, User-Event, and User-University via "cross reference tables"
 */
User.hasMany(Organization, {through: 'User', foreignKey: 'orgID'});
Organization.hasMany(User, {through: 'Organization', foreignKey: 'userID'});

User.hasMany(Event, {through: 'User', foreignKey: 'eventID'});
Event.hasMany(User, {through: 'Event', foreignKey: 'userID'});

User.hasOne(University, {foreignKey: 'universityID'});
University.belongsTo(User, {foreignKey: 'userID'}); // this seems incorrect? since university does not have a userID?

// we might need to do this
// http://docs.sequelizejs.com/en/1.7.0/articles/express/#modelsindexjs
//module.exports = db;
