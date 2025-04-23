//Copyright 2025 Kaya Sertel & ENGRARE®. All Rights Reserved.
var spd_opts = { //https://bernii.github.io/gauge.js/
	  angle: -0.17, // The span of the gauge arc
	  lineWidth: 0.19, // The line thickness
	  radiusScale: 0.97, // Relative radius
	  staticLabels: {
		  font: "13px sans-serif",  // Specifies font
		  labels: [0, 5, 10, 15, 20, 25, 30],  // Print labels at these values
		  color: "#000000",  // Optional: Label text color
		  fractionDigits: 0  // Optional: Numerical precision. 0=round off.
	  },
	  pointer: {
		length: 0.56, // // Relative to gauge radius
		strokeWidth: 0.068, // The thickness
		color: '#000000' // Fill color
	  },
	  limitMax: false,     // If false, max value increases automatically if value > maxValue
	  limitMin: false,     // If true, the min value of the gauge will be fixed
	  colorStart: '#6FADCF',   // Colors
	  colorStop: '#8FC0DA',    // just experiment with them
	  strokeColor: '#E0E0E0',  // to see which ones work best for you
	  generateGradient: true,
	  highDpiSupport: true,     // High resolution support
	  // renderTicks is Optional
	  renderTicks: {
		divisions: 6,
		divWidth: 2.4,
		divLength: 0.67,
		divColor: '#333333',
		subDivisions: 5,
		subLength: 0.62,
		subWidth: 1,
		subColor: '#666666'
	  }
	  
	};
	
	var power_opts = {
  angle: -0.2, // The span of the gauge arc
  lineWidth: 0.2, // The line thickness
  radiusScale: 0.97, // Relative radius
  pointer: {
    length: 0.56, // // Relative to gauge radius
    strokeWidth: 0.075, // The thickness
    color: '#aaedf6' // Fill color
  },
  staticLabels: {
	  font: "13px sans-serif",  // Specifies font
	  labels: [0, 20, 40, 60, 80, 100],  // Print labels at these values
	  color: "#000000",  // Optional: Label text color
	  fractionDigits: 0  // Optional: Numerical precision. 0=round off.
  },
  limitMax: false,     // If false, max value increases automatically if value > maxValue
  limitMin: false,     // If true, the min value of the gauge will be fixed
  colorStart: '#6F6EA0',   // Colors
  colorStop: '#C0C0DB',    // just experiment with them
  strokeColor: '#ffffff00',  // to see which ones work best for you
  staticZones: [
   {strokeStyle: "#dd3232", min: 0, max: 20}, // Red from 100 to 130
   {strokeStyle: "#FFDD00", min: 20, max: 40}, // Yellow
   {strokeStyle: "#30B32D", min: 40, max: 60}, // Green
   {strokeStyle: "#30B32D", min: 60, max: 80}, // Yellow
   {strokeStyle: "#30B32D", min: 80, max: 100}  // Red
],
  generateGradient: true,
  highDpiSupport: true,     // High resolution support
  // renderTicks is Optional
  renderTicks: {
    divisions: 5,
    divWidth: 2.4,
    divLength: 0.67,
    divColor: '#333333',
    subDivisions: 0,
    subLength: 0.62,
    subWidth: 1,
    subColor: '#666666'
  }
  
};

var is_login_ok = false;
var is_cookie_red = false;
var key_pressed = [false, false, false, false, false, false];
var key_pressed_lift = [false, false];
var mission_sec = 0;
var target_spd;
var gauge_spd;
var target_pwr;
var gauge_pwr;
var selected_msn = 0; //0: not selected, 1: infinity, 2: release Weight, 3: take Weight
var is_html_loaded = false;

var set_spd = 80;
var logincookiename = "logincookie";

var map_outer_div, droneMarker, rotaCizgisi;
var begining_point = [41.006, 28.9780];
var drone_current_location = [41.01, 28.97];

function fetchWebsiteData(apiKey) {
fetch('https://raw.githubusercontent.com/eylulberil/encoded_key/main/keys.json')
  .then(response => response.json())
  .then(myObj => {
	encrypted_key = myObj[0];
	console.log(encrypted_key);
	
  })
  .catch(error => {
    console.log('Error:', error);
  });
}



function decodeBase64(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
}

async function fetchFile() {
	const repoOwner = 'engrare';
	const repoName = 'dronox_priv';
	const filePath = 'index.html';
	const github_api = await readData("github-api");
	
    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            headers: { Authorization: `Bearer ${github_api}` },
        });
        if (!response.ok) throw new Error(`GitHub API hatası: ${response.statusText}`);
        const data = await response.json();
        return decodeBase64(data.content);
    } catch (error) {
        console.error(`Hata (${filePath}):`, error);
        return null;
    }
}

