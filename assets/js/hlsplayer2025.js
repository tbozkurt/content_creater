var JWRefreshFNC = [];
var JWcount=-1;
var keyframes = "@keyframes lds-ring { 0%{transform: rotate(0deg)} 100%{transform: rotate(360deg)} }";
$('<style type="text/css">' + keyframes + '</style>').appendTo($('head'));


var VPFullScreenID=0;
var GlobalFullScreenID;

function JWPlayerRefreshFNC(){
	for(var i=0; i<JWRefreshFNC.length;i++){
		JWRefreshFNC[i]();
	}
}
	function AddPlayer(obj){
		/* CSS Part */
		var videoContainerCSS = {
			width: 640,
			height: 360,
			padding: 0,
			margin: 0,
			fontSize: 0,
			fontFamily: "Nunito, sans-serif",
			position: "relative",
			backgroundColor: "black",
			overflow: "hidden"
		};
		
		var qualityBoxMainCSS = {
			width: 200,
			position: "absolute",
			visibility: "hidden",
			color: "#fff",
			bottom: 80
		};
		
		var qualityBoxCSS = {
			height: 30,
			backgroundColor: "rgba(50, 50, 50, .75)",
			borderTop: "1px solid black",
			borderRight: "1px solid black",
			borderLeft: "1px solid black",
			textAlign: "right",
			lineHeight: "30px",
			paddingRight: 5,
			fontSize: 15
		};
	
		var playerSkinCSS = {
			width:"100%",
			visibility: "hidden",
			position: "absolute",
			background: "linear-gradient(to bottom, rgba(2,0,0,0) 0%,rgba(0,0,0,0.6) 100%)",
			filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr='#00020000', endColorstr='#99000000', GradientType=0)",
			bottom: 0
		};
		
		var sliderContainerCSS = {
			width: "90%",
			height: "100%",
			left: "5%",
			position: "relative",
			display: "flex",
			alignItems: "center"
		};
	
		var sliderBatCSS = {
			width: "90%",
			height: "100%",
			left: "5%",
			position: "relative",
			display: "flex"
		};
	
		var sliderBufferCSS = {
			width: "100%",
			position: "absolute",
			opacity: 0.5,
			backgroundColor: "white"
		};
	
		var sliderFrontCSS = {
			width: 0,
			position: "absolute",
			background: "#fcc240",
			opacity: 0.8
		};
		
		var sliderCircleCSS = {
			left:-7,
			width: 14,
			height: 14,
			backgroundColor: "rgba(255,255,255,1)",
			borderRadius: 6,
			position:"absolute"
		};
		
		var controlMainHalfCSS = {
			width: "50%",
			height:"100%",
			display: "inline-flex"
		};
		
		var butonBoxCSS = {
			height: "100%",
			display: "inline-block",
			fontSize: 15,
			position: "relative",
			verticalAlign: "top",
			color: "white",
			cursor: "pointer",
			userSelect: "none"
		};
		
		var currentTimeCSS = {
			height: "100%",
			display: "inline-block",
			fontSize: 20,
			position: "relative",
			verticalAlign: "top",
			color: "white",
		};
	
		var stopBtnCSS = {
			top:0,
			left:0,
			position: "absolute",
			visibility: "hidden"
		};

		var navigationBtnCSS = {
			fontSize: 20,
			textAlign: "center"
		};

		var svgImage={
			left: 5,
			top: 5,
			position:"relative"
		};
		
		var blackScreenCSS = {
			left:0,
			top:0,
			width: "100%",
			height: "100%",
			position: "absolute",
			display: "none"
		};
		
		var selected = {
			fontWeight: "bold",
			color: "#fcc240"
		};
		
		var selectedNone = {
			fontWeight: "normal",
			color: "white"
		};
		
		var fullScreenPlayCSS = {
			left:0,
			top:0,
			width: "100%",
			height: "100%",
			position: "absolute"
		};
		
		var mediaNavigationMainCSS = {
			width: "100%",
		};
	
		var mediaNavigationBoxCSS = {
			width: 45,
			height: 55,
			backgroundColor: "white",
			fontSize: 22,
			display: "inline-block",
			marginRight: 5,
			marginTop: 5,
			textAlign: "center",
			borderRadius: 6,
			userSelect: "none",
			cursor: "pointer"
		};

		var mediaNavPart1CSS = {
			height: 36,
			lineHeight: "42px"
		}

		var mediaNavCircleCSS = {
			width: 11,
			height: 11,
			borderRadius: 11,
			marginLeft: 17,
			backgroundColor: "#8d6e63"
		}
		
		var ArrowUpCSS = {
			width: 0,
			height: 0,
			borderLeft: "10px solid transparent",
			borderRight: "10px solid transparent",
			borderBottom: "10px solid darkorange",
			position: "absolute"
		};
		
		var playerFullScreenControlCSS = {
			left: 0,
			top: 0,
			width: "100%",
			height: "100%",
			backgroundColor: "rgba(255, 255, 255, 0)",
			position: "absolute"
		};

		var naviconCSS = {
			width: "100%"
		}
		
		var conf = {occMode:false, div:"", src:"", width:"100%", autoStart:false, fullScreen:false, skin:true, videoCapture:false, vsMode:false, vsLevel:null, vkaMode:false, keyboardEvent:true, hype:{mode:false, height:720}, fullScreenFNC:null, endFNC:undefined, watchedFNC:undefined, currentMediaID:0, lang:"tr"};
		var playerListMode = false;
		var playlist = [];
		for (var x in obj) {
			conf[x] = obj[x];
		}

		var methods = {PlayVideo:{}, StopVideo:{}, FullScreenPlay:{}, FullScreenVideo:{}, gotoTime:{}, HlsSelectLevel:{}, resizePosition:{}, hypeResize:{}, curTime:"0:00", durTime:"0:00", buffer:{}, globalPlay:false, firstPlay:false, endMovie:false, accessPercent:0, qualityOptions:[], hlsSupport:false, autoQuality:-1, selectedQuality:-1, currentMediaID: conf.currentMediaID};
		
		var MainDIV = conf.div;
		var MainDivName = MainDIV.attr("id");
		MainDIV.replaceWith("<div id='"+ MainDivName +"'></div>");
		MainDIV = $("#"+MainDivName);
		var MainSrc = conf.src;
		var MainWidth = conf.width;
		var fullScreen = conf.fullScreen;
		var autoPlay = conf.autoStart;
		var vSolutionMode = conf.vsMode;
		var vSolutionLevel = conf.vsLevel;
		var vkaMode = conf.vkaMode;
		var hype = conf.hype;
		var autoScale = false;
		var loaderCount=0;
		var loaderActive=false;
		var localX=0;
		var sliderCirclePress = false;
		var WatchConfirm = [];
		var coverImg = "";
		var elem = document.documentElement;
		var openFullScreen = false;
		var isFullScreenMode = false;
		var LocalFullScreenID = VPFullScreenID++;
		var LNames = ["Düşük", "Orta", "İyi", "Yüksek", "Çok Yüksek"];
		var AutoTxt = "Otomatik Kalite";
		var autoDetail = true;
		var allMediaBtn;

		if(conf.lang === "en"){
			AutoTxt = "Auto";
			autoDetail = false;
			qualityBoxMainCSS.width = 100;
			LNames = ["", "", "", "", ""];
		}

		var videoCapture = conf.videoCapture;
		if(conf.videoCapture === true){
			videoCapture = true;
		}else {
			coverImg = videoCapture;
			videoCapture = false;
		}

		var percent = 0;
		if(typeof MainWidth === "string"){
			percent = parseInt(MainWidth);
			autoScale = true;
		}

		if(conf.currentMediaID >= MainSrc.length){
			methods.currentMediaID = 0;
		}
		
		if(typeof MainSrc === "object"){
			playerListMode = true;
			playlist = MainSrc;
			addFormatType();
		}else{
			playlist[0] = MainSrc;
			addFormatType()
		}
		
		function addFormatType(){
			for(var i=0; i<playlist.length; i++){
				var _src;
				if(videoCapture){
					_src = playlist[i]+"#t=0.1";
				}else{
					_src = playlist[i];
				}
				playlist[i] = [];
				WatchConfirm[i] = false;
				if(searchStringFNC(_src, ".m3u8") === true){
					playlist[i] = [_src, "m3u8"];
				}else if(searchStringFNC(_src, ".mp4") === true){
					playlist[i] = [_src, "mp4"];
				}
			}
		}

		var isM3U8 = searchStringFNC(playlist[0][0], ".m3u8");

		function searchStringFNC(str, find){
			str = str.toLowerCase();
			if(str.indexOf(find) > -1){
				return true;
			}else{
				return false;
			}
		}
		
		/* Html Codes Start */
		var html = '<div class="videoContainer"><div style="position:relative"><video playsinline></video></div><div class="playerFullScreenControl"></div><div class="playerSkin"><div class="sliderMain"><div class="sliderContainer"><div class="sliderBuffer"><canvas></canvas></div><div class="sliderFront"></div><div class="sliderCircle"></div></div></div><div class="controlMain"><div class="sliderBat"><div class="controlMainHalf1"><div class="butonBox"><div class="stopBtn butonBox"><img src="https://cdn.okulistik.com/mobileplayer/videoplayer/image/pause.svg" class="navicon" alt=""></div><div class="playBtn butonBox"><img src="https://cdn.okulistik.com/mobileplayer/videoplayer/image/play.svg" class="navicon" alt=""></div></div><div class="currentTime">0:00 / 0:00</div></div><div class="controlMainHalf2"><div class="backFileBtn butonBox"><img src="https://cdn.okulistik.com/mobileplayer/videoplayer/image/back.svg" class="navicon" alt=""></div><div class="navigationBtn butonBox">0/0</div><div class="nextFileBtn butonBox"><img src="https://cdn.okulistik.com/mobileplayer/videoplayer/image/next.svg" class="navicon" alt=""></div></div></div></div><div class="mediaNavigationMain"></div></div><div class="blackScreen"></div><div class="qualityBoxMain"></div><div class="fullScreenPlay"></div><div class="LoaderDiv"><div class="LdrRing1"></div><div class="LdrRing2"></div><div class="LdrRing3"></div><div class="LdrRing4"></div></div></div>';
		MainDIV.html(html);
		/* Html Codes End */

		var controlMainHalf1 = MainDIV.find(".controlMainHalf1");
		var controlMainHalf2 = MainDIV.find(".controlMainHalf2");
		var html2='<div class="settingsBtn butonBox"> <img src="https://cdn.okulistik.com/mobileplayer/videoplayer/image/settings.svg" class="navicon" alt=""> </div> <div class="fullScreenBtn butonBox"> <img src="https://cdn.okulistik.com/mobileplayer/videoplayer/image/fullscreen.svg" class="navicon" alt=""> </div>';
		var fullScreenBtn;

		if(conf.occMode){
			qualityBoxMainCSS.left = "16%"
			controlMainHalf1.append(html2);
			fullScreenBtn = MainDIV.find(".fullScreenBtn");
			fullScreenBtn.css("visibility", "hidden");
		}else{
			qualityBoxMainCSS.right = "5%"
			controlMainHalf2.append(html2);
			fullScreenBtn = MainDIV.find(".fullScreenBtn");
		}

		/* Elements Start */
		var videoContainer = MainDIV.find(".videoContainer");
		var playBtn = MainDIV.find(".playBtn");
		var stopBtn = MainDIV.find(".stopBtn");
		var playerFullScreenControl = MainDIV.find(".playerFullScreenControl");
		var settingsBtn = MainDIV.find(".settingsBtn");
		var backFileBtn = MainDIV.find(".backFileBtn");
		var navigationBtn = MainDIV.find(".navigationBtn");
		var nextFileBtn = MainDIV.find(".nextFileBtn");
		var sliderMain = MainDIV.find(".sliderMain");
		var sliderContainer = MainDIV.find(".sliderContainer");
		var sliderFront = MainDIV.find(".sliderFront");
		var sliderCircle = MainDIV.find(".sliderCircle").css(sliderCircleCSS);
		var sliderBuffer = MainDIV.find(".sliderBuffer");
		var fullScreenPlay = MainDIV.find(".fullScreenPlay");
		var controlMain = MainDIV.find(".controlMain");
		var qualityBoxMain = MainDIV.find(".qualityBoxMain");
		var playerSkin = MainDIV.find(".playerSkin");
		var currentTime = MainDIV.find(".currentTime");
		var Loader = MainDIV.find(".LoaderDiv");
		var LoaderRings = Loader.find("div");
		var qualityBox;
		var sliderBat = MainDIV.find(".sliderBat");
		var butonBox = MainDIV.find(".butonBox");
		var navicon = MainDIV.find(".navicon");

		var blackScreen = MainDIV.find(".blackScreen");
		var mediaNavigationMain = MainDIV.find(".mediaNavigationMain");
		var mediaNavigationArrow;

		if(!videoCapture && coverImg.length>0){
			fullScreenPlay.html('<img src="'+ coverImg +'" alt="Smiley face" height="100%" width="100%">');
		}

		/* Object CSS append Start*/
		videoContainer.css(videoContainerCSS);
		playerSkin.css(playerSkinCSS).css("background", "-moz-linear-gradient(top, rgba(2,0,0,0) 0%, rgba(0,0,0,0.6) 100%)").css("background", "-webkit-linear-gradient(top, rgba(2,0,0,0) 0%,rgba(0,0,0,0.6) 100%)");
		qualityBoxMain.css(qualityBoxMainCSS);
		sliderContainer.css(sliderContainerCSS);
		sliderBat.css(sliderBatCSS);
		sliderFront.css(sliderFrontCSS);
		sliderBuffer.css(sliderBufferCSS);
		controlMainHalf1.css(controlMainHalfCSS);
		controlMainHalf2.css(controlMainHalfCSS);
		butonBox.css(butonBoxCSS);
		currentTime.css(currentTimeCSS);
		stopBtn.css(stopBtnCSS);
		navigationBtn.css(navigationBtnCSS);
		blackScreen.css(blackScreenCSS);
		fullScreenPlay.css(fullScreenPlayCSS);
		mediaNavigationMain.css(mediaNavigationMainCSS);
		playerFullScreenControl.css(playerFullScreenControlCSS);
		navicon.css(naviconCSS);
		
		function addLoader(){
			var LoaderDivCSS = {
				left: "calc(50% - 32px)",
				top: "calc(50% - 32px)",
				width: 64,
				height: 64,
				backgroundColor:"rgba(0, 0, 0, .5)",
				borderRadius: 60,
				position: "absolute",
				visibility: "hidden",
				opacity: 0.6
			};
			
			var RingCSS = {
				boxSizing: "border-box",
				display: "block",
				position: "absolute",
				margin: "6px",
				border: "3px solid #fff",
				borderRadius: 100,
				animation: "lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
				borderColor: "#fff transparent transparent transparent"
				
			};
			
			var Ring1 = {width:26, height:26, left:12, top:12};
			var Ring2 = {width:34, height:34, left:8, top:8};
			var Ring3 = {width:42, height:42, left:4, top:4};
			var Ring4 = {width:50, height:50, left:0, top:0};
			
			Loader.css(LoaderDivCSS);
			LoaderRings.css(RingCSS);
			Loader.find(".LdrRing1").css("animation-delay", "-0.45s").css(Ring1);
			Loader.find(".LdrRing2").css("animation-delay", "-0.30s").css(Ring2);
			Loader.find(".LdrRing3").css("animation-delay", "-0.15s").css(Ring3);
			Loader.find(".LdrRing4").css(Ring4);
			LoaderClose();
		}
		
		function LoaderOpen(){
			loaderCount=0;
			loaderActive=true;
			LoaderRings.css("animation-play-state", "running");
			Loader.css("visibility", "visible");
		}
		
		function LoaderClose(){
			loaderCount=0;
			loaderActive=false;
			LoaderRings.css("animation-play-state", "paused");
			Loader.css("visibility", "hidden");
		}
		
		addLoader();
		
		if(!conf.skin){
			playerSkin.css("display","none");
		}

		/* Object CSS append End */
		if(vSolutionLevel){
			playerFullScreenControl.before('<div style="width: 8%; height: 8%; position: absolute; top: 5px; right: 5px"><img src="/mobileplayer/videoplayer/image/zor'+ vSolutionLevel +'.png" width="100%" alt=""></div>');
		}
		
		var playerContainerWidth;
		var playerContainerHeight;
		var video = MainDIV.find("video")[0];
		var canvas = MainDIV.find("canvas")[0];
		var hls;
		var hlsTotalLevel=0;
		var sliderWidth;
		var sliderHeight = 10;
		var controllerHeight = 50;
		var time;
		var skinTimer;
		var pointerLeave = true;
		var xMouse=0;
		var ButonArray = [];
		var appleDevice = false;
		var firstAutoLevel = true;
		var watchTime=0;
		var curTime=0;
		var durTime=0;
		var fragLoadedCount=0;
		var frag3Loaded = false;
		var firstFragLoaded = false;
		var firstCaptureSettings = false;
		
		var $mobileDevice = false;
		var $ua = navigator.userAgent.toLowerCase();
		var ctx;
		
		function isMobileFNC(){
			var isIphone = $ua.indexOf("iphone") > -1;
			var isIpad = $ua.indexOf("ipad") > -1;
			var isAndroid = $ua.indexOf("android") > -1;
			if(isAndroid || isIpad || isIphone){
				$mobileDevice=true;
			}
			if(isIpad || isIphone){
				appleDevice=true;
			}
		}
		
		isMobileFNC();
		
		var userEvent = {};
		
		/* Cihaza göre eventlar ayarlanıyor. */
		function eventSettingsFNC() {
			if ($mobileDevice) {
				userEvent = {
					down: "touchstart",
					enter: "touchstart",
					leave: "touchend",
					click: "click",
					move: "touchmove",
					up: "touchend"
				};
			} else {
				userEvent = {
					down: "mousedown",
					enter: "mouseenter",
					leave: "mouseleave",
					click: "click",
					move: "mousemove",
					up: "mouseup"
				};
			}
		}
		
		eventSettingsFNC();
		
		function playerMediaSupport(playerType){
			createMediaNavigationFNC();
			if(playerType==="m3u8"){
				if(Hls.isSupported()){
					methods.hlsSupport = true;
					parentContainerWidthFNC();
					if(videoCapture){
						MediaChangeFNC();
					}
				}else if(video.canPlayType('application/vnd.apple.mpegurl')) {
					methods.hlsSupport = false;
					settingsBtn.hide();
					MediaChangeFNC();
					playerSkin.css("visibility","visible");
				}
			}else if(playerType==="mp4"){
				MediaChangeFNC();
				if(autoPlay===true){
					video.addEventListener('canplay',function() {
						video.play();
					});
				}
			}
			
			if(!playerListMode){
				backFileBtn.hide();
				navigationBtn.hide();
				nextFileBtn.hide();
				playerFullScreenControl.css("visibility", "hidden");
			}
			
			
			if(videoCapture===true){
				fullScreenPlay.hide();
				if(playlist.length===1){
					navigationBtn.hide();
				}
			}
		}
		
		playerMediaSupport(playlist[methods.currentMediaID][1]);

		function LocalSaveBTD(QualityLevel) {
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem("okulistik-vq", QualityLevel);
			}
		}

		function LocalBTDTotalGet() {
			if (typeof(Storage) !== "undefined") {
				var locLevel = localStorage.getItem("okulistik-vq");
				if(locLevel !== null){
					return parseInt(locLevel);
				}
			}

			return -1;
		}

		function newHLSObjectFNC(){
			var config = {
				maxMaxBufferLength: 30,
				maxBufferLength: 30
			};

			hls = new Hls(config);
			hls.autoLevelCapping = selectAutoLevelCapping(playerContainerHeight);
			hls.attachMedia(video);

			hls.startLevel = LocalBTDTotalGet();

			if(videoCapture){
				hls.startLevel = selectAutoLevelCapping(playerContainerHeight);
			}

			hls.on(Hls.Events.LEVEL_UPDATED,function() {
				LocalSaveBTD(hls.nextLoadLevel);
			});

			hls.on(Hls.Events.MANIFEST_PARSED,function() {
				hlsTotalLevel = hls.levels.length;
				LevelCreateFNC();
			});
			
			hls.on(Hls.Events.FRAG_LOADED,function(e) {
				if(videoCapture){
					if(fragLoadedCount===2 && !frag3Loaded && !methods.firstPlay){
						/*
						//7-8 sn. donma yapabiliyor.
						hls.stopLoad();
						*/
						frag3Loaded = true;
					}else{
						fragLoadedCount++;
					}

					if(!firstFragLoaded){
						LoaderClose();
						playerSkin.css("visibility","visible");
						firstFragLoaded = true;
					}
				}
			});
			
			hls.on(Hls.Events.MANIFEST_LOADED,function() {
				if(videoCapture){
					MaxQualityFNC(playerContainerHeight);
				}
			});
		}

		function MaxQualityFNC(Height){
			var totalLevel = hls.levels.length-1;
			var totalCapping = selectAutoLevelCapping(Height);
			if(totalLevel < totalCapping) {
				hls.autoLevelCapping = totalLevel;
				methods.HlsSelectLevel(totalLevel, true);
			} else if (totalLevel > totalCapping) {
				methods.HlsSelectLevel(totalCapping, true);
			}else{
				methods.HlsSelectLevel(totalLevel, true);
			}
		}
		
		function bufferClearFNC(){
			ctx = canvas.getContext('2d');
			ctx.fillStyle = 'silver';
			ctx.fillRect(0, 0, sliderWidth, sliderHeight);
			ctx.fillStyle = 'rgba(100, 100, 100, 1)';
		}
		
		
		function showMediaListFNC(visible){
			if(visible){
				mediaNavigationMain.css("visibility" , "visible");
				mediaNavigationMain.show();
			}else{
				mediaNavigationMain.css("visibility" , "hidden");
				mediaNavigationMain.hide();
			}
		}
		
		function MediaChangeFNC(){
			firstCaptureSettings = false;
			fragLoadedCount=0;
			frag3Loaded = false;
			watchTime = 0;
			settingsBtn.hide();
			fullScreenBtn.hide();
			clearInterval(time);
			currentTime.text("0:00 / 0:00");
			sliderCircle.css("left", -7);
			firstAutoLevel = true;
			methods.globalPlay = false;
			methods.selectedQuality = -1;
			if(methods.currentMediaID < (playlist.length-1)){
				nextFileBtn.show();
			}else{
				nextFileBtn.hide();
			}
			
			if(methods.currentMediaID > 0){
				backFileBtn.show();
			}else{
				backFileBtn.hide();
			}
			
			bufferClearFNC();
			PlayingIconVisibleFNC(true);
			sliderFront.css("width", 0);
			
			if(playlist[methods.currentMediaID][1]==="m3u8"){
				if(methods.hlsSupport){
					if(hls!==undefined){
						hls.destroy();
					}
					newHLSObjectFNC();
					hls.loadSource(playlist[methods.currentMediaID][0]);
					if(videoCapture){
						LoaderOpen();
						firstFragLoaded = false;
					}
				}else{
					video.src = playlist[methods.currentMediaID][0];
				}
			}else if(playlist[methods.currentMediaID][1]==="mp4"){
				video.src = playlist[methods.currentMediaID][0];
			}
			
			navigationBtn.text((methods.currentMediaID+1) +" / "+ playlist.length);
			showMediaListFNC(false);
			if(playerListMode){
				arrowPosRefreshFNC();
			}
			methods.firstPlay = false;
			autoChangeHide();
		}
		
		
		function parentContainerWidthFNC(){
			if(autoScale){
				playerContainerWidth =  Math.floor(MainDIV.parent().width() * (percent/100));
				if(playerContainerWidth===0){
					playerContainerWidth = 600;
				}
			}else{
				playerContainerWidth =  MainWidth;
			}
			var ratio = playerContainerWidth/1280;
			playerContainerHeight = (ratio*720);
			if(fullScreen===true){
				playerContainerHeight = window.innerHeight;
			}
			
		}

		/* Playlist kutusunun yukarı bakan ok'u left değeri güncelleniyor */
		function arrowPosRefreshFNC(){
			mediaNavigationArrow.css("left", navigationBtn.offset().left + 30);
		}
		
		function supportM3U8(){
			if(isM3U8 && methods.hlsSupport){
				return true;
			}else{
				return false;
			}
		}

		function selectAutoLevelCapping(Height){
			if(hype.mode){
				Height = hype.height;
			}

			var capping = 0;
			if(Height<=360){
				capping=0;
			}else if(Height<=480){
				capping=1;
			}else if(Height<=959){
				capping=2;
			}else if(Height>960){
				capping=3;
			}

			return capping;
		}
		
		playBtn.on(userEvent.click, function(){
			methods.PlayVideo();
		});
		
		stopBtn.on(userEvent.click, function(){
			methods.StopVideo();
		});

		methods.PlayVideo = function(){
			if(supportM3U8() && videoCapture){
				video.play();
				PlayingIconVisibleFNC(false);
				if(!firstCaptureSettings){
					methods.HlsSelectLevel(-1, true);
					if(frag3Loaded){
						hls.startLoad();
					}
					frag3Loaded = true;
					LoaderOpen();
					firstCaptureSettings = true;
				}
			}else{
				video.play();
				PlayingIconVisibleFNC(false);
			}
		};
		
		methods.StopVideo = function(){
			video.pause();
			PlayingIconVisibleFNC(true);
		};
		
		settingsBtn.on(userEvent.click, function(){
			if(qualityBoxMain.css("visibility")==="hidden"){
				qualityBoxMain.css("visibility", "visible");
				settingsBtn.css("background-color","rgba(150,200,150,0.75)");
				blackScreen.show();
			}else{
				qualityBoxMain.css("visibility", "hidden");
				settingsBtn.css("background-color","transparent");
				blackScreen.hide();
			}
		});
		
		blackScreen.on("click", function() {
			blackScreenClose();
		});
		
		function blackScreenClose(){
			qualityBoxMain.css("visibility", "hidden");
			settingsBtn.css("background-color","transparent");
			blackScreen.hide();
		}
		
		fullScreenPlay.on(userEvent.click, function(){
			methods.FullScreenPlay();
		});
		
		methods.FullScreenPlay = function(){
			LoaderOpen();
			MediaChangeFNC();
			methods.PlayVideo();
			fullScreenPlay.hide();
		};
		
		 methods.gotoTime = function(time){
			 video.currentTime = time;
			 updateSliderAndTimeFNC(false);
		 };
		
		/* Navigasyon Next Buton Event */
		nextFileBtn.on("click", function(){
			methods.changeScene("next");
		});

		/* Navigasyon Back Buton Event */
		backFileBtn.on("click", function(){
			methods.changeScene("back");
		});

		methods.changeScene = function (id){
			if(id === "next"){
				methods.currentMediaID++;
			}else if(id === "back"){
				methods.currentMediaID--;
			}else{
				methods.currentMediaID = id;
			}

			MediaChangeFNC();
			disableNavButon(methods.currentMediaID);
		}

		/* Navigasyon Buton Event */
		navigationBtn.on("click", function () {
			if(mediaNavigationMain.css("visibility")==="hidden"){
				showMediaListFNC(true);
				arrowPosRefreshFNC();
				qualityBoxMain.css("bottom", 155);
			}else{
				showMediaListFNC(false);
				qualityBoxMain.css("bottom", 80);
			}
		});
		
		playerFullScreenControl.on(userEvent.click, function(){
			if(methods.globalPlay){
				methods.StopVideo();
			}else{
				methods.PlayVideo();
			}
		});
		
		function updateSliderAndTimeFNC(watch){
			curTime = video.currentTime;
			durTime = video.duration;
			if(methods.globalPlay){
				if(watch){
					watchTime++;
					if(vkaMode){
						$GlobalVKATime[0] = watchTime;
						$GlobalVKATime[1] = durTime;
					}
					
					methods.accessPercent = parseInt((watchTime / durTime)*100);
					if(methods.accessPercent > 62 && !WatchConfirm[methods.currentMediaID]){
						WatchConfirm[methods.currentMediaID] = true;
						if(conf.watchedFNC){
							conf.watchedFNC();
						}

						if(vSolutionMode && contentData){
							contentData.movies[methods.currentMediaID].Access = 1;
							allMediaBtn[methods.currentMediaID].btnCircle.show();
							contentData.accessVSFNC();
						}
					}
				}
			}

			var math = parseInt((curTime/durTime)*100)+"%";
			if(!sliderCirclePress){
				sliderFront.css("width", math);
				sliderCircle.css("left", (sliderFront.width()-7));
			}
			
			methods.curTime = digit(parseInt(curTime));
			methods.durTime = digit(parseInt(durTime));
			methods.cTime = curTime;
			methods.dTime = durTime;
			if(methods.cTime === methods.dTime){
				methods.endMovie = true;
			}else{
				methods.endMovie = false;
			}
			
			if(!sliderCirclePress){
				currentTime.text(methods.curTime+" / "+methods.durTime);
			}
			
			checkBuffer();
			
			if(methods.hlsSupport){
				try{
					methods.autoQuality = hls.currentLevel;
					if(hls.autoLevelEnabled === true){
						if(autoDetail){
							ButonArray[0].text(AutoTxt +" ("+ hls.levels[methods.autoQuality].height +"p)");
						}else{
							ButonArray[0].text(AutoTxt);
						}
					}
				}catch (err){}
			}
		}
		
		sliderContainer.on(userEvent.down, function(e) {
			if(methods.firstPlay) {
				gotoCircle(e);
				sliderCirclePress = true;
				e.preventDefault();
			}
		});
		
		function gotoCircle(e){
			if ($mobileDevice) {
				xMouse = e.originalEvent.touches[0].pageX;
			} else {
				xMouse = e.pageX;
			}
			
			localX = (xMouse-sliderContainer.offset().left);

			
			if(localX<0){
				localX=0;
			}else if(localX > sliderWidth){
				localX=sliderWidth;
			}
			
			var goes = (localX / sliderWidth);
			goes = Math.ceil(goes * parseInt(durTime));
			currentTime.text(digit(goes)+" / "+methods.durTime);
			
			sliderFront.css("width", localX);
			sliderCircle.css("left", (localX-7));
		}
		
		function gotoTime(e){
			if(sliderCirclePress && methods.firstPlay){
				sliderCirclePress = false;
				var goes = (localX / sliderWidth);
				goes = Math.ceil(goes * durTime);
				methods.gotoTime(goes);
			}
		}
		
		
		$("html").on(userEvent.move, function(e){
			if(sliderCirclePress && methods.firstPlay){
				gotoCircle(e);
			}
		}).on(userEvent.up, function(e){
			gotoTime(e);
		});
		
		if(!$mobileDevice && conf.keyboardEvent){
			$(window).keypress(function (e) {
				if(e.keyCode===32){
					if(methods.globalPlay){
						methods.StopVideo();
					}else{
						methods.PlayVideo();
					}
					e.preventDefault();
				}
			});
		}
		
		
		fullScreenBtn.on(userEvent.click, function() {
			methods.FullScreenVideo();
		});
		
		methods.FullScreenVideo = function(){
			GlobalFullScreenID = LocalFullScreenID;
			if(hype.mode){
				if (video.requestFullscreen) {
					video.requestFullscreen();
				} else if (video.mozRequestFullScreen) {
					video.mozRequestFullScreen();
				} else if (video.webkitRequestFullscreen) {
					video.webkitRequestFullscreen();
				}else if(video.webkitEnterFullscreen){
					video.webkitEnterFullscreen();
				}
			}else{
				if(openFullScreen){
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
					}
				}else{
					if (elem.requestFullscreen) {
						elem.requestFullscreen();
					} else if (elem.mozRequestFullScreen) {
						elem.mozRequestFullScreen();
					} else if (elem.webkitRequestFullscreen) {
						elem.webkitRequestFullscreen();
					} else if (elem.msRequestFullscreen) {
						elem.msRequestFullscreen();
					}
				}
			}
		};
		
		document.addEventListener("fullscreenchange", function () {
			onFullScreen(document.fullscreen);
		}, false);
		
		document.addEventListener("mozfullscreenchange", function () {
			onFullScreen(document.mozFullScreen);
		}, false);
		
		document.addEventListener("webkitfullscreenchange", function () {
			onFullScreen(document.webkitIsFullScreen);
		}, false);
		
		document.addEventListener("msfullscreenchange", function () {
			onFullScreen(document.msFullscreenElement);
		}, false);
		
		function onFullScreen(skin) {
			if(GlobalFullScreenID === LocalFullScreenID){
				if(skin){
					openFullScreen = true;
					methods.resizePosition();
					if(conf.fullScreenFNC !== null){
						conf.fullScreenFNC(true);
					}
				}else{
					openFullScreen = false;
					isFullScreenMode = false;
					methods.resizePosition();
					methods.HlsSelectLevel(-1, false);
					if(conf.fullScreenFNC !== null){
						conf.fullScreenFNC(false);
					}
				}
				
				if(hype.mode){
					video.controls = skin;
				}
			}
		}


		methods.resizePosition = function(){

			var videoWidth, videoHeight;
			if(openFullScreen){
				videoWidth = window.screen.width;
				videoHeight = window.screen.height;
				videoContainer.css({top:0, left:0, width:"100%", height:"100%", position:"fixed", zIndex:2147483647});
				if(window.innerHeight < window.innerWidth && $mobileDevice){
					videoWidth = window.innerWidth;
					videoHeight = window.innerHeight;
				}
			}else{
				parentContainerWidthFNC();
				videoWidth = playerContainerWidth;
				videoHeight = playerContainerHeight;
				videoContainer.css({width: videoWidth, height: videoHeight, position:"relative", zIndex:"auto"});
			}

			sliderWidth = sliderContainer.width();
			video.width = videoWidth;
			video.height = videoHeight;
			canvas.width = sliderWidth;
			canvas.height = sliderHeight;

			bufferClearFNC();
			controlMain.css("height", controllerHeight).css("width", "100%");
			butonBox.css({width: controllerHeight, height: controllerHeight});
			currentTime.css({lineHeight: controllerHeight+"px"});
			navigationBtn.css({width:(controllerHeight+30), lineHeight: controllerHeight+"px"});
			sliderFront.css("height", sliderHeight);
			sliderMain.css("height", 30).css("width", "100%");
			arrowPosRefreshFNC();
			if(methods.firstPlay && supportM3U8()){
				if(openFullScreen){
					if(!isFullScreenMode){
						hls.autoLevelCapping = selectAutoLevelCapping(videoHeight);
						MaxQualityFNC(videoHeight);
						isFullScreenMode = true;
					}
				}else{
					hls.autoLevelCapping = selectAutoLevelCapping(playerContainerHeight);
				}
			}
		};

		methods.hypeResize = function(size){
			hype.height = size;
			methods.resizePosition();
		};

		methods.resizePosition();
		JWRefreshFNC.push(methods.resizePosition);

		if(!hype.mode){
			$(window).resize(function () {
				if(autoScale || openFullScreen){
					methods.resizePosition();
				}
			});
		}

		
		var videoBuffer;
		var startBuffer;
		var endBuffer;
		var sendBuffer;
		
		/* video'nun ne kadar buffer yaptığı canvas'a çiziliyor */
		function checkBuffer() {
			videoBuffer = video.buffered;
			sendBuffer=[];
			if (videoBuffer) {
				for (var i=0; i<videoBuffer.length; i++) {
					sendBuffer[i] = [videoBuffer.start(i), videoBuffer.end(i)];
					startBuffer = sendBuffer[i][0] / video.duration * sliderWidth;
					endBuffer = sendBuffer[i][1] / video.duration * sliderWidth;
					ctx.fillRect(startBuffer, 0, Math.max(2, endBuffer - startBuffer), sliderHeight);
				}
				methods.buffer = sendBuffer;
			}
		}
		
		/**
		 * @return {number}
		 */
		function Comparator(a, b) {
			if(a[0] < b[0]){
				return -1
			}
			if(a[0] > b[0]){
				return 1
			}
			return 0;
		}
		
		/* Hls için video kalitesi kutusu burada oluşturuluyor */
		function LevelCreateFNC(){
			qualityBoxMain.html("");
			var _html = "";
			var _btnName;

			var sortArray = [];
			for(var x=0; x<hls.levels.length; x++){
				sortArray[x] =[hls.levels[x].height, x];
			}
			sortArray = sortArray.sort(Comparator);
			
			for(var j=0; j<sortArray.length; j++){
				sortArray[j][2] = LNames[j];
			}
			sortArray.unshift([0, -1, AutoTxt]);
			
			methods.qualityOptions = sortArray;
			for(var i=0; i<sortArray.length; i++){
				if(sortArray[i][1]===-1){
					_btnName = sortArray[i][2];
				}else{
					_btnName = sortArray[i][2] +" "+ sortArray[i][0] +"p";
				}
				_html = '<div class="qualityBox">'+_btnName+'</div>';
				qualityBoxMain.append(_html);
				ButonArray[i] = $(MainDIV.find(".qualityBox")[i]);
				ButonArray[i].on("click", function(){
					methods.HlsSelectLevel($(this).data().quality, true);
					blackScreenClose();
				}).css("cursor", "pointer").data({quality: sortArray[i][1] });
			}
			
			ButonArray[0].css(selected);
			qualityBox = MainDIV.find(".qualityBox");
			qualityBox.css(qualityBoxCSS);
		}

		function qualitySelectedBtn(selectedQuality){
			if(methods.selectedQuality>-1){
				ButonArray[0].text(AutoTxt);
			}
			for(var i=0; i<ButonArray.length; i++){
				ButonArray[i].css(selectedNone);
				if(selectedQuality === ButonArray[i].data().quality){
					ButonArray[i].css(selected);
				}

			}
		}
		
		/* Hls videoları için Kalite ayarları Buradan Yapılır */
		methods.HlsSelectLevel = function (selectedQuality, loaderShow){
			if(methods.selectedQuality !== selectedQuality){
				if(loaderShow){
					LoaderOpen();
				}
				methods.selectedQuality = selectedQuality;
				if(methods.selectedQuality === -1){
					hls.loadLevel = -1;
				}else{
					hls.currentLevel = selectedQuality;
				}
				qualitySelectedBtn(selectedQuality);
				methods.resizePosition();
			}
		};
		
		/* Playlist Kutusu burada oluşturuluyor */
		function createMediaNavigationFNC(){
			allMediaBtn = [];
			mediaNavigationMain.html('<div style="width:100%; height:10px"><div class="naviArrowUp"></div></div><div style="width:100%;  overflow-y: auto; background-color: darkorange; text-align: center"><div style="width:90%; display: inline-block; text-align:left; padding: 0 0 5px 5px;" class="mediaNavigationBoxContainer"></div></div>');
			mediaNavigationArrow = $(mediaNavigationMain.find(".naviArrowUp"));
			mediaNavigationArrow.css(ArrowUpCSS);
			arrowPosRefreshFNC();
			var mediaNavigationBoxContainer = $(mediaNavigationMain.find(".mediaNavigationBoxContainer"));
			for(var i=0; i<playlist.length; i++){
				mediaNavigationBoxContainer.append('<div class="mediaNavigationBox" id="VP_mediaBtnID_'+ i +'"> <div class="mediaNavPart1">'+ (i+1) +'</div> <div class="mediaNavCircle"></div> </div>');
				var btn = $("#VP_mediaBtnID_"+i);
				allMediaBtn[i] = {btn: btn};
				allMediaBtn[i].btnCircle = btn.find(".mediaNavCircle").hide();
				allMediaBtn[i].btn.css(mediaNavigationBoxCSS);
				enableNavButon(i);
			}

			MainDIV.find(".mediaNavPart1").css(mediaNavPart1CSS);
			MainDIV.find(".mediaNavCircle").css(mediaNavCircleCSS);
			MainDIV.find(".mediaNavigationBox").css(mediaNavigationBoxCSS);

			if(conf.vsMode){
				contentData.movies.map(function(movie, index){
					if(movie.Access){
						allMediaBtn[index].btnCircle.show();
					}
				});
			}

			disableNavButon(methods.currentMediaID);
		}

		function disableNavButon(id){
			var box;
			for(var i=0; i<allMediaBtn.length; i++){
				box = allMediaBtn[i].btn;
				if(box.hasClass("disableBtn")){
					enableNavButon(i);
					break;
				}
			}
			var btn = allMediaBtn[id].btn;
			btn.off("click mouseenter mouseleave").css({cursor: "default", backgroundColor: "silver"}).addClass("disableBtn");
		}

		function enableNavButon(id){
			var box = allMediaBtn[id].btn;
			box.on("click", {id: id}, function(e){
				methods.changeScene(e.data.id);
			}).on("mouseenter", function(){
				$(this).css("background-color", "silver");
			}).on("mouseleave", function(){
				$(this).css("background-color", "white");
			}).removeClass("disableBtn").css({cursor: "pointer", backgroundColor: "white"});
		}

		video.onplay = function() {
			PlayingIconVisibleFNC(false);
		};
		
		video.onpause = function() {
			methods.globalPlay = false;
			PlayingIconVisibleFNC(true);
			clearInterval(time);
			time = setInterval(updateSliderAndTimeFNC, 1000, false);
		};
		
		video.onwaiting = function() {
			LoaderOpen();
			clearInterval(time);
		};
		
		
		video.onplaying = function() {
			methods.globalPlay = true;
			if(!methods.firstPlay){
				playerSkin.css("visibility", "visible");
				fullScreenPlay.hide();
				playerFullScreenControl.css("visibility", "visible");
				if(methods.hlsSupport){
					settingsBtn.show();
				}
				methods.firstPlay = true;
			}

			fullScreenBtn.show();
			PlayingIconVisibleFNC(false);
			clearInterval(time);
			time = setInterval(updateSliderAndTimeFNC, 1000, true);
			addSkinEventFNC();
			updateSliderAndTimeFNC(false);
			if(playlist.length > 1){
				arrowPosRefreshFNC();
			}
		};

		video.onended = function() {
			clearInterval(time);
			updateSliderAndTimeFNC(false);
			PlayingIconVisibleFNC(true);
			if(conf.endFNC !== undefined){
				conf.endFNC();
			}

			autoChangeShow();
		};

		function autoChangeShow(){
			if(conf.autoChange){
				var nextID = methods.currentMediaID+1;

				if(nextID < playlist.length){
					conf.autoChange("show");
				}
			}
		}

		function autoChangeHide(){
			if(conf.autoChange){
				conf.autoChange("hide");
			}
		}
		
		video.ontimeupdate = function() {
			if(loaderActive){
				if(loaderCount>2){
					LoaderClose();
					clearInterval(time);
					time = setInterval(updateSliderAndTimeFNC, 1000, true);
				}else{
					loaderCount++;
				}
			}
		};
		
		video.onsuspend = function() {
			if(playlist[methods.currentMediaID][1]==="mp4"){
				playerSkin.css("visibility", "visible");
			}
		};
		
		video.onseeking = function() {
			LoaderOpen();
		};

		video.onseeked = function() {
			LoaderClose();
		};

		video.oncanplay = function() {
			LoaderClose();
		};

		function PlayingIconVisibleFNC(visible){
			if(methods.firstPlay){
				if(visible){
					playBtn.css("visibility", "visible");
					stopBtn.css("visibility", "hidden");
				}else{
					playBtn.css("visibility", "hidden");
					stopBtn.css("visibility", "visible");
					autoChangeHide();
				}
			}
		}

		function addSkinEventFNC(){
			videoContainer.on(userEvent.enter, function(){
				clearInterval(skinTimer);
				pointerLeave = false;
				playerSkin.animate({opacity:1}, 200);
				playerFullScreenControl.css("visibility", "visible");
			}).on(userEvent.leave, function() {
				pointerLeave = true;
			});
		}

		videoContainer.on("contextmenu", function () {
			return false;
		});
		
		videoContainer.on("contextmenu", function (e) {
			e.preventDefault();
		});
		
		function digit(x) {
			var dk = parseInt(x / 60);
			var sn = zero(x % 60);
			return dk+":"+sn;
		}
		
		function zero(x) {
			if (x<10){
				return "0"+x;
			}else{
				return x;
			}
		}
		
		return methods;
	}