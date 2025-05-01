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
var drone_current_location = [41.006, 28.9780];
var is_msn_running = false;
var rote_coors;
var pole_coors;
var border_coors;
var current_msn_step = 0;



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
		if (window.location.href.includes("dronox.engrare.com")) {
			$("#placeholder").html(htmlContent);
			startWebsite();
			console.log("HTML eklendi.");
		} else {
			openPage(1);
		}
		return true;
    } catch (error) {
		return false;
        console.error("Bir hata oluştu:", error);
    }
}

function saveWebpage() {
	const userConfirmed = confirm("Yükleme yapmak istediğinize emin misiniz?");

    if (userConfirmed) {
		const result = {
			html: null,
			css: [],
			js: []
		};
		result.html = document.documentElement.outerHTML;
		console.log(result.html);
    }
}

	
$(document).ready(function() {
	if (!window.location.href.includes("dronox.engrare.com")) {
		is_html_loaded = true;
		var usernameee = "sdt@engrare.com";
		var passworrdd = "Engrare123";
		logintofirebase(usernameee, passworrdd);
		
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
		
		const p_lat1 = document.getElementById('pole_lat1').value;
		const p_lng1 = document.getElementById('pole_lng1').value;
		const p_lat2 = document.getElementById('pole_lat2').value;
		const p_lng2 = document.getElementById('pole_lng2').value;
		const lat1 = document.getElementById('border_lat1').value;
		const lng1 = document.getElementById('border_lng1').value;
		const lat2 = document.getElementById('border_lat2').value;
		const lng2 = document.getElementById('border_lng2').value;
		const lat3 = document.getElementById('border_lat3').value;
		const lng3 = document.getElementById('border_lng3').value;
		const lat4 = document.getElementById('border_lat4').value;
		const lng4 = document.getElementById('border_lng4').value;
		
		pole_coors = [[p_lat1, p_lng1], [p_lat2, p_lng2]];
		addPoleCoordinate(pole_coors[0]);
		addPoleCoordinate(pole_coors[1]);
		border_coors = [
			[lat1, lng1],
			[lat2, lng2],
			[lat3, lng3],
			[lat4, lng4]
		];
		addBorderCoordinate(false, border_coors[0]);
		for(var i = 1; i < border_coors.length; i++) {
			addBorderCoordinate(border_coors[i - 1], border_coors[i]);
		}
		addBorderCoordinate(border_coors[border_coors.length - 1], border_coors[0]);
		
	} else {
		is_msn_running = false;
		selected_msn = 0;
		mission_sec = 0;
		if(is_login_ok) {
			writeData("client/mis_coor", "");
			writeData("client/type", "m");
		}	
		if (time_couter_interval != null) {
			clearInterval(time_couter_interval);
			$(".text_data_value_text:eq(2)").text("00:00");
		}
		$(".enter_coordinate_outer_div").fadeIn(400);
		clearPathCoordinates();
		clearPoleCoordinates();
		clearBorderCoordinates();
	}
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
	

	map_outer_div = L.map('map_outer_div').setView(drone_current_location, 16);
	L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles © Esri'
	}).addTo(map_outer_div);
    
	
	$(".leaflet-control-attribution").text("ENGRARE®");
	
	droneMarker = L.marker(drone_current_location, {
		icon: L.icon({
			iconUrl: 'https://dronox.engrare.com/files/photos/drone_logo.png',
			iconSize: [50, 50]
		})
	}).addTo(map_outer_div);
	

	setInterval(writeScreenData, 1000);
}



var pathElements = [];
var path_elements_selected = [];
var path_elements_done = [];

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

line_type_json = [
  {//predected lines
    "line": {
      color: "#ff0000",
      weight: 2,
      opacity: 0.7,
      dashArray: "5,5"
    },
    "marker": {
        radius: 4,
        fillColor: "#ff0000",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    }
  },
  {//following lines
    "line": {
      color: "#e5c13d",
      weight: 2,
      opacity: 0.7,
      dashArray: "5,5"
    },
    "marker": {
        radius: 4,
        fillColor: "#e5c13d",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    }
  },
   {//passed lines
    "line": {
      color: "#4ab138",
      weight: 2,
      opacity: 0.7,
      dashArray: "5,5"
    },
    "marker": {
        radius: 4,
        fillColor: "#4ab138",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    }
  }
];