async function replaceHtmlWithUpdatedContent() {
    try {
        const htmlContent = await fetchFile();
        if (!htmlContent) {
            throw new Error("Dosya yüklenemedi.");
			return false;
        }
		$("#placeholder").html(htmlContent);
		startWebsite();
        console.log("HTML eklendi.");
		return true;
    } catch (error) {
		return false;
        console.error("Bir hata oluştu:", error);
    }
}



	
$(document).ready(function() {
	if (!window.location.href.includes("dronox.engrare.com")) {
		startWebsite();
	}
		
	
	
	$("#speedSlider").on("input change", function() {
		$("#speedValue").text($(this).val());
	});
	
		/*$(document).keydown(function(event) {
			var key = event.key;
		});

		$(document).keyup(function(event) {
			var key = event.key;
		});*/
	
	if(is_cookie_red == false) {
		logininfo = readCookie(logincookiename);
		is_cookie_red = true;
	}
	
	if(logininfo != "") {
		const parts = logininfo.split(/\|/);
		console.log(parts);

		logintofirebase(parts[0], parts[1]);
	}
	
});

let observer1, observer2;

function startObserving() {
    var element1 = document.getElementById('main_left_div_ID');
    var element2 = document.getElementById('main_top_div_ID');

    if (element1 && !observer1) {
        observer1 = new ResizeObserver(function(entries) {
            entries.forEach(function(entry) {
                var width = entry.contentRect.width;
                var height = entry.contentRect.height;
                $(".main_right_top_div").width($(".main_div").width() - $("#main_left_div_ID").width());
            });
        });
        observer1.observe(element1);
        console.log("Observer 1 başlatıldı");
    }

    if (element2 && !observer2) {
        observer2 = new ResizeObserver(function(entries) {
            entries.forEach(function(entry) {
                var width = entry.contentRect.width;
                var height = entry.contentRect.height;
                $(".main_bottom_div").height($(".main_div").height() - $("#main_top_div_ID").height() - 120);
            });
        });
        observer2.observe(element2);
        console.log("Observer 2 başlatıldı");
    }
}

function enterCoordinate() {
	if($(".enter_coordinate_outer_div").css("display") != "none") {
		$(".enter_coordinate_outer_div").fadeOut(400);
		const p_lat1 = document.getElementById('pole_lat1');
		const p_lng1 = document.getElementById('pole_lng1');
		const p_lat2 = document.getElementById('pole_lat2');
		const p_lng2 = document.getElementById('pole_lng2');
		var poles = [[p_lat1.value, p_lng1.value], [p_lat2.value, p_lng2.value]];
		addPoleCoordinate(poles[0]);
		addPoleCoordinate(poles[1]);
		
		const lat1 = document.getElementById('border_lat1');
		const lng1 = document.getElementById('border_lng1');
		const lat2 = document.getElementById('border_lat2');
		const lng2 = document.getElementById('border_lng2');
		const lat3 = document.getElementById('border_lat3');
		const lng3 = document.getElementById('border_lng3');
		const lat4 = document.getElementById('border_lat4');
		const lng4 = document.getElementById('border_lng4');
		var borders = [
		[lat1.value, lng1.value],
		[lat2.value, lng2.value],
		[lat3.value, lng3.value],
		[lat4.value, lng4.value]
		];
		addBorderCoordinate(false, borders[0]);
		for(var i = 1; i < borders.length; i++) {
			addBorderCoordinate(borders[i - 1], borders[i]);
		}
		addBorderCoordinate(borders[borders.length - 1], borders[0]);
		
	} else {
		$(".enter_coordinate_outer_div").fadeIn(400);
		clearPathCoordinates();
		clearPoleCoordinates();
		clearBorderCoordinates();
	}
}

function startMap() {
}

function startWebsite() {
	openPage(1);
	target_spd = document.getElementById('speed_meter_gauge');
	gauge_spd = new Gauge(target_spd).setOptions(spd_opts);
	gauge_spd.maxValue = 30;
	gauge_spd.setMinValue(0);
	gauge_spd.animationSpeed = 24;
	gauge_spd.set(0);
	
	
	target_pwr = document.getElementById('power_meter_gauge');
	gauge_pwr = new Gauge(target_pwr).setOptions(power_opts);
	gauge_pwr.maxValue = 100;
	gauge_pwr.setMinValue(0);
	gauge_pwr.animationSpeed = 24;
	gauge_pwr.set(0);
	startObserving();
	

	map_outer_div = L.map('map_outer_div').setView(begining_point, 16);
	L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'ENGRARE © Tiles © Esri'
	}).addTo(map_outer_div);
            
	droneMarker = L.marker(begining_point, {
		icon: L.icon({
			iconUrl: 'https://dronox.engrare.com/files/photos/drone_logo.png',
			iconSize: [50, 50]
		})
	}).addTo(map_outer_div);
	

	setInterval(writeScreenData, 1000);
}



