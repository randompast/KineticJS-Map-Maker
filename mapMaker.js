
//Image loader, suggested my html5canvastutorials.com
function loadImages(sources, callback) {

    var images = {};
    var loadedImages = 0;
    var numImages = 0;

    for (var src in sources) {
        numImages++;
    }

    for (var src in sources) {

        images[src] = new Image();
        images[src].onload = function(){

            if (++loadedImages >= numImages) {
                callback(images);
            }

        };
        images[src].src = sources[src];
    }
}


//Store data to the brush.
function paintBrush(brush, grid, tile,  mapProps) {

  var tS = mapProps.tS;
  var top;

  if (!mapProps.iso) top = tile.attrs.y / tS;
  if (mapProps.iso) top = tile.attrs.y / ( tS / 2 );

  var bottom = top + brush.y;
  var left = tile.attrs.x / tS;
  var right = left + brush.x;
  var idc = 0; //indexcorrecter

  for ( var j = top; j < bottom; j++ ) {

    for ( var i = left; i < right; i++ ) {

      //error correction
      if ( mapProps.iso ) idc = ( j - top );

      //prevent errors/breaking
      if ( grid[ j + idc ] && grid[ j + idc ][ i ]) {

        if( mapProps.hoverDrawing ) {

          //paint with top left brush coordinate
          grid[ j ][ i ].attrs.srcx = brush[0][0][0]; 
          grid[ j ][ i ].attrs.srcy = brush[0][0][1];

        } else {

          //cycle through the brush tiles
          grid[ j + idc][ i ].attrs.srcx = brush[ j - top ][ i - left ][0];
          grid[ j + idc][ i ].attrs.srcy = brush[ j - top ][ i - left ][1];  
        }
      }
    }
  }
}


//For displaying the brush
function makeBrush(mapProps, brush, grid, tile, tS) {

  var gridx;
  var gridy;

  //for resizing with wasd
  if ( tile == undefined ) {

    gridx = brush[0][0][0] / tS; 
    gridy = brush[0][0][1] / tS;

  } else {

    gridx = tile.attrs.x / tS - mapProps.mapSizeX;
    gridy = tile.attrs.y / tS;

  }

  for ( var j = 0; j < brush.y; j++ ) {

    for ( var i = 0; i < brush.x; i++ ) {

        if ( grid[ j + gridy ] && grid[ j + gridy ][ i + gridx ] ) {

          brush[j][i][0] = grid[ j + gridy ][ i + gridx ].attrs.srcx;
          brush[j][i][1] = grid[ j + gridy ][ i + gridx ].attrs.srcy;

        }
      }
  }
}

//resize the brush display
function palletOverlay(rect, brush, tS, overlayGuide) {

  rect.attrs.srcwidth = tS * brush.x;
  rect.attrs.srcheight = tS * brush.y;
  rect.attrs.width = tS * brush.x;
  rect.attrs.height = tS * brush.y;
  rect.rect.attrs.x = rect.attrs.x; 
  rect.rect.attrs.y = rect.attrs.y;
  rect.rect.attrs.width = rect.attrs.width; 
  rect.rect.attrs.height = rect.attrs.height; 

  //update the display
  overlayGuide.draw();
}

function mapMaker(tS, tileSet, mapLayer, mapProps) {  //make a map layer

    var map = [];
    var rand = Math.floor( Math.random() * 10 );

    for ( var j=0; j < mapProps.mapSizeY; j++ ) {

      map[j] = [];

      for ( var i = 0; i < mapProps.mapSizeX; i++ ) {

        map[j][i] = new Kinetic.QImage({  //This sprite was 3x4 tiles
          x: tS * i,
          y: tS * j / mapProps.div, //tS*j/2 for isometric
          image: tileSet,
          width: tS,
          height: tS,
          name: "image",
          srcx: tS * rand, //x source position
          srcy: tS * 0, //y source position
          srcwidth: tS, //source width
          srcheight: tS, //source height
          //draggable: true
        });
      }
    }

    return map;
}

