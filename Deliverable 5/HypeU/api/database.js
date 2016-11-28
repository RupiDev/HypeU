// we need to export the file

var Sequelize = require('sequelize');
var Promise = require('bluebird');

/**
 * Sets up a connection pool on initializtion.
 * Created with aid of Sequelize tutorial...
 */
var sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'hypeu.db'
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
    }}, 
    {
        classMethods: {
            checkAuthTokenValid: function(authToken) {
                return Promise.resolve(true);
            },
            checkOrgAdmin: function(user, org) {
                return org.queryAdminList().then((adminList) => {
                    for (var i = 0; i < adminList.length; i++) {
                        if (adminList[i].email === this.email) {
                            return true;
                        }
                    }
                    return false;
                })
            },
            checkOrgNameValid: function(orgName) {
                return orgName != null && orgName != "";
            },
            checkEmailValid: function(email) {
                return email != null && email != "";
            },
            checkEmailExists: function(email) {
                return User.findOne({ where: {email: email}}).then((user) => {
                    return user != null;
                });
            },
            checkOrgIDValid: function(orgID) {
                return Organization.findById(orgID).then((org) => {
                    return org != null;
                });
            }
        },
        instanceMethods: {
            createOrganization: function(authToken, orgName) {
                return Organization.findOne({ where: {orgName: orgName} }).then((foundOrg) => {
                    if (foundOrg) {
                        throw "org already exists";
                    }
                    return this.checkAuthTokenValid(authToken);
                }).then((authValid) => {
                    if(!authValid) {
                        throw "auth token not valid";
                    }
                    if (!this.checkOrgNameValid(orgName)) {
                        throw "org name not valid";
                    }
                    return this.checkOrgAdmin(this);
                }).then((isAdmin) => {
                    if(!isAdmin) {
                        throw "user is not org admin";
                    }
                    return Organization.create({orgName: orgName});
                });
            },
            createEvent: function(authToken, orgID, name, description, date) {
                var org = Organization.findById(orgID);
                var event = org.then((org) => {
                    return this.checkAuthTokenValid(authToken);
                }).then((authValid) => {
                    if(!authValid) {
                        throw "auth token not valid";
                    }
                    return this.checkOrgIDValid(orgID);
                }).then((isValid) => {
                    if(!isValid) {
                        throw "org id not valid";
                    }
                    return Event.create({name: name, description: description, date: date});
                });
                return Promise.join(org, event, (org, event) => {
                    return org.addEvent(event);
                });
            },
            setOrganizationEmail: function(email, orgID) {
                if (!this.checkEmailValid(email)) {
                    return Promise.reject("email not valid");
                }
                return Organization.findById(orgID).then((org) => {
                    return org.updateAttributes({ email: email});
                });
            },
            addUserAsAdmin: function(authToken, userEmail, orgID) {
                var org = this.checkAuthTokenValid(authToken).then((authValid) => {
                    if (!authValid) {
                        throw "auth token not valid";
                    }
                    if (!this.checkEmailValid(userEmail)) {
                        throw "email not valid";
                    }
                    return this.checkEmailExists(userEmail);
                }).then((emailExists) => {
                    if(!emailExists) {
                        throw "admin email does not exist";
                    }
                    return this.checkOrgIDValid(orgID);
                }).then((orgValid) => {
                    if(!orgValid) {
                        throw "org id not valid";
                    }
                    return Organization.findById(orgID);
                });
                var isAdmin = org.then((org) => {
                    return this.checkOrgAdmin(this);
                });
                return Promise.join(org, isAdmin, (org, isAdmin) => {
                    if(!isAdmin) {
                        throw "user is not admin";
                    }
                    return org.addAdminUser(this); // TODO not sure if using this will work
                })
            }
        }
    }
);

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
    }}, {
        instanceMethod: {
            queryAllEvents: function() {
                return Event.findAll({ where: { universityID: this.universityID } });
            }
        }
    }
);

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
    }},
    {
        classMethods: {
            checkAuthTokenValidForOrganization: function(authToken) {
                return Promise.resolve(true);
            }},
        instanceMethods: {
            queryAdminList: function() {
                return this.getAdminUsers();
            }
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
    longitude: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    latitude: {
        type: Sequelize.DECIMAL,
        allowNull: false
    }},
    {
    classMethods: {
        checkEventIDValid: function(eventID) {
            return Organization.findById(eventID).then((event) => {
                return event != null;
            });
        }        
        
    }   
});
 
/**
 * Foreign keys for User-Organization, User-Event, and User-University via "cross reference tables"
 */
University.hasMany(User, {as: 'Students'});
University.hasMany(Organization, {as: 'Orgs'});
Organization.hasMany(Event, {as: 'Events'});
 
User.belongsToMany(Organization, { as: 'FollowsOrgs', through: 'UserOrganization'});
Organization.belongsToMany(User, { as: 'FollowingUsers', through: 'UserOrganization'});

User.belongsToMany(Event, { as: 'FollowsEvents', through: 'UserEvent'});
Event.belongsToMany(User, { as: 'FollowingUsers', through: 'UserEvent'});

Organization.hasMany(User, {as: 'AdminUsers'});

// we might need to do this
// http://docs.sequelizejs.com/en/1.7.0/articles/express/#modelsindexjs

module.exports.sequelize = sequelize
module.exports.University = University
module.exports.Organization = Organization
module.exports.Event = Event
module.exports.User = User


