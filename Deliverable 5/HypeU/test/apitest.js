
/**
 * Test around the API
 * 
 * To run tests in command window:
 * node_modules/mocha/bin/mocha
 */

'use strict'

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const SequelizeMocking = require('sequelize-mocking').SequelizeMocking;
const Promise = require('bluebird');

describe("API Testing (using SequelizeMocking) - ", function () {
    const database = require('../api/database.js');
    const service = require('../api/index.js');
    const User = database.User;
    const Organization = database.Organization;
    const Event = database.Event;

    // Basic configuration: create a sinon sandbox for testing
    let sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox && sandbox.restore();
    });

    // Load fake data for the users
    let sequelizeInstance = null;

    beforeEach(function (done) {
        SequelizeMocking
            .createAndLoadFixtureFile(database.sequelize, 
            path.resolve(path.join(__dirname, './fake-db.json')))
            .then(function (mockedSequelizeInstance) {
                sequelizeInstance = mockedSequelizeInstance;
                done();
            })
            .catch(done);
    });

    afterEach(function (done) {
        SequelizeMocking
            .restore(sequelizeInstance)
            .then(function () {
                done();
            })
            .catch(done);
    });
    
    /**
     * Checks if getting user from authtoken
     */
    describe('Getting a user from an authtoken', function () {
        it('exist', function () {
           chai.expect(service.getUserFromAuthToken(27300)).to.exist;
        });
    });
    
    /**
     * Checks if authtoken is valid
     */
    describe('Checking authtoken', function () {
       it('is valid', function () {
           chai.expect(User.checkAuthTokenValid(27300)).to.exist;
        });
    });
    
    /**
     * Checks if orgName is valid
     */
    describe('Checking orgName', function () {
       it('is valid', function () {
           chai.expect(User.checkOrgNameValid("hello")).to.exist;
        });
    });
    
    /**
     * Checks if email is valid
     */
    describe('Checking email is Valid', function () {
       it('is valid', function () {
           chai.expect(User.checkEmailValid("email@email.com")).to.exist;
        });
    });
    
    /**
     * Checks if email exists
     */
    describe('Checking email is Exists', function () {
       it('exists', function () {
           chai.expect(User.checkEmailExists("email@email.com")).to.exist;
        });
    });
    
    /**
     * Checks if orgID is valid
     */
    describe('Checking orgID', function () {
       it('is valid', function () {
           chai.expect(User.checkOrgIDValid(1)).to.exist;
        });
    });
    
    /**
     * Checks if authtoken is valid
     */
    describe('Checking authtoken for organization', function () {
       it('is valid', function () {
           chai.expect(Organization.checkAuthTokenValidForOrganization(27300)).to.exist;
        });
    });
    
    /**
     * Checks if eventID is valid
     */
    describe('Checking eventID', function () {
       it('is valid', function () {
           chai.expect(Event.checkEventIDValid(1)).to.exist;
        });
    });
    
    /**
     * Creating Organization Test 1
     */
    describe('Creating organization', function () {
        it('org is created', function() {
            User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300}).then((user) => {
                return User.createOrganization(user.authToken, "CS Club");
            }).then(function (org) {
                chai.expect(org).deep.equals([{
                    "orgID": 1,
                    "name": "CS Club"
                }]);
            });
        });
        
        it('org already exists', function() {
            User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300}).then((user) => {
                return User.createOrganization(user.authToken, "CS Club");
            }).then(function (org) {
                return User.createOrganization(user.authToken, "CS Club");
            }).catch((error) => {
                chai.expect(error).to.equal("org already exists");
            })
        });

        it('org name not valid', function() {
            User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300}).then((user) => {
                return User.createOrganization(user.authToken, "");
            }).catch((error) => {
                chai.expect(error).to.equal("org name not valid");
            })
        });

        it('user admin for multiple orgs', function() {
            User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300}).then((user) => {
                return User.createOrganization(user.authToken, "CS Club");
            }).then((org) => {
                return User.createOrganization(user.authToken, "Basket Weaving Club");
            }).catch((error) => {
                chai.expect(error).to.equal("user is already admin for another org");
            })
        });
    });
    
    
    /**
     * Create Event
     */
    describe('Creating event', function () {
        it('event is created', function () {
            User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300}).then((user) => {
                return User.createOrganization(user.authToken, "CS Club");
            }).then((org) => {
                return User.createEvent(user.authToken, org.orgID, "CS Club First Meeting", "Code Party", 0)
            }).then((event) => {
                chai.expect(event).deep.equals([{
                    "eventID": 1,
                    "name": "CS Club First Meeting",
                    "description": "Code Party"
                }]);
            })
        });
        
        it('org id not valid', function() {
            User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300}).then((user) => {
                return User.createOrganization(user.authToken, "CS Club");
            }).then((org) => {
                return User.createEvent(user.authToken, -1, "CS Club First Meeting", "Code Party", 0)
            }).catch((error) => {
                chai.expect(error).to.equal("org name not valid");
            });
        });
    });
    
    /**
     * Add user as admin
     */
    describe('Adding user as admin', function () {
        it('user is added', function () {
            var user = User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300});
            var org = user.then((user) => {
                return User.createOrganization(user.authToken, "NodeJS Fan Club");
            });
            var user2 = User.create({ userID: 2, name: "Bob the Builder", email: "buildingCS@BobtheCompiler.com", passwordHash: "password123", authToken: 27300});
            var userAdded = Promise.join(user, org, user2, (user, org, user2) => {
                return user.addUserAsAdmin(user.authToken, user2.email, org.orgID);
            });
            Promise.join(user2, userAdded, (user2, org) => {
                chai.expect(user2.orgAdminOf).to.equal(1);
            });
        });
    });
     
    /**
     * Set organization email
     */
    describe('Setting Organization Email', function () {
        it('organization email is set', function() {
            var user = User.create({ userID: 1, name: "John Smith", email: "john@smith.com", passwordHash: "password123", authToken: 27300});
            var org = user.then((user) => {
                return user.createOrganization(user.authToken, "Cool Squad");
            })
            Promise.join(user, org, (user, org) => {
                return user.setOrganizationEmail("ilovekabobs@gmail.com", org.orgID);
            }).then((org) => {
                chai.expect(org.email).to.equal("ilovekabobs@gmail.com");
            });
        });
    });
});