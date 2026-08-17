var express = require("express");
var multer  = require('multer');
var axios = require('axios');
var path = require("path");
var fs = require('node:fs');
var app = express();
var archiver = require("archiver");
var Users={};
var token;
var service = "www";

/////////////////////////
var word = ["a","b","w","c","d","e","f","g","h","j","y","z"];
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var occUser = {
    user_15514575: "basak",
    user_15513246: "melike",
    user_9244372: "melike",
    user_15432145: "irem",
    user_7729542: "kamil",
    user_2521680: "demet",
    user_12621116: "goknur",
    user_15480368: "cansu",
    user_7729545: "tuncay",
    user_20: "gulcin",
    user_15515696: "bahar",
    user_15517168: "duygu",
    user_12896817: "taner",
    user_15944889: "deniz",
    user_15939315: "oyku"
}
/////////////////////////

/* Sabit dosyaları kopyalama */
var templateImages = [
    "butonback.png",
    "closebtn.png",
    "directiveplay.png",
    "directivestop.png",
    "paint_easer.png",
    "draw_icon.png",
    "draw_easer.png",
    "sp_pause.png",
    "sp_play.png",
    "sp_return.png",
    "record_off.png",
    "record_on.png",
    "color.png",
    "clean.png",
    "arrow.png"
];

async function copyTemplateImages(imgFolder) {
    await Promise.all(templateImages.map(function(fileName) {
        return copyFile(
            path.join(__dirname, "assets/img/template", fileName),
            path.join(imgFolder, fileName)
        );
    }));
}

// Klasörlerin erşim izinleri verildi..
app.use("/libs", express.static(__dirname + "/node_modules"));
app.use('/files', express.static('files'));
app.use('/assets', express.static('assets'));

app.use(express.json({ limit: '11mb' }));
app.use(express.urlencoded({ extended: true, limit: '11mb' }));

function getOccJwt(req){
    var authHeader = req.headers.authorization || "";
    if(authHeader.indexOf("Bearer ") === 0){
        return authHeader.substring(7);
    }

    return "";
}

function getOccAuthHeaders(jwt){
    var headers = {
        "x-accept-version": 1
    };

    if(jwt){
        headers.Authorization = "Bearer " + jwt;
    }

    return headers;
}

require("./serverRubrik")(app, {
    axios: axios,
    getService: function(){
        return service;
    },
    getOccJwt: getOccJwt,
    getOccAuthHeaders: getOccAuthHeaders
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var token = req.query.token || req.body.token;
        var FD = Users[token];

        if (!FD || !FD.files || !FD.files.imgFolder) {
            return cb(new Error("Upload klasörü bulunamadı."));
        }

        cb(null, FD.files.imgFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
    limits: {
        fileSize: 11 * 1024 * 1024 // 10 MB
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 11 * 1024 * 1024 // 11 MB
    }
});

function getZip(filename, folder, token){
    return new Promise(function(resolve, reject){
        var FD = Users[token];

        var zipName = path.join(FD.root, filename +".zip");
        var output = fs.createWriteStream(zipName);
        var archive = archiver('zip');
        output.on("close", function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve(zipName);
        });

        archive.on("error", function(err){
            reject(err);
        });

        archive.pipe(output);
        archive.directory(folder, false);
        archive.directory('subdir/', 'new-subdir');
        archive.finalize();
    })
}

function addFolder(target){
    return new Promise(function(resolve, reject){
        try{
            if (!fs.existsSync(target)) {
                fs.mkdirSync(target);
            }

            resolve(target);
        }catch(err){
            console.error("Klasör oluşturma hatası:", err);
            reject(err);
        }
    })
}

function copyFolder(source, target){
    console.log("source:", source);
    console.log("target:", target);
    return new Promise(function(resolve, reject){

        fs.cp(source, target, {recursive: true}, (err) => {
            if (err) {
                resolve(false);
            }else{
                resolve(true);
            }
        });
    })
}

function deleteFolder(target){
    return new Promise(function(resolve, reject) {
        fs.rm(target, { recursive: true, force: true }, err => {
            if (err) {
                //throw err;
                resolve(err);
            }
            resolve(target);
        });
    });
}

function createJson(json, data, flag){
    console.log("createJson");
    return  new Promise(function(resolve, reject){
        fs.writeFile(json, JSON.stringify(data), flag, function(err){
            if (err) {
                console.error("JSON yazma hatası:", err);
                reject(err);
            } else {
                resolve({data:data, path:json});
            }
        });
    })
}