function addPathCoordinate(old_coordinate, coordinate, line_type) {
    let line = null;
    if (old_coordinate) {
        line = L.polyline([old_coordinate, coordinate], line_type_json[line_type].line
		).addTo(map_outer_div);
        pathElements.push(line);
    }
    
    const pathMarker = L.circleMarker(coordinate, line_type_json[line_type].marker
    ).addTo(map_outer_div);
    
    pathElements.push(pathMarker);
    return pathMarker;
}


function addBorderCoordinate(old_coordinate, coordinate) {
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
	path_elements_selected.forEach(element => {
        map_outer_div.removeLayer(element);
    });
    path_elements_selected = [];
    path_elements_done.forEach(element => {
        map_outer_div.removeLayer(element);
    });
    path_elements_done = [];
}

function clearBorderCoordinates() {
    borderElements.forEach(element => {
        map_outer_div.removeLayer(element);
    });
    borderElements = [];
}

function updateDroneLocation(coors) {
	drone_current_location = coors;
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

function calculateSearchPath(poles_coors, startPoint, border_coors) {
    const OFFSET_DIST = 0.0005;
    const POLE_MIN_DIST = 0.0002;

    // Yardımcı fonksiyonlar
    const lineFromPoints = (A, B) => ({
        a: B[1] - A[1],
        b: A[0] - B[0],
        c: A[0]*B[1] - B[0]*A[1]
    });

    const offsetLine = (line, d) => {
        const length = Math.sqrt(line.a*line.a + line.b*line.b);
        return {...line, c: line.c - d*length}; // İçe doğru offset
    };

    const lineIntersection = (L1, L2) => {
        const det = L1.a*L2.b - L2.a*L1.b;
        if (Math.abs(det) < 1e-15) return null;
        return [
            (L1.b*L2.c - L2.b*L1.c)/det,
            (L1.c*L2.a - L2.c*L1.a)/det
        ];
    };

    const distance = (p1, p2) => 
        Math.hypot(p1[0]-p2[0], p1[1]-p2[1]);

    const validatePoint = (pt) => {
        // Sınır kontrolü ve direk mesafe kontrolü
        return poles_coors.every(pole => distance(pt, pole) >= POLE_MIN_DIST);
    };

    // 1. Adım: İlk 4 noktayı oluştur
    const originalEdges = Array.from({length:4}, (_,i) => 
        lineFromPoints(border_coors[i], border_coors[(i+1)%4]));

    const offsetEdges = originalEdges.map(edge => 
        offsetLine(edge, OFFSET_DIST));

    const initialPoints = Array.from({length:4}, (_,i) => 
        lineIntersection(offsetEdges[i], offsetEdges[(i+1)%4]));

    // 2. Adım: Nokta validasyonu
    if (initialPoints.some(pt => !pt || !validatePoint(pt))) 
        return [startPoint];

    let path = [...initialPoints];
    let currentLines = initialPoints.map((_,i) => 
        lineFromPoints(initialPoints[i], initialPoints[(i+1)%4]));

    // 3. Adım: Dinamik spiral oluşturma
    let cycle = [
        {type: 'edge', index: 0},  // İlk çift: Kenar0 + Line0
        {type: 'line', index: 0},  // Sonraki: Line0 + Line1
        {type: 'line', index: 1},
        {type: 'line', index: 2},
        {type: 'edge', index: 3}   // Son çift: Line3 + Kenar3
    ];

    while (true) {
        let newPoints = [];
        for (const {type, index} of cycle) {
            let L1, L2;
            
            if (type === 'edge') {
                L1 = offsetLine(originalEdges[index], OFFSET_DIST);
                L2 = offsetLine(currentLines[index], OFFSET_DIST);
            } else {
                L1 = offsetLine(currentLines[index], OFFSET_DIST);
                L2 = offsetLine(currentLines[(index+1)%4], OFFSET_DIST);
            }

            const pt = lineIntersection(L1, L2);
            if (!pt || !validatePoint(pt)) break;
            newPoints.push(pt);
        }

        if (newPoints.length !== cycle.length) break;
        
        path.push(...newPoints);
        currentLines = newPoints.map((_,i) => 
            lineFromPoints(newPoints[i], newPoints[(i+1)%newPoints.length]));
    }

    path.push(startPoint);
    return path;
}

// Polygon alan hesaplama
function polygonArea(p) {
    return Math.abs(p.reduce((a,c,i) => 
        a + c[0]*p[(i+1)%p.length][1] - c[1]*p[(i+1)%p.length][0], 0)) / 2;
}


function drawInfinity() {
	if(!is_msn_running) {
		selected_msn = 1;
		clearPathCoordinates();
		const lat1 = document.getElementById('pole_lat1');
		const lng1 = document.getElementById('pole_lng1');
		const lat2 = document.getElementById('pole_lat2');
		const lng2 = document.getElementById('pole_lng2');
		var poles = [[lat1.value, lng1.value], [lat2.value, lng2.value]];
		rote_coors = calculateInfinityPath(poles, drone_current_location);
		addPathCoordinate(false, rote_coors[0], 0);
		for(var i = 1; i < rote_coors.length; i++) {
			addPathCoordinate(rote_coors[i - 1], rote_coors[i], 0);
		}
		addPathCoordinate(rote_coors[rote_coors.length - 1], rote_coors[0], 0);
	} else {
		bottomAlert("Görev " + selected_msn + " devam ediyor. Bu yüzden görev hesaplanmadı.");
	}
}

function drawSearchPath(mission_type) {
	if(!is_msn_running) {
		selected_msn = mission_type + 1;
		clearPathCoordinates();
		const p_lat1 = document.getElementById('pole_lat1').value;
		const p_lng1 = document.getElementById('pole_lng1').value;
		const p_lat2 = document.getElementById('pole_lat2').value;
		const p_lng2 = document.getElementById('pole_lng2').value;
		const lat1 = document.getElementById('border_lat1').value;
		const lng1 = document.getElementById('border_lng1').value;
		const lat2 = document.getElementById('border_lat2').value;
		const lng2 = document.getElementById('border_lng2').value;
		const lat3 = document.getElementById('border_lat3').value;
		const lng3 = document.getElementById('border_lng3').value;
		const lat4 = document.getElementById('border_lat4').value;
		const lng4 = document.getElementById('border_lng4').value;
		pole_coors = [[p_lat1, p_lng1], [p_lat2, p_lng2]];
		border_coors = [
			[lat1, lng1],
			[lat2, lng2],
			[lat3, lng3],
			[lat4, lng4]
		];
		
		/*drone_current_location = [41.006, 28.978];
		pole_coors = [[41.009351, 28.976004], [41.007000, 28.980017]];
		border_coors = [
			[41.008493, 28.984373],
			[41.002682, 28.975583],
			[41.007841, 28.970426],
			[41.013029, 28.978623]
		];*/
		rote_coors = calculateSearchPath(pole_coors, drone_current_location, border_coors);
		console.log(rote_coors);
		addPathCoordinate(false, rote_coors[0], 0);
		for(var i = 1; i < rote_coors.length; i++) {
			addPathCoordinate(rote_coors[i - 1], rote_coors[i], 0);
		}
		addPathCoordinate(rote_coors[rote_coors.length - 1], rote_coors[0], 0);
	} else {
		bottomAlert("Görev " + selected_msn + " devam ediyor. Bu yüzden görev hesaplanmadı.");
	}
}

var time_couter_interval;


function startSelectedMission() {
	if(selected_msn != 0) {
		if(!is_msn_running) {
			clearPathCoordinates();
			if($(".enter_coordinate_outer_div").css("display") != "none")
				enterCoordinate();
			
			addPathCoordinate(false, rote_coors[0], 1);
			for(var i = 1; i < rote_coors.length; i++) {
				addPathCoordinate(rote_coors[i - 1], rote_coors[i], 1);
			}
			addPathCoordinate(rote_coors[rote_coors.length - 1], rote_coors[0], 1);
			current_msn_step = 0;
			time_couter_interval = setInterval(countMissionTime, 1000);
			if(is_login_ok) {
				//var red_data = await readData("SDTdata/client/main_power");
				var written_data = {
					"mis_coor": rote_coors,
					"type": selected_msn,
					"pole_coor": pole_coors,
					"border_coor": border_coors,
					"start_coor": drone_current_location
				};
				writeData("client", written_data);
			}
			is_msn_running = true;
		} else {
			bottomAlert("Zaten bir görev yapılıyor.");
		}
	} else {
		bottomAlert("Görev Seçilmedi.");
	}
}

async function stopSelectedMission() {
	clearPathCoordinates();
	if (time_couter_interval != null) {
		clearInterval(time_couter_interval);
		$(".text_data_value_text:eq(2)").text("00:00");
	}
	var red_data;
	if(is_login_ok) {
		var red_data = await readData("d/dt/dev/coor");
		writeData("client/type", 4);
		writeData("client/mis_coor", red_data);
	} else {
		red_data = [0, 0];
	}
	
	addPathCoordinate(false, drone_current_location, 0);
	addPathCoordinate(drone_current_location, red_data, 0);
}

function countMissionTime() {
	mission_sec++;
	$(".text_data_value_text:eq(2)").text(Math.floor(mission_sec / 60).toString().padStart(2, '0') + ":" + (mission_sec % 60).toString().padStart(2, '0'));
	
}

function isStateAchieved(current_data, required_data) {
	if(Math.abs(current_data.coor[0] - required_data.coor[0]) > 0.0002)
		return false;
	
	if(Math.abs(current_data.coor[1] - required_data.coor[1]) > 0.0002)
		return false;
	
	/*if(abs(current_data.angle - required_data.angle) > 0.1)
		return false;
	
	if(abs(current_data.altitude - required_data.altitude) > 0.01)
		return false;*/
	
	return true;
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
			if(is_msn_running) {
				var required_data = {
					"coor": rote_coors[current_msn_step],
					"angle": red_data.angle,
					"altitude": red_data.altitude
				};
				
				//if(isStateAchieved(red_data, required_data)) {
				if(isStateAchieved(red_data, required_data)) {
					current_msn_step++;
					clearPathCoordinates();
					addPathCoordinate(rote_coors[rote_coors.length - 1], rote_coors[0], 2);
					for(var i = 1; i < current_msn_step; i++) {
						addPathCoordinate(rote_coors[i - 1], rote_coors[i], 2);
					}
					
					for(var i = current_msn_step; i < rote_coors.length; i++) {
						addPathCoordinate(rote_coors[i - 1], rote_coors[i], 1);
					}
				}
			}
			
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
			bottomAlert("Veri okunamadı.");
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

var alert_interval_temp;

function bottomAlert(str, alert_type) {
	alert_interval_temp = setInterval(bottomAlertDisappear, 2500);
	//<div style="display: flex; color: #ff9b00; align-items: center; font-weight: bold;"><i class="fa-solid fa-square-exclamation car_text_data_icon_i"></i><p>-deneme</p></div>
	
	var color = "#ff9b00";
	if (alert_type)
		color = "#edff00";
	$(".copywrite_part").html("<div style=\"display: flex; color: " + color + "; align-items: center; font-weight: bold;\"><i class=\"fa-solid fa-square-exclamation car_text_data_icon_i\"></i><p>-" + str + "</p></div>");
	
}

function bottomAlertDisappear(str) {
	clearInterval(alert_interval_temp);
	$(".copywrite_part").html("<p class=\"copywrite_text\">Bu websitesinin tüm hakları <b>Engrare®</b> ekibine aittir. 3. kişilerin kullanımına kapalıdır.</p>").css("color", "");
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