function mapListeners(tS, mapProps, map, layer, mapLayer, brush, brushSrcX, brushSrcY, overlayGuide, rect) {

  //add listeners
  for ( var j = 0; j < mapProps.mapSizeY; j++ ) {

    for ( var i = 0; i < mapProps.mapSizeX; i++ ) {

      map[layer][j][i].on("mousedown", function() {

        this.attrs.srcx = brushSrcX;
        this.attrs.srcy = brushSrcY;

        paintBrush( brush, map[layer], this, mapProps );

        mapLayer.draw();
      
      });

      map[layer][j][i].on("mouseover", function() {

        rect.attrs.x = this.attrs.x;
        rect.attrs.y = this.attrs.y;

        palletOverlay( rect, brush, tS, overlayGuide );

        overlayGuide.draw();

        if ( mapProps.hoverDrawing ) {

          this.attrs.srcx = brushSrcX;
          this.attrs.srcy = brushSrcY;

          paintBrush( brush, map[layer], this, mapProps );
          
          mapLayer.draw();

        }

      });

      mapLayer.add(map[layer][j][i]); 

    }

  }

}

function mapLayerSelector(map, mapLayer, mapProps) {

  //use 1,2,... to select the layers
  for(var j=0; j<mapProps.mapSizeY; j++) {

    for(var i=0; i<mapProps.mapSizeX; i++) {

      //Move all of the kinetic.Image tiles to the top. (even transparent tiles)
      map[j][i].moveToTop();

    }
  }

  //Display
  mapLayer.draw(); 

}

function mapDataSaver(map, mapLayer, mapProps) {

  var myMapData = [];

  //use 1,2,... to select the layers
  for ( var j = 0; j < mapProps.mapSizeY; j++ ) {
    myMapData[j] = [];

    for( var i = 0; i < mapProps.mapSizeX; i++ ) {

      myMapData[j][i] = [];
      myMapData[j][i][0] = map[j][i].attrs.srcx;
      myMapData[j][i][1] = map[j][i].attrs.srcx; 

    }
  }
  
  return myMapData;
}

