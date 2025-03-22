const resultBox = document.querySelector('.result-box');
const resultBox2 = document.querySelector('.result-box-2');

const firstSearchLocation = document.getElementById('first-search-location');
const secondSearchLocation = document.getElementById('second-search-location');

let slides = document.querySelectorAll(".slider img");
let slideIndex = 0;
let intervalId = null;

let map = document.querySelector(".map");

const viewDirection = document.querySelector('.view-direction');

const directionText = document.querySelector(".direction-text");

let isFirst = false;
let put, putResult;

document.addEventListener("DOMContentLoaded", initSlider())

class Navigate {
    constructor(firstLoc, secondLoc) {
        this.firstLoc = firstLoc;
        this.secondLoc = secondLoc;

        this.dijkstra = function (graph, start, end) {
            let distance = {}, previous = {}, unvisited = new Set();
    
            for (let node in graph) {
                distance[node] = node === start ? 0 : Infinity;
                unvisited.add(node);
            }

            while (unvisited.size) {
                let closestNode = null;

                for (let node of unvisited) {
                    if (!closestNode || distance[node] < distance[closestNode]) {
                        closestNode = node;
                    }
                }

                if (distance[closestNode] === Infinity) break;
                if (closestNode === end) break;

                for (let neigbor in graph[closestNode]) {
                    let newDistance = distance[closestNode] + graph[closestNode][neigbor];
                    if (newDistance < distance[neigbor]) {
                        distance[neigbor] = newDistance;
                        previous[neigbor] = closestNode;
                    }
                }

                unvisited.delete(closestNode);
            }

            let path = [], node = end;

            while (node) {
                path.push(node);
                node = previous[node];
            }

            return path.reverse();
        }

        this.map = {
            "dg court": {"canteen 2": 1, "p1": 1, "gate 2": 1},
            "canteen 2": {"p2": 1, "dg court": 1}, 
            "p2": {"canteen 2": 1, "p3": 1, "ilang ilang": 1}, 
            "ilang ilang": {"p2": 1, "p4": 1}, 
            "p4": {"p5": 1, "p6": 1, "ilang ilang": 1, "gerbera": 1},
            "gerbera":  {"p4": 1, "rose": 2, "sp1": 1},
            "sp1": {"p6": 1, "gerbera": 1},
            "rose": {"gerbera": 2, "t1": 1}, 
            "p8": {"gumamela": 1, "anthurium": 1},
            "anthurium": {"p8": 1, "yellow bell": 1, "mapeh ground": 1},
            "yellow bell": {"anthurium": 1, "catleya": 2},
            "gumamela": {"p8": 1, "p9": 1, "mapeh ground": 1},
            "mapeh ground": {"anthurium": 1, "gumamela": 1, "poinsettia": 1},
            "p1": {"dg court": 1, "p3": 1, "gate 2": 1},
            "p3": {"p2": 1, "p1": 1, "white angel": 1},
            "white angel": {"p5": 1, "p11": 1, "p3": 1},
            "p5": {"p4": 1, "p6": 1.5, "t2": 1, "white angel": 1, "p11": 1.5},
            "p6": {"clinic": 1, "p12": 1, "t2": 1, "p5": 1, "sp1": 1},
            "clinic": {"p6": 1, "p12": 1, "t1": 2,},
            "t1": {"rose": 1, "p7": 1, "camia": 1, "clinic": 2},
            "p7": {"p9": 1, "t1": 1, "p14": 1},
            "p9": {"p7": 1, "p14": 1, "sp16": 1, "gumamela": 1},
            "poinsettia": {"sp16": 1, "sp2": 1},
            "sp2": {"poinsettia": 1, "catleya": 1},
            "catleya": {"sp2": 1, "yellow bell": 1, "sp18": 1.5, "sp18": 1},
            "p10": {"sp3": 1, "cadena de amor": 1},
            "cadena de amor": {"p10": 1, "p11": 1, "gabaldon": 1},
            "p11": {"white angel": 1, "cadena de amor": 1, "t2": 1},
            "t2": {"p5": 1, "p11": 1, "p6": 1, "p12": 1},
            "p12": {"clinic": 1, "p6": 1, "t2": 1, "p13": 1, "p15 ": 0.5},
            "p13": {"clinic": 1, "p12": 1, "t1": 1, "camia": 1, "calixto": 1, "rose": 1.5},
            "camia": {"t1": 1, "p13": 1, "p14": 1},
            "p14": {"p7": 1, "p9": 1.1, "sp16": 1, "canteen 3": 1, "camia": 1},
            "sp3": {"p10":1, "main entrance": 1},
            "gabaldon": {"cadena de amor": 1, "t3": 1, "main library": 1},
            "main library": {"science office": 1, "principal office": 1}, 
            "science office": {"sp4": 1, "main library": 1},
            "sp4": {"science office": 1, "filipino office": 1, "dm court": 0.5},
            "filipino office": {"sp4": 1, "values office": 0.5},
            "values office": {"filipino office": 0.5, "p15": 0.5},
            "principal office": {"main library": 1, "admin office": 0.25},
            "admin office": {"principal office": 0.25, "hr office": 0.25},
            "hr office": {"admin office": 0.25, "promis office": 0.25},
            "promis office": {"hr office": 0.25, "sp5": 0.25},
            "dm court": {"sp4": 0.5, "sp5": 0.5, "dama de noche": 2},
            "sp5": {"promis office": 0.25, "p16": 2, "dm court": 0.5},
            "p15": {"p12": 0.5, "dama de nocher": 0.5, "values office": 0.5},
            "dama de noche": {"p15": 0.5, "p16": 0.5, "dm court": 2},
            "p16": {"dama de noche": 0.5, "p17": 0.5, "sp5": 2},
            "p17": {"p16": 0.5, "sp23": 0.5, "sp24": 0.5},
            "t3": {"sampaguita 1": 1.5, "gabaldon": 1, "main entrance": 1, "canteen 1": 1},
            "main entrance": {"supply storage": 1, "t3": 1, "sp3": 1},
            "calixto": {"p13": 0.3, "media room": 0.3},
            "media room": {"calixto": 0.3, "caballero": 0.3},
            "caballero": {"media room": 0.3, "baliti": 0.3},
            "baliti": {"caballero": 0.3, "acacia": 0.3},
            "acacia": {"baliti": 0.3, "sp8": 0.3},
            "sp8": {"acacia": 0.3, "sp9": 0.3},
            "sp9": {"sp8": 0.3, "agri lagoon": 0.3, "green house": 0.3},
            "green house": {"sp9": 0.3, "narra": 0.3},
            "narra": {"ipil ipil": 0.3, "green house": 0.3},
            "ipil ipil": {"narra": 0.3, "sp10": 0.3, "kamagono": 0.3},
            "kamagono": {"ipil ipil": 0.3, "sp10": 0.3, "molave": 0.3},
            "molave": {"kamagono": 0.3, "lagundi": 0.3},
            "lagundi": {"molave": 0.3},
            "sp10": {"kamagono": 0.3, "ipil ipil": 0.3, "santan": 0.3},
            "sp16": {"poinsettia": 1, "p9": 1, "p14": 1, "chrysanthenum": 1},
            "chrysanthenum": {"sp18": 1, "waling waling": 1, "sp16": 1, "sp17": 1},
            "sp18": {"catleya": 1, "waling waling": 1, "chrysanthenum": 1},
            "sp19": {"catley": 1, "infirmary": 0.5},
            "infirmary": {"sp19": 0.5, "sped": 0.5, "guidance": 0.5},
            "sped": {"infirmay": 0.5, "quota": 1},
            "guidance": {"inifirmary": 0.5, "sp14": 1},
            "quota": {"sped": 1, "sp15": 1},
            "canteen 3": {"p14": 1, "sp11": 1},
            "sp11": {"canteen 3": 1, "sp12": 1},
            "sp12": {"sp11": 1, "sp17": 0.5, "sp13": 1},
            "sp17": {"sp12": 0.5, "sp14": 1,},
            "sp14": {"sp17": 1, "sp15": 1},
            "sp15": {"quota": 1, "sp14": 1, "gladiola": 1},
            "gladiola": {"sp15": 1, "sp21": 1},
            "sp13": {"sp12": 1, "sp20": 1, "aster": 1},
            "aster": {"sp13": 1, "euphorbia": 1},
            "euphorbia": {"aster": 1, "sp21": 1},
            "sp21": {"gladiola": 1, "sp22": 1, "euphorbia": 1},
            "supply storage": {"main entrance": 1, "sp6": 1},
            "sp6": {"sp7": 1, "canteen 1": 1},
            "sp7": {"medina hall": 1, "sp6": 1},
            "medina hall": {"sp7": 1},
            "sampaguita 1": {"t3": 1.5, "sp23": 1},
            "canteen 1": {"sp6": 1, "sampaguita 2": 1.5, "t3": 1},
            "sampaguita 2": {"lotus": 0.5, "canteen 1": 1.5},
            "lotus": {"sampaguita 2": 0.5, "p18": 1},
            "sp23": {"p17": 0.5, "sampaguita 1": 1, "gardenia": 0.5},
            "sp24": {"gardenia": 0.5, "p17": 0.5, "p18": 0.5},
            "gardenia": {"sp24": 0.5, "sp23": 0.5},
            "p18": {"sunflower": 0.5, "lotus": 1},
            "sunflower": {"p18": 0.5, "santan": 2},
            "santan": {"sunflower": 1, "sp10": 1, "daisy": 1},
            "daisy": {"sp20": 1, "santan": 1},
            "sp20": {"sp13": 1, "daisy": 1, "orchids": 1},
            "orchids": {"euphorbia": 0.5, "sp20": 1},
            "euphorbia": {"sp22": 1, "orchids": 0.5},
            "sp22": {"euphorbia": 1, "sp21": 1, "gate 3": 1},
            "gate 3": {"sp22": 1}
        }

        this.direction = this.dijkstra(this.map, this.firstLoc, this.secondLoc);
    }

