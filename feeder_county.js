const statesJson = require("./states.json");
const countiesJson = require("./counties.json");
const axios = require("axios");
const paranaIdebJson = require("./ideb-pr/out.json");
const sereJson = require("../cm.json");

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

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
            .post(
              "http://localhost:3000/api/profile/county-institutional",
              county
            )
            .then(res => {
              // console.log(res.data.data.id);
              county_id = res.data.data.id;
              schools = paranaIdebJson["PARANÁ"][county.name];
              if (schools && county.name === "CAMPO MOURAO") { /* && county.name !== "CAMPO MOURAO" */
                console.log(county.name + "<<<")
                schoolsNames = Object.keys(schools);
                schoolsNames.forEach(async element => {
                  // console.log(element);
                  axios
                    .post(
                      "http://localhost:3000/api/profile/school-institutional", {
                        inep_properties: schools[element],
                        county_id: county_id,
                        name: element
                      }
                    )
                    .then(resSchool => {
                      // console.log("SchoolId " + resSchool.data.id_profile);
                    })
                    .catch(err => {
                      // console.error(err);
                    });
                });
              }
              // else
              // if (county.name === "CAMPO MOURAO") {
              //   console.log(county_id);
              //   console.log("Campo Mourão >>>");
              //   let escolas = sereJson["escolas"];
              //   escolas.forEach(escola => {
              //     console.log(escola["nome"]);
              //     axios
              //       .post(
              //         "http://localhost:3000/api/profile/school-institutional",
              //         {
              //           // inep_properties: {},
              //           county_id: county_id,
              //           name: escola["nome"]
              //         }
              //       )
              //       .then(
              //         resSchool => {
              //           // console.log(resSchool.data);

              //           turmas = escola["turmas"];
              //           turmas.forEach(turma => {
              //             let id = Object.keys(turma);
              //             // console.log(id);
              //             let infos = turma[id]["infos"];
              //             if (infos) {
              //               axios
              //                 .post("http://localhost:3000/api/classroom", {
              //                   school: resSchool.data.data.id_profile,
              //                   external_id: escola["codigo"],
              //                   course: infos["Curso"],
              //                   shift: infos["Turno"],
              //                   subClass: infos["Turma"],
              //                   series: infos["Seriação"],
              //                   hour: infos["Horário"]
              //                 })
              //                 .then(function(response) {
              //                   // console.log(response.data);
              //                   // let students = turma[id]["alunos"];
              //                   // students.forEach(student => {
              //                   //   axios
              //                   //     .post(
              //                   //       "http://localhost:3000/api/enrollment/externalfeed",
              //                   //       {
              //                   //         classroom:
              //                   //           response.data.data.classroom._id,
              //                   //         enrollment: student
              //                   //       }
              //                   //     )
              //                   //     .then(function(response) {
              //                   //       // console.log(response.data);
              //                   //     })
              //                   //     .catch(function(error) {
              //                   //       console.log(error);
              //                   //     });
              //                   // });
              //                   setTimeout(function() {}, 1500);
              //                 })
              //                 .catch(function(error) {
              //                   axios
              //                     .get(
              //                       "http://localhost:3000/api/profile/school-institutional"
              //                     )
              //                     .then(res => {
              //                       console.log(res.data.data);
              //                     })
              //                     .catch(err => {
              //                       console.log(">>>>>>>");
              //                       console.log(err);
              //                     });
              //                   // console.log("Catch Classroom >>>>>> ");
              //                 });
              //             } else {
              //               console.log("Classroom empty");
              //             }
              //           });
              //         },
              //         err => {
              //           console.log("Catch School >>>>>>>>>");
              //           // console.error(err);
              //         }
              //       );
              //   });
              // }
            });
        });
    }
  });
}

feedCounties();