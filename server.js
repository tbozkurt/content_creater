var express = require("express");
var multer  = require('multer');
var axios = require('axios');
var bodyParser = require('body-parser');
var path = require("path");
var fs = require('node:fs');
var app = express();
var archiver = require("archiver");
var Users={};
var currentUploadFolder;
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
    user_12896817: "taner"
}
/////////////////////////

// Klasörlerin erşim izinleri verildi..
app.use("/libs", express.static(__dirname + "/node_modules"));
app.use('/files', express.static('files'));
app.use('/assets', express.static('assets'));

app.use(bodyParser.json({ limit: '11mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '11mb' }));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, currentUploadFolder);
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
            throw err;
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
            console.error(err);
        }
    })
}

function copyFolder(source, target){
    console.log("source:", source);
    console.log("target:", target);
    return new Promise(function(resolve, reject){
/*        try{
            deleteFolder(target);
            console.log("mevcut klasörü silme: OK");
        }catch(e){
            console.log("mevcut klasörü silme: FAIL");
        }*/

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
                resolve(false);
            } else {
                resolve({data:data, path:json});
            }
        });
    })
}

function readFileList(json){
    return new Promise(function(resolve, reject){
        fs.readFile(json, "utf8", function (err, data) {
            //if(err){throw err}
            if(data){
                resolve(JSON.parse(data));
            }else{
                resolve(false);
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
    var copyImageA = await copyFile(path.join(__dirname, "assets/img/template/butonback.png"), FD.files.imgFolder+"/butonback.png");
    var copyImageB = await copyFile(path.join(__dirname, "assets/img/template/closebtn.png"), FD.files.imgFolder+"/closebtn.png");
    var copyImageC = await copyFile(path.join(__dirname, "assets/img/template/directiveplay.png"), FD.files.imgFolder+"/directiveplay.png");
    var copyImageD = await copyFile(path.join(__dirname, "assets/img/template/directivestop.png"), FD.files.imgFolder+"/directivestop.png");
    var copyImageE = await copyFile(path.join(__dirname, "assets/img/template/paint_easer.png"), FD.files.imgFolder+"/paint_easer.png");
    var copyImageF = await copyFile(path.join(__dirname, "assets/img/template/draw_icon.png"), FD.files.imgFolder+"/draw_icon.png");
    var copyImageG = await copyFile(path.join(__dirname, "assets/img/template/draw_easer.png"), FD.files.imgFolder+"/draw_easer.png");
    var copyImageH = await copyFile(path.join(__dirname, "assets/img/template/sp_pause.png"), FD.files.imgFolder+"/sp_pause.png");
    var copyImageJ = await copyFile(path.join(__dirname, "assets/img/template/sp_play.png"), FD.files.imgFolder+"/sp_play.png");
    var copyImageK = await copyFile(path.join(__dirname, "assets/img/template/sp_return.png"), FD.files.imgFolder+"/sp_return.png");
    var copyImageL = await copyFile(path.join(__dirname, "assets/img/template/record_off.png"), FD.files.imgFolder+"/record_off.png");
    var copyImageM = await copyFile(path.join(__dirname, "assets/img/template/record_on.png"), FD.files.imgFolder+"/record_on.png");
    var copyImageN = await copyFile(path.join(__dirname, "assets/img/template/bucket.png"), FD.files.imgFolder+"/bucket.png");
    var copyImageP = await copyFile(path.join(__dirname, "assets/img/template/clean.png"), FD.files.imgFolder+"/clean.png");
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
        var copyImageA = await copyFile(path.join(__dirname, "assets/img/template/butonback.png"), FD.files.imgFolder+"/butonback.png");
        var copyImageB = await copyFile(path.join(__dirname, "assets/img/template/closebtn.png"), FD.files.imgFolder+"/closebtn.png");
        var copyImageC = await copyFile(path.join(__dirname, "assets/img/template/directiveplay.png"), FD.files.imgFolder+"/directiveplay.png");
        var copyImageD = await copyFile(path.join(__dirname, "assets/img/template/directivestop.png"), FD.files.imgFolder+"/directivestop.png");
        var copyImageE = await copyFile(path.join(__dirname, "assets/img/template/paint_easer.png"), FD.files.imgFolder+"/paint_easer.png");
        var copyImageF = await copyFile(path.join(__dirname, "assets/img/template/draw_icon.png"), FD.files.imgFolder+"/draw_icon.png");
        var copyImageG = await copyFile(path.join(__dirname, "assets/img/template/draw_easer.png"), FD.files.imgFolder+"/draw_easer.png");
        var copyImageH = await copyFile(path.join(__dirname, "assets/img/template/sp_pause.png"), FD.files.imgFolder+"/sp_pause.png");
        var copyImageJ = await copyFile(path.join(__dirname, "assets/img/template/sp_play.png"), FD.files.imgFolder+"/sp_play.png");
        var copyImageK = await copyFile(path.join(__dirname, "assets/img/template/sp_return.png"), FD.files.imgFolder+"/sp_return.png");
        var copyImageL = await copyFile(path.join(__dirname, "assets/img/template/record_off.png"), FD.files.imgFolder+"/record_off.png");
        var copyImageM = await copyFile(path.join(__dirname, "assets/img/template/record_on.png"), FD.files.imgFolder+"/record_on.png");
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
        var step1 = await addFolder( path.join(step0, "2024-2025") );
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

        //info = [entrance, mainFolder , step10 , PublisherCopy , req.body.file];
/*        info[1] = entrance;
        info[2] = mainFolder;
        info[3] = step10;
        info[4] = PublisherCopy;
        info[5] = req.body.file;*/

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
            return res.status(500).send({ success: false, message: "Yükleme hatası" });
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
app.post("/prepare", function(req, res){
    initApp(req, res);
});

app.post("/uploadFolderChange", function(req, res){
    var FD = Users[req.body.token];
    currentUploadFolder = FD.files.imgFolder;
    res.send({success:true});
});


app.use("/player", function(req, res) {
    res.sendFile(path.join(__dirname, "views/","player.html"));
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

    //service
/*
    if(req.body.service){
        console.log("service var");
        service = req.body.service;
    }
*/


    Users[token] = {};
    var FD = Users[token];

    //1."files" Klasörü yoksa oluşturulur..
    FD.root = await addFolder( path.join(__dirname, "files") );

    //2."files" dosyası varsa okunur. Yoksa oluşturulur...
    FD.fileList = {path: path.join(FD.root, "fileList.json")};
    FD.fileList.data = await readFileList(FD.fileList.path);
    if(!FD.fileList.data){
        FD.fileList = await createJson(FD.fileList.path, {}, {encoding:"utf8", flag:"w"});
    }

    FD.token = token;
    FD.systemReady = true;

    res.send(FD);
}


function copyFile(source, target){
    console.log(source);
    console.log(target);
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
            FD.user = user;
        }

        var jwt = resp.data.jwt;

        var config = {
            headers: {Authorization: "Bearer "+jwt}
        }

        axios.get(`https://${service}.okulistik.com/api/occ`, config).then(response => {
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
    var jwt = req.body.jwt;
    var token = req.body.token;
    console.log(selectedFile, jwt, token);

    var FD = Users[token];
    if(FD.fileList.data[selectedFile]){
        FD.files = FD.fileList.data[selectedFile].files;
    }

    var config = {
        headers: {
            Authorization: "Bearer "+jwt
        }
    }

    axios.get(`https://${service}.okulistik.com/api/occ/${selectedFile}`, config).then(response => {
        res.send({success: true, response: response.data});
    });
});


//Read File List
app.post("/occSaveFile", function(req, res){
    var jwt = req.body.jwt;
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
    });

});

//Read File List
app.post("/occDeleteFile", function(req, res){
    var jwt = req.body.jwt;
    var deleteFile = req.body.deleteFile;

    axios({
        method: "delete",
        url: `https://${service}.okulistik.com/api/occ/${deleteFile}`,
        headers: {
            Authorization: "Bearer "+jwt
        }
    }).then(response => {
        console.log("res", response.data);
        res.send({success: true, response: response.data});
    }).catch(err => {
        console.log("error in request", err);
    });

});


//Login
app.post("/occRefreshList", function(req, res){
    var jwt = req.body.jwt;

    var config = {
        headers: {Authorization: "Bearer "+jwt}
    }

    axios.get(`https://${service}.okulistik.com/api/occ`, config).then(response => {
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
    var jwt = req.body.jwt;
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
        var jwt = req.body.jwt;
        var config = {
            headers: {
                Authorization: "Bearer "+jwt
            }
        }

        axios.get(`https://${service}.okulistik.com/api/occ/${req.body.duplicate_curName}`, config).then(response => {
            FD.files = { mainJson:{ path: newFolder+"/"+req.body.duplicate_newName+".json" } };
            res.send({success: true, response: response.data, clone: req.body, FD});
        });
    }
}