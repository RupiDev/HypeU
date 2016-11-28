// we need to export the file

var Sequelize = require('sequelize');

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
                return true;
            },
            checkOrgAdmin: function(user, org) {
                var adminList = org.queryAdminList();
                    for (var i = 0; i < adminList.length; i++) {
                        if (adminList[i].email === this.email) {
                            return true;
                        }
                    }
            },
            checkOrgNameValid: function(orgName) {
                return orgName != null && orgName != "";
            },
            checkEmailValid: function(email) {
                return email != null && email != "";
            },
            checkEmailExists: function(email) {
                return User.findOne({ where: {email: email}});
            },
            checkOrgIDValid: function(orgID) {
                return Organization.findById(orgID);
            }
        },
        instanceMethods: {
            createOrganization: function(authToken, orgName) {
                var foundOrg = Organization.findOne({ where: {orgName: orgName} });
                if (!foundOrg) {
                    if (this.checkAuthTokenValid(authToken)) {
                        if (this.checkOrgNameValid(orgName)) {
                            if (this.checkOrgAdmin(this)) {
                                return Organization.create({orgName: orgName});
                            }
                        }
                    }
                }
                return null;
            },
            createEvent: function(authToken, orgID, name, description, date) {
                if (this.checkAuthTokenValid(authToken)) {
                    if (this.checkOrgIDValid(orgID)) {
                        var org = Organization.findById(orgID);
                        var event = Event.create({name: name, description: description, date: date});
                        var eventsList = org.getEvents();;
                        eventsList.append(event);
                        org.setEvents(eventsList);
                        return event;
                    }
                }
                return null;
            },
            setOrganizationEmail: function(email, organization) {
                if (this.checkEmailValid(email)) {
                    return organization.updateAttributes({ email: email});
                }
            },
            addUserAsAdmin: function(authToken, userEmail, orgID) {
                if (this.checkAuthTokenValid(authToken)) {
                    if (this.checkEmailValid && this.checkEmailExists) {
                        if (this.checkOrgIDValid(orgID)) {
                            var org = Organization.findById(orgID);
                            if (org) {
                                if (this.checkOrgAdmin(this)) {
                                       org.addAdminUser(this);
                                }
                            }
                        }
                    }
                }
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
    },
    email: {
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
        instanceMethods: {
            queryAdminList: function() {
                User.findAll({ where: { orgID: this.orgID } });
            },
            addAdminUser: function(user) {
                var adminList = this.queryAdminList();
                adminList.push(user);
                this.adminList = adminList;
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
    }}
 );
 
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

Organization.hasMany(User, {as: 'UserAdmin'})

// we might need to do this
// http://docs.sequelizejs.com/en/1.7.0/articles/express/#modelsindexjs

module.exports.sequelize = sequelize
module.exports.University = University
module.exports.Organization = Organization
module.exports.Event = Event
module.exports.User = User