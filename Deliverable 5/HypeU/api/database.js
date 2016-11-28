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
            checkOrgAdmin: function(user) {
                return Promise.resolve(user.orgAdminOf != null);
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
            createOrganization: function(authToken, orgName, universityID) {
                return Organization.findOne({ where: {name: orgName} }).then((foundOrg) => {
                    if (foundOrg) {
                        throw "org already exists";
                    }
                    return User.checkAuthTokenValid(authToken);
                }).then((authValid) => {
                    if(!authValid) {
                        throw "auth token not valid";
                    }
                    if (!User.checkOrgNameValid(orgName)) {
                        throw "org name not valid";
                    }
                    return User.checkOrgAdmin(this);
                }).then((isAdmin) => {
                    if(isAdmin) {
                        throw "user is already admin for another org";
                    }
                    return Organization.create({name: orgName, hostUniversity: universityID});
                }).then((org) => {
                    // Make this user the first admin of the new org
                    return org.addAdminUser(this);
                });
            },
            createEvent: function(authToken, orgID, name, description, date) {
                var org = Organization.findById(orgID);
                var valid = org.then((org) => {
                    return User.checkAuthTokenValid(authToken);
                }).then((authValid) => {
                    if(!authValid) {
                        throw "auth token not valid";
                    }
                    return User.checkOrgIDValid(orgID);
                });
                var event = Promise.join(org, valid, (org, isValid) => {
                    if(!isValid) {
                        throw "org id not valid";
                    }
                    return Event.create({name: name, description: description, date: date, parentOrg: org.orgID});
                });
                return Promise.join(org, event, (org, event) => {
                    return org.addEvent(event);
                }).then(() => {
                    return event;
                });
            },
            setOrganizationEmail: function(email, orgID) {
                if (!User.checkEmailValid(email)) {
                    return Promise.reject("email not valid");
                }
                return Organization.findById(orgID).then((org) => {
                    return org.updateAttributes({ email: email});
                });
            },
            addUserAsAdmin: function(authToken, userEmail, orgID) {
                var org = User.checkAuthTokenValid(authToken).then((authValid) => {
                    if (!authValid) {
                        throw "auth token not valid";
                    }
                    if (!User.checkEmailValid(userEmail)) {
                        throw "email not valid";
                    }
                    return User.checkEmailExists(userEmail);
                }).then((emailExists) => {
                    if(!emailExists) {
                        throw "admin email does not exist";
                    }
                    return User.checkOrgIDValid(orgID);
                }).then((orgValid) => {
                    if(!orgValid) {
                        throw "org id not valid";
                    }
                    return Organization.findById(orgID);
                });
                var isAdmin = org.then((org) => {
                    return User.checkOrgAdmin(this);
                });
                var user = Promise.join(org, isAdmin, (org, isAdmin) => {
                    if(!isAdmin) {
                        throw "current user is not admin";
                    }
                    return User.find({where: {email: userEmail}});
                });
                return Promise.join(org, user, (org, user) => {
                    if(user.orgAdminOf) {
                        throw "new user is already admin for an org";
                    }
                    return org.addAdminUser(user);
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
        instanceMethods: {
            queryAllEvents: function() {
                return Event.findAll({
                    include: [
                        {
                            model: Organization,
                            where: {
                                hostUniversity: this.universityID
                            }
                        }
                    ]
                });
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
    },
    hostUniversity: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    },
    latitude: {
        type: Sequelize.DECIMAL,
    },
    parentOrg: {
        type: Sequelize.INTEGER,
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
University.hasMany(Organization, {as: 'Orgs', foreignKey: 'hostUniversity'});

Organization.hasMany(Event, {as: 'Events', foreignKey: 'parentOrg'});
Event.belongsTo(Organization, {foreignKey: 'parentOrg'});
 
User.belongsToMany(Organization, { as: 'FollowsOrgs', through: 'UserOrganization'});
Organization.belongsToMany(User, { as: 'FollowingUsers', through: 'UserOrganization'});

User.belongsToMany(Event, { as: 'FollowsEvents', through: 'UserEvent'});
Event.belongsToMany(User, { as: 'FollowingUsers', through: 'UserEvent'});

Organization.hasMany(User, {as: 'AdminUsers', foreignKey: 'orgAdminOf'})

module.exports.sequelize = sequelize
module.exports.University = University
module.exports.Organization = Organization
module.exports.Event = Event
module.exports.User = User