function readFileList(json){
    return new Promise(function(resolve, reject){
        fs.readFile(json, "utf8", function (err, data) {
            if (err) {
                if (err.code === "ENOENT") {
                    return resolve(false);
                }

                console.error("Dosya okuma hatası:", err);
                return reject(err);
            }

            if(!data){
                return resolve(false);
            }

            try {
                resolve(JSON.parse(data));
            } catch (parseError) {
                console.error("fileList.json parse hatası:", parseError);
                reject(parseError);
            }
        });
    })
}

//Modified Main File List
app.post("/modifiedFilelist", modifiedFilelistFNC);
async function modifiedFilelistFNC(req, res){
    console.log("Modified File List");
    var FD = Users[req.body.token];
    console.log( req.body);
    var data = JSON.parse(req.body.newList);
    FD.fileList = await createJson( FD.fileList.path, data, {encoding:"utf8", flag:"w"});
    res.send(FD);
    console.log("-----Modified File List------");
}


//Create New File
app.post("/createNewFile", createNewFileFNC);
async function createNewFileFNC(req, res){
    console.log("-- CREATE NEW START--");
    var FD = Users[req.body.token];
    var data = JSON.parse(req.body.data);
    FD.files = {activeFile: data.fileName};
    FD.files.mainFolder = await addFolder( path.join(FD.root, data.fileName) );
    FD.files.imgFolder = await addFolder( path.join(FD.files.mainFolder, "img") );

    console.log("///////////");
    console.log(FD);
    console.log("///////////");
    var addList = listAddFile(FD, data);
    FD.files.mainJson = await createJson( path.join(FD.files.mainFolder, data.fileName+".json"), data, {encoding:"utf8", flag:"w"});
    FD.fileList = await createJson( FD.fileList.path, addList, {encoding:"utf8", flag:"w"});
    res.send(FD);
    await copyTemplateImages(FD.files.imgFolder);
    console.log("-- CREATE NEW FINISH--");
}

//SaveDataFNC
app.post("/saveData", saveDataFNC);
/*
async function saveDataFNC(req, res){
    console.log("-- SAVE DATA START--");
    var stringJSON = JSON.parse(req.body.stringJSON);
    var FD = Users[req.body.token];
    FD.files.mainJson = await createJson(FD.files.mainJson.path, stringJSON, {encoding:"utf8", flag:"w"});
    res.send({response: FD, success: true});
    console.log("-- SAVE DATA FINISH--", FD.files.mainJson.path);
}
*/

async function saveDataFNC(req, res){
    console.log("-- SAVE DATA START--");

    var FD = Users[req.body.token];

    if (!FD || !FD.files || !FD.files.mainJson) {
        return res.status(400).send({
            success: false,
            message: "Aktif dosya yok. Önce dosya seçilmeli veya oluşturulmalı."
        });
    }

    var stringJSON = JSON.parse(req.body.stringJSON);

    FD.files.mainJson = await createJson(
        FD.files.mainJson.path,
        stringJSON,
        { encoding:"utf8", flag:"w" }
    );

    res.send({ response: FD, success: true });
    console.log("-- SAVE DATA FINISH--", FD.files.mainJson.path);
}

//Select File
app.post("/selectFile", selectFileFNC);
async function selectFileFNC(req, res){
    var FD = Users[req.body.token];
    var selectedFile = req.body.selectedFile;
    console.log("-------------");
    console.log("selectedFile:", selectedFile);

    if(FD.fileList.data[selectedFile]){
        FD.files = FD.fileList.data[selectedFile].files;
        FD.files.data = await readFileList(FD.files.mainJson.path);
        await copyTemplateImages(FD.files.imgFolder);
        res.send({success: true, FILE: FD});
    }else{
        res.send({success: false});
    }
}

//Delete File
app.post("/deleteFolder", deleteFolderFNC);
async function deleteFolderFNC(req, res){
    console.log("-- DELETE START--");
    var FD = Users[req.body.token];
    var deleteFile = req.body.deleteFile;
    var foundDeleteFile = FD.fileList.data[deleteFile];

    if(foundDeleteFile){
        var sonuc = await deleteFolder(FD.fileList.data[deleteFile].files.mainFolder);
        delete FD.fileList.data[deleteFile];
        FD.fileList = await createJson( FD.fileList.path, FD.fileList.data, {encoding:"utf8", flag:"w"});
        FD.success = true;
        res.send(FD);
        console.log("-- DELETE FINISH --");
    }else{
        res.send({success: false});
    }

}

