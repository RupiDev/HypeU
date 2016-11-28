// Implements REST api

module.exports.runRestServer = runRestServer;

var database = require("./database");

var restify = require("restify");

var server = restify.createServer();

// allows you to parse the query parameters in the URL
server.use(restify.queryParser());

// this allows you to parse the body of what you posted 
server.use(restify.bodyParser()); 

// allows AJAX requests from the web server
server.use(restify.CORS());

// this is the function that will run the server
function runRestServer(port) {
    database.sequelize.sync().then(() => {
        server.listen(port, () => {
            console.log('rest server running on port %s', port);
        });
    });
}

// this method will return a promise, and in order to get the
// the user object we have to fufill the promise whenever we call it. 
function getUserFromAuthToken(authToken)
{
    var promise = database.User.findById(1); // we will return the method 
    return promise; 
 
}
   // promise.then(function(user) {
    //     user.whatever;
    // })

// GET
// no auth token needed,
// need to query based on unviersity ID, and then get university, and do findAll
// on that university

// This is a GET Method
// In this method we will get all the events based on the specified university ID
// We will return a json object for events
function eventGetter(req, res, next)
{
    // first need to make a query
    // then you are getting 
    database.University.find({
        where: {
            universityID: req.params.universityID
        }
    }).then(function(university) {
        university.queryAllEvents().then(function(events) {
            res.json({
                success: 1,
                events: events // this will get the events 
            });
            next();
        }).catch(function(error){
            console.log("Error is received by querying for all the events based one University");
            res.json(400, {success: 0});
        });
    })
    .catch(function(error){
        console.log("Error is received by getting University ID " + error);
        res.json(400, {success: 0});
    });
}
server.get('/all_events', eventGetter);

// Post Event
// This method will let a user create an organization
// This will return a json object either of success or failure and an orgID
function creatingOrganization(req, res, next)
{
    var promise = getUserFromAuthToken(req.params.authToken);
    promise.then(function(user) 
    {
         user.createOrganization(req.params.authToken, req.params.orgName);
         res.json({success: 1, orgID: req.params.orgID});
         next();
    })
    .catch(function(error)
    {
        console.log("Error in creating organization");
        res.json(400, {success: 0});
    });
}
server.post('/orgs/create', creatingOrganization);

// Post event
// This method will let a user create an event
// This will return a json object either of success or failure and eventID
function creatingEvent(req, res, next)
{
    var promise = getUserFromAuthToken(req.params.authToken);
    
    promise.then(function(user)
    {
        user.createEvent(req.params.authToken, req.params.orgID, req.params.name, req.params.description, req.params.date);
        res.json({success: 1, eventID: req.params.event_id});
    })
    .catch(function(error)
    {
        console.log("There has been an error in creating an event");
        res.json(400, {success: 0});
    });
}
server.post('/events/create', creatingEvent);


// PUT - used to update
// This method will allow a user to add an admin
// This will return a json object either of success or failure and authtoken
function addingAdmins(res, req, next)
{
    // this is the query
    /*User.findAll({
        where: {
            userID: req.param.ID
        }
    }).then(function(users){
        var user = users[0];
        user.set("adminOrgID", req.body.adminOrgID);
        user.save();
        res.send(200);
    })
    .catch(function(error){
        console.log("Cool Error");
        res.send(400);
    });*/
    
    var promise = getUserFromAuthToken(req.params.authToken);
    promise.then(function(user){
        user.addUserAsAdmin(req.params.authToken, req.params.email, req.params.orgID);
        res.json({success: 1, authToken: req.params.authToken});
    })
    .catch(function(error){
        console.log("There has been an error in adding the specified user as an admin");
        res.json(400, {success: 0});
    });
}
server.put("/orgs/ID/admins/add", addingAdmins);


// POST
// This method is used to login, basically used as a dummy method
// Returns a json object with success and authToken
function logIn(req, res, next)
{
    res.json({success: 1, authToken: req.params.authToken});
    // dummy method for log in
}
server.post('/login', logIn);

// POST
// This method is used to logout, basically used as a dummy method
// Returns a json object with true
function logOut(req, res, next)
{
    // dummy method for log out
    res.json({sucess: 1});
}
server.post('/logout', logOut);

module.exports = service;
