var express = require("express");
var multer  = require('multer');
var bodyParser = require('body-parser');
var path = require("path");
var fs = require('node:fs');
var app = express();
var archiver = require("archiver");
var FILE = {};

// Klasörlerin erşim izinleri verildi..
app.use("/libs", express.static(__dirname + "/node_modules"));
app.use('/files', express.static('files'));
app.use('/assets', express.static('assets'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, FILE.files.imgFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage })

function getZip(filename, folder){
    return new Promise(function(resolve, reject){
        var zipName = path.join(FILE.root, filename +".zip");
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

function deleteFolder(target){
    return new Promise(function(resolve, reject) {
        fs.rm(target, { recursive: true, force: true }, err => {
            if (err) {
                throw err;
            }
            resolve(target);
        });
    });
}

function createJson(json, data, flag){
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

//Create New File
app.post("/createNewFile", createNewFileFNC);
async function createNewFileFNC(req, res){
    var data = JSON.parse(req.body.data);
    FILE.files = {activeFile: data.fileName};
    FILE.files.mainFolder = await addFolder( path.join(FILE.root, data.fileName) );
    FILE.files.imgFolder = await addFolder( path.join(FILE.files.mainFolder, "img") );

    var addList = listAddFile(data);
    FILE.files.mainJson = await createJson( path.join(FILE.files.mainFolder, data.fileName+".json"), data, {encoding:"utf8", flag:"w"});
    FILE.fileList = await createJson( FILE.fileList.path, addList, {encoding:"utf8", flag:"w"});
    res.send(FILE);
}

//SaveDataFNC
app.post("/saveData", saveDataFNC);
async function saveDataFNC(req, res){
    var data = JSON.parse(req.body.data);
    FILE.files.mainJson = await createJson(FILE.files.mainJson.path, data, {encoding:"utf8", flag:"w"});
    res.send({success: FILE});
}

//Select File
app.post("/selectFile", selectFileFNC);

async function selectFileFNC(req, res){
    var file = req.body.file;
    FILE.files = FILE.fileList.data[file].files;
    FILE.files.data = await readFileList(FILE.files.mainJson.path);
    res.send(FILE);
}

//Delete File
app.post("/deleteFile", deleteFileFNC);
async function deleteFileFNC(req, res){
    var file = req.body.file;
    await deleteFolder(FILE.fileList.data[file].files.mainFolder);

    var delList = listDelFile(file);
    FILE.fileList = await createJson( FILE.fileList.path, delList, {encoding:"utf8", flag:"w"});
    res.send(FILE);
}

//Read File List
app.post("/getZip", downloadFNC);
async function downloadFNC(req, res){
    FILE.fileList.data[req.body.file].files.zipFile = await getZip( req.body.file, FILE.fileList.data[req.body.file].files.mainFolder);
   res.send(FILE.fileList.data[req.body.file]);
}

//Upload Image
app.post('/uploadImage', upload.array("uploadImage", 12), function (req, res) {
    res.send(req.files);
});

//Read File List
app.post("/getFileList", function(req, res){
    res.send(FILE);
});


//Index Page
app.use("/index", function(req, res) {
    initApp();
    res.sendFile(path.join(__dirname, "views/","index.html"));
});


async function initApp(){
    console.log('\033[2J');
    console.log("///////START APP/////////");

    //1."files" Klasörü yoksa oluşturulur..
    FILE.root = await addFolder( path.join(__dirname, "files") );

    //2."files" dosyası varsa okunur. Yoksa oluşturulur...
    FILE.fileList = {path: path.join(FILE.root, "fileList.json")};
    FILE.fileList.data = await readFileList(FILE.fileList.path);
    if(!FILE.fileList.data){
        FILE.fileList = await createJson(FILE.fileList.path, {}, {encoding:"utf8", flag:"w"});
    }

    FILE.systemReady = true;
}

app.listen(3600, function() {
    console.log("listening on port 3600");
});


function listAddFile(data){
    FILE.fileList.data[data.fileName] = {create: data.createTime, files: FILE.files};
    return FILE.fileList.data;
}

function listDelFile(file){
    delete FILE.fileList.data[file];
    return FILE.fileList.data;
}