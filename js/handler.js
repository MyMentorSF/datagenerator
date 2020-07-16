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
    if (uuid == userTable[i].uuid)
      return userTable[i];
  }
  return null;
}

console.log(`Mentors: ${mentorList.length} Mentees: ${menteeList.length}`);

let privateUsers = "../private.json";
let appointments = "../appointments.json";
let connections = "../connections.json";
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
connectionsTable = [
  ...new Set(connectionsTable)
];
writeStream = fs.createWriteStream(connections);
writeStream.write(JSON.stringify(connectionsTable), "utf8");

// ======================Appointments=============================================================

amount = api.randomNumber(
  2,
  connectionsTable.length
);
while (appointmentTable.length < amount) {
  connectionsTable.forEach((connection) => {
    let tor = getUser(connection.mentorUUID);
    let tee = getUser(connection.menteeUUID);
    appointmentTable.push(api.scheduleAppointment(tor, tee));
  })
}
appointmentTable = [...new Set(appointmentTable)];
writeStream = fs.createWriteStream(appointments);
writeStream.write(JSON.stringify(appointmentTable), "utf8");