app.post("/deleteFile", deleteFileFNC);
async function deleteFileFNC(req, res){
    var delList = req.body.deleteList;
    var delStatusList = [];

    delList.map(function(file){
        console.log("deleted file:", file);
        /*
        fs.unlink(file, function(err){
            if (err){
                //throw err;
                delStatusList.push({path:file, deleteStatus: false});
            }else{
                delStatusList.push({path:file, deleteStatus: true});
            }
        });
        */

        try{
            fs.unlinkSync(file);
            delStatusList.push({path:file, deleteStatus: true, err:null});
            console.log("Dosya başarıyla silindi.");
        }catch(err){
            delStatusList.push({path:file, deleteStatus: false, err:err});
            console.error("Dosya silinirken hata oluştu:", err);
        }
    });

    res.send({success: true, delStatusList, refreshFileList: req.body.refreshFileList});
}

//Read File List
app.post("/getZip", downloadFNC);
async function downloadFNC(req, res){
    var FD = Users[req.body.token];
    var file = req.body.file;
    var product = file.substring(5, 8);
    var grade = file.substring(3, 4);
    var lesson = file.substring(0, 3);

    if(!product.length){
        product = "EKT";
    }

    if(!grade.length){
        grade = "5";
    }

    if(!lesson.length){
        lesson = "TRK";
    }

    var info = ["deneme"];

    try{
        info[6] = ["girdi"];
        var entrance = await addFolder( path.join(FD.root, "zip") );
        info[1] = [entrance];
        var step0 = await addFolder( path.join(entrance, "ONLINE") );
        var step1 = await addFolder( path.join(step0, "2026-2027") );
        var step2 = await addFolder( path.join(step1, product) );
        var step3 = await addFolder( path.join(step2, grade) );
        var step4 = await addFolder( path.join(step3, "0") );
        var step5 = await addFolder( path.join(step4, lesson) );
        var step6 = await addFolder( path.join(step5, file) );
        var step7 = await addFolder( path.join(step6, "2") );
        var step8 = await addFolder( path.join(step7, "publish") );
        var step9 = await addFolder( path.join(step7, "src") );
        var step10 = await addFolder( path.join(step9, "content") );
        var step11 = await addFolder( path.join(step9, "coverimg") );
        info[7] = ["bitti"];

        var mainFolder = FD.fileList.data[file].files.mainFolder;
        info[2] = mainFolder;

        var successCopy = await copyFolder(mainFolder, step10);
        var PublisherCopy = await copyFile(path.join(__dirname, "assets/publisher/Publisher.py"), step6+"/Publisher.py");
        FD.fileList.data[req.body.file].files.zipFile = await getZip( req.body.file, entrance, req.body.token);
        await deleteFolder(entrance);

        res.send({success: true, content: FD.fileList.data[req.body.file], info, FD, file});
    }catch (e){
        res.send({success: false, content: FD.fileList.data[req.body.file], info, FD, file});
    }
}

//Upload Image
app.post('/uploadImage', function (req, res) {
    upload.array("uploadImage", 12)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send({ success: false, message: "Dosya boyutu limiti aşıldı" });
            }
        } else if (err) {
            return res.status(450).send({ success: false, message: "Yükleme hatası" });
        }
        res.send(req.files);
    });
});

var userList = {
    melike:{password:"1q2w3e"},
    irem:{password:"1a2s3d"},
    tuncay:{password:"1b9d8s4d"},
    kamil:{password:"1z2x3c"},
    demet:{password:"3e2w1q"},
    goknur:{password:"3d2s1a"},
    cansu:{password:"3c2x1z"},
    gulcin:{password:"1q2w3e"},
    bahar:{password:"1q2w3e"},
    duygu:{password:"1q2w3e"},
    taner:{password:"1q2w3e"},
    deniz:{password:"1q2w3e"},
    oyku:{password:"1q2w3e"}
};