//Do everything
function initStage(images) {

    var tileSet = images.tileSet5;
    var isISO = globalMapData.isometric;

    console.log(isISO);

    var tS = parseInt(globalMapData.tS, 10);
    var mapSizeX = parseInt(globalMapData.mapX, 10);
    var mapSizeY = parseInt(globalMapData.mapY, 10);
    var mapSpacing = parseInt(globalMapData.mapSpacing, 10);

    var stage = new Kinetic.Stage({
      container: 'container', 
      width: mapSizeX * tS + tileSet.height, 
      height: tileSet.height
    });

    var tilesetLayer = new Kinetic.Layer();
    var mapLayer = new Kinetic.Layer();
    var overlayGuide = new Kinetic.Layer();

    //probably should do something else
    var brushSrcX = 0;

    //would need to change a few things
    var brushSrcY = 0; 

    var brush = [];

    // max size
    brush.size = 10;

    // current
    brush.x = 1;
    brush.y = 1;

    // initialize to top left tile
    for( var j = 0; j < brush.size; j++) {

      brush[j] = [ [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0] ];

    }

    //Create the brush display
    var rect = new Kinetic.QImage({
        x: -500,
        y: -500,
        image: tileSet,
        width: tS,
        height: tS,
        name: "image",
        srcx: 0, //x source position
        srcy: 0, //y source position
        srcwidth: tS, //source width
        srcheight: tS, //source height
        alpha: 0.5
    });

    rect.rect = new Kinetic.Rect({
        x: rect.attrs.x,
        y: rect.attrs.y,
        width: rect.attrs.width,
        height: rect.attrs.width,
        fill: "#00D2FF",
        stroke: "black",
        strokeWidth: 4,
        alpha: 0.2
    });

    //make it invisible to the mouse events
    rect.listen( false );
    rect.rect.listen( false );

    //Map (background, initial)
    var map = [];
    var mapProps = {};

    mapProps.hoverDrawing = false; // currently changed by holding shift
    mapProps.tS = tS; //tileSize 
    mapProps.mapSizeX = mapSizeX;
    mapProps.mapSizeY = mapSizeY;
    mapProps.iso = isISO;
    mapProps.mapSpacing = mapSpacing;

    if ( mapProps.iso ) {

      mapProps.div = 2;

    } else {

      mapProps.div = 1;

    }

    //make a layer
    map[0] = mapMaker( tS, tileSet, mapLayer, mapProps );
    map[1] = mapMaker( tS, tileSet, mapLayer, mapProps );

    //add listeners and display layer
    mapListeners( tS, mapProps, map, 0, mapLayer, brush, brushSrcX, brushSrcY, overlayGuide, rect );
    mapListeners( tS, mapProps, map, 1, mapLayer, brush, brushSrcX, brushSrcY, overlayGuide, rect );

    //Construct Tile Set
    var tiles = [];

    for ( var j = 0; j < tileSet.height / tS; j++ ) {

      tiles[j] = [];

      for(var i=0; i<tileSet.width/tS; i++) {

        tiles[j][i] = new Kinetic.QImage({
          x: tS * i + mapProps.mapSizeX * mapProps.tS,
          y: tS * j,
          image: tileSet,
          width: tS,
          height: tS,
          name: "image",
          srcx: tS * i + mapProps.mapSpacing * i, //x source position
          srcy: tS * j + mapProps.mapSpacing * j, //y source position
          srcwidth: tS, //source width
          srcheight: tS //source height
        });

        tiles[j][i].on("mouseover", function() {

          rect.attrs.x = this.attrs.x;
          rect.attrs.y = this.attrs.y;

          palletOverlay( rect, brush, tS, overlayGuide );
          
          overlayGuide.draw();

        });

        tiles[j][i].on("mousedown", function() {

          rect.attrs.srcx = this.attrs.srcx;
          rect.attrs.srcy = this.attrs.srcy;

          makeBrush( mapProps, brush, tiles, this, tS );
          
          palletOverlay( rect,brush,tS,overlayGuide );
          
          overlayGuide.draw();

        });

        tilesetLayer.add(tiles[j][i]);

      } 
    }

    overlayGuide.add( rect );
    overlayGuide.add( rect.rect );

    //various map layers
    stage.add( mapLayer );
    
    //tileset
    stage.add( tilesetLayer );
    
    //display brush
    stage.add( overlayGuide );

    //current keyboard controls
    document.addEventListener( 'keydown', function (e) { 

        var keyCode = e.which;
        var data;

        if ( keyCode == 38 || keyCode == 40 || keyCode == 32 ) e.preventDefault(); //disables page scrolling

        //+,- removed
        if ( keyCode == 80 ) {

          data = mapDataSaver(map[0], mapLayer, mapProps); 
          console.log(JSON.stringify(data));

        }

        if ( keyCode == 16 ) {
          mapProps.hoverDrawing = true;
        }

        //wasd
        if (keyCode == 87 || keyCode == 65 || keyCode == 83 || keyCode == 68) {

          if (keyCode == 83 && brush.y < brush.size) brush.y++;
          if (keyCode == 68 && brush.x < brush.size) brush.x++;
          if (keyCode == 87 && brush.y > 1) brush.y--;
          if (keyCode == 65 && brush.x > 1) brush.x--;

          palletOverlay( rect, brush, tS, overlayGuide );

          console.log(brush.y+", "+brush.x);

        }

        //1,2

        if (keyCode == 49 || keyCode == 50) {

          //1
          if (keyCode == 49) {
            mapLayerSelector(map[0], mapLayer, mapProps);
          }

          //2
          if (keyCode == 50) {
            mapLayerSelector(map[1], mapLayer, mapProps);            
          }

        }

        //update brush's display
        makeBrush(  mapProps, brush, tiles, undefined, tS );

    });

    document.addEventListener('keyup', function (e) {

        var keyCode = e.which;

        //shift
        if (keyCode == 16) mapProps.hoverDrawing = false;

    });

}


var loadMapMaker = function(tilesetURL) {

    var sources = {

        //http://silveiraneto.net/tag/tileset/
        //tileSet1: "http://www.quantumfractal.info/kineticjs/tiletest/free_tileset_CC.png", //CC-By-SA
        //http://opengameart.org/sites/default/files/grassland_tiles.png
        //tileSet2: "http://www.files.cruel-online.de/img/tiles/grassland_tiles.png",
        //tileSet3: "http://www.spriters-resource.com/pc_computer/warcraft2/summertiles.png",
        //tileSet4: "http://opengameart.org/sites/default/files/iso-64x64-outside.png",

        //User's map
        tileSet5: tilesetURL
    };

    loadImages(sources, initStage);
};

//grab data from the div and store it to a global variable for access later.
var loadinputformap = function() {

  var iso = document.getElementById("iso").value;

  globalMapData.URL = document.getElementById("URL").value;
  globalMapData.tS = document.getElementById("tS").value;
  globalMapData.mapX = document.getElementById("mapX").value;
  globalMapData.mapY = document.getElementById("mapY").value;
  globalMapData.mapSpacing = document.getElementById("space").value;

  if ( iso == "t" || iso == 1 || iso == "true" ) {

    globalMapData.isometric = true;
  
  } else {

    globalMapData.isometric = false;    
  }

  //hide the menu
  document.getElementById('menu').style.display = "none";

  //do init and make the map
  loadMapMaker(globalMapData.URL);

}

//make a global variable for easier data access
var globalMapData = {};