const api = require("./randomapi.js");

let userTable = [];
let connectionsTable = [];
let appointmentTable = [];
let mentorList = [];
let menteeList = [];
for (let i = 0; i < 40; i++) {
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

console.log(`Mentors: ${mentorList.length} Mentees: ${menteeList.length}`);

let privateUsers = "../private.json";
let appointments = "../appointments.json";
let connections = "../connections.json";
const fs = require("fs");

let writeStream = fs.createWriteStream(privateUsers);
writeStream.write(JSON.stringify(userTable), "utf8");

let amount = api.randomNumber(
  1,
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
