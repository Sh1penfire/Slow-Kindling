let 
cherryPink = Color.valueOf("#ffb1ff"),
brightSpore = Color.valueOf("#b46eff");
let replacementFx = new ObjectMap();

let shootPyraFlame = new Effect(33, 80, e => {
    Draw.color(Pal.lightTrail, Pal.darkPyraFlame, Color.gray, e.finpow());
    Draw.alpha(Math.min(e.fin() * 6, 1) * 0.75 + e.fout() * 0.25);

    Angles.randLenVectors(e.id, 10, e.finpow() * 70, e.rotation, 4, (x, y) => {
        Fill.circle(e.x + x, e.y + y + e.finpow() * 5 - 1, e.fout() * 2.65);
    });
});

let thorBurst = new Effect(35, e => {
    Angles.randLenVectors(e.id, 3, e.finpow() * 95, e.rotation, 360, (x, y) => {
        Draw.color(Pal.spore, Items.thorium.color, Items.graphite.color, Math.abs(x + y)/23 % 1);
        Fill.circle(e.x + x, e.y + y - e.fin() * 24, e.fout() * 3.35);
    });
    Angles.randLenVectors(e.id, 5, e.finpow() * 125, e.rotation, 360, (x, y) => {
        Draw.color(Color.white, Items.thorium.color, Items.graphite.color, Math.abs(x + y)/39 % 1);
        Fill.square(e.x + x, e.y + y - e.fin() * 36, e.fout() * 2.35, e.fout() * 360);
    });
    
    e.scaled(15, h => {
        Lines.stroke(h.fout());
        Draw.color(Color.white, Pal.accent, h.fout());
        Lines.circle(e.x, e.y, h.fin() * 65);
    });
});

replacementFx.put(Fx.shootPyraFlame, shootPyraFlame);

let bullet = null;

Events.on(ClientLoadEvent, () => {
    Vars.content.bullets().each(b => {
        try{
            if(replacementFx.containsKey(b.shootEffect)){
                b.shootEffect = replacementFx.get(b.shootEffect);
            }
        }
        catch(e){
            try{
                Log.info("An unexpected error occoured when trying to replace bullet particles: " + b + " " + e);
            }
            catch(ee){
                Log.info(e + "," + ee);
            }
        }
    });
    Bullets.standardThoriumBig.hitEffect = thorBurst;
    bullet = Blocks.spectre.ammoTypes.get(Items.thorium);
    bullet.hitEffect = thorBurst;
    bullet.frontColor = cherryPink;
    bullet.backColor = brightSpore;
    bullet = Blocks.salvo.ammoTypes.get(Items.thorium);
    bullet.frontColor = cherryPink;
    bullet.backColor = brightSpore;
});

//units

let ningMap = ObjectMap.of(UnitTypes.beta, {
    region: "beta-shield",
    color: Pal.lancerLaser,
    alpha: 0.35,
    glareAlphaMulti: 0.05,
    velMin: 1,
    velMax: 3,
    x: 0,
    y: 0
});

let currentWeapon = null;

let unitSeq = Seq.with();

function loadIcons(unit){
    unitSeq.add(unit);
}

Events.on(EventType.ClientLoadEvent, e => {
    unitSeq.each(unit => {
        unit.load();
        if(Version.number > 6){
            unit.fullIcon = Core.atlas.find(unit.name + "-full");
        }
        else unit.fullRegion = Core.atlas.find(unit.name + "-full");
    });
});

//Core.atlas.find("unit-" + unit.name "-full")

//alpha
UnitTypes.alpha.weapons.each(w => {
    w.name = "tiny-single-blaster";
    w.y = 2.25;
});
loadIcons(UnitTypes.alpha);

//beta
loadIcons(UnitTypes.beta);

//gamma
UnitTypes.gamma.weapons.each(w => {
    w.name = "tiny-duality-blaster";
    w.x = w.x > 0 ? 0.75 : -0.75;
    w.y = 2.75;
    w.bullet.frontColor = StatusEffects.melting.color;
    w.bullet.trailEffect = Fx.melting;
    w.bullet.trailChance = 0.25;
});
loadIcons(UnitTypes.gamma);



let cbility = null;

Events.on(Trigger.draw.getClass(), e => {
    Groups.unit.each(u => {
        if(ningMap.containsKey(u.type)){
            
            Draw.reset();
            
            cbility = ningMap.get(u.type);
            
            if(u.vel.len() < cbility.velMin) return;
            
            Draw.z((Layer.flyingUnit, u.type.lowAltitude ? Layer.flyingUnitLow : Layer.flyingUnit));
            let alpha = Mathf.clamp((u.vel.len() - cbility.velMin)/(cbility.velMax - cbility.velMin), 0, 1);
            
            Draw.color(cbility.color);
            Draw.alpha(alpha * cbility.alpha);
            Draw.rect(cbility.region, u.x + cbility.x, u.y + cbility.y, u.rotation - 90);
            
            Draw.blend(Blending.additive);
            Draw.color(Color.white);
            Draw.alpha(alpha * cbility.alpha * cbility.glareAlphaMulti);
            Draw.rect(cbility.region, u.x + cbility.x, u.y + cbility.y, u.rotation - 90);
            Draw.blend();
            
            Draw.reset();
        }
    });
});

/*
let h = [];
let i = 0;
let continued = true;
let beforeTheChaos = Core.atlas.getRegionMap().copy();

while(continued){
  h[i] = [];
  for(let y = 0; y < 3; y++){
    let region = Core.atlas.find("endless-rusting-PLACEHOLDER" + (i * 4 + y + 1));
    if(region == Core.atlas.find("error")) continued = false;
    else{
      h[i][y] = region;
    }
  }
  i++;
}
Vars.content.blocks().each(b => {
    try{
        if(b.size <= h.length - 1){
            let region = h[b.size - 1][Math.round(Math.random() * h[b.size - 1].length)];
            b.region = region;
            Log.info(b.region);
            for(let i = 0; i < Cicon.values().length; i++){
                let cicon = Cicon.values()[i];
                let image = new Image(region);
                image.height = cicon.size;
                image.width = cicon.size;
                Core.atlas.addRegion(
                    b.name + "-" + cicon.name(), region
                );
                b.icon(cicon).set(region);
            }
        }
    }
    catch(e){

    }
});

beforeTheChaos.each((nam, reg) => {
    Core.atlas.regionMap.remove(nam);
    Core.atlas.addRegion(nam, reg.texture, reg.offsetX, reg.offsetY, reg.width, reg.height);
});



let original = Core.bundle.getProperties();
let edit = Core.bundle.getProperties().copy();
let keys = edit.keys().toSeq();
let changeChance = 0.01;

Events.on(Trigger.update.getClass(), e => {

    if(!Mathf.chance(changeChance)) return;
    
    let tmpKeys = Seq.with();
    let tmpEdit = edit.copy();
    
    tmpKeys.set(keys);
    tmpEdit.each((k, v) => {
        let value = tmpKeys.random();
        tmpKeys.remove(value);
        tmpEdit.put(k, edit.get(value));
    });
    
    Core.bundle.setProperties(tmpEdit);
});

*/
