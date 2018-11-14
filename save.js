const statesJson = require("./states.json");
const countiesJson = require("./counties.json");
let sereJson = require("./data/cm.json");
const axios = require("axios");
const paranaIdebJson = require("./data/teste.json");

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

const API = "http://localhost:3000/api";

function feedCounties() {
  statesJson.forEach(async state => {
    if (state.id == "41") {
      // console.log(Object.keys(paranaIdebJson['PARANÁ']));
      counties = countiesJson
        .filter(v => {
          return v.state_id === state.id;
        })
        .forEach(county => {
          let county_id;
          county.name = county.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
          axios
            .post(API + "/profile/county-institutional", county)
            .then(res => {
              county_id = res.data.data.id;
              schools = paranaIdebJson["PARANÁ"][county.name];
              if (schools /*  && county.name !== "CAMPO MOURAO" */) {
                schoolsNames = Object.keys(schools);
                schoolsNames.forEach(async element => {
                  // console.log(element);
                  axios
                    .post(API + "/profile/school-institutional", {
                      // inep_properties: schools[element],
                      county_id: county_id,
                      name: element
                    })
                    .then(resSchool => {
                      console.log(resSchool.data);
                    })
                    .catch(err => {
                      console.error(err);
                    });
                });
              } else if (county.name === "CAMPO MOURAO") {
                let escolas = sereJson["escolas"];
                escolas.forEach(e => {
                  if (e["nome"] == "PARIGOT DE SOUZA, E M-EI EF") {
                    console.log(e["nome"]);
                    console.log(county_id);
                    axios
                      .post(API + "/profile/school-institutional", {
                        inep_properties: {},
                        county_id: county_id,
                        name: e["nome"]
                      })
                      .then(schoolResponse => {
                        console.log(Object.keys(e));
                        console.log(schoolResponse);
                        turmas = e["turmas"];
                        turmas.forEach(t => {
                          let id = Object.keys(t);
                          // console.log(id);
                          let infos = t[id]["infos"];
                          // console.log(infos);
                          axios
                            .post(API + "/classroom", {
                              school: schoolResponse.data.id_profile,
                              external_id: e["codigo"],
                              course: infos["Curso"],
                              shift: infos["Turno"],
                              subClass: infos["Turma"],
                              series: infos["Seriação"],
                              hour: infos["Horário"]
                            })
                            .then(function(response) {
                              let alunos = t[id]["alunos"];
                              alunos.forEach(a => {
                                axios
                                  .post(API + "/enrollment/externalfeed", {
                                    classroom: response.data._id,
                                    a: a
                                  })
                                  .then(function(response) {
                                    // console.log(response.data);
                                  })
                                  .catch(function(error) {
                                    console.log(error);
                                  });
                              });
                            })
                            .catch(function(error) {
                              console.log(error);
                            });
                        });
                      })
                      .catch(schoolError => {
                        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                        console.error(schoolError);
                      });
                  }
                });
              }
            });
        });
    }
  });
}

feedCounties();
