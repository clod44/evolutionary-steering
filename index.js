






let vehicles = [];
let vg; //vehicles graphics
let fpg; //food/poison graphics
let dg; //debug bar graphics
let debugActive = true;
let populationHistory = [];
let populationTemp = 0;
let populationHistoryMax = 0;
let foods = [];
let poisons = [];
const foodSafeZone = 0.1;

let canvas;
function setup(){
    pixelDensity(1);
    frameRate(60);
    const c = document.getElementById("canvas-holder");
    canvas = createCanvas(c.clientWidth,c.clientHeight);
    canvas.parent("canvas-holder");
    noSmooth();
    vg = createGraphics(750,450);
    fpg = createGraphics(750,450);
    dg = createGraphics(200,520);


    for (let i = 0; i < 10; i++) {
        vehicles.push(new Vehicle(createVector(random(vg.width),random(vg.height))));
    }
    
    for (let i = 0; i < 50; i++) {
        foods.push(createVector(random(foodSafeZone*fpg.width,  fpg.width-foodSafeZone*fpg.width),
                                random(foodSafeZone*fpg.height, fpg.height-foodSafeZone*fpg.height)));
    }

    for (let i = 0; i < 10; i++) {
        poisons.push(createVector(random(foodSafeZone*fpg.width,  fpg.width-foodSafeZone*fpg.width),
                                random(foodSafeZone*fpg.height, fpg.height-foodSafeZone*fpg.height)));
    }

    for (let i = 0; i < 50; i++) {
        populationHistory.push(0);
    }
}


function mousePressed(){
    if(mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0){
        const pos = createVector(   map(mouseX,0,width,0,vg.width),
                                    map(mouseY,0,height,0,vg.height));
        if(customSpawn.checked){
            colorMode(HSB,1);
            const dna = [
                +(document.getElementById("food-attract").value),
                +(document.getElementById("poison-attract").value),
                +(document.getElementById("food-scan").value),
                +(document.getElementById("poison-scan").value),
                +(document.getElementById("max-speed").value),
                +(document.getElementById("acceleration").value),
                color(random(1),1,1)
            ];
            vehicles.push(new Vehicle(pos,dna, 3, 1, true));
        }else{
            //random spawn
            vehicles.push(new Vehicle(pos));
        }
    }
}


function draw(){

    background(0);

    //clear graphics
    vg.clear();
    fpg.clear();
    dg.clear();


    if(random(1) < foodSpawnRate && foods.length < 50){
        foods.push(createVector(random(foodSafeZone*fpg.width,  fpg.width-foodSafeZone*fpg.width),
                                random(foodSafeZone*fpg.height, fpg.height-foodSafeZone*fpg.height)));
    }
    if(random(1) < 0.03 && poisons.length < 25){
        poisons.push(createVector(  random(foodSafeZone*fpg.width,  fpg.width-foodSafeZone*fpg.width),
                                    random(foodSafeZone*fpg.height, fpg.height-foodSafeZone*fpg.height)));
    }

    //draw foods
    fpg.colorMode(RGB,255);
    fpg.noStroke();
    fpg.fill(0,255,0);
    foods.forEach(food=>{
        fpg.ellipse(food.x,food.y,8,8);
    });
    fpg.fill(255,0,0);
    poisons.forEach(poison=>{
        fpg.ellipse(poison.x,poison.y,8,8);
    });

    //render food and poisons
    image(fpg,0,0,width,height);



    let highestHealth = 0;
    let bestVehicle;
    for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
        vehicle.behave(foods,foodNutrition,poisons,poisonNutrition);
        vehicle.boundaries();
        vehicle.update();
        vehicle.show({
            g: vg,
            debug:debugActive
        });        
        if(vehicle.health < 0){
            //died
            if(random(1)<1){
                foods.push(createVector(random(foodSafeZone*fpg.width,  fpg.width-foodSafeZone*fpg.width),
                                        random(foodSafeZone*fpg.height, fpg.height-foodSafeZone*fpg.height)));
            }
            vehicles.splice(i,1);
            i--;
        }else{
            //check for the best vehicle
            if(vehicle.health > highestHealth ){
                highestHealth = vehicle.health;
                bestVehicle = vehicle.copy();
            }
        }
    }
    //render vehicle canvas
    image(vg,0,0,width,height);


    populationHistoryMax = max(populationHistoryMax,vehicles.length);
    populationTemp+= vehicles.length;
    if(frameCount%100 == 0){
        populationHistory.splice(0,1);
        populationHistory.push(populationTemp/100.0);
        populationTemp = 0
    }
    if(debugActive && bestVehicle){
        debugBarOf(bestVehicle);
    }


    //render debug bar canvas
    image(dg,0,0,width*0.2,height*0.8);
}


