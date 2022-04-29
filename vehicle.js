


class Vehicle{
    
    constructor(pos, dna, health, generation, forceClone){


        //dna is genes' itself. no sub veriables. its just an array of genes
        this.dna=[];
        if(dna){
            this.dna[0] = dna[0];
            this.dna[1] = dna[1];
            this.dna[2] = dna[2];
            this.dna[3] = dna[3];
            this.dna[4] = dna[4];
            this.dna[5] = dna[5];
            this.dna[6] = dna[6];
            if(!forceClone){
                colorMode(HSB,1); //with each mutation to genes, color changes a bit
                if(random(1) < this.mutationRate){
                    this.dna[0] = dna[0]+random(-0.2,0.2);
                    this.dna[6] = color((hue(this.dna[6])+0.01)%1,1,1);
                }
                if(random(1) < this.mutationRate){
                    this.dna[1] = dna[1]+random(-0.2,0.2);
                    this.dna[6] = color((hue(this.dna[6])+0.01)%1,1,1);
                }
                if(random(1) < this.mutationRate){
                    this.dna[2] = dna[2]+random(-20,20);
                    this.dna[6] = color((hue(this.dna[6])+0.1)%1,1,1);
                }
                if(random(1) < this.mutationRate){
                    this.dna[3] = dna[3]+random(-20,20);
                    this.dna[6] = color((hue(this.dna[6])+0.01)%1,1,1);
                }
                if(random(1) < this.mutationRate){
                    this.dna[4] = dna[4]+random(-1,1);
                    this.dna[6] = color((hue(this.dna[6])+0.01)%1,1,1);
                }
                if(random(1) < this.mutationRate){
                    this.dna[5] = dna[5]+random(-0.2,0.2);
                    this.dna[6] = color((hue(this.dna[6])+0.1)%1,1,1);
                }
            }
            
        }else{
            this.dna[0] = random(0,2);      //food attraction
            this.dna[1] = random(-2,0);     //poison attraction
            this.dna[2] = random(5,150);    //food perseption
            this.dna[3] = random(5,150);    //poison perception
            this.dna[4] = random(2,6);      //maxVel
            this.dna[5] = random(0,1);      //maxAcc
            colorMode(HSB,1);
            this.dna[6] = color(random(1),1,1);//color
        }


        if(pos){
            this.pos = createVector(pos.x,pos.y);
        }else{
            this.pos = createVector(random(width),random(height));
        }
        this.acc = createVector();
        this.size = 10;
        this.vel = p5.Vector.random2D().setMag(this.dna[4]);
        this.friction = 1;
        this.health = health || 3;
        this.highestHealthEver = this.health;
        this.healthHistory = [];
        for (let i = 0; i < 50; i++) {
            this.healthHistory.push(0);
        }
        this.mutationRate = 0.25;
        this.sleepTimer = 100;
        this.generation = generation || 1;
        this.name = getRandomName(this.generation);
        
    }

    applyForce(v){
        this.acc.add(v);
    }

    update(){
        if(this.sleepTimer > 0){
            this.sleepTimer--;
        }else{
            this.vel.add(this.acc.limit(this.dna[5]));
            this.vel.limit(this.dna[4]);
            this.vel.mult(this.friction);
            this.pos.add(this.vel);
            this.acc.mult(0);
            this.health-=hungerRate;
            //not accurate. needs averaging between record delays but anyways.
            if(frameCount%10 == 0){
                this.healthHistory.splice(0,1);
                this.healthHistory.push(this.health);
            }
            this.highestHealthEver = max(this.health, this.highestHealthEver);
        }
    }

    show(args){
        args.g.push();
        args.g.colorMode(RGB,255);
        args.g.translate(this.pos.x,this.pos.y);
        args.g.rotate(this.vel.heading());
        args.g.noStroke();
        //strokeWeight(2);
        //stroke(lerpColor(color(255,0,0),color(0,255,0),this.health));
        args.g.fill(this.dna[6]);
        args.g.beginShape();
        args.g.vertex(this.size,0);
        args.g.vertex(-this.size,this.size*0.5);
        args.g.vertex(0,0);
        args.g.vertex(-this.size,-this.size*0.5);
        args.g.endShape(CLOSE);
        if((args) && args.debug){
            args.g.noFill();
            args.g.strokeWeight(1);
            args.g.stroke(0,255,0,map(max(0,this.dna[0]),-2,2,0,255));
            args.g.ellipse(0,0,this.dna[2]*2,this.dna[2]*2);
            args.g.stroke(255,0,0,map(max(0,this.dna[1]),-2,2,255,0));
            args.g.ellipse(0,0,this.dna[3]*2,this.dna[3]*2);
        }

        args.g.pop();
    }

    cloneMe(){
        return new Vehicle(this.pos,this.dna, this.health, this.generation+1);
    }

    behave(good,goodNutrition,bad,badNutrition){
        let steerG = this.huntFood(good, goodNutrition, this.dna[2]);
        let steerB = this.huntFood(bad, badNutrition, this.dna[3]);

        steerG.mult(this.dna[0]);
        steerB.mult(this.dna[1]);
        
        this.applyForce(steerG);
        this.applyForce(steerB);
        
    }


    huntFood(list, nutrition, perception){
        let record = Infinity;
        let closest = null;
        for (let i = list.length-1; i >= 0 ; i--) {
            const d = this.pos.dist(list[i]);


            if(d < this.dna[4]){
                list.splice(i,1);
                this.health += nutrition;
                
                //clone itself if its a good food
                if(random(1)<cloneChance && nutrition > 0){
                    if(vehicles.length < 100){
                        vehicles.push(this.cloneMe());
                    }
                }
            }else{
                if(d < record && d < perception){
                    record = d;
                    closest = list[i];
                }
            }
            
        }

        if(closest != null){
            return this.seek(closest);
        }

        
        return createVector(0,0);
        
    }

    seek(target){
        const desired = p5.Vector.sub(target,this.pos);
        desired.limit(this.dna[4]);
        const steer = p5.Vector.sub(desired,this.vel);
        steer.limit(this.dna[5]);

        return steer;

    }
 
    

    boundaries() {
        const d = foodSafeZone*min(fpg.width,fpg.height);

        let desired = null;

        if (this.pos.x < d) {
            desired = createVector(this.dna[4], this.vel.y);
        } else if (this.pos.x > vg.width - d) {
            desired = createVector(-this.dna[4], this.vel.y);
        }

        if (this.pos.y < d) {
            desired = createVector(this.vel.x, this.dna[4]);
        } else if (this.pos.y > vg.height - d) {
            desired = createVector(this.vel.x, -this.dna[4]);
        }

        if (desired !== null) {
            desired.normalize();
            desired.mult(this.dna[4]*2);
            const steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxforce);
            this.applyForce(steer);
        }
    }

    copy(){
        const a = new Vehicle();
        a.pos = this.pos;
        a.vel = this.vel;
        a.dna = this.dna;
        a.health = this.health;
        a.healthHistory = this.healthHistory;
        a.highestHealthEver = this.highestHealthEver;
        a.generation = this.generation;
        a.name = this.name;
        return a;
    }

}




function getRandomName(gen){
    let a = "euioa".split("");
    let b = "qwrtypsdfghjklzxcvbnm".split("");
    let name = gen+"";
    for (let i = 0; i < 3; i++) {
        name = name+a[floor(random(a.length))];
        name = name+b[floor(random(b.length))];
    }
    return name;
}