//Read File List
app.post("/getFileList", function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var token = req.body.token;

    var FD = Users[token];

    if(username === "guest" && password === "guest"){
        FD.user = "guest";
        FD.pw = "guest";
        FD.success = true;
        res.send(FD);
    }else if(userList[username] && userList[username].password === password){
        FD.user = username;
        FD.pw = password;
        FD.success = true;
        res.send(FD);
    }else{
        FD.success = false;
        res.send(FD);
    }
});

//Read File List
app.post("/prepare", async function(req, res){
    try {
        await initApp(req, res);
    } catch (err) {
        console.error("/prepare hatası:", err);

        if (!res.headersSent) {
            res.status(500).send({
                success: false,
                systemReady: false,
                message: "Prepare işlemi sırasında sunucu hatası oluştu.",
                error: err.message
            });
        }
    }
});


app.use("/player", function(req, res) {
    res.sendFile(path.join(__dirname, "views/","player.html"));
});

app.use("/rubrik", function(req, res) {
    res.sendFile(path.join(__dirname, "views/","rubrik.html"));
});

app.use("/regex", function(req, res) {
    res.sendFile(path.join(__dirname, "views/","regex.html"));
});

//Index Page
app.use("/ide", function(req, res) {
    /* initApp(req, res); */
    res.sendFile(path.join(__dirname, "views/","index.html"));
});

async function initApp(req, res){
    if(req.body.service){
        service = req.body.service;
    }

    console.log(service);

    token = "User_"+getRandomInt(9000)+"_"+word[getRandomInt(10)]+"_"+getRandomInt(9000);
    console.log('\033[2J');
    console.log("///////START APP/////////");

    Users[token] = {};
    var FD = Users[token];

    //1."files" Klasörü yoksa oluşturulur..
    FD.root = await addFolder( path.join(__dirname, "files") );

    //2."files" dosyası varsa okunur. Yoksa oluşturulur...
    FD.fileList = {path: path.join(FD.root, "fileList.json")};

    try {
        FD.fileList.data = await readFileList(FD.fileList.path);
    } catch (err) {
        console.error("fileList.json okunamadı, yeni liste oluşturulacak:", err.message);
        FD.fileList.data = false;
    }

    if(!FD.fileList.data){
        FD.fileList = await createJson(FD.fileList.path, {}, {encoding:"utf8", flag:"w"});
    }

    FD.token = token;
    FD.systemReady = true;
    FD.templateImages = templateImages;
    FD.success = true;

    res.send(FD);
}


function copyFile(source, target){
    return new Promise(function(resolve, reject){
        fs.copyFile(source, target, (err) => {
            if (err){
                resolve(false);
            }else{
                resolve(true);
            }
        });
    })
}


app.listen(3630, function() {
    console.log("listening on port 3630");
});


function listAddFile(FD, data){
    FD.fileList.data[data.fileName] = {user: FD.user, create: data.createTime, files: FD.files};
    return FD.fileList.data;
}


//Login
app.post("/occLogin", function(req, res){
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var token = req.body.token;
    console.log("service:", service);

    console.log(username, password, token, service);
    console.log(`https://${service}.okulistik.com/srv/login?username=${username}&password=${password}&auth_type=1&ltype=2&utype=other`);

    axios.get(`https://${service}.okulistik.com/srv/login?username=${username}&password=${password}&auth_type=1&ltype=2&utype=other`).then(resp => {
        var user = occUser["user_"+resp.data.uid];
        if(user){
            var FD = Users[token];
            if(FD){
                FD.user = user;
            }
        }

        var jwt = resp.data.jwt;

        var config = {
            headers: {Authorization: "Bearer "+jwt}
        }

        axios.get(`https://${service}.okulistik.com/api/occ?limit=4000`, config).then(response => {
            res.send({success: true, response: response.data, user: resp.data});
        }).catch(function (error) {
            res.send({success: false, err:error});
        });
    }).catch(function (error) {
        res.send({success: false, err:error});
    });
});


//Read File List
app.post("/occSelectFile", function(req, res){
    var selectedFile = req.body.selectedFile;
    var jwt = getOccJwt(req);
    var token = req.body.token;
    console.log(selectedFile, token);

    var FD = Users[token];
    if(FD && FD.fileList && FD.fileList.data[selectedFile]){
        FD.files = FD.fileList.data[selectedFile].files;
    }

    var config = {
        headers: getOccAuthHeaders(jwt)
    }

    axios.get(`https://${service}.okulistik.com/api/occ/${selectedFile}`, config).then(response => {
        res.send({success: true, response: response.data});
    }).catch(err => {
        console.log("error in request", err);
        res.status(502).send({
            success: false,
            message: "OCC dosya seçme isteği başarısız oldu."
        });
    });
});

