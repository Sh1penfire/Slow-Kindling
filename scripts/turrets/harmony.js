// Obligatory comment line for no reason at all
const fc = require("libs/fc");
//shoot effect for puver
const puverShoot = new Effect(30, e => {
  Draw.color(Color.valueOf("0A01b7"), Color.valueOf("56D7CA"), e.fslope());
  Draw.alpha(0.5);
  Fill.circle(e.x, e.y, e.fslope() * 5);
  Draw.color(Color.blue, Color.valueOf("0A01b7"), Color.valueOf("0A01b7"), e.fin());
  Angles.randLenVectors(e.id, 8, e.finpow() * 25, e.rotation, 10, (x, y) => {
    Fill.circle(e.x + x, e.y + y, 0.65 + e.fout() * 1.5);
  })
});



//Charge effect for puver
/*
const puverCharge = new Effect(30, e => {
  Draw.color(Color.black, Color.white, e.fin());
  Lines.stroke(e.fin() * 2);
  Lines.circle(e.x, e.y, e.fout() * 10);
});
*/

//trail effect for the shot
const shotTrail = new Effect(10, e => {
  Draw.color(Color.valueOf("0A01b7"), Color.valueOf("56D7CA"), e.fin());
  Lines.stroke(e.fout() * 2);
  Lines.circle(e.x, e.y, e.fin() * 4);
});

//effect when bullet breaks
const shotHit = new Effect(40, e => {
  Draw.color(Color.valueOf("56D7CA"), Color.valueOf("0A01b7"), e.fin());
  Lines.stroke(e.fout() * 2);
  Lines.circle(e.x, e.y, e.fin() * 4);
});

//frag effect
const blast = new Effect(25, e => {
  Draw.color(e.data.frontColor, e.data.backColor, e.fin());
  Lines.stroke(e.fin() * 2);
  Lines.circle(e.x, e.y, e.fout() * 2);
});


//makes the shot of puver
const SOFreezing = extend(MissileBulletType, {
    update(b){
        shotTrail.at(b.x, b.y);
        fireShot.create(b.owner, b.team, b.x, b.y, fc.rotationFC(b.rotation(), 90), fc.helix(7, 3, b.fin(), 1));
        fireShot.create(b.owner, b.team, b.x, b.y, fc.rotationFC(b.rotation(), -90), fc.helix(7, 3, b.fin(), 1));
    },
    collision(b){
        this.super$collision(b)
        b.apply(this.status, this.statusDuration)
        b.apply(StatusEffects.burning, this.statusDuration)
    }
});

const SOFlame = extend(BasicBulletType, {
    damage: 1,
    speed: 2,
    lifetime: 6,
    width: 0,
    height: 0,
    hitSize: 4,
    status: StatusEffects.burning,
    despawned(b){
        blast.at(b.x, b.y, b.rotation(), b);
    },
    hit(b){
        blast.at(b.x, b.y, b.rotation(), b);
    },
    collision(b){
        this.super$collision(b);
        b.apply(StatusEffects.freezing, this.statusDuration)
    }
});

//extends off the puver hjson file
const SOFAI = extendContent(PowerTurret, "SOFAI", {
    localizedName: "SOFAI",
    description: "Shoots bolts of fire and ice, inspirred from thorium mod",
    size: 3,
    range: 125,
    reloadTime: 50,
    shots: 1,
    shootEffect: Fx.none,
    smokeEffect: Fx.none,
    requirements: ItemStack.with(
        Items.copper, 69
    ),
    alwaysUnlocked: true,
    inEditor: true,
  icons(){
    return [
      Core.atlas.find("block-3"),
      Core.atlas.find("salvo")
    ];
  }
});

//stats of bullet shot by puver
shot.damage = 25;
shot.speed = 3;
shot.lifetime = 35;
shot.knockback = 5;
shot.pierce = true;
shot.pierceBuilding = true;
shot.width = 0;
shot.height = 0;
shot.hitSize = 4
shot.collides = true;
shot.collidesTiles = true;
shot.hitEffect = Fx.none;
shot.despawnEffect = shotHit;
shot.shootEffect = puverShoot;
shot.hitSound = Sounds.none;
//shot.smokeEffect = puverSmoke;