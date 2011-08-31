(function(window){
  var TILESET_WIDTH = 5,
      TILE_WIDTH = 63,
      TILE_HEIGHT = 32;
  var sprite,
      world_seed = 20110719,
      view_diameter = 30;
  jQuery(document).ready(function(){
    var img = new Image();
    img.onload = function(){
      sprite = img;
      MainScene();
    };
    img.src = 'tiles.png';
  });
  var MainScene = function(){
    var context = document.getElementById('canvas').getContext('2d');
    var hero = Player(0,0),
        map = Map(),
        tile_manager = TileManager(hero,map,context);
    run_at_fps(function(iteration){
      if(iteration % 10 === 0){
        hero.sprite = hero.sprites[hero.direction].walk[hero.sprite_index];
        hero.sprite_index += 1;
        if(hero.sprite_index > hero.sprites[hero.direction].walk.length - 1){
          hero.sprite_index = 0;
        }
      }
      tile_manager.render();
    },20);
    jQuery(document).keydown(function(e){
      if(e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40){
        var vx = 0,
            vy = 0;
        if(e.keyCode === 37){
          hero.sprite = hero.sprites.northwest.stop;
          hero.direction = 'northwest';
          if(map.get_tile(hero.map_x - 1,hero.map_y)){
            vx -= 1;
          }
        }
        if(e.keyCode === 38){
          hero.sprite = hero.sprites.northeast.stop;
          hero.direction = 'northeast';
          if(map.get_tile(hero.map_x,hero.map_y - 1)){
            vy -= 1;
          }
        }
        if(e.keyCode === 39){
          hero.sprite = hero.sprites.southeast.stop;
          hero.direction = 'southeast';
          if(map.get_tile(hero.map_x + 1,hero.map_y)){
            vx += 1;
          }
        }
        if(e.keyCode === 40){
          hero.sprite = hero.sprites.southwest.stop;
          hero.direction = 'southwest';
          if(map.get_tile(hero.map_x,hero.map_y + 1)){
            vy += 1;
          }
        }
        hero.move_by(vx,vy);
      }
    });
  };
  var TileManager = function(hero,map,context){
    var self = {},
        width = view_diameter,
        height = view_diameter,
        offset_left = 0,
        offset_top = 0,
        tiles = [],
        tile_x,
        tile_y,
        canvas_width = context.canvas.width,
        canvas_height = context.canvas.height,
        w = TILE_WIDTH,
        h = TILE_HEIGHT;
    var tile_cache = {};
    var sprite_tilemap = SpriteMap(sprite,0,0,315,128),
        tree_tilemap = SpriteMap(sprite,315,0,70,116);
    tile_cache.grass = Tile(sprite_tilemap,4,w,h);
    tile_cache.tree_grass = Tile(sprite_tilemap,2,w,h);
    tile_cache.tree = Tile(tree_tilemap,0,tree_tilemap.width,tree_tilemap.height);
    self.render = function(){
      context.clearRect(0,0,canvas_width,canvas_height);
      var offset_x = hero.map_x - Math.floor(width / 2),
          offset_y = hero.map_y - Math.floor(height / 2),
          y,
          yl,
          x,
          xl;
      for(y = 0, yl = height; y < yl; y += 1){
        for(x = 0, xl = width; x < xl; x += 1){
          tile_x = (x - y) * (w / 2);
          tile_y = (x + y) * (h / 2);
          tile_x += ((w / 2) * (yl - 1));
          tile_x -= ((view_diameter * w) / 2) - (canvas_width / 2);
          tile_y -= ((view_diameter * h) / 2) - (canvas_height / 2);
          if(tile_x < 0 - w || tile_y < 0 - h || tile_x > canvas_width + w || tile_y > canvas_height + h){
            // only draw visible tiles
            continue;
          }
          var tile_index = map.get_tile(x + offset_x,y + offset_y);
          if(tile_cache[tile_index] === undefined){
            tile_cache[tile_index] = Tile(sprite,tile_index,w,h);
          }
          if(tile_index === 0){
            context.drawImage(tile_cache.tree_grass,tile_x,tile_y);
            context.drawImage(tile_cache.tree,tile_x - 3.5,tile_y - tree_tilemap.height + h / 1.5);
          }else{
            context.drawImage(tile_cache.grass,tile_x,tile_y);
          }
          if(hero.map_x === x + offset_x && hero.map_y === y + offset_y){
            context.drawImage(hero.sprite,tile_x + 22,tile_y - hero.sprite.height + h / 1.5);
          }
        }
      }
    };
    return self;
  };
  var Map = function(){
    var self = {};
    var seed_from_xy = function(x,y){
      var random = new Alea(world_seed);
      random = new Alea(random() + x);
      random = new Alea(random() + y);
      return random();
    };
    self.get_tile = function(x,y){
      var random = new Alea(seed_from_xy(x,y));
      return (Math.floor(random() * 10) < 9) % 2;
    };
    return self;
  };
  var Player = function(map_x,map_y){
    var self = {};
    self.map_x = map_x;
    self.map_y = map_y;
    self.move_by = function(vx,vy){
      self.map_x += vx;
      self.map_y += vy;
    };
    self.sprites = {};
    var index,
        w = 24,
        h = 33,
        character_tilemap = SpriteMap(sprite,385,0,72,132);
    // northeast
    index = 0;
    var canvas = TmpCanvas(w,h);
    canvas.context.drawImage(character_tilemap,0,h * index,w,h,0,0,w,h);
    self.sprites.northeast = {};
    self.sprites.northeast.stop = canvas.canvas;
    self.sprites.northeast.walk = AnimationFrames(character_tilemap,w,h,index,24,2);
    // southeast
    index = 1;
    canvas = TmpCanvas(w,h);
    canvas.context.drawImage(character_tilemap,0,h * index,w,h,0,0,w,h);
    self.sprites.southeast = {};
    self.sprites.southeast.stop = canvas.canvas;
    self.sprites.southeast.walk = AnimationFrames(character_tilemap,w,h,index,24,2);
    // southwest
    index = 2;
    canvas = TmpCanvas(w,h);
    canvas.context.drawImage(character_tilemap,0,h * index,w,h,0,0,w,h);
    self.sprites.southwest = {};
    self.sprites.southwest.stop = canvas.canvas;
    self.sprites.southwest.walk = AnimationFrames(character_tilemap,w,h,index,24,2);
    // northwest
    index = 3;
    canvas = TmpCanvas(w,h);
    canvas.context.drawImage(character_tilemap,0,h * index,w,h,0,0,w,h);
    self.sprites.northwest = {};
    self.sprites.northwest.stop = canvas.canvas;
    self.sprites.northwest.walk = AnimationFrames(character_tilemap,w,h,index,24,2);
    self.direction = 'northeast';
    self.sprite = self.sprites[self.direction].stop;
    self.sprite_index = 0;
    return self;
  };
  var AnimationFrames = function(tilemap,w,h,index,pixel_height,count){
    var frames = [],
        i;
    for(i = 0; i < count; i += 1){
      var c = TmpCanvas(w,h);
      c.context.drawImage(tilemap,(i + 1) * pixel_height,h * index,w,h,0,0,w,h);
      frames[i] = c.canvas;
    }
    return frames;
  };
  var SpriteMap = function(img,x,y,w,h){
    var self = TmpCanvas(w,h);
    self.context.drawImage(img,x,y,w,h,0,0,w,h);
    return self.canvas;
  };
  var Tile = function(img,index,w,h){
    var self = TmpCanvas(w,h),
        y = Math.floor(index / TILESET_WIDTH),
        x = (index % TILESET_WIDTH);
    self.context.drawImage(img,(x * w),(y * h),w,h,0,0,w,h);
    return self.canvas;
  };
  var TmpCanvas = function(w,h){
    var self = {};
    self.canvas = document.createElement('canvas');
    self.canvas.width = w;
    self.canvas.height = h;
    self.context = self.canvas.getContext('2d');
    return self;
  };
  var run_at_fps = function(callback,fps,itr){
    itr = itr || 0;
    setTimeout(function(){
      callback(itr);
      itr += 1;
      run_at_fps(callback,fps,itr);
    },1000 / fps);
  };
})(window);