    putDirection() {
        
    }

    putImages() {
        const imageSlides = document.querySelector(".slides");

        var locImages = mapLocation(this.direction);

        putImage(locImages);

        function mapLocation (resultMap) {
            var dirList = [];

            for (let x = 0; x < resultMap.length; x++) {
                var directory;

                if (x !== resultMap.length - 1) {
                    directory = resultMap[x] + "/" + resultMap[x + 1];
                    dirList.push(directory);
                }
                else {
                    directory = resultMap[x] + "/" + resultMap[x];
                    dirList.push(directory);
                }
            }

            return dirList;
        }

        function putImage (images) {
            var img;

            for (let image in images) {
                img = document.createElement("img")
                img.src = "locations/" + images[image] + ".jpg";
                imageSlides.appendChild(img);
            }

            slides = document.querySelectorAll(".slider img");
        }
    }

    putTextDirection() {

    }

    isInMap() {
        console.log(this.firstLoc.toLowerCase(), this.secondLoc.toLowerCase())

        if (this.firstLoc.toLowerCase() in this.map && this.secondLoc.toLowerCase() in this.map) {
            return true;
        }
        else {
            return false;
        }
    }
}

class SearcBar {
    constructor(locationInput, resultDiv) {
        this.value = locationInput.value;
        this.resultbox = resultDiv;
        this.locationResult = [
            "Acacia",
            "Admin office",
            "Anthurium",
            "Aster",
            "Baliti",
            "Caballero",
            "Cadena de amor",
            "Calixto",
            "Camia",
            "Canteen 1",
            "Canteen 2",
            "Canteen 3",
            "Catleya",
            "Chrysanthenum",
            "Clinic",
            "Daisy",
            "Dama de noche",
            "Dg court",
            "Dm court",
            "Euphorbia",
            "Filipino office",
            "Gabaldon",
            "Gardenia",
            "Gate 2",
            "Gate 3",
            "Gerbera",
            "Gladiola",
            "Green house",
            "Guidance",
            "Gumamela",
            "Hr office",
            "Ilang ilang",
            "Infirmary",
            "Ipil ipil",
            "Kamagono",
            "Lagundi",
            "Lotus",
            "Main entrance",
            "Main library",
            "Mapeh ground",
            "Media room",
            "Medina hall",
            "Molave",
            "Narra",
            "Orchids",
            "Poinsettia",
            "Principal office",
            "Promis office",
            "Quota",
            "Rose",
            "Sampaguita 1",
            "Sampaguita 2",
            "Santan",
            "Science office",
            "Sped",
            "Sunflower",
            "Supply storage",
            "Values office",
            "White angel",
            "yellow bell",
        ]
        this.result = [];
    }