var pathElements = [];
var poleElements = [];
var borderElements = [];


function addPoleCoordinate(coordinate) {
    // Siyah daire oluştur (direk)
    const poleMarker = L.circleMarker(coordinate, {
        radius: 8, // Biraz daha büyük
        fillColor: "#ffffff", // İçi beyaz
        color: "#000000", // Siyah kenarlık
        weight: 2, // Kenarlık kalınlığı
        opacity: 1,
        fillOpacity: 1 // Tam opak
    }).addTo(map_outer_div);
    
    poleElements.push(poleMarker);
    return poleMarker;
}

// Rota çizgisi ve kırmızı noktalar için
function addPathCoordinate(old_coordinate, coordinate) {
    // İki koordinat arasına çizgi ekle
    let line = null;
    if (old_coordinate) {
        line = L.polyline([old_coordinate, coordinate], {
            color: '#ff0000',
            weight: 2,
            opacity: 0.7,
            dashArray: '5, 5'
        }).addTo(map_outer_div);
        pathElements.push(line); // Çizgiyi kaydet
    }
    
    // Kırmızı yol noktası ekle
    const pathMarker = L.circleMarker(coordinate, {
        radius: 4,
        fillColor: "#ff0000",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(map_outer_div);
    
    pathElements.push(pathMarker); // Marker'ı kaydet
    return pathMarker;
}


function addBorderCoordinate(old_coordinate, coordinate) {
    // İki koordinat arasına çizgi ekle
    let line = null;
    if (old_coordinate) {
        line = L.polyline([old_coordinate, coordinate], {
            color: '#ff0000',
            weight: 2,
            opacity: 1,
            dashArray: '5, 5'
        }).addTo(map_outer_div);
        borderElements.push(line); // Çizgiyi kaydet
    }
    
    // Kırmızı yol noktası ekle
    const pathMarker = L.circleMarker(coordinate, {
        radius: 6,
        fillColor: "#ff0000",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(map_outer_div);
    
    borderElements.push(pathMarker); // Marker'ı kaydet
    return pathMarker;
}


function clearPoleCoordinates() {
    poleElements.forEach(element => {
        map_outer_div.removeLayer(element);
    });
    poleElements = [];
}

function clearPathCoordinates() {
    pathElements.forEach(element => {
        map_outer_div.removeLayer(element);
    });
    pathElements = [];
}

function clearBorderCoordinates() {
    borderElements.forEach(element => {
        map_outer_div.removeLayer(element);
    });
    borderElements = [];
}

function updateDroneLocation(coors) {
	droneMarker.setLatLng(coors);
    map_outer_div.panTo(coors);
}

function calculateInfinityPath(poles_coors, startPoint) {
    
    const [p1, p2] = poles_coors.map(c => c.map(Number));
    const [startLat, startLng] = startPoint.map(Number);
    
    if ([...p1, ...p2, startLat, startLng].some(isNaN)) {
        console.error("Geçersiz koordinatlar!");
        return [];
    }

    // Temel parametreler
    const dx = p2[1] - p1[1];
    const dy = p2[0] - p1[0];
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const center = [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2];
    const a = distance / Math.sqrt(2);

    // Tüm noktaları oluştur
    const steps = 21;
    const allPoints = [];
    
    // Parametrik denklemlerle tüm noktaları oluştur
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const x = (a * Math.cos(t)) / (1 + Math.sin(t)**2);
        const y = (a * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t)**2);
        
        const rotX = x * Math.cos(angle) - y * Math.sin(angle);
        const rotY = x * Math.sin(angle) + y * Math.cos(angle);
        
        allPoints.push([
            center[0] + rotY,
            center[1] + rotX
        ]);
    }

    // Başlangıç noktasına en yakın noktayı bul
    let closestIndex = 0;
    let minDistance = Infinity;
    
    allPoints.forEach((point, i) => {
        const d = Math.hypot(point[0]-startLat, point[1]-startLng);
        if (d < minDistance) {
            minDistance = d;
            closestIndex = i;
        }
    });

    // Noktaları yeniden sırala (en yakından başlayıp döngüyü tamamla)
    const sortedPoints = [];
    for (let i = 0; i < allPoints.length; i++) {
        const idx = (closestIndex + i) % allPoints.length;
        sortedPoints.push(allPoints[idx]);
    }
    
    // Başlangıç noktasına geri dönmek için son noktayı ekle
    sortedPoints.push([startLat, startLng]);

    return sortedPoints;
}

function drawInfinity() {
	selected_msn = 1;
	clearPathCoordinates();
	const lat1 = document.getElementById('pole_lat1');
	const lng1 = document.getElementById('pole_lng1');
	const lat2 = document.getElementById('pole_lat2');
	const lng2 = document.getElementById('pole_lng2');
	var poles = [[lat1.value, lng1.value], [lat2.value, lng2.value]];
	var rote_coor = calculateInfinityPath(poles, begining_point);
	addPathCoordinate(false, rote_coor[0]);
	for(var i = 1; i < rote_coor.length; i++) {
		addPathCoordinate(rote_coor[i - 1], rote_coor[i]);
	}
	addPathCoordinate(rote_coor[rote_coor.length - 1], rote_coor[0]);
}

function drawSearchPath(mission_type) {
	selected_msn = mission_type + 1;
	clearPathCoordinates();
	
}

var time_couter_interval;

function startSelectedMission() {
	if(selected_msn != 0) {
		time_couter_interval = setInterval(countMissionTime, 1000);
		begining_point = drone_current_location;
		if(is_login_ok) {
			//var red_data = await readData("SDTdata/client/main_power");
			writeData("o_dat", drone_current_location);
		}
	} else {
		alert("Görev Seçilmedi.");
	}
}

function stopSelectedMission() {
	clearPathCoordinates();
	if (time_couter_interval != null) {
		clearInterval(time_couter_interval);
		$(".text_data_value_text:eq(2)").text("00:00");
	}
	
	addPathCoordinate(false, drone_current_location);
	addPathCoordinate(drone_current_location, begining_point);
	if(is_login_ok) {
		//var red_data = await readData("SDTdata/client/main_power");
		writeData("c", begining_point);
		writeData("m", "s");
	}
}

function countMissionTime() {
	mission_sec++;
	$(".text_data_value_text:eq(2)").text(Math.floor(mission_sec / 60).toString().padStart(2, '0') + ":" + (mission_sec % 60).toString().padStart(2, '0'));
	
}



async function selectScenario(scenario_type, mapping_or_weight) {
	console.log("senerioya a bastın.");
	$(".scenario_selector_div").removeClass("scenario_selector_div_selected");
	$(".scenario_selector_div:eq(" + (mapping_or_weight == 1 ? scenario_type - 1 : scenario_type + 3) + ")").addClass("scenario_selector_div_selected");
	if(is_login_ok) {
		//var red_data = await readData("SDTdata/client/main_power");
		//writeData("main_power", !red_data);
	}
}


function openPageRequest(pagenum) {
	if(is_login_ok) {
		openPage(pagenum);
	} else {
		openPage(0);
	}
}

async function writeScreenData() {
	if(is_login_ok) {//if(is_login_ok && await checkUserOnline("")) {
		var red_data = await readData("d/dt/dev");
		//var states[7] = {"Hazır Değil", "Beklemede", "Arıza", "Manuel", "map_outer_divlandırma", "Yük Taşıma", "Şarj"};
		if (red_data) {
			drone_current_location = red_data.coor;
			updateDroneLocation(drone_current_location);
			$(".text_data_value_text:eq(0)").text("Bağlı");
			$(".text_data_value_text:eq(1)").text(red_data.state);
			$(".text_data_value_text:eq(3)").text(red_data.current + " Amper");
			$(".text_data_value_text:eq(4)").text(red_data.voltage + " Volt");
			$(".text_data_value_text:eq(5)").text(red_data.temp + "°C");
			
			gauge_spd.set(red_data.speed);
			gauge_pwr.set(red_data.percent);
			//console.log("Okunan veri:", red_data);
		} else {
			console.log("Veri okunamadı.");
		}
	} else {
		$(".text_data_value_text:not(:eq(0),:eq(2))").text("-");
		$(".text_data_value_text:eq(0)").text("Bağlı Değil");
		
		gauge_spd.set(0);
		gauge_pwr.set(0);
	}
}


function openPage(pagenum) {
	
	switch (pagenum) {
		case 0:
			$(".main_menu_outer_div").css("display", "none");
			$(".main_container_login").css("display", "");
			$(".fixed_menu_buttons_left:eq(0)").attr("onclick","");
			$(".fixed_menu_buttons_left:eq(0) > p").text("Giriş Yap");
			$(".fixed_menu_buttons_left").removeClass("fixed_menu_button_selected");
			$(".fixed_menu_buttons_left:eq(0)").addClass("fixed_menu_button_selected");
			break;
		case 1:
			$(".main_menu_outer_div").css("display", "none");
			$(".main_container_login").css("display", "none");
			$(".main_page_1").css("display", "");
			$(".fixed_menu_buttons_left").removeClass("fixed_menu_button_selected");
			$(".fixed_menu_buttons_left:eq(1)").addClass("fixed_menu_button_selected");
			$(".main_container_login").css("display", "none");
			$(".fixed_menu_buttons_left:eq(0)").attr("onclick","signoutfirebase()");
			$(".fixed_menu_buttons_left:eq(0) > p").text("Çıkış Yap");
			
			break;
		case 2:
			$(".main_container_login").css("display", "none");
			$(".main_menu_outer_div").css("display", "none");
			$(".main_page_2").css("display", "");
			$(".fixed_menu_buttons_left").removeClass("fixed_menu_button_selected");
			$(".fixed_menu_buttons_left:eq(2)").addClass("fixed_menu_button_selected");
			
			$(".fixed_menu_buttons_left:eq(0)").attr("onclick","signoutfirebase()");
			$(".fixed_menu_buttons_left:eq(0) > p").text("Çıkış Yap");
	  
			break;
		case 3:
			$(".main_container_login").css("display", "none");
			$(".main_menu_outer_div").css("display", "none");
			$(".main_page_3").css("display", "");
			$(".fixed_menu_buttons_left").removeClass("fixed_menu_button_selected");
			$(".fixed_menu_buttons_left:eq(3)").addClass("fixed_menu_button_selected");
			$(".fixed_menu_buttons_left:eq(0)").attr("onclick","signoutfirebase()");
			$(".fixed_menu_buttons_left:eq(0)").text("Çıkış Yap");
	  
			break;
		case 4:
			$(".main_container_login").css("display", "none");
			$(".main_menu_outer_div").css("display", "none");
			$(".main_page_4").css("display", "");
			$(".fixed_menu_buttons_left").removeClass("fixed_menu_button_selected");
			$(".fixed_menu_buttons_left:eq(4)").addClass("fixed_menu_button_selected");
			$(".fixed_menu_buttons_left:eq(0)").attr("onclick","signoutfirebase()");
			$(".fixed_menu_buttons_left:eq(0)").text("Çıkış Yap");
	  
			break;
	}
	
}


var ismenuopen = false;
	var is_mobile_phone = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) ? true : false;
	function goMainPage() {
		var url = window.location.href;
		var result = url.indexOf(".com") + 4;
		window.open(url.slice(0, result), '_self');
		
	}
	
	function openLeftMenu() {
	$(".fixed_menu_all_buttons_cont").stop();
	$(".menu_closer").stop();
	$('.fixed_menu_all_buttons_cont').animate(
		{ left: ismenuopen ? -200 : 0 }, 200);
	if(ismenuopen) {
		$(".menu_closer").fadeOut(200);
		$(".menu_opener").addClass('fa-bars');
		$(".menu_opener").addClass('fa');
		
		$(".menu_opener").removeClass('fa-regular');
		$(".menu_opener").removeClass('fa-solid');
		$(".menu_opener").removeClass('fa-xmark');
		
		$("html body").css("overflow-y", "auto");
		if(!is_mobile_phone) {
			$(".main_div").css("width", "100%");
			$(".fixed_menu_right_cont").css("width", parseInt($( ".fixed_menu_right_cont" ).width()) - 14);
		}
		//console.log(is_mobile_phone);
	}
	else {
		$(".menu_closer").fadeIn(200);
		$(".menu_opener").removeClass('fa-bars');
		$(".menu_opener").removeClass('fa');
		
		$(".menu_opener").addClass('fa-regular');
		$(".menu_opener").addClass('fa-solid');
		$(".menu_opener").addClass('fa-xmark');
		
		$("html body").css("overflow-y", "hidden");
		if(!is_mobile_phone) {
			$(".main_div").css("width", "calc(100% - 14px)");
			$(".fixed_menu_right_cont").css("width", parseInt($( ".fixed_menu_right_cont" ).width()) + 14.5);
		}
	}
	//fa-regular fa-solid fa-xmark

	ismenuopen = !ismenuopen;

	//overflow: hidden;
}

function deleteCookie(cookieName) {
    document.cookie = cookieName + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function readCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