function debugBarOf(vehicle){

    dg.colorMode(RGB,255);
    let y = 10;
    let x = 10;
    let pd = dg.width*0.1;

    
    //bar
    dg.background(255,32);

    //apex zoom
    dg.noStroke();
    dg.fill(255,64);
    dg.rect(x,y,dg.width-20,dg.width-20)
    vehicle.pos = createVector(dg.width*0.5,dg.width*0.5);
    vehicle.size = dg.width*0.3;
    vehicle.show({
        g: dg,
        debug: false
    });
    dg.fill(255);
    dg.stroke(0);
    dg.textFont("monospace");
    dg.textSize(dg.width*0.1);
    dg.textAlign(CENTER);
    dg.text("apex: "+vehicle.name,dg.width*0.5,20);
    y+=dg.width;
    

    addText("dna: "+vehicle.dna[0].toLocaleString(undefined, {maximumFractionDigits: 4}));
    addText("     "+vehicle.dna[1].toLocaleString(undefined, {maximumFractionDigits: 4}));
    addText("     "+vehicle.dna[2].toLocaleString(undefined, {maximumFractionDigits: 4}));
    addText("     "+vehicle.dna[3].toLocaleString(undefined, {maximumFractionDigits: 4}));
    addText("     "+vehicle.dna[4].toLocaleString(undefined, {maximumFractionDigits: 4}));
    addText("     "+vehicle.dna[5].toLocaleString(undefined, {maximumFractionDigits: 4}));
    addText("health: "+vehicle.health.toLocaleString(undefined, {maximumFractionDigits: 4}));

    drawGraph(x,y,dg.width-x*2,dg.width*0.25, vehicle.healthHistory, vehicle.highestHealthEver);

    addText("generation: "+vehicle.generation);
    addText("population: "+vehicles.length);

    drawGraph(x, y, dg.width-x*2, dg.width*0.25, populationHistory, populationHistoryMax);

    function drawGraph(_x, _y, w, h, _list, listMaxVal){
        dg.noFill();
        dg.rect(_x,_y,w,h);
        let xSize = w/_list.length;
        dg.noStroke();
        dg.fill(0,255,0,150);
        dg.beginShape();
        dg.vertex(_x,_y+h);
        for (let i = 0; i < _list.length; i++) {
            const val = _list[i] / listMaxVal * h;
            vertex( _x+i*xSize, _y+h-val);
    
        }
        dg.vertex(_x+w,_y+h);
        dg.endShape();
        dg.noFill();
        dg.strokeWeight(1);
        dg.stroke(255,200);
        dg.rect(_x,_y,w,h);
        dg.stroke(0);
        dg.strokeWeight(1);
        dg.fill(255);
        dg.textAlign(RIGHT);
        dg.textSize(7);
        dg.text(listMaxVal.toLocaleString(undefined, {maximumFractionDigits: 4}),_x+w,_y-2);
        
        y+=h+pd;
    }

    function addText(t,size,align){
        dg.textAlign(align || LEFT);
        dg.textSize(size || dg.width*0.08);
        dg.text(t || "",x,y);
        y+=pd;

    }

}



let foodNutrition = 0.3;
const foodNutritionInput = document.getElementById("food-nutrition");
foodNutritionInput.value = foodNutrition;
let poisonNutrition = -2.0;
const poisonNutritionInput = document.getElementById("poison-nutrition")
poisonNutritionInput.value = poisonNutrition;
let hungerRate = 0.008;
const hungerRateInput = document.getElementById("hunger-rate");
hungerRateInput.value = hungerRate;
let cloneChance = 0.05;
const cloneChanceInput = document.getElementById("clone-chance");
cloneChanceInput.value = cloneChance;
let foodSpawnRate = 0.1;
const foodSpawnRateInput = document.getElementById("food-spawn-rate");
foodSpawnRateInput.value = foodSpawnRate;

const updateBtn = document.getElementById("update-button");
updateBtn.addEventListener("click",()=>{
    foodNutrition = +(foodNutritionInput.value);
    poisonNutrition = +(poisonNutritionInput.value);
    hungerRate = +(hungerRateInput.value);
    cloneChance = +(cloneChanceInput.value);
    foodSpawnRate = +(foodSpawnRateInput.value);
});

const customSpawn = document.getElementById("custom-spawn");
customSpawn.checked = false;
const randomSpawn = document.getElementById("random-spawn");
randomSpawn.checked = true;
customSpawn.addEventListener("click",()=>{
    customSpawn.checked = true;
    randomSpawn.checked = false;
});

randomSpawn.addEventListener("click",()=>{
    customSpawn.checked = false;
    randomSpawn.checked = true;
});

const debugActiveInput = document.getElementById("debug-active");
debugActiveInput.checked = debugActive;
debugActiveInput.addEventListener("click",()=>{
    debugActive=debugActiveInput.checked;
})









