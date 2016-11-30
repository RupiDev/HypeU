var db = require('./api/database');
var Promise = require('bluebird');

db.sequelize.sync({force: true}).then(() => {
    return db.University.create({name: 'VT'});
}).then(() => {
    return db.Organization.create({name: 'Test Org', hostUniversity: 1});
}).then(() => {
    return db.Event.create({name: 'Test Event', description: 'This is the first test event', date: 0, parentOrg: 1});
}).then(() => {
    return db.Event.create({name: 'Test Event 2', description: 'This is another test event', date: 0, parentOrg: 1});
}).then(() => {
    return db.User.create({name: 'Test User', email: 'testuser@vt.edu', passwordHash: ''});
}).then(() => {
    return db.User.create({name: 'Test User 2', email: 'testuser2@vt.edu', passwordHash: ''});
}).then(() => {
    return db.User.create({name: 'Test User 3', email: 'testuser3@vt.edu', passwordHash: ''});
}).then(() => {
    var user = db.User.findById(2);
    var org = db.Organization.findById(1);
    Promise.join(user, org, (user, org) => {
        org.addAdminUser(user);
    });
});