    display() {
        if (this.value.length) {
            this.result = this.locationResult.filter((keyword)=>{
                return keyword.toLowerCase().includes(this.value.toLowerCase());
            });
        }

        const content = this.result.map((list)=>{
            return "<li onclick=selectInput(this)>" + list + "</li>";
        });

        this.resultbox.innerHTML = "<ul>" + content.join('') + "</ul>";
    }
}

firstSearchLocation.onkeyup = function() {
    isFirst = true;

    new SearcBar(firstSearchLocation, resultBox).display()

    if (!firstSearchLocation.value.length){
        resultBox.innerHTML = '';
    }
}

secondSearchLocation.onkeyup = function() {
    isFirst = false;

    new SearcBar(secondSearchLocation, resultBox2).display()

    if (!secondSearchLocation.value.length){
        resultBox2.innerHTML = '';
    }
}

function selectInput(list) {
    if (isFirst) {
        put = firstSearchLocation
        putResult = resultBox
    }
    else {
        put = secondSearchLocation
        putResult = resultBox2
    }

    put.value = list.innerHTML;
    putResult.innerHTML = '';
}

function initSlider() {
    if (slides.length > 0) {
        slides[slideIndex].classList.add("displaySlide");
    }
}

function showSlides(index) {
    if (index >= slides.length) {
        slideIndex = 0;
    }
    else if (index < 0) {
        slideIndex = slides.length - 1;
    }
    
    slides.forEach(slide => {
        slide.classList.remove("displaySlide");
    });

    slides[slideIndex].classList.add("displaySlide");
}

