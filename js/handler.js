const api = require("./randomapi.js");

let userTable = [];
let connectionsTable = [];
let appointmentTable = [];
let mentorList = [];
let menteeList = [];
for (let i = 0; i < 60; i++) {
  let userReturn = api.randomPublicUser();
  let private = api.makePrivateUser(userReturn);
  delete private.mentors;
  delete private.mentees;
  delete private.agenda;
  userTable.push(private);
  if (private.isMentor) {
    mentorList.push(private);
  }
  if (private.isMentee) {
    menteeList.push(private);
  }
}

function getUser(uuid) {
  for (let i = 0; i < userTable.length; i++) {
    if (uuid == userTable[i].uuid) return userTable[i];
  }
  return null;
}

console.log(`Mentors: ${mentorList.length} Mentees: ${menteeList.length}`);

let privateUsers = "../private.json";
let appointments = "../appointments.json";
let connections = "../connections.json";
let frontEndUsers = "../frontend.json";
const fs = require("fs");

let writeStream = fs.createWriteStream(privateUsers);
writeStream.write(JSON.stringify(userTable), "utf8");

// ======================Connections=============================================================

let amount = api.randomNumber(
  2,
  Math.min(mentorList.length, menteeList.length)
);
while (connectionsTable.length < amount) {
  userTable.forEach((person) => {
    if (person.isMentee && connectionsTable.length < amount) {
      let ment = api.getRandomElement(mentorList);
      if (ment.username == person.username) {
        return;
      }
      connectionsTable.push(api.createConnection(ment, person));
    }
  });
}
connectionsTable = [...new Set(connectionsTable)];
writeStream = fs.createWriteStream(connections);
writeStream.write(JSON.stringify(connectionsTable), "utf8");

// ======================Appointments=============================================================

amount = api.randomNumber(2, connectionsTable.length);
while (appointmentTable.length < amount) {
  connectionsTable.forEach((connection) => {
    let tor = getUser(connection.mentorUUID);
    let tee = getUser(connection.menteeUUID);
    appointmentTable.push(api.scheduleAppointment(tor, tee));
  });
}
appointmentTable = [...new Set(appointmentTable)];
writeStream = fs.createWriteStream(appointments);
writeStream.write(JSON.stringify(appointmentTable), "utf8");

// ======================FrontEndUsers=============================================================

function getMentors(mentee) {
  return connectionsTable.filter((c) => c.menteeUUID === mentee.uuid);
}

function getMentees(mentor) {
  return connectionsTable.filter((c) => c.mentorUUID === mentor.uuid);
}

function getAppointments(user) {
  return appointmentTable.filter((a) => {
    a.host === user.username || a.guest === user.username;
  });
}

amount = connections.length;
let finalPrivate = [];
userTable.forEach((person) => {
  let p = JSON.parse(JSON.stringify(person))
  p.mentors = p.isMentee ? getMentors(p) : [];
  p.mentees = p.isMentor ? getMentees(p) : [];
  p.agenda = getAppointments(p);
  finalPrivate.push(p);
});
writeStream = fs.createWriteStream(frontEndUsers);
writeStream.write(JSON.stringify(finalPrivate), "utf8");
