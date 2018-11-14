const statesJson = require("./states.json");
const countiesJson = require("./counties.json");
let sereJson = require("./data/cm.json");
const axios = require("axios");
const paranaIdebJson = require("./data/teste.json");

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

const url = "http://localhost:3000/api";
const headers = {
  headers: {
    "x-access-token":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InByb2ZpbGVzIjpbeyJwcm9maWxlVHlwZSI6IlByb2ZpbGVQcm9mZXNzb3IiLCJfaWQiOiI1YmIzZGY4MDljMzIzYzBiZDgzYTg1YzgifSx7InByb2ZpbGVUeXBlIjoiUHJvZmlsZVNjaG9vbCIsIl9pZCI6IjViYmE4Y2Y2MjlhNWIzMjExYzk0MWIyMCJ9LHsicHJvZmlsZVR5cGUiOiJQcm9maWxlU2Nob29sIiwiX2lkIjoiNWJiYWI4YmI1M2RlNjgzMDJmOTNhN2E1In0seyJwcm9maWxlVHlwZSI6IlByb2ZpbGVTdHVkZW50IiwiX2lkIjoiNWJiYmE5M2RhYTNhMDExZTRmMjE0NzY2In0seyJwcm9maWxlVHlwZSI6IlByb2ZpbGVQcm9mZXNzb3IiLCJfaWQiOiI1YmJiYjUwYzQxZjVkYTIzMTVjZWJlYjAifV0sIl9pZCI6IjViYjNkZTJjOWMzMjNjMGJkODNhODQwNCIsInNob3J0TmFtZSI6Im1hcmlhY2VsbWEiLCJwZW9wbGUiOnsiX2lkIjoiNWJiM2RlMmM5YzMyM2MwYmQ4M2E4NDAzIiwibmFtZSI6Ik1hcmlhIENlbG1hIGRlIE9saXZlaXJhIn19LCJpYXQiOjE1MzkxNzE4NDQsImV4cCI6MTUzOTM0NDY0NH0.5jN2uUTxPT9oZelRcKJ262n1sVTtDHZwygwmnmOXzmM"
  }
};

async function updateIdebProperties(county) {
  try {
    let escolas = await axios.get(
      `${url}/profile/school-institutional?countyInstitutional=${county}`
    );
    schools = paranaIdebJson["PARANÁ"]["CAMPO MOURAO"];
    escolas.data.data.schools.forEach(async element => {
      let escola = schools[element.institution.name];
      console.log(element._id);
      console.log(escola.id);

      let response = await axios.put(
        `${url}/profile/school-institutional/${element._id}`,
        { inep_properties: escola },
        headers
      );
      console.log(response.data.data);
    });
  } catch (error) {
    // console.error(error);
  }
}

updateIdebProperties("5bb3deda9c323c0bd83a8441");