function prevSlide() {
    slideIndex--;
    showSlides(slideIndex); 
}

function nextSlide() {
    slideIndex++;
    showSlides(slideIndex);
}

function startNavigating() {
    var Navigated = new Navigate(firstSearchLocation.value, secondSearchLocation.value)

    console.log(Navigated.isInMap());

    if (Navigated.isInMap()){
        Navigated.putImages();

        showSlides(slideIndex);

        viewDirection.style.display = 'block'; 

        console.log(resultMap);
    }
    else {
       noResult(); 
       viewDirection.style.display = 'block';
    }
}

function noResult () {
    directionText.innerHTML = "No Result Found...";
}

function mapInit(listResult) {
    const result = document.querySelector(".direction-image");
    let map = mapPicker();
    let directionResult = listResult;

    result.innerHTML = "";

    let dirDirectionList = createDirList();

    let image = document.createElement("img");
    image.src = "map/" + map;

    result.appendChild(image);

    for (let x = 0; x < dirDirectionList.length; x++) {
        let img = document.createElement("img");
        img.src = "map/" + dirDirectionList[x];

        result.appendChild(img);
    }

    function mapPicker() {
        var map;

        if (firstSearchLocation.value in map1 && secondSearchLocation.value in map1) {
            map = "map1.png";
        }
        else if (firstSearchLocation.value in map1 || secondSearchLocation.value in map1) {
            map = "map3.png";
        }
        else {
            map = "map2.png";
        }

        return map;
    }

    function createDirList() {
        let locList = [];

        for (let x = 0; x < directionResult.length; x++) {
            var directory;

            if (x !== directionResult.length - 1) {
                directory = map + "/" + directionResult[x] + "/" + directionResult[x + 1];
                locList.push(directory);
            }
            else {
                directory = map + "/" + directionResult[x] + "/" + directionResult[x];
                locList.push(directory);
            }
        }

        return locList;
    }
}
