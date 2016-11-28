/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const SequelizeMocking = require('sequelize-mocking').SequelizeMocking;

describe('User - UserService (using SequelizeMocking) - ', function () {
    const database = require('../api/database.js');
    const service = require('../api/index.js');

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
            .createAndLoadFixtureFile(database.getInstance(), path.resolve(path.join(__dirname, './fake-db.json')))
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
     * Test Case #1: getUserFromAuthToken
     */
    describe('get authtoken from user will', function () {
        it('exist', function () {
           chai.expect(service.getUserFromAuthToken(27300)).to.exist;
        });
        
        it('shall return the user of the authtoken', function () {
            return service
                .getUserFromAuthToken(27300)
                .then(function (user) {
                    chai.expect(user).deep.equals([{
                        "userID": 1,
                        "name": "John Smith",
                        "email": "john@smith.com",
                        "passwordHash": "password123",
                        "authToken": 27300
                    }]);
                });
        });
    });

    
    
});

