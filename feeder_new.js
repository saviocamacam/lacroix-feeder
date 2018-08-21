let json = require('/Users/savio/Documents/cm/cm.json');
let axios = require('axios');

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

function readTextFile(file, callback) {
    console.log(Object.keys(json));

    axios.post('http://localhost:3000/api/county', {
            name: json['cidade'],
            external_id: json['codigo'],
            available: true
        })
        .then((countyResponse) => {
            console.log(countyResponse.data);
            axios.post('http://localhost:3000/api/institution', {
                    county: countyResponse.data._id,
                    name: 'SECRETARIA CAMPO MOURÃO',
                })
                .then((institutionResponse) => {
                    console.log(institutionResponse.data);
                    let escolas = json['escolas'];
                    escolas.forEach(e => {
                        if (e['nome'] == 'PARIGOT DE SOUZA, E M-EI EF') {
                            axios.post('http://localhost:3000/api/institution', {
                                    county: countyResponse.data._id,
                                    name: e['nome'],
                                })
                                .then((schoolResponse) => {

                                    console.log(Object.keys(e));
                                    turmas = e['turmas'];
                                    turmas.forEach(t => {
                                        let id = Object.keys(t);
                                        console.log(id);
                                        let infos = t[id]['infos'];
                                        // console.log(infos);

                                        axios.post('http://localhost:3000/api/classroom', {
                                                school: schoolResponse.data._id,
                                                external_id: e['codigo'],
                                                course: infos['Curso'],
                                                shift: infos['Turno'],
                                                subClass: infos['Turma'],
                                                series: infos['Seriação'],
                                                hour: infos['Horário'],
                                            })
                                            .then(function (response) {
                                                let alunos = t[id]['alunos'];
                                                alunos.forEach(a => {
                                                    axios.post('http://localhost:3000/api/enrollment/externalfeed', {
                                                            classroom: response.data._id,
                                                            a: a
                                                        })
                                                        .then(function (response) {
                                                            console.log(response.data);
                                                        })
                                                        .catch(function (error) {
                                                            console.log(error);
                                                        });
                                                });
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });
                                    });

                                })
                                .catch((schoolError) => {
                                    console.error(schoolError);
                                });

                        }
                    });

                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch(function (error) {
            console.log(error);
        });
}

//usage:
readTextFile("/Users/savio/Documents/cm/cm.json");