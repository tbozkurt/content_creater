function registerRubrikServer(app, deps){
    var axios = deps.axios;
    var getService = deps.getService;
    var getOccJwt = deps.getOccJwt;
    var getOccAuthHeaders = deps.getOccAuthHeaders;

    function getRubrikTopicHeaders(req){
        var headers = getOccAuthHeaders(getOccJwt(req));

        if(req.headers.cookie){
            headers.Cookie = req.headers.cookie;
        }

        return headers;
    }

    function saveOccFileFNC(req, res){
        var jwt = getOccJwt(req);
        var stringJSON = req.body.stringJSON || req.body.json;
        var uid = req.body.uid || req.query.uid || "";
        var logType = req.body.logType || req.query.logType || "1";
        var service = getService();

        if(!jwt){
            return res.status(401).send({
                success: false,
                message: "OCC kayıt isteği için JWT gelmedi."
            });
        }

        if(!stringJSON){
            return res.status(400).send({
                success: false,
                message: "OCC kayıt isteği için json/stringJSON zorunludur."
            });
        }

        if(typeof stringJSON !== "string"){
            stringJSON = JSON.stringify(stringJSON);
        }

        if(uid){
            try {
                var parsedJSON = JSON.parse(stringJSON);
                if(!parsedJSON.uid){
                    parsedJSON.uid = uid;
                }
                if(!parsedJSON.creator){
                    parsedJSON.creator = uid;
                }
                stringJSON = JSON.stringify(parsedJSON);
            } catch (error) {}
        }

        var formData = new FormData();
        formData.append("json", stringJSON);
        formData.append("logType", logType);

        axios({
            method: "post",
            url: `https://${service}.okulistik.com/api/occ`,
            headers: getOccAuthHeaders(jwt),
            data: formData
        }).then(response => {
            console.log("res", response.data);
            var apiSuccess = !(response.data && response.data.success === false);
            res.send({success: apiSuccess, response: response.data, domain: service});
        }).catch(err => {
            var status = err.response ? err.response.status : 502;
            console.log("error in save request", err.message, status, err.response ? err.response.data : "");
            res.status(status).send({
                success: false,
                message: "OCC kayıt isteği başarısız oldu.",
                error: err.response ? err.response.data : err.message
            });
        });
    }

    app.post("/api/occ", saveOccFileFNC);

    app.get("/api/occ/log", function(req, res){
        var fileName = req.query.fileName;
        var logType = req.query["logType[]"] || req.query.logType || "1";
        var jwt = getOccJwt(req);
        var service = getService();
        console.log("fileName:", fileName);
        if(!fileName){
            return res.status(400).send({
                success: false,
                message: "Log listesi için fileName zorunludur."
            });
        }

        var url = `https://${service}.okulistik.com/api/occ/log`;
        console.log("occ log url:", url, "fileName:", fileName, "logType:", logType);

        axios.get(url, {
            params: {fileName: fileName, "logType[]": logType},
            headers: getOccAuthHeaders(jwt)
        }).then(response => {
            res.send(response.data);
        }).catch(err => {
            var status = err.response ? err.response.status : 502;
            console.log("error in log request", err.message, status, err.response ? err.response.data : "");
            res.status(status).send({
                success: false,
                message: "OCC log listesi alınamadı.",
                fileName: fileName,
                error: err.response ? err.response.data : err.message
            });
        });
    });

    app.put("/api/occ/rollback", function(req, res){
        var logId = req.body.logId;
        var jwt = getOccJwt(req);
        var service = getService();

        if(!logId){
            return res.status(400).send({
                success: false,
                message: "Rollback için logId zorunludur."
            });
        }

        axios({
            method: "put",
            url: `https://${service}.okulistik.com/api/occ/rollback`,
            headers: Object.assign(getOccAuthHeaders(jwt), {
                "Content-Type": "application/x-www-form-urlencoded"
            }),
            data: new URLSearchParams({logId: logId}).toString()
        }).then(response => {
            res.send(response.data);
        }).catch(err => {
            var status = err.response ? err.response.status : 502;
            console.log("error in rollback request", err.message, status);
            res.status(status).send({
                success: false,
                message: "OCC rollback isteği başarısız oldu.",
                logId: logId,
                error: err.response ? err.response.data : err.message
            });
        });
    });

    app.get("/api/occ/:fileName", function(req, res){
        var fileName = req.params.fileName;
        var jwt = getOccJwt(req);
        var service = getService();
        var url = `https://${service}.okulistik.com/api/occ/${encodeURIComponent(fileName)}`;
        console.log("url:", url);
        if(!jwt){
            return res.status(401).send({
                success: false,
                message: "OCC rubrik dosyası için JWT gelmedi.",
                fileName: fileName
            });
        }

        axios.get(url, {
            headers: getOccAuthHeaders(jwt)
        }).then(response => {
            res.send(response.data);
        }).catch(err => {
            var status = err.response ? err.response.status : 502;
            console.log("error in request", err.message, status);
            res.status(status).send({
                success: false,
                message: "OCC rubrik dosyası alınamadı.",
                fileName: fileName,
                error: err.response ? err.response.data : err.message
            });
        });
    });

    app.get("/api/rubrik/topics/courses", function(req, res){
        var gid = req.query.gid;
        var desig = req.query.desig;

        if(!gid || !desig){
            return res.status(400).send({
                success: false,
                message: "Kurs listesi için gid ve desig zorunludur."
            });
        }

        axios.get("https://www.okulistik.com/json/question", {
            params: {cmd: "courses", gid: gid, desig: desig},
            headers: getRubrikTopicHeaders(req)
        }).then(response => {
            res.send(response.data);
        }).catch(err => {
            var status = err.response ? err.response.status : 502;
            console.log("error in topic courses request", err.message, status, err.response ? err.response.data : "");
            res.status(status).send({
                success: false,
                message: "Konu ağacı kurs bilgisi alınamadı.",
                error: err.response ? err.response.data : err.message
            });
        });
    });

    app.get("/api/rubrik/topics/tree", function(req, res){
        var cid = req.query.cid;

        if(!cid){
            return res.status(400).send({
                success: false,
                message: "Konu ağacı için cid zorunludur."
            });
        }

        axios.get("https://www.okulistik.com/json/question", {
            params: {cmd: "tree", cid: cid},
            headers: getRubrikTopicHeaders(req)
        }).then(response => {
            res.send(response.data);
        }).catch(err => {
            var status = err.response ? err.response.status : 502;
            console.log("error in topic tree request", err.message, status, err.response ? err.response.data : "");
            res.status(status).send({
                success: false,
                message: "Konu ağacı alınamadı.",
                error: err.response ? err.response.data : err.message
            });
        });
    });
}

module.exports = registerRubrikServer;