//Read File List
app.post("/occSaveFile", function(req, res){
    var jwt = getOccJwt(req);
    var stringJSON = req.body.stringJSON;
    axios({
        method: "post",
        url: `https://${service}.okulistik.com/api/occ`,
        headers: {
            Authorization: "Bearer "+jwt
        },
        data: {
            json: stringJSON,
        }
    }).then(response => {
        console.log("res", response.data);
        res.send({response: response.data, domain:service});
    }).catch(err => {
        console.log("error in request", err);
        res.status(502).send({
            success: false,
            message: "OCC kayıt isteği başarısız oldu."
        });
    });

});

//Read File List
app.post("/occDeleteFile", function(req, res){
    var jwt = getOccJwt(req);
    var deleteFile = req.body.deleteFile;

    axios({
        method: "delete",
        url: `https://${service}.okulistik.com/api/occ/${deleteFile}`,
        headers: getOccAuthHeaders(jwt)
    }).then(response => {
        console.log("res", response.data);
        res.send({success: true, response: response.data});
    }).catch(err => {
        console.log("error in request", err);
        res.status(502).send({
            success: false,
            message: "OCC silme isteği başarısız oldu."
        });
    });

});


//Login
app.post("/occRefreshList", function(req, res){
    var jwt = getOccJwt(req);

    var config = {
        headers: getOccAuthHeaders(jwt)
    }

    axios.get(`https://${service}.okulistik.com/api/occ?limit=4000`, config).then(response => {
        res.send({success: true, response: response.data});
    }).catch(function (error) {
        console.log(error);
        res.send({success: false, error});
    });

});


//Login
app.post("/autoGetJson", function(req, res){
    var url = req.body.url;

    axios.get(url).then(response => {
        res.send({success: true, response: response.data});
    }).catch(function (error) {
        console.log(error);
        res.send({success: false, error});
    });
});

app.post("/autoSaveData", function(req, res){
    var jwt = getOccJwt(req);
    var stringJSON = req.body.stringJSON;

    axios({
        method: "post",
        url: `https://${service}.okulistik.com/api/occ`,
        headers: getOccAuthHeaders(jwt),
        data: {
            json: stringJSON,
        }
    }).then(response => {
        console.log("res", response.data);
        res.send({success: true, response: response.data});
    }).catch(err => {
        console.log("error in request", err);
    });
});


//Login
app.post("/occAutoGetFile", function(req, res){

    axios.get('http://contentcreator.okulistik.com:3630/files/fileList.json').then(response => {
        res.send({success: true, response: response.data});
    }).catch(function (error) {
        console.log(error);
        res.send({success: false, error});
    });

});

//Return File
app.post("/return", returnFileFNC);
async function returnFileFNC(req, res){

    console.log(req.body);
    var FD = Users[req.body.token];
    var rescueFile = req.body.rescueFile;
    var rescueData = req.body.rescueData;

    console.log(rescueFile);
    console.log(rescueData);
    console.log(FD.fileList);
    console.log(FD.fileList.data[rescueFile]);

    FD.fileList.data[rescueFile] = rescueData;
    FD.fileList = await createJson( FD.fileList.path, FD.fileList.data, {encoding:"utf8", flag:"w"});
    res.send({success: true, response: FD});
}

//Duplicate File
app.post("/duplicate", duplicateFileFNC);
async function duplicateFileFNC(req, res){
    var FD = Users[req.body.token];

    var curFolder = FD.root+"/"+req.body.duplicate_curName;
    var newFolder = FD.root+"/"+req.body.duplicate_newName;
    var oldJson = newFolder+"/"+req.body.duplicate_curName+".json";
    req.body.duplicate_curFolder = curFolder;
    req.body.duplicate_newFolder = newFolder;
    req.body.duplicate_oldJson = [oldJson];

    var currentNewFolderDel = await deleteFolder(newFolder);
    var successCopy = await copyFolder(curFolder, newFolder);

    if(successCopy){
        var jwt = getOccJwt(req);
        var config = {
            headers: getOccAuthHeaders(jwt)
        }

        axios.get(`https://${service}.okulistik.com/api/occ/${req.body.duplicate_curName}`, config).then(response => {
            FD.files = { mainJson:{ path: newFolder+"/"+req.body.duplicate_newName+".json" } };
            res.send({success: true, response: response.data, clone: req.body, FD});
        }).catch(err => {
            console.log("error in request", err);
            res.status(502).send({
                success: false,
                message: "OCC duplicate isteği başarısız oldu."
            });
        });
    }
}


//Read File List
app.post("/occCopyScene", function(req, res){

    var copyFiles = req.body.copyFiles;
    var copyFilesNewFolder = req.body.copyFilesNewFolder;
    var occSceneCopy = req.body.occSceneCopy;

    copyFileListToFolder(copyFiles, copyFilesNewFolder).then(function(result) {
        res.send({success: true, occSceneCopy});
    });
});

//Sahneler arası dosya kopyalama
function copyFileListToFolder(fileList, targetFolder) {
    return new Promise(function(resolve) {
        var results = [];

        try {
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            var copyPromises = fileList.map(function(filePath) {
                return new Promise(function(resolveFile) {
                    var fileName = path.basename(filePath);
                    var targetPath = path.join(targetFolder, fileName);

                    fs.copyFile(filePath, targetPath, function(err) {
                        if (err) {
                            results.push({
                                source: filePath,
                                target: targetPath,
                                success: false,
                                error: err.message
                            });
                        } else {
                            results.push({
                                source: filePath,
                                target: targetPath,
                                success: true,
                                error: null
                            });
                        }

                        resolveFile();
                    });
                });
            });

            Promise.all(copyPromises).then(function() {
                resolve({
                    success: results.every(function(item) {
                        return item.success;
                    }),
                    results: results
                });
            });
        } catch (err) {
            resolve({
                success: false,
                error: err.message,
                results: results
            });
        }
    });
}

/**
 * Belirtilen klasördeki tüm dosyaları liste halinde döndüren fonksiyon (Promise tabanlı).
 * 
 * @param {string} targetDir - Listelenecek klasörün yolu (örn: "./files", "assets/img")
 * @param {Object} [options] - Opsiyonel parametreler
 * @param {boolean} [options.recursive=false] - Alt klasörlerdeki dosyaların da dahil edilip edilmeyeceği
 * @param {boolean} [options.detailed=false] - true ise boyut, uzantı gibi detaylı nesne listesi döndürür
 * @returns {Promise<Array>} Dosya adları/yolları veya detaylı dosya bilgileri dizisi
 */
function getFilesInDirectory(targetDir, options) {
    options = options || {};
    var recursive = options.recursive || false;
    var detailed = options.detailed || false;

    return new Promise(function(resolve, reject) {
        if (!targetDir) {
            return reject(new Error("Klasör yolu belirtilmedi."));
        }

        var resolvedPath = path.resolve(targetDir);

        if (!fs.existsSync(resolvedPath)) {
            return reject(new Error("Klasör bulunamadı: " + targetDir));
        }

        var stat = fs.statSync(resolvedPath);
        if (!stat.isDirectory()) {
            return reject(new Error("Belirtilen yol bir klasör değil: " + targetDir));
        }

        function scanDirectory(currentDir) {
            var fileList = [];
            var items = fs.readdirSync(currentDir);

            items.forEach(function(item) {
                var fullPath = path.join(currentDir, item);
                var itemStat = fs.statSync(fullPath);

                if (itemStat.isDirectory()) {
                    if (recursive) {
                        fileList = fileList.concat(scanDirectory(fullPath));
                    }
                } else if (itemStat.isFile()) {
                    var relativePath = path.relative(resolvedPath, fullPath);

                    if (detailed) {
                        fileList.push({
                            name: item,
                            relativePath: relativePath,
                            fullPath: fullPath,
                            extension: path.extname(item),
                            sizeBytes: itemStat.size,
                            modifiedAt: itemStat.mtime
                        });
                    } else {
                        fileList.push(relativePath);
                    }
                }
            });

            return fileList;
        }

        try {
            var results = scanDirectory(resolvedPath);
            resolve(results);
        } catch (err) {
            reject(err);
        }
    });
}

// Express HTTP Endpoint: POST /listFiles
app.post("/listFiles", async function(req, res) {
    var targetFolder = req.body.folderPath || req.body.targetFolder;
    var recursive = req.body.recursive || false;
    var detailed = req.body.detailed || false;

    if (!targetFolder) {
        return res.status(400).send({
            success: false,
            message: "Lütfen 'folderPath' veya 'targetFolder' parametresi belirtin."
        });
    }

    try {
        var files = await getFilesInDirectory(targetFolder, {
            recursive: recursive,
            detailed: detailed
        });

        res.send({
            success: true,
            folder: targetFolder,
            totalFiles: files.length,
            files: files
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
});

/**
 * Verilen dosya listesini silen fonksiyon (Promise tabanlı asenkron).
 * 
 * @param {Array<string>|string} fileList - Silinecek dosyaların yolları (dizi veya tek metin)
 * @param {Object} [options] - Opsiyonel ayarlar
 * @param {string} [options.baseDir=""] - Göreceli yollar için temel klasör
 * @param {boolean} [options.ignoreMissing=true] - Bulunamayan dosyaları hata olarak sayma
 * @returns {Promise<Object>} Silme sonuçlarının detaylı özeti
 */
function deleteFileList(fileList, options) {
    options = options || {};
    var baseDir = options.baseDir || "";
    var ignoreMissing = options.ignoreMissing !== undefined ? options.ignoreMissing : true;

    return new Promise(function(resolve, reject) {
        if (!fileList) {
            return reject(new Error("Silinecek dosya listesi belirtilmedi."));
        }

        if (typeof fileList === "string") {
            fileList = [fileList];
        }

        if (!Array.isArray(fileList)) {
            return reject(new Error("Dosya listesi bir dizi (Array) veya metin (String) olmalıdır."));
        }

        var results = [];
        var deletedCount = 0;
        var failedCount = 0;

        var deletePromises = fileList.map(function(filePath) {
            return new Promise(function(resolveFile) {
                if (!filePath || typeof filePath !== "string") {
                    results.push({
                        path: filePath,
                        success: false,
                        error: "Geçersiz dosya yolu",
                        notFound: false
                    });
                    failedCount++;
                    return resolveFile();
                }

                var fullPath = baseDir ? path.resolve(baseDir, filePath) : path.resolve(filePath);

                fs.stat(fullPath, function(statErr, stats) {
                    if (statErr) {
                        var isNotFound = statErr.code === "ENOENT";
                        var isSuccess = isNotFound && ignoreMissing;

                        results.push({
                            path: filePath,
                            fullPath: fullPath,
                            success: isSuccess,
                            error: isNotFound ? "Dosya bulunamadı" : statErr.message,
                            notFound: isNotFound
                        });

                        if (isSuccess) {
                            deletedCount++;
                        } else {
                            failedCount++;
                        }
                        return resolveFile();
                    }

                    if (stats.isDirectory()) {
                        results.push({
                            path: filePath,
                            fullPath: fullPath,
                            success: false,
                            error: "Belirtilen yol bir dosya değil, bir klasör.",
                            notFound: false
                        });
                        failedCount++;
                        return resolveFile();
                    }

                    fs.unlink(fullPath, function(unlinkErr) {
                        if (unlinkErr) {
                            results.push({
                                path: filePath,
                                fullPath: fullPath,
                                success: false,
                                error: unlinkErr.message,
                                notFound: false
                            });
                            failedCount++;
                        } else {
                            results.push({
                                path: filePath,
                                fullPath: fullPath,
                                success: true,
                                error: null,
                                notFound: false
                            });
                            deletedCount++;
                        }
                        resolveFile();
                    });
                });
            });
        });

        Promise.all(deletePromises).then(function() {
            resolve({
                success: failedCount === 0,
                totalCount: fileList.length,
                deletedCount: deletedCount,
                failedCount: failedCount,
                results: results
            });
        }).catch(function(err) {
            reject(err);
        });
    });
}

// Express HTTP Endpoint: POST /deleteFileList
app.post("/deleteFileList", async function(req, res) {
    var fileList = req.body.fileList || req.body.deleteList;
    var baseDir = req.body.baseDir || "";
    var ignoreMissing = req.body.ignoreMissing;

    if (!fileList) {
        return res.status(400).send({
            success: false,
            message: "Lütfen 'fileList' veya 'deleteList' parametresi belirtin."
        });
    }

    try {
        var result = await deleteFileList(fileList, {
            baseDir: baseDir,
            ignoreMissing: ignoreMissing !== undefined ? ignoreMissing : true
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
});


