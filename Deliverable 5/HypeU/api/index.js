// Implements REST api

/*function runRestServer() {
    console.log('running REST server')
}

module.exports.runRestServer = runRestServer*/


var restify = require("restify");

var server = restify.createServer();

// allows you to parse the query parameters in the URL
server.use(restify.queryParser());

// this allows you to parse the body of what you posted 
server.use(restify.bodyParser()); 

// GET
function eventGetter(req, res, next)
{
    res.json({
        events: [Event.findAll({})] // this will get the events 
    });
    next();
}
server.get('/events', eventGetter);

// GET
function getEventFollower(req, res, next)
{
    res.json({
        events: [Event.getUser ] // or something like that, we need to add the user]
    })
}
server.get('/events/:ID/follow?user=USERID', getEventFollower);

// Post Event
function creatingOrganization(req, res, next)
{
    var organization = Organization.create({
        orgID: "sdlfkj",
        name: "sfdslkj",
        description: "sldkfj",
        universityID: "85743"
        // make data correct
    });
    
    organization.save()
    .then(function() 
    {
         res.send(200); // this indicates success
    })
    .catch(function(error)
    {
        console.log(error + " bet");
        res.send(400);
    });
    

}
server.post('/orgs/create', creatingOrganization);

// Post event
function creatingEvents(req, res, next)
{
    var event = Event.create({
        eventID: "sdf",
        name: "asdf",
        description: "sdfsdf",
        data: "sdfsf",
        location: "sdfsf",
        orgID: "sdfsdf"
        
        // make data correct based on type in the database
    });
    
    event.save()
    .then(function()
    {
        res.send(200) // success  
    })
    .catch(function(error)
    {
        console.log(error + "Lamp");
        res.send(400) // error
    });
}
server.post('/events/create', creatingEvent);


// PUT - used to update
//12: PUT  /orgs/ID/admins/add
// first query the database
// then update it, using the query parameters
// then save it

function addingAdmins(res, req, next)
{
    // this is the query
    User.findAll({
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
    });
}



// GET
function logIn(req, res, next)
{
    // dummy method for log in
}

server.get('/logIn', logIn);

// GET
function logOut(req, res, next)
{
    // dummy method for log out
}

server.get('/logOut', logOut);



