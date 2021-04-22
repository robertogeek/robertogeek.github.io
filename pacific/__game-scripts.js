// character.js
var Character = pc.createScript('character');

Character.attributes.add('sidePosition', { type: 'number', default: 0.405 });
Character.attributes.add('initialPosition', { type: 'vec3', default: [0, 0.56, 0] });

// initialize code called once per entity
Character.prototype.initialize = function() {
    var app = this.app;
    
    this.characterState = 'intro';
    // 0 California, 1 Tokyo
    this.stage = 0;
    
    this.intro = this.entity.sprite.clip('char1_intro');
    this.intro2 = this.entity.sprite.clip('char2_intro');
    this.intro.pause();
    this.intro2.pause();
    this.left = this.entity.sprite.clip('char1_left');
    this.left2 = this.entity.sprite.clip('char2_left');
    this.right = this.entity.sprite.clip('char1_right');
    this.right2 = this.entity.sprite.clip('char2_right');
    this.damage = this.entity.sprite.clip('char1_damage');
    this.damage2 = this.entity.sprite.clip('char2_damage');
    
    app.on('startStage', this.startStage, this);
    app.on('resetGame', this.resetCharacter, this);
    app.on('startMoving', this.startMoving, this);
    app.on('moveLeft', this.moveLeft, this);
    app.on('moveRight', this.moveRight, this);
    app.on('obstacleHit', this.collisionHit, this);
    app.on('changeToTokyo', this.tokyoCharacter, this);
    app.on('changeToCali', this.caliCharacter, this);
};

// update code called every frame
Character.prototype.update = function(dt) {
    var app = this.app;
    
    if (this.stage === 0) {
        if (this.intro.frame === 8) {
            app.fire('startMoving'); // Tells the road and assets to start moving
        }
        if (this.left.frame === 5 || this.right.frame === 5) {
            app.fire('tangible');
        }
        if ((this.left.frame === 8) || (this.right.frame === 8)) {
            this.resumeIdle();
        } 
        if (this.damage.frame === 5 && this.characterState != 'gameover') {
            this.damage.pause();
            this.characterState = 'gameover';
            app.fire('gameOver', this.stage);
        }
    }
    else {
        if (this.intro2.frame === 11) {
            app.fire('startMoving'); // Tells the road and assets to start moving
        }
        if (this.left2.frame === 5 || this.right2.frame === 5) {
            app.fire('tangible');
        }
        if ((this.left2.frame === 8) || (this.right2.frame === 8)) {
            this.resumeIdle();
        } 
        if (this.damage2.frame === 5 && this.characterState != 'gameover') {
            this.damage2.pause();
            this.characterState = 'gameover';
            app.fire('gameOver', this.stage);
        }
    }
};

Character.prototype.startStage = function() {
    if (this.stage === 0) {
        this.characterState = 'intro';
        this.stage = 0;
        this.intro.resume();
    }
    else {
        this.characterState = 'intro';
        this.stage = 1;
        this.intro2.resume();
    }
};

Character.prototype.startMoving = function() {
    var app = this.app;
    
    if (this.stage === 0) {
        this.intro.stop();
        this.entity.sprite.play('char1_idle');
    }
    else {
        this.intro2.stop();
        this.entity.sprite.play('char2_idle');
    }
    this.characterState = 'idle';
    app.fire('startGame'); // Tells obstacles to start spawning and timer to start counting
};

Character.prototype.moveLeft = function() {
    var app = this.app;
    
    if ((this.characterState === 'idle') && (this.entity.getPosition().x.toFixed(3) != -this.sidePosition)) {
        app.fire('intangible');
        this.characterState = 'moving';
        if (this.stage === 0) {
            this.entity.sprite.play('char1_left');
        }
        else {
            this.entity.sprite.play('char2_left');
        }
        var tween = this.entity.tween(this.entity.getLocalPosition())
        .to(new pc.Vec3(this.entity.getPosition().x - this.sidePosition, this.entity.getPosition().y, 0), 0.35, pc.Linear);
        tween.start();
    }
};

Character.prototype.moveRight = function() {
    var app = this.app;
    
    if ((this.characterState === 'idle') && (this.entity.getPosition().x.toFixed(3) != this.sidePosition)) {
        app.fire('intangible');
        this.characterState = 'moving';
        if (this.stage === 0) {
            this.entity.sprite.play('char1_right');
        }
        else {
            this.entity.sprite.play('char2_right');
        }
        var tween = this.entity.tween(this.entity.getLocalPosition())
        .to(new pc.Vec3(this.entity.getPosition().x + this.sidePosition, this.entity.getPosition().y, 0), 0.35, pc.Linear);
        tween.start();
    }
};

Character.prototype.resumeIdle = function() {
    this.left.stop();
    this.left2.stop();
    this.right.stop();
    this.right2.stop();
    if (this.stage === 0) {
        this.entity.sprite.play('char1_idle');
    }
    else {
        this.entity.sprite.play('char2_idle');
    }
    this.characterState = 'idle';
};

Character.prototype.collisionHit = function() {
    this.characterState = 'dying';
    if (this.stage === 0) {
        this.entity.sprite.play('char1_damage');
    }
    else {
        this.entity.sprite.play('char2_damage');
    }
};

Character.prototype.resetCharacter = function() {
    this.damage.stop();
    this.damage2.stop();
    this.entity.setPosition(this.initialPosition);
    if (this.stage === 0) {
        this.entity.sprite.play('char1_intro');
        this.intro.pause();
    }
    else {
        this.entity.sprite.play('char2_intro');
        this.intro2.pause();
    }
    this.characterState = 'intro';
};

Character.prototype.tokyoCharacter = function() {
    this.stage = 1;
    this.resetCharacter();
};

Character.prototype.caliCharacter = function() {
    this.stage = 0;
    this.resetCharacter();
};

// swap method called for script hot-reloading
// inherit your script state here
// Character.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// sideroadMovement.js
var SideroadMovement = pc.createScript('sideroadMovement');

SideroadMovement.attributes.add('playerEntity', { type: 'entity' });

// initialize code called once per entity
SideroadMovement.prototype.initialize = function() {
    var app = this.app;
    
    this.dockReached = false;
    this.tokyoReached = false;
    
    this.sprites = [this.entity.sprite.clip('cali1')];
    
    for (var i=0; i < this.sprites.length ; i++) {
        this.sprites[i].pause();
    }
    
    var onStartMoving = function () {
        for (var i=0; i < this.sprites.length ; i++) {
            this.sprites[i].resume();
        }
    };
    app.on('startMoving', onStartMoving, this);
    app.on('resetGame', this.resetSideRoad, this);
    app.on('transitionDockRoad', this.transitionDockRoad, this);
    app.on('transitionTokyoRoad', this.transitionTokyoRoad, this);
    app.on('dockReached', function() {
        this.dockReached = true;
    }, this);
    app.on('tokyoReached', function() {
        this.tokyoReached = true;
    }, this);
    app.on('stopMovement', function() {
        this.entity.sprite.pause();
    }, this);
    app.on('changeToTokyo', this.tokyoSides, this);
    app.on('changeToCali', this.caliSides, this);
    app.on('obstacleHit', function() {
        this.entity.sprite.pause();
    }, this);
};

// update code called every frame
SideroadMovement.prototype.update = function(dt) {
    var app = this.app;
    
    if (this.tokyoReached) {
        this.tokyoReached = false;
        app.fire('stopMovement');
    }
    
    switch (this.entity.name) {
        case 'cali2_left':
        case 'cali2_right':
            if (this.dockReached) {
                this.entity.sprite.play('waterTransition');
                this.dockReached = false;
            }
            if (this.entity.sprite.frame === 7) {
                this.entity.sprite.play('waterEnd');
                app.fire('stopMovement');
            }
            break;
        case 'cali3_left':
        case 'cali3_right':
            if (this.entity.sprite.frame === 7) {
                this.entity.sprite.opacity = 0;
            }
            break;
        default:
            break;
    }
};

SideroadMovement.prototype.resetSideRoad = function(stage) {
    this.entity.sprite.play('cali1');
    this.entity.sprite.currentClip.pause();
    if (stage === 0) {
        if (this.entity.name != 'cali1_left' && this.entity.name != 'cali1_right' && this.entity.name != 'cali1_sea') {
            this.entity.sprite.opacity = 0;
        }
        if (this.entity.name === 'cali1_sea') {
            this.entity.sprite.opacity = 1;
        }
    }
    else {
        if (this.entity.name != 'cali1_left' && this.entity.name != 'cali1_right' && this.entity.name != 'cali1_sea' && this.entity.name != 'tokyo1_right' && this.entity.name != 'tokyo1_left') {
            this.entity.sprite.opacity = 0;
        }
    }
    this.dockReached = false;
    this.tokyoReached = false;
};

SideroadMovement.prototype.transitionDockRoad = function() {
    switch (this.entity.name) {
        case 'cali2_left':
        case 'cali2_right':
        case 'cali3_left':
        case 'cali3_right':
            this.entity.sprite.play('waterLoop');
            break;
        case 'cali1_sea':
        case 'cali2_sea':
        case 'cali3_sea':
            this.changeOpacity(this.entity);
            break;
        default:
            break;
    }
};

SideroadMovement.prototype.transitionTokyoRoad = function() {
    switch (this.entity.name) {
        case 'tokyo3_left':
        case 'tokyo3_right':
            this.entity.sprite.play('finalTransition');
            break;
        default:
            break;
    }
};

SideroadMovement.prototype.changeOpacity = function(entity) {
    var opacity = {alpha: 1};
    var sprite = entity.sprite;
    this.app
        .tween(opacity)
        .to({alpha: 0}, 1, pc.Linear)
        .loop(false)
        .yoyo(false)
        .on('update', function () {
            sprite.opacity = opacity.alpha;
        })
        .start();
};

SideroadMovement.prototype.tokyoSides = function() {
    this.resetSideRoad();
    if (this.entity.tags.has('tokyo1')) {
        this.entity.sprite.opacity = 1;
    }
    if (this.entity.tags.has('sea')) {
        this.entity.sprite.opacity = 0;
    }
    this.entity.sprite.pause();
};

SideroadMovement.prototype.caliSides = function() {
    this.resetSideRoad();
};
// swap method called for script hot-reloading
// inherit your script state here
// RoadMovement.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// gameplay.js
var Gameplay = pc.createScript('gameplay');

Gameplay.attributes.add('minSwipeSpeed', { type: 'number', default: 1000 });

// initialize code called once per entity
Gameplay.prototype.initialize = function() {
    var app = this.app;
    
    // Variables for spawning
    this.spawner = app.root.findByName('SpawnerLeft');
    this.timer = 0;
    this.startGame = false;
    
    // Variables for swiping event
    this.touchStarted = false;
    this.touchEnded = false;
    this.touchStartPos = 0;
    this.touchEndPos = 0;
    this.swipeDistance = 0;
    this.time = 0;
    this.touchDuration = 0;
    this.moved = false;
    
    app.on('startGame', function() {
        this.startGame = true;
    }, this);
    
    app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
    if (app.touch) {
        console.log('estoy en touch!');
        app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
    }
};

// update code called every frame
Gameplay.prototype.update = function(dt) {
    var app = this.app;
    if (this.startGame) {
        // Check input
    
        // Check swipe
        if(this.touchStarted) {
            this.time += dt;
        }
        else {
            this.touchDuration = this.time;
        }
        if (this.touchEnded && this.touchDuration > 0.02 && this.moved) {
            this.swipeDistance = this.touchEndPos - this.touchStartPos;
            //console.log(Math.abs(this.swipeDistance/this.touchDuration));
            //console.log('time: ' + this.touchDuration);
            //console.log('distance: ' + this.swipeDistance);
        }
        if (this.validSwipe()) {
            if (this.swipeDistance > 50) {
                app.fire('moveRight');
                //console.log('valid Left');
            }
            else if (this.swipeDistance < -50) {
                app.fire('moveLeft');
                //console.log('valid Right');
            }
            this.swipeDistance = 0;
            this.touchDuration = 0;
            this.touchEnded = false;
            this.moved = false;
        }
    }
};

Gameplay.prototype.onKeyDown = function(event) {
    var app = this.app;
    
    // Check event.key to detect which key has been pressed
    if (event.key === pc.KEY_LEFT) {
        app.fire('moveLeft');
    }
    if (event.key === pc.KEY_RIGHT) {
        app.fire('moveRight');
    }

    // Calling preventDefault() prevents the browser from doing the original event for that key (E.G. spacebar scrolling down)
    //event.event.preventDefault();
};

Gameplay.prototype.onTouchStart = function(event) {
    this.time = 0;
    this.touchDuration = 0;
    this.touchStarted = true;
    this.touchEnded = false;
    
    //Get touch start position
    var touch = event.touches[0];
    this.touchStartPos= touch.x;
};

Gameplay.prototype.onTouchMove = function(event) {
    var touch = event.touches[0];
    this.moved = true;
    this.touchEndPos = touch.x;
};

Gameplay.prototype.onTouchEnd = function(event) {
    this.touchStarted = false;
    this.touchEnded = true;
};

Gameplay.prototype.validSwipe = function() {
    if ((this.touchDuration > 0.02) && (this.swipeDistance > 50 || this.swipeDistance < -50) && this.moved) {
        if (Math.abs(this.swipeDistance)/this.touchDuration >= this.minSwipeSpeed) {
            return true;
        }
    }
    return false;
};

// swap method called for script hot-reloading
// inherit your script state here
// Gameplay.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// obstacleMovement.js
var ObstacleMovement = pc.createScript('obstacleMovement');

ObstacleMovement.attributes.add('ySpeed', { type: 'number', default: 1 });
ObstacleMovement.attributes.add('xSpeed', { type: 'number', default: 1 });
ObstacleMovement.attributes.add('scaleSpeed', { type: 'number', default: 1 });

// initialize code called once per entity
ObstacleMovement.prototype.initialize = function() {
    var app = this.app;
    
    this.character = app.root.findByName('Character');
    this.charPos = this.character.getPosition();
    
    this.intangible = false;
    
    // Initialize character and obstacle collisions
    this.charRect = { x: 0, y: 0, w: 0, h: 0 };
    this.obstacleRect = { x: 0, y: 0, w: 0, h: 0 };
    
    this.gameOver = false;
    this.itemHit = false;
    
    this.carril = 'mid';
    
    app.on('intangible', function() {
        this.intangible = true;
    }, this);
    app.on('tangible', function() {
        this.intangible = false;
    }, this);
    app.on('gameOver', function() {
        this.gameOver = true;
    }, this);
    app.on('resetGame', function() {
        this.entity.destroy();
    }, this);
};

// update code called every frame
ObstacleMovement.prototype.update = function(dt) {
    var app = this.app;
    
    if (!this.gameOver) {
        if (!this.itemHit) {
            // Scale obstacle
            var previousScale = this.entity.getLocalScale();
            this.entity.setLocalScale(previousScale.x + this.scaleSpeed * dt, previousScale.y + this.scaleSpeed * dt, previousScale.z);
            // Translate obstacle
            if (this.entity.parent === app.root.findByName('SpawnerLeft')) {
                this.entity.translateLocal(0, -this.ySpeed * dt, 0);
                this.entity.translateLocal(-this.xSpeed * dt, 0, 0);
                this.carril = 'left';
            }
            else if (this.entity.parent === app.root.findByName('SpawnerRight')) {
                this.entity.translateLocal(0, -this.ySpeed * dt, 0);
                this.entity.translateLocal(this.xSpeed * dt, 0, 0);
                this.carril = 'right';
            }
            else {
                this.entity.translateLocal(0, -this.ySpeed * dt, 0);
            }
            // Create the character collision
            var rect1 = this.charRect;
            var aabb_1 = this.character.sprite._meshInstance.aabb;
            var min1 = aabb_1.getMin();
            var max1 = aabb_1.getMax();
            rect1.x = min1.x;
            rect1.y = min1.y;
            rect1.w = (max1.x - min1.x) * 0.2; // *0.2 to adjust the character's sprite hitbox
            rect1.h = (max1.y - min1.y) * 0.75; // *0.75 to adjust the character's sprite hitbox
            // Create the obstacle collision
            var rect2 = this.obstacleRect;
            var aabb_2 = this.entity.sprite._meshInstance.aabb;
            var min2 = aabb_2.getMin();
            var max2 = aabb_2.getMax();
            rect2.x = min2.x;
            rect2.y = min2.y;
            rect2.w = (max2.x - min2.x) * 0.4; // *0.75 to adjust the obstacle's sprite hitbox
            rect2.h = (max2.y - min2.y) * 0.65; // *0.75 to adjust the obstacle's sprite hitbox
            let miniSprite = this.entity.sprite;
            if (miniSprite.currentClip === miniSprite.clip('skunk') && miniSprite.clip('barrel')) {
                rect2.w = rect2.w * 1.3;
                rect2.h = rect2.h * 2;
                if (this.carril === 'right') {
                    rect2.w *= 2;
                    rect2.h *= 1.8;
                }
            }
            // Check for collisions
            if (this.collision(rect1, rect2)) {
                if (this.entity.tags.has('item')) {
                    this.itemHit = true;
                    this.entity.sprite.play('anim');
                }
                else {
                    if (!this.intangible) {
                        app.fire('obstacleHit');
                    }
                }
            }
        }
        if (this.entity.tags.has('item') && this.itemHit) {
            var sprite = this.entity.sprite;
            switch (this.entity.name) {
                case 'glasses':
                    app.fire('itemCollected', 0);
                    if (sprite.frame === 7) {
                        this.entity.destroy();
                    }
                    break;
                case 'hat':
                    app.fire('itemCollected', 1);
                    if (sprite.frame === 9) {
                        this.entity.destroy();
                    }
                    break;
                case 'bag':
                    app.fire('itemCollected', 2);
                    if (sprite.frame === 8) {
                        this.entity.destroy();
                    }
                    break;
                case 'shirt':
                    app.fire('itemCollected', 0);
                    if (sprite.frame === 8) {
                        this.entity.destroy();
                    }
                    break;
                case 'sandals':
                    app.fire('itemCollected', 1);
                    if (sprite.frame === 8) {
                        this.entity.destroy();
                    }
                    break;
                case 'shorts':
                    app.fire('itemCollected', 2);
                    if (sprite.frame === 9) {
                        this.entity.destroy();
                    }
                    break;
            }
        }
        // Change sprite for some obstacles
        if (this.entity.getLocalPosition().y < -0.8 && this.entity.getPosition().y > 0.1 && !this.entity.tags.has('item')) {
            var spriteClip = this.entity.sprite;
            switch (spriteClip.currentClip) {
                case spriteClip.clip('carMid'):
                    if (this.carril === 'left') {
                        spriteClip.play('carLeft');
                    }
                    else if (this.carril === 'right') {
                        spriteClip.play('carRight');
                    }
                    break;
                case spriteClip.clip('caravanMid'):
                    if (this.carril === 'left') {
                        spriteClip.play('caravanLeft');
                    }
                    else if (this.carril === 'right') {
                        spriteClip.play('caravanRight');
                    }
                    break;
                case spriteClip.clip('scooterMid'):
                    if (this.carril === 'left') {
                        spriteClip.play('scooterLeft');
                    }
                    else if (this.carril === 'right') {
                        spriteClip.play('scooterRight');
                    }
                    break;
                case spriteClip.clip('vanMid'):
                    if (this.carril === 'left') {
                        spriteClip.play('vanLeft');
                    }
                    else if (this.carril === 'right') {
                        spriteClip.play('vanRight');
                    }
                    break;
                default: 
                    break;
            }
        }
        // Destroy obstacle
        if (this.entity.getPosition().y < 0) {
            if (this.entity.tags.has('item')) {
                switch (this.entity.name) {
                    case 'glasses':
                        app.fire('itemFailed', 0);
                        break;
                    case 'hat':
                        app.fire('itemFailed', 1);
                        break;
                    case 'bag':
                        app.fire('itemFailed', 2);
                        break;
                    case 'shirt':
                        app.fire('itemFailed', 0);
                        break;
                    case 'sandals':
                        app.fire('itemFailed', 1);
                        break;
                    case 'shorts':
                        app.fire('itemFailed', 2);
                        break;
                }
            }
            this.entity.destroy();
        }
    }
};

ObstacleMovement.prototype.collision = function(rect1, rect2) {
    var minDistX = rect1.w/2 + rect2.w/2;
    var minDistY = rect1.h/2 + rect2.h/2;
    var distX = Math.abs(rect1.x - rect2.x);
    var distY = Math.abs(rect1.y - rect2.y);
    return ((distX < minDistX) && (distY < minDistY));
};

// swap method called for script hot-reloading
// inherit your script state here
// ObstacleMovement.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// startScreen.js
var StartScreen = pc.createScript('startScreen');

// initialize code called once per entity
StartScreen.prototype.initialize = function() {
    var app = this.app;
    
    // Find our button
    this.startButton = this.entity.findByTag('button')[0];
    // Catch the click event
    this.startButton.element.on('click', function() {
        app.fire('startStage');
        this.entity.enabled = false;
    }, this);
};

// update code called every frame
//StartScreen.prototype.update = function(dt) { };

// swap method called for script hot-reloading
// inherit your script state here
// StartScreen.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// tween.js
pc.extend(pc, function () {

    /**
     * @name pc.TweenManager
     * @description Handles updating tweens
     * @param {pc.Application} app  The application
     */
    var TweenManager = function (app) {
        this._app = app;
        this._tweens = [];
        this._add = []; // to be added
    };

    TweenManager.prototype = {
        add: function (tween) {
            this._add.push(tween);
            return tween;
        },

        update: function (dt) {
            var i = 0;
            var n = this._tweens.length;
            while (i < n) {
                if (this._tweens[i].update(dt)) {
                    i++;
                } else {
                    this._tweens.splice(i, 1);
                    n--;
                }
            }

            // add any tweens that were added mid-update
            if (this._add.length) {
                this._tweens = this._tweens.concat(this._add);
                this._add.length = 0;
            }
        }
    };

    /**
     * @name  pc.Tween
     * @param {Object} target The target property that will be tweened
     * @param {pc.TweenManager} manager The tween manager
     * @param {pc.Entity} entity The pc.Entity whose property we are tweening
     */
    var Tween = function (target, manager, entity) {
        pc.events.attach(this);

        this.manager = manager;

        if (entity) {
            this.entity = null; // if present the tween will dirty the transforms after modify the target
        }

        this.time = 0;

        this.complete = false;
        this.playing = false;
        this.stopped = true;
        this.pending = false;

        this.target = target;

        this.duration = 0;
        this._currentDelay = 0;
        this.timeScale = 1;
        this._reverse = false;

        this._delay = 0;
        this._yoyo = false;

        this._count = 0;
        this._numRepeats = 0;
        this._repeatDelay = 0;

        this._from = false; // indicates a "from" tween

        // for rotation tween
        this._slerp = false; // indicates a rotation tween
        this._fromQuat = new pc.Quat();
        this._toQuat = new pc.Quat();
        this._quat = new pc.Quat();

        this.easing = pc.Linear;

        this._sv = {}; // start values
        this._ev = {}; // end values
    };

    var _parseProperties = function (properties) {
        var _properties;
        if (properties instanceof pc.Vec2) {
            _properties = {
                x: properties.x,
                y: properties.y
            };
        } else if (properties instanceof pc.Vec3) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z
            };
        } else if (properties instanceof pc.Vec4) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Quat) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Color) {
            _properties = {
                r: properties.r,
                g: properties.g,
                b: properties.b,
            };
            if (properties.a !== undefined) {
                _properties.a = properties.a;
            }
        } else {
            _properties = properties;
        }
        return _properties;
    }
    Tween.prototype = {
        // properties - js obj of values to update in target
        to: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            return this;
        },

        from: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._from = true;

            return this;
        },

        rotate: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);

            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._slerp = true;

            return this;
        },

        start: function () {
            var prop, _x, _y, _z;

            this.playing = true;
            this.complete = false;
            this.stopped = false;
            this._count = 0;
            this.pending = (this._delay > 0);

            if (this._reverse && !this.pending) {
                this.time = this.duration;
            } else {
                this.time = 0;
            }

            if (this._from) {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this._properties[prop];
                        this._ev[prop] = this.target[prop];
                    }
                }

                if (this._slerp) {
                    this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._fromQuat.setFromEulerAngles(_x, _y, _z);
                }
            } else {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this.target[prop];
                        this._ev[prop] = this._properties[prop];
                    }
                }

                if (this._slerp) {
                    this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._toQuat.setFromEulerAngles(_x, _y, _z);
                }
            }

            // set delay
            this._currentDelay = this._delay;

            // add to manager when started
            this.manager.add(this);

            return this;
        },

        pause: function () {
            this.playing = false;
        },

        resume: function () {
            this.playing = true;
        },

        stop: function () {
            this.playing = false;
            this.stopped = true;
        },

        delay: function (delay) {
            this._delay = delay;
            this.pending = true;

            return this;
        },

        repeat: function (num, delay) {
            this._count = 0;
            this._numRepeats = num;
            if (delay) {
                this._repeatDelay = delay;
            } else {
                this._repeatDelay = 0;
            }

            return this;
        },

        loop: function (loop) {
            if (loop) {
                this._count = 0;
                this._numRepeats = Infinity;
            } else {
                this._numRepeats = 0;
            }

            return this;
        },

        yoyo: function (yoyo) {
            this._yoyo = yoyo;
            return this;
        },

        reverse: function () {
            this._reverse = !this._reverse;

            return this;
        },

        chain: function () {
            var n = arguments.length;

            while(n--) {
                if (n > 0) {
                    arguments[n-1]._chained = arguments[n];
                } else {
                    this._chained = arguments[n];
                }
            }

            return this;
        },

        update: function (dt) {
            if (this.stopped) return false;

            if (!this.playing) return true;

            if (!this._reverse || this.pending) {
                this.time += dt*this.timeScale;
            } else {
                this.time -= dt*this.timeScale;
            }

            // delay start if required
            if (this.pending) {
                if (this.time > this._currentDelay) {
                    if (this._reverse) {
                        this.time = this.duration - (this.time - this._currentDelay);
                    } else {
                        this.time = this.time - this._currentDelay;
                    }
                    this.pending = false;
                } else {
                    return true;
                }
            }

            var _extra = 0;
            if ((!this._reverse && this.time > this.duration) || (this._reverse && this.time < 0)){
                this._count++;
                this.complete = true;
                this.playing = false;
                if (this._reverse) {
                    _extra = this.duration - this.time;
                    this.time = 0;
                } else {
                    _extra = this.time - this.duration;
                    this.time = this.duration;
                }
            }

            var elapsed = (this.duration === 0) ? 1 : (this.time / this.duration);

            // run easing
            var a = this.easing(elapsed);

            // increment property
            var s,e,d;
            for (var prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    s = this._sv[prop];
                    e = this._ev[prop];
                    this.target[prop] = s + (e - s) * a;
                }
            }

            if (this._slerp) {
                this._quat.slerp(this._fromQuat, this._toQuat, a);
            }

            // if this is a entity property then we should dirty the transform
            if (this.entity) {
                this.entity._dirtifyLocal();

                // apply element property changes
                if (this.element && this.entity.element) {
                    this.entity.element[this.element] = this.target;
                }

                if (this._slerp) {
                    this.entity.setLocalRotation(this._quat);
                }
            }

            this.fire("update", dt);

            if (this.complete) {
                var repeat = this._repeat(_extra);
                if (!repeat) {
                    this.fire("complete", _extra);
                    if (this.entity)
                        this.entity.off('destroy', this.stop, this);
                    if (this._chained) this._chained.start();
                } else {
                    this.fire("loop");
                }

                return repeat;
            }

            return true;
        },

        _repeat: function (extra) {
            // test for repeat conditions
            if (this._count < this._numRepeats) {
                // do a repeat
                if (this._reverse) {
                    this.time = this.duration - extra;
                } else {
                    this.time = extra; // include overspill time
                }
                this.complete = false;
                this.playing = true;

                this._currentDelay = this._repeatDelay;
                this.pending = true;

                if (this._yoyo) {
                    // swap start/end properties
                    for (var prop in this._properties) {
                        var tmp = this._sv[prop];
                        this._sv[prop] = this._ev[prop];
                        this._ev[prop] = tmp;
                    }

                    if (this._slerp) {
                        this._quat.copy(this._fromQuat);
                        this._fromQuat.copy(this._toQuat);
                        this._toQuat.copy(this._quat);
                    }
                }

                return true;
            }
            return false;
        },

    };


    /**
     * Easing methods
     */

    var Linear = function (k) {
        return k;
    };

    var QuadraticIn = function (k) {
        return k * k;
    };

    var QuadraticOut = function (k) {
        return k * (2 - k);
    };

    var QuadraticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };

    var CubicIn = function (k) {
        return k * k * k;
    };

    var CubicOut = function (k) {
        return --k * k * k + 1;
    };

    var CubicInOut = function (k) {
        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
        return 0.5 * ( ( k -= 2 ) * k * k + 2 );
    };

    var QuarticIn = function (k) {
            return k * k * k * k;
    };

    var QuarticOut = function (k) {
        return 1 - ( --k * k * k * k );
    };

    var QuarticInOut = function (k) {
        if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
        return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
    };

    var QuinticIn = function (k) {
            return k * k * k * k * k;
    };

    var QuinticOut = function (k) {
            return --k * k * k * k * k + 1;
    };

    var QuinticInOut = function (k) {
        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
        return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
    };

    var SineIn = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 1 - Math.cos( k * Math.PI / 2 );
    };

    var SineOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return Math.sin( k * Math.PI / 2 );
    };

    var SineInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
    };

    var ExponentialIn = function (k) {
        return k === 0 ? 0 : Math.pow( 1024, k - 1 );
    };

    var ExponentialOut = function (k) {
        return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
    };

    var ExponentialInOut = function (k) {
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
        return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
    };

    var CircularIn = function (k) {
        return 1 - Math.sqrt( 1 - k * k );
    };

    var CircularOut = function (k) {
        return Math.sqrt( 1 - ( --k * k ) );
    };

    var CircularInOut = function (k) {
        if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
        return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
    };

    var ElasticIn = function (k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    };

    var ElasticOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
    };

    var ElasticInOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
        return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
    };

    var BackIn = function (k) {
            var s = 1.70158;
            return k * k * ( ( s + 1 ) * k - s );
    };

    var BackOut = function (k) {
        var s = 1.70158;
        return --k * k * ( ( s + 1 ) * k + s ) + 1;
    };

    var BackInOut = function (k) {
        var s = 1.70158 * 1.525;
        if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
        return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
    };

    var BounceIn = function (k) {
        return 1 - BounceOut( 1 - k );
    };

    var BounceOut = function (k) {
        if ( k < ( 1 / 2.75 ) ) {
            return 7.5625 * k * k;
        } else if ( k < ( 2 / 2.75 ) ) {
            return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
        } else if ( k < ( 2.5 / 2.75 ) ) {
            return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
        } else {
            return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
        }
    };

    var BounceInOut = function (k) {
        if ( k < 0.5 ) return BounceIn( k * 2 ) * 0.5;
        return BounceOut( k * 2 - 1 ) * 0.5 + 0.5;
    };

    return {
        TweenManager: TweenManager,
        Tween: Tween,
        Linear: Linear,
        QuadraticIn: QuadraticIn,
        QuadraticOut: QuadraticOut,
        QuadraticInOut: QuadraticInOut,
        CubicIn: CubicIn,
        CubicOut: CubicOut,
        CubicInOut: CubicInOut,
        QuarticIn: QuarticIn,
        QuarticOut: QuarticOut,
        QuarticInOut: QuarticInOut,
        QuinticIn: QuinticIn,
        QuinticOut: QuinticOut,
        QuinticInOut: QuinticInOut,
        SineIn: SineIn,
        SineOut: SineOut,
        SineInOut: SineInOut,
        ExponentialIn: ExponentialIn,
        ExponentialOut: ExponentialOut,
        ExponentialInOut: ExponentialInOut,
        CircularIn: CircularIn,
        CircularOut: CircularOut,
        CircularInOut: CircularInOut,
        BackIn: BackIn,
        BackOut: BackOut,
        BackInOut: BackInOut,
        BounceIn: BounceIn,
        BounceOut: BounceOut,
        BounceInOut: BounceInOut,
        ElasticIn: ElasticIn,
        ElasticOut: ElasticOut,
        ElasticInOut: ElasticInOut
    };
}());

// Expose prototype methods and create a default tween manager on the application
(function () {
    // Add pc.Application#addTweenManager method
    pc.Application.prototype.addTweenManager = function () {
        this._tweenManager = new pc.TweenManager(this);

        this.on("update", function (dt) {
            this._tweenManager.update(dt);
        });
    };

    // Add pc.Application#tween method
    pc.Application.prototype.tween = function (target) {
        return new pc.Tween(target, this._tweenManager);
    };

    // Add pc.Entity#tween method
    pc.Entity.prototype.tween = function (target, options) {
        var tween = this._app.tween(target);
        tween.entity = this;

        this.once('destroy', tween.stop, tween);

        if (options && options.element) {
            // specifiy a element property to be updated
            tween.element = options.element;
        }
        return tween;
    };

    // Create a default tween manager on the application
    var application = pc.Application.getApplication();
    if (application) {
        application.addTweenManager();
    }
})();


// parallaxBackground.js
var ParallaxBackground = pc.createScript('parallaxBackground');

ParallaxBackground.attributes.add('parallax1', { type: 'number', default: 0.45 });
ParallaxBackground.attributes.add('parallax2', { type: 'number', default: 0.4 });
ParallaxBackground.attributes.add('parallax3', { type: 'number', default: 0.05 });
ParallaxBackground.attributes.add('curve1Velocity', { type: 'number', default: 0.7 });

// initialize code called once per entity
ParallaxBackground.prototype.initialize = function() {
    var app = this.app;
    
    this.curve2Velocity = this.curve1Velocity * 2;
    this.curve3Velocity = this.curve1Velocity * 3;
    this.curve4Velocity = this.curve1Velocity * 4;
    this.velocity = 0;
    
    this.backgrounds0 = this.entity.findByTag('bg0');
    this.backgrounds1 = this.entity.findByTag('bg1');
    
    app.on('straight', this.straight, this);
    app.on('curve1', this.curve1, this);
    app.on('curve2', this.curve2, this);
    app.on('curve3', this.curve3, this);
    app.on('curve4', this.curve4, this);
    
    app.on('obstacleHit', this.straight, this);
};

// update code called every frame
ParallaxBackground.prototype.update = function(dt) {
    for (var i=0; i<this.backgrounds0.length; i++) {
        this.backgrounds0[i].translateLocal(this.parallax1 * this.velocity * dt, 0, 0);
        this.backgrounds1[i].translateLocal(this.parallax2 * this.velocity * dt, 0, 0);
    }
};

ParallaxBackground.prototype.straight = function() {
    this.velocity = 0;
};

ParallaxBackground.prototype.curve1 = function(direction) {
    this.velocity = -direction * this.curve1Velocity;
};

ParallaxBackground.prototype.curve2 = function(direction) {
    this.velocity = -direction * this.curve2Velocity;
};

ParallaxBackground.prototype.curve3 = function(direction) {
    this.velocity = -direction * this.curve3Velocity;
};

ParallaxBackground.prototype.curve4 = function(direction) {
    this.velocity = -direction * this.curve4Velocity;
};

// swap method called for script hot-reloading
// inherit your script state here
// Gameplay.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// obstacleSpawning.js
var ObstacleSpawning = pc.createScript('obstacleSpawning');

ObstacleSpawning.attributes.add('obstaclePrefab', { type: 'entity' });

// initialize code called once per entity
ObstacleSpawning.prototype.initialize = function() {
    var app = this.app;
    
    // Variables for spawning
    this.spawners = app.root.findByTag('spawner');
    this.currentSpawner = this.spawners[0];
    this.spawningTimer = 0;
    this.startGame = false;
    this.canSpawn = true;
    this.itemList = app.root.findByTag('item');
    this.previousSpawner = -1;
    
    this.stage = 1;
    
    app.on('startGame', function() {
        this.spawningTimer = 0;
        this.startGame = true;
        this.canSpawn = true;
    }, this);
    app.on('obstacleHit', function() {
        this.startGame = false;
    }, this);
    app.on('stopSpawn', function() {
        this.canSpawn = false;
    }, this);
    app.on('resumeSpawn', function() {
        this.canSpawn = true;
    }, this);
    app.on('spawnItem', this.spawnItem, this);
    app.on('changeToTokyo', function() {
        this.startGame = false;
        this.canSpawn = false;
        this.stage = 4;
    }, this);
    app.on('changeToCali', function() {
        this.startGame = false;
        this.canSpawn = false;
        this.stage = 1;
    }, this);
    app.on('resetGame', function(currentStage) {
        if (currentStage === 0) {
            this.stage = 1;
        }
        else {
            this.stage = 4;
        }
        this.previousSpawner = -1;
    }, this);
    
    app.on('playCali2', function() {
        this.stage = 2;
    }, this);
    app.on('playCali3', function() {
        this.stage = 3;
    }, this);
    app.on('playTokyo2', function() {
        this.stage = 5;
    }, this);
    app.on('playTokyo3', function() {
        this.stage = 6;
    }, this);
    app.on('playTokyo4', function() {
        this.stage = 7;
    }, this);
};

// update code called every frame
ObstacleSpawning.prototype.update = function(dt) {
    var app = this.app;
    
    // Object spawning
    if (this.startGame && this.canSpawn) {
        this.spawningTimer += dt;
        if (this.spawningTimer > 1) {
            this.spawnObstacle();
            this.spawningTimer = 0;
        }
    }
};

ObstacleSpawning.prototype.randomizeSpawner = function() {
    if (this.previousSpawner === -1) {
        var random = Math.floor(Math.random() * 3);
    
        this.currentSpawner = this.spawners[random];
        this.previousSpawner = random;
    }
    else {
        let randomB;
        do {
            randomB = Math.floor(Math.random() * 3);
        } while(randomB === this.previousSpawner);
        
        this.currentSpawner = this.spawners[randomB];
        this.previousSpawner = randomB;
    }
};

ObstacleSpawning.prototype.spawnObstacle = function() {
    this.randomizeSpawner();
    // Clone the prefab to create the new obstacle
    var newObstacle = this.obstaclePrefab.clone();
    // Change animation clip
    this.selectSprite(newObstacle);
    newObstacle.enabled = true;
    // Add the obstacle to the scene
    this.currentSpawner.addChild(newObstacle);
};

ObstacleSpawning.prototype.spawnItem = function(index) {
    this.randomizeSpawner();
    var newItem = this.itemList[index].clone();
    newItem.enabled = true;
    this.currentSpawner.addChild(newItem);
};

ObstacleSpawning.prototype.selectSprite = function(entity) {
    var random = Math.floor(Math.random() * 2);
    switch (this.stage) {
        case 1:
            if (random === 0) {
                entity.sprite.play('skunk');
            }
            else {
                entity.sprite.play('bear');
            }
            break;
        case 2:
            if (random === 0) {
                entity.sprite.play('carMid');
            }
            else {
                entity.sprite.play('caravanMid');
            }
            break;
        case 3: 
            if (random === 0) {
                entity.sprite.play('carMid');
            }
            else {
                entity.sprite.play('barrel');
            }
            break;
        case 4:
            entity.sprite.play('scooterMid');
            break;
        case 5:
            entity.sprite.play('deer');
            break;
        case 6:
        case 7:
            if (random === 0) {
                entity.sprite.play('scooterMid');
            }
            else {
                entity.sprite.play('vanMid');
            }
            break;
        default:
            break;
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// ObstacleSpawning.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// interfaceManager.js
var InterfaceManager = pc.createScript('interfaceManager');

// initialize code called once per entity
InterfaceManager.prototype.initialize = function() {
    var app = this.app;
    
    this.screens = app.root.findByTag('screen');
    
    app.on('introFinished', this.introFinished, this);
    app.on('startPlaying', this.startPlaying, this);
    
    app.on('gameOver', this.gameOver, this);
    app.on('resetGame', this.resetGame, this);
    app.on('endStage', this.endStage, this);
    app.on('changeToTokyo', function() {
        this.screens[3].enabled = true;
    }, this);
    app.on('changeToCali', function() {
        this.screens[0].enabled = true;
    }, this);
};

InterfaceManager.prototype.gameOver = function(stage) {
    if (stage === 0) {
        this.screens[1].enabled = true;
    }
    else {
        this.screens[4].enabled = true;
    }
};

InterfaceManager.prototype.resetGame = function(stage) {
    if (stage === 0) {
        this.screens[0].enabled = true;
    }
    else {
        this.screens[3].enabled = true;
    }
};

InterfaceManager.prototype.endStage = function(stage) {
    if (stage === 0) {
        let entities = this.screens[2].findByTag('enabler');
        for (let i=0; i<entities.length; i++) {
            entities[i].enabled = true;
        }
    }
    else {
        let entities = this.screens[5].findByTag('enabler');
        for (let i=0; i<entities.length; i++) {
            entities[i].enabled = true;
        }
    }
};

InterfaceManager.prototype.introFinished = function() {
    var intro = this.entity.findByName('PullBearPresents');
    var title = this.entity.findByName('PacificRun');
    intro.enabled = false;
    title.enabled = true;
};

InterfaceManager.prototype.startPlaying = function() {
    this.screens[0].enabled = true;
};

// update code called every frame
//InterfaceManager.prototype.update = function(dt) { };

// swap method called for script hot-reloading
// inherit your script state here
// InterfaceManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// roadMovement.js
var RoadMovement = pc.createScript('roadMovement');

// initialize code called once per entity
RoadMovement.prototype.initialize = function() {
    var app = this.app;
    
    this.caliEndReached = false;
    this.tokyoEndReached = false;
    
    this.sprites = [this.entity.sprite.clip('straight'), this.entity.sprite.clip('dockTransition'), this.entity.sprite.clip('finalTransition')];
    
    /*for (var i=0; i < this.sprites.length ; i++) {
        this.sprites[i].pause();
    }*/
    this.entity.sprite.currentClip.pause();
    
    app.on('startMoving', this.onStartMoving, this);
    app.on('resetGame', this.resetRoad, this);
    app.on('straight', this.straight, this);
    app.on('curve1', this.curve1Road, this);
    app.on('curve2', this.curve2Road, this);
    app.on('curve3', this.curve3Road, this);
    app.on('curve4', this.curve4Road, this);
    app.on('transitionDockRoad', function() {
        this.caliEndReached = true;
    }, this);
    app.on('transitionTokyoRoad', function() {
        this.tokyoEndReached = true;
    }, this);
    app.on('stopMovement', function() {
        this.entity.sprite.pause();
    }, this);
    app.on('changeToTokyo', this.resetRoad, this);
    app.on('changeToCali', this.resetRoad, this);
    app.on('obstacleHit', function() {
        this.entity.sprite.pause();
    }, this);
};

// update code called every frame
RoadMovement.prototype.update = function(dt) {
    if (this.caliEndReached) {
        this.entity.sprite.play('dockTransition');
        this.caliEndReached = false;
    }
    if (this.sprites[1].frame === 7) {
        this.sprites[1].stop();
        this.entity.sprite.play('dockLoop');
    }
    if (this.tokyoEndReached) {
        this.entity.sprite.play('finalTransition');
        this.tokyoEndReached = false;
    }
    if (this.sprites[2].frame === 7) {
        this.sprites[2].stop();
        this.entity.sprite.play('finalLoop');
    }
};

RoadMovement.prototype.onStartMoving = function() {
    for (var i=0; i < this.sprites.length ; i++) {
        this.sprites[i].resume();
        this.entity.sprite.play('straight');
    }
};

RoadMovement.prototype.resetRoad = function() {
    this.entity.sprite.play('straight');
    this.caliEndReached = false;
    this.tokyoEndReached = false;
    this.entity.sprite.currentClip.stop();
};

RoadMovement.prototype.straight = function() {
    this.entity.sprite.play('straight');
};

RoadMovement.prototype.curve1Road = function(direction) {
    if (direction > 0) {
        this.entity.sprite.play('rightCurve1');
    }
    else {
        this.entity.sprite.play('leftCurve1');
    }
};

RoadMovement.prototype.curve2Road = function(direction) {
    if (direction > 0) {
        this.entity.sprite.play('rightCurve2');
    }
    else {
        this.entity.sprite.play('leftCurve2');
    }
};

RoadMovement.prototype.curve3Road = function(direction) {
    if (direction > 0) {
        this.entity.sprite.play('rightCurve3');
    }
    else {
        this.entity.sprite.play('leftCurve3');
    }
};

RoadMovement.prototype.curve4Road = function(direction) {
    if (direction > 0) {
        this.entity.sprite.play('rightCurve4');
    }
    else {
        this.entity.sprite.play('leftCurve4');
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// RoadMovement.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// gameOverScreen.js
var GameOverScreen = pc.createScript('gameOverScreen');

// initialize code called once per entity
GameOverScreen.prototype.initialize = function() {
     var app = this.app;
    
    // Find our button
    this.retryButton = this.entity.findByTag('button')[0];
    // Catch the click event
    this.retryButton.element.on('click', function() {
        if (this.entity.name === 'GameOverCali') {
            app.fire('resetGame', 0);
        }
        else {
            app.fire('resetGame', 1);
        }
        this.entity.enabled = false;
    }, this);
};

// update code called every frame
//GameOverScreen.prototype.update = function(dt) { };

// swap method called for script hot-reloading
// inherit your script state here
// GameOverScreen.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// stageManager.js
var StageManager = pc.createScript('stageManager');

// initialize code called once per entity
StageManager.prototype.initialize = function() {
    var app = this.app;
    
    this.startGame = false;
    this.stageTimer = 0;
    this.stage = 1;
    this.dockReached = false;
    this.tokyoReached = false;
    this.transitionReached = false;
    this.itemFired = false;
    
    app.on('startGame', function() {
        this.stageTimer = 0;
        this.startGame = true;
    }, this);
    app.on('obstacleHit', function() {
        this.startGame = false;
    }, this);
    app.on('resetGame', function(stage) {
        this.startGame = false;
        this.stageTimer = 0;
        this.dockReached = false;
        this.tokyoReached = false;
        this.transitionReached = false;
        this.itemFired = false;
        if (stage === 0) {
            this.stage = 1;
        }
        else {
            this.stage = 5;
        }
    }, this);
    app.on('changeToTokyo', this.tokyoManager, this);
    app.on('changeToCali', this.caliManager, this);
};

// update code called every frame
StageManager.prototype.update = function(dt) {
    var app = this.app;
    
    if (this.startGame) {
        this.stageTimer += dt;
        switch (this.stage) {
            case 1:
                this.changeRoad1();
                break;
            case 2:
                this.changeRoad2();
                break;
            case 3:
                this.changeRoad3();
                break;
            case 5:
                this.changeRoad5();
                break;
            case 6:
                this.changeRoad6();
                break;
            case 7: 
                this.changeRoad7();
                break;
            case 8:
                this.changeRoad8();
                break;
            default:
                break;
        }
    }
};

StageManager.prototype.changeRoad1 = function() {
    var app = this.app;
    
    if (this.stageTimer > 2 && this.stageTimer < 4) {
        app.fire('curve1', 1);
    }
    if (this.stageTimer > 4 && this.stageTimer < 5) {
        app.fire('straight');
    }
    if (this.stageTimer > 5.5 && this.stageTimer < 6) {
        if (!this.itemFired) {
            app.fire('spawnItem', 0);
            this.itemFired = true;
        }
    }
    if (this.stageTimer > 5 && this.stageTimer < 9) {
        app.fire('curve1', -1);
    }
    // Vamos a Cali2
    if (this.stageTimer > 10 && this.stageTimer < 11) {
        app.fire('stopSpawn');
        app.fire('curve2', -1);
    }
    if (this.stageTimer > 11 && this.stageTimer < 13) {
        app.fire('curve3', -1);
    }
    if (this.stageTimer > 13 && this.stageTimer < 16) {
        app.fire('curve4', -1);
    }
    if (this.stageTimer > 16 && this.stageTimer < 17) {
        app.fire('curve3', -1);
    }
    if (this.stageTimer > 17 && this.stageTimer < 18) {
        app.fire('curve2', -1);
    }
    if (this.stageTimer > 18 && this.stageTimer < 19) {
        app.fire('curve1', -1);
    }
    if (this.stageTimer > 19 && this.stageTimer < 20) {
        app.fire('resumeSpawn');
        app.fire('straight');
        app.fire('playCali2');
        this.stage = 2;
        this.stageTimer = 0;
        this.itemFired = false;
    }
};

StageManager.prototype.changeRoad2 = function() {
    var app = this.app;
    
    if (this.stageTimer > 2 && this.stageTimer < 4) {
        app.fire('curve1', -1);
    }
    if (this.stageTimer > 4 && this.stageTimer < 5) {
        app.fire('straight');
        app.fire('changeBg3', 0);
    }
    if (this.stageTimer > 5.5 && this.stageTimer < 6) {
        if (!this.itemFired) {
            app.fire('spawnItem', 1);
            this.itemFired = true;
        }
    }
    if (this.stageTimer > 5 && this.stageTimer < 9) {
        app.fire('curve1', 1);
    }
    // Vamos a Cali3
    if (this.stageTimer > 10 && this.stageTimer < 11) {
        app.fire('stopSpawn');
        app.fire('curve2', 1);
    }
    if (this.stageTimer > 11 && this.stageTimer < 13) {
        app.fire('curve3', 1);
    }
    if (this.stageTimer > 13 && this.stageTimer < 16) {
        app.fire('curve4', 1);
    }
    if (this.stageTimer > 16 && this.stageTimer < 17) {
        app.fire('curve3', 1);
    }
    if (this.stageTimer > 17 && this.stageTimer < 18) {
        app.fire('curve2', 1);
    }
    if (this.stageTimer > 18 && this.stageTimer < 19) {
        app.fire('curve1', 1);
    }
    if (this.stageTimer > 19 && this.stageTimer < 20) {
        app.fire('resumeSpawn');
        app.fire('straight');
        app.fire('playCali3');
        this.stage = 3;
        this.stageTimer = 0;
        this.itemFired = false;
    }
};

StageManager.prototype.changeRoad3 = function() {
    var app = this.app;
    
    if (this.stageTimer > 5.5 && this.stageTimer < 6) {
        if (!this.itemFired) {
            app.fire('spawnItem', 2);
            this.itemFired = true;
        }
    }
    if (this.stageTimer > 10 && this.stageTimer < 11) {
        app.fire('stopSpawn');
    }
    if (this.stageTimer > 11 && this.stageTimer < 13) {
        app.fire('transitionDockRoadPre');
    }
    // Cambiamos suelo y agua
    if (this.stageTimer > 13 && this.stageTimer < 16) {
        if (!this.transitionReached) {
            app.fire('transitionDockRoad');
        }
        this.transitionReached = true;
    }
    if (this.stageTimer > 16 && this.stageTimer < 19) {
        if (!this.dockReached) {
            app.fire('dockReached');
        }
        this.dockReached = true;
    }
    if (this.stageTimer > 19) {
        app.fire('endStage', 0);
        this.stage = 4;
        this.stageTimer = 0;
        this.startGame = false;
        this.itemFired = false;
        this.transitionReached = false;
        this.dockReached = false;
    }
};

StageManager.prototype.changeRoad5 = function() {
    var app = this.app;
    
    if (this.stageTimer > 2 && this.stageTimer < 4) {
        app.fire('curve1', 1);
    }
    if (this.stageTimer > 4 && this.stageTimer < 5) {
        app.fire('straight');
    }
    if (this.stageTimer > 5.5 && this.stageTimer < 6) {
        if (!this.itemFired) {
            app.fire('spawnItem', 3);
            this.itemFired = true;
        }
    }
    if (this.stageTimer > 5 && this.stageTimer < 9) {
        app.fire('curve1', -1);
    }
    // Vamos a Tokyo2
    if (this.stageTimer > 10 && this.stageTimer < 11) {
        app.fire('stopSpawn');
        app.fire('curve2', -1);
    }
    if (this.stageTimer > 11 && this.stageTimer < 13) {
        app.fire('curve3', -1);
    }
    if (this.stageTimer > 13 && this.stageTimer < 16) {
        app.fire('curve4', -1);
    }
    if (this.stageTimer > 16 && this.stageTimer < 17) {
        app.fire('curve3', -1);
    }
    if (this.stageTimer > 17 && this.stageTimer < 18) {
        app.fire('curve2', -1);
    }
    if (this.stageTimer > 18 && this.stageTimer < 19) {
        app.fire('curve1', -1);
    }
    if (this.stageTimer > 19 && this.stageTimer < 20) {
        app.fire('resumeSpawn');
        app.fire('straight');
        app.fire('playTokyo2');
        this.stage = 6;
        this.stageTimer = 0;
        this.itemFired = false;
    }
};

StageManager.prototype.changeRoad6 = function() {
    var app = this.app;
    
    if (this.stageTimer > 2 && this.stageTimer < 4) {
        app.fire('curve1', -1);
    }
    if (this.stageTimer > 4 && this.stageTimer < 5) {
        app.fire('changeBg3', 1);
        app.fire('straight');
    }
    if (this.stageTimer > 5.5 && this.stageTimer < 6) {
        if (!this.itemFired) {
            app.fire('spawnItem', 4);
            this.itemFired = true;
        }
    }
    if (this.stageTimer > 5 && this.stageTimer < 9) {
        app.fire('curve1', 1);
    }
    // Vamos a Tokyo3
    if (this.stageTimer > 10 && this.stageTimer < 11) {
        app.fire('stopSpawn');
        app.fire('curve2', 1);
    }
    if (this.stageTimer > 11 && this.stageTimer < 13) {
        app.fire('curve3', 1);
    }
    if (this.stageTimer > 13 && this.stageTimer < 16) {
        app.fire('curve4', 1);
    }
    if (this.stageTimer > 16 && this.stageTimer < 17) {
        app.fire('curve3', 1);
    }
    if (this.stageTimer > 17 && this.stageTimer < 18) {
        app.fire('curve2', 1);
    }
    if (this.stageTimer > 18 && this.stageTimer < 19) {
        app.fire('curve1', 1);
    }
    if (this.stageTimer > 19 && this.stageTimer < 20) {
        app.fire('resumeSpawn');
        app.fire('straight');
        app.fire('playTokyo3');
        this.stage = 7;
        this.stageTimer = 0;
        this.itemFired = false;
    }
};

StageManager.prototype.changeRoad7 = function() {
    var app = this.app;
    
    if (this.stageTimer > 2 && this.stageTimer < 4) {
        app.fire('curve1', 1);
    }
    if (this.stageTimer > 4 && this.stageTimer < 5) {
        app.fire('changeBg4', 1);
        app.fire('straight');
    }
    if (this.stageTimer > 5.5 && this.stageTimer < 6) {
        if (!this.itemFired) {
            app.fire('spawnItem', 5);
            this.itemFired = true;
        }
    }
    if (this.stageTimer > 5 && this.stageTimer < 9) {
        app.fire('curve1', -1);
    }
    // Vamos a Tokyo2
    if (this.stageTimer > 10 && this.stageTimer < 11) {
        app.fire('stopSpawn');
        app.fire('curve2', -1);
    }
    if (this.stageTimer > 11 && this.stageTimer < 13) {
        app.fire('curve3', -1);
    }
    if (this.stageTimer > 13 && this.stageTimer < 16) {
        app.fire('curve4', -1);
    }
    if (this.stageTimer > 16 && this.stageTimer < 17) {
        app.fire('curve3', -1);
    }
    if (this.stageTimer > 17 && this.stageTimer < 18) {
        app.fire('curve2', -1);
    }
    if (this.stageTimer > 18 && this.stageTimer < 19) {
        app.fire('curve1', -1);
    }
    if (this.stageTimer > 19 && this.stageTimer < 20) {
        app.fire('resumeSpawn');
        app.fire('straight');
        app.fire('playTokyo4');
        this.stage = 8;
        this.stageTimer = 0;
        this.itemFired = false;
    }
};

StageManager.prototype.changeRoad8 = function() {
    var app = this.app;
    
    if (this.stageTimer > 6 && this.stageTimer < 7) {
        app.fire('stopSpawn');
    }
    if (this.stageTimer > 8 && this.stageTimer < 10) {
        app.fire('transitionTokyoRoadPre'); // done
    }
    // Cambiamos suelo y agua
    if (this.stageTimer > 10 && this.stageTimer < 13) {
        if (!this.transitionReached) {
            app.fire('transitionTokyoRoad'); // done
        }
        this.transitionReached = true;
    }
    if (this.stageTimer > 13 && this.stageTimer < 16) {
        if (!this.tokyoReached) {
            app.fire('tokyoReached'); // done 
        }
        this.tokyoReached = true;
    }
    if (this.stageTimer > 16) {
        app.fire('endStage', 1); 
        this.stage = 4;
        this.stageTimer = 0;
        this.startGame = false;
        this.itemFired = false;
        this.transitionReached = false;
        this.tokyoReached = false;
    }
};

StageManager.prototype.tokyoManager = function() {
    this.transitionReached = false;
    this.stageTimer = 0;
    this.startGame = false;
    this.itemFired = false;
    this.dockReached = false;
    this.tokyoReached = false;
    this.stage = 5;
};

StageManager.prototype.caliManager = function() {
    this.transitionReached = false;
    this.stageTimer = 0;
    this.startGame = false;
    this.itemFired = false;
    this.dockReached = false;
    this.tokyoReached = false;
    this.stage = 1;
};

// swap method called for script hot-reloading
// inherit your script state here
// StageManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// sideRoadManager.js
var SideRoadManager = pc.createScript('sideRoadManager');

SideRoadManager.attributes.add('initialX', { type: 'number' });
SideRoadManager.attributes.add('finalX', { type: 'number' });
SideRoadManager.attributes.add('initialY', { type:'number', default: 2.115 });
SideRoadManager.attributes.add('finalY', { type: 'number', default: 0 });
SideRoadManager.attributes.add('xSpeed', { type: 'number' });

// initialize code called once per entity
SideRoadManager.prototype.initialize = function() {
    var app = this.app;
    
    this.direction = -1;
    //this.xSpeed = 0.6;
    this.ySpeed = -0.8;
    this.scaleSpeed = 0.8;
    this.initialScale = 0.3;
    
    this.stage = 'cali1';
    this.dockReached = false;
    this.tokyoReached = false;
    
    this.move = false;
    
    this.assets = this.entity.findByTag('asset');
    this.initialPositions = this.getInitialPositions();
    this.initialScales = this.getInitialScales();
    
    if (this.entity.parent.name === 'SideRoadRight') {
        this.direction = 1;
    }
    
    app.on('startMoving', function() {
        this.move = true;
    }, this);
    app.on('gameOver', function() {
        this.move = false;
    }, this);
    app.on('playCali2', function() {
        this.stage = 'cali2';
    }, this);
    app.on('playCali3', function() {
        this.stage = 'cali3';
    }, this);
    app.on('playTokyo2', function() {
        this.stage = 'tokyo2';
    }, this);
    app.on('playTokyo3', function() {
        this.stage = 'tokyo3';
    }, this);
    app.on('playTokyo4', function() {
        this.stage = 'tokyo4';
    }, this);
    app.on('transitionDockRoadPre', function() {
        this.dockReached = true;
    }, this);
    app.on('transitionTokyoRoadPre', function() {
        this.tokyoReached = true;
    }, this);
    app.on('changeToTokyo', this.tokyoAssets, this);
    app.on('changeToCali', this.caliAssets, this);
    app.on('resetGame', this.resetAssets, this);
};

// update code called every frame
SideRoadManager.prototype.update = function(dt) {
    if (this.move) {
        for (var i=0; i<this.assets.length; i++) {
            var asset = this.assets[i];
            var speedIncrement;
            if (asset.getPosition().y > 0.1) {
                speedIncrement = this.initialY / asset.getLocalPosition().y;
            }
            else {
                speedIncrement = this.initialY / 0.1;
            }
            // Scale asset
            var previousScale = asset.getLocalScale();
            asset.setLocalScale(previousScale.x + this.scaleSpeed * dt, previousScale.y + this.scaleSpeed * dt, previousScale.z);
            asset.translateLocal(this.direction * this.xSpeed * dt * speedIncrement, this.ySpeed * dt * speedIncrement, 0);
            if (asset.getLocalPosition().y <= this.finalY) {
                if (this.dockReached) {
                    asset.enabled = false;
                }
                if (this.tokyoReached) {
                    asset.enabled = false;
                }
                asset.setLocalScale(this.initialScale, this.initialScale, 1);
                asset.setLocalPosition(this.initialX, this.initialY, 0);
                asset.sprite.play(this.stage);
            }
        }
    }
};

SideRoadManager.prototype.getInitialPositions = function() {
    var positions = [];
    for (var i=0; i<this.assets.length; i++) {
        positions.push(this.assets[i].getLocalPosition().clone());
    }
    
    return positions;
};

SideRoadManager.prototype.getInitialScales = function() {
    var scales = [];
    for (var i=0; i<this.assets.length; i++) {
        scales.push(this.assets[i].getLocalScale().clone());
    }
    
    return scales;
};

SideRoadManager.prototype.resetAssets = function(currentStage) {
    this.move = false;
    this.dockReached = false;
    this.tokyoReached = false;
    
    if (currentStage === 0) {
        this.stage = 'cali1';
    }
    else {
        this.stage = 'tokyo1';
    }
    for (var i=0; i<this.assets.length; i++) {
        this.assets[i].sprite.play(this.stage);
        this.assets[i].setLocalPosition(this.initialPositions[i]);
        this.assets[i].setLocalScale(this.initialScales[i]);
        this.assets[i].enabled = true;
    }
};

SideRoadManager.prototype.tokyoAssets = function() {
    this.resetAssets(1);
};

SideRoadManager.prototype.caliAssets = function() {
    this.resetAssets(0);
};

// swap method called for script hot-reloading
// inherit your script state here
// SideRoadManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// roadManager.js
var RoadManager = pc.createScript('roadManager');

// initialize code called once per entity
RoadManager.prototype.initialize = function() {
    var app = this.app;
    
    this.left = this.entity.findByName('LeftContainer');
    this.right = this.entity.findByName('RightContainer');
    this.sea = this.entity.findByName('SeaContainer');
    
    this.dock = this.entity.findByName('CaliforniaEnd');
    this.tokyoBase = this.entity.findByName('tokyoBase');
    this.tokyoEnd = this.entity.findByName('TokyoEnd');
    
    this.initialDockPosition = this.dock.getLocalPosition().clone();
    this.initialDockScale = this.dock.getLocalScale().clone();
    this.finalDockPosition = 0.15;
    
    this.initialTokyoBasePosition = this.tokyoBase.getLocalPosition().clone();
    this.initialTokyoBaseScale = this.tokyoBase.getLocalScale().clone();
    this.finalTokyoBasePosition = 1.695;
    
    this.initialTokyoEndPosition = this.tokyoEnd.getLocalPosition().clone();
    this.initialTokyoEndScale = this.tokyoEnd.getLocalScale().clone();
    // dock scale = 1
    this.dockReached = false;
    this.tokyoReached = false;
    // tokyoFloor scale = 1.9, position = 1.695
    
    app.on('playCali2', this.playCali2, this);
    app.on('playCali3', this.playCali3, this);
    app.on('playTokyo2', this.playTokyo2, this);
    app.on('playTokyo3', this.playTokyo3, this);
    //app.on('playTokyo4', this.playTokyo4, this);
    app.on('straight', this.curve1, this);
    app.on('curve1', this.curve1, this);
    app.on('curve2', this.curve2, this);
    app.on('curve3', this.curve3, this);
    app.on('curve4', this.curve3, this);
    app.on('dockReached', this.dockReached2, this);
    app.on('tokyoReached', this.tokyoReached2, this);
    app.on('changeToTokyo', this.tokyoRoad, this);
    app.on('changeToCali', this.caliRoad, this);
    app.on('resetGame', function() {
        this.resetDock();
        this.resetTokyoEnd();
    }, this);
};

RoadManager.prototype.playCali2 = function() {
    var cali2 = this.entity.findByTag('cali2');
    for (var i=0; i<cali2.length; i++) {
        this.changeOpacity(cali2[i]);
    }
};

RoadManager.prototype.playCali3 = function() {
    var cali3 = this.entity.findByTag('cali3');
    for (var i=0; i<cali3.length; i++) {
        this.changeOpacity(cali3[i]);
    }
};

RoadManager.prototype.playTokyo2 = function() {
    var tokyo2 = this.entity.findByTag('tokyo2');
    for (var i=0; i<tokyo2.length; i++) {
        this.changeOpacity(tokyo2[i]);
    }
};

RoadManager.prototype.playTokyo3 = function() {
    var tokyo3 = this.entity.findByTag('tokyo3');
    for (var i=0; i<tokyo3.length; i++) {
        this.changeOpacity(tokyo3[i]);
    }
};

/*RoadManager.prototype.playTokyo4 = function() {
    var tokyo4 = this.entity.findByTag('tokyo4');
    for (var i=0; i<tokyo4.length; i++) {
        this.changeOpacity(tokyo4[i]);
    }
};*/

RoadManager.prototype.changeOpacity = function(entity) {
    var opacity = {alpha: 0};
    var sprite = entity.sprite;
    this.app
        .tween(opacity)
        .to({alpha: 1}, 1, pc.Linear)
        .loop(false)
        .yoyo(false)
        .on('update', function () {
            sprite.opacity = opacity.alpha;
        })
        .start();
};

RoadManager.prototype.curve1 = function(direction) {
    this.left.setLocalPosition(0, 0, 0);
    this.right.setLocalPosition(0, 0, 0);
    this.sea.setLocalPosition(0, 0, 0);
};

RoadManager.prototype.curve2 = function(direction) {
    if (direction > 0) {
        this.left.setLocalPosition(0.065, 0, 0);
        this.right.setLocalPosition(0, 0, 0);
        this.sea.setLocalPosition(0, 0, 0);
    }
    else {
        this.left.setLocalPosition(0, 0, 0);
        this.right.setLocalPosition(-0.065, 0, 0);
        this.sea.setLocalPosition(0, 0, 0);
    }
};

RoadManager.prototype.curve3 = function(direction) {
    if (direction > 0) {
        this.left.setLocalPosition(0.197, 0, 0);
        this.right.setLocalPosition(0.137, 0, 0);
        this.sea.setLocalPosition(0, 0, 0);
    }
    else {
        this.left.setLocalPosition(-0.137, 0, 0);
        this.right.setLocalPosition(-0.197, 0, 0);
        this.sea.setLocalPosition(0, 0, 0);
    }
};

RoadManager.prototype.dockReached2 = function() {
    if (!this.dockReached) {
        var caliEnd = this.entity.findByName('CaliforniaEnd');
        caliEnd.enabled = true;
        this.dockReached = true;
        var tween = caliEnd.tween(caliEnd.getLocalPosition())
            .to(new pc.Vec3(caliEnd.getLocalPosition().x, this.finalDockPosition, 0), 1, pc.Linear);
            tween.start();
        var tween2 = caliEnd.tween(caliEnd.getLocalScale())
            .to(new pc.Vec3(1, 1, 1), 1, pc.Linear);
            tween2.start();
    }
};

RoadManager.prototype.tokyoReached2 = function() {
    if (!this.tokyoReached) {
        var tokyoBase = this.entity.findByName('tokyoBase');
        var tokyoEnd = this.entity.findByName('TokyoEnd');
        //tokyoBase.enabled = true;
        tokyoEnd.enabled = true;
        this.tokyoReached = true;
        var tween3 = tokyoBase.tween(tokyoBase.getLocalPosition())
            .to(new pc.Vec3(tokyoBase.getLocalPosition().x, this.finalTokyoBasePosition, 0), 1, pc.Linear);
            tween3.start();
        var tween4 = tokyoBase.tween(tokyoBase.getLocalScale())
            .to(new pc.Vec3(tokyoBase.getLocalScale().x, 1.9, 1), 1, pc.Linear);
            tween4.start();
        var tween = tokyoEnd.tween(tokyoEnd.getLocalPosition())
            .to(new pc.Vec3(tokyoEnd.getLocalPosition().x, this.finalDockPosition, 0), 1, pc.Linear);
            tween.start();
        var tween2 = tokyoEnd.tween(tokyoEnd.getLocalScale())
            .to(new pc.Vec3(1, 1, 1), 1, pc.Linear);
            tween2.start();
    }
};

RoadManager.prototype.resetDock = function() {
    this.dockReached = false;
    var caliEnd = this.entity.findByName('CaliforniaEnd');
    caliEnd.enabled = false;
    caliEnd.setLocalPosition(this.initialDockPosition);
    caliEnd.setLocalScale(this.initialDockScale);
};

RoadManager.prototype.resetTokyoEnd = function() {
    this.tokyoReached = false;
    var tokyoBase = this.entity.findByName('tokyoBase');
    var tokyoEnd = this.entity.findByName('TokyoEnd');
    tokyoBase.enabled = false;
    tokyoEnd.enabled = false;
    tokyoBase.setLocalPosition(this.initialTokyoBasePosition);
    tokyoBase.setLocalScale(this.initialTokyoBaseScale);
    tokyoEnd.setLocalPosition(this.initialTokyoEndPosition);
    tokyoEnd.setLocalScale(this.initialTokyoEndScale);
};

RoadManager.prototype.tokyoRoad = function() {
    this.resetDock();
    this.resetTokyoEnd();
    this.curve1();
    var tokyo1 = this.entity.findByTag('tokyo1');
    for (var i=0; i<tokyo1.length; i++) {
        tokyo1[i].sprite.opacity = 1;
    }
};

RoadManager.prototype.caliRoad = function() {
    this.resetDock();
    this.resetTokyoEnd();
    this.curve1();
    var tokyo1 = this.entity.findByTag('tokyo1');
    for (var i=0; i<tokyo1.length; i++) {
        tokyo1[i].sprite.opacity = 0;
    }
    this.entity.findByName('cali1_sea').sprite.opacity = 1;
};
// update code called every frame
//RoadManager.prototype.update = function(dt) {};

// swap method called for script hot-reloading
// inherit your script state here
// RoadManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// skyManager.js
var SkyManager = pc.createScript('skyManager');

// initialize code called once per entity
SkyManager.prototype.initialize = function() {
    var app = this.app;
    
    this.skies = this.entity.findByTag('sky');
    
    app.on('playCali2', function() {
        this.changeOpacity(this.entity.findByName('cali2_sky'));
    }, this);
    app.on('playCali3', function() {
        this.changeOpacity(this.entity.findByName('cali3_sky'));
    }, this);
    app.on('playTokyo2', function() {
        this.changeOpacity(this.entity.findByName('tokyo2_sky'));
    }, this);
    app.on('playTokyo3', function() {
        this.changeOpacity(this.entity.findByName('tokyo3_sky'));
    }, this);
    app.on('playTokyo4', function() {
        this.changeOpacity(this.entity.findByName('tokyo4_sky'));
    }, this);
    app.on('transitionDockRoad', function() {
        this.changeOpacity(this.entity.findByName('cali4_sky'));
    }, this);
    /*app.on('transitionTokyoRoad', function() {
        this.changeOpacity(this.entity.findByName('tokyo4_sky'));
    }, this);*/
    app.on('changeToTokyo', this.tokyoSky, this);
    app.on('changeToCali', this.caliSky, this);
    app.on('resetGame', this.resetSky, this);
};

SkyManager.prototype.changeOpacity = function(entity) {
    var opacity = {alpha: 0};
    var sprite = entity.sprite;
    this.app
        .tween(opacity)
        .to({alpha: 1}, 1, pc.Linear)
        .loop(false)
        .yoyo(false)
        .on('update', function () {
            sprite.opacity = opacity.alpha;
        })
        .start();
};

SkyManager.prototype.tokyoSky = function() {
    this.entity.findByName('tokyo1_sky').sprite.opacity = 1;
};

SkyManager.prototype.caliSky = function() {
    this.resetSky(0);
};

SkyManager.prototype.resetSky = function(currentStage) {
    if (currentStage === 0) {
        for (var i=0; i<this.skies.length; i++) {
            if (this.skies[i].name != 'cali1_sky') {
                this.skies[i].sprite.opacity = 0;
            }
            else {
                this.skies[i].sprite.opacity = 1;
            }
        }
    }
    else {
        for (var j=0; j<this.skies.length; j++) {
            if (this.skies[j].name != 'tokyo1_sky') {
                this.skies[j].sprite.opacity = 0;
            }
        }
    }
};

// update code called every frame
// SkyManager.prototype.update = function(dt) {};

// swap method called for script hot-reloading
// inherit your script state here
// SkyManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// backgroundManager.js
var BackgroundManager = pc.createScript('backgroundManager');

// initialize code called once per entity
BackgroundManager.prototype.initialize = function() {
    var app = this.app;
    
    this.backgrounds0 = this.entity.findByTag('bg0');
    this.pos0 = this.getPositions('bg0');
    this.backgrounds1 = this.entity.findByTag('bg1');
    this.pos1 = this.getPositions('bg1');
    
    app.on('changeBg3', this.changeBg3, this);
    app.on('changeBg4', this.changeBg4, this);
    app.on('transitionDockRoad', this.transitionDockRoad, this);
    //app.on('transitionTokyoRoad', this.transitionTokyoRoad, this);
    
    app.on('resetGame', this.resetBackgrounds, this);
    
    app.on('changeToTokyo', this.tokyoBackgrounds, this);
    app.on('changeToCali', function() {
        this.resetBackgrounds(0);
    }, this);
};

BackgroundManager.prototype.changeBg3 = function(stage) {
    var bg1 = this.entity.findByTag('cali1');
    if (stage === 0) {
        for (var i=0; i<bg1.length; i++) {
            bg1[i].sprite.play('cali3');
        }
    }
    else {
        for (var j=0; j<bg1.length; j++) {
            bg1[j].sprite.play('tokyo3');
        }
    }
};

BackgroundManager.prototype.changeBg4 = function(stage) {
    var bg2 = this.entity.findByTag('cali2');
    for (var i=0; i<bg2.length; i++) {
        bg2[i].sprite.play('tokyo4');
    }
};

BackgroundManager.prototype.transitionDockRoad = function() {
    var backgrounds = this.entity.findByTag('bg');
    for (var i=0; i<backgrounds.length; i++) {
        this.changeOpacity(backgrounds[i]);
    }
};

BackgroundManager.prototype.changeOpacity = function(entity) {
    var opacity = {alpha: 1};
    var sprite = entity.sprite;
    this.app
        .tween(opacity)
        .to({alpha: 0}, 1, pc.Linear)
        .loop(false)
        .yoyo(false)
        .on('update', function () {
            sprite.opacity = opacity.alpha;
        })
        .start();
};

BackgroundManager.prototype.getPositions = function(tag) {
    var positions = [];
    if (tag === 'bg0') {
        for (var i=0; i<this.backgrounds0.length; i++) {
            positions.push(this.backgrounds0[i].getLocalPosition().clone()); // .clone() is necessary so that the position doesn't update
        }
    }
    else if (tag === 'bg1') {
        for (var j=0; j<this.backgrounds0.length; j++) {
            positions.push(this.backgrounds0[j].getLocalPosition().clone()); // .clone() is necessary so that the position doesn't update
        }
    }
    
    return positions;
};

BackgroundManager.prototype.resetBackgrounds = function(stage) {
    if (stage === 0) {
        var cali1Backgrounds = this.entity.findByTag('cali1');
        for (let i=0; i<cali1Backgrounds.length; i++) {
            cali1Backgrounds[i].sprite.play('cali1');
            cali1Backgrounds[i].sprite.opacity = 1;
        }
        var cali2Backgrounds = this.entity.findByTag('cali2');
        for (let j=0; j<cali2Backgrounds.length; j++) {
            cali2Backgrounds[j].sprite.play('cali1');
            cali2Backgrounds[j].sprite.opacity = 1;
        }
    }
    else {
        var tokyoBackgrounds1 = this.entity.findByTag('cali1');
        for (let i=0; i<tokyoBackgrounds1.length; i++) {
            tokyoBackgrounds1[i].sprite.play('tokyo1');
            tokyoBackgrounds1[i].sprite.opacity = 1;
        }
        var tokyoBackgrounds2 = this.entity.findByTag('cali2');
        for (let j=0; j<tokyoBackgrounds2.length; j++) {
            tokyoBackgrounds2[j].sprite.play('tokyo2');
            tokyoBackgrounds2[j].sprite.opacity = 1;
        }
    }
    for (var i=0; i<this.backgrounds0.length; i++) {
        this.backgrounds0[i].setLocalPosition(this.pos0[i]);
    }
    for (var j=0; j<this.backgrounds1.length; j++) {
        this.backgrounds1[j].setLocalPosition(this.pos1[j]);
    }
};

BackgroundManager.prototype.tokyoBackgrounds = function() {
    this.resetBackgrounds(1);
    
};

// update code called every frame
//BackgroundManager.prototype.update = function(dt) {};

// swap method called for script hot-reloading
// inherit your script state here
// BackgroundManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// sideRoadsEntity.js
var SideRoadsEntity = pc.createScript('sideRoadsEntity');

// initialize code called once per entity
SideRoadsEntity.prototype.initialize = function() {
    var app = this.app;
    
    this.left = this.entity.findByName('SideRoadLeft');
    this.right = this.entity.findByName('SideRoadRight');
    
    app.on('straight', this.curve1, this);
    app.on('curve1', this.curve1, this);
    app.on('curve2', this.curve2, this);
    app.on('curve3', this.curve3, this);
    app.on('curve4', this.curve3, this);
};

SideRoadsEntity.prototype.curve1 = function(direction) {
    this.left.setLocalPosition(0, 0, 0);
    this.right.setLocalPosition(0, 0, 0);
};

SideRoadsEntity.prototype.curve2 = function(direction) {
    if (direction > 0) {
        this.right.setLocalPosition(0.114, 0, 0);
    }
    else {
        this.left.setLocalPosition(-0.114, 0, 0);
    }
};

SideRoadsEntity.prototype.curve3 = function(direction) {
    if (direction > 0) {
        this.right.setLocalPosition(0.169, 0, 0);
    }
    else {
        this.left.setLocalPosition(-0.169, 0, 0);
    }
};

// update code called every frame
//SideRoadsEntity.prototype.update = function(dt) {};

// swap method called for script hot-reloading
// inherit your script state here
// SideRoadsEntity.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// finishScreen.js
var FinishScreen = pc.createScript('finishScreen');

// initialize code called once per entity
FinishScreen.prototype.initialize = function() {
    var app = this.app;
    
    // Find our button
    this.button = this.entity.findByTag('button')[0];
    // Catch the click event
    this.button.element.on('click', this.buttonClicked, this);
    
    this.items0 = this.entity.findByTag('item0');
    this.items1 = this.entity.findByTag('item1');
    
    app.on('itemCollected', this.itemCollected, this);
    app.on('itemFailed', this.itemFailed, this);
    app.on('resetGame', this.resetItems, this);
    app.on('changeToTokyo', this.resetItems, this);
    app.on('changeToCali', this.resetItems, this);
};

FinishScreen.prototype.itemCollected = function(index) {
    this.items0[index].enabled = true;
};

FinishScreen.prototype.itemFailed = function(index) {
    this.items1[index].enabled = true;
};

FinishScreen.prototype.buttonClicked = function() {
    var app = this.app;
    
    let entities = this.entity.findByTag('enabler');
    for (let i=0; i<entities.length; i++) {
        entities[i].enabled = false;
    }
    if (this.entity.name === 'FinishCali') {
        app.fire('changeToTokyo');
    }
    else {
        app.fire('changeToCali');
        //changeToCali ¿?
    }
    //app.fire('resetGame', 0);
};

FinishScreen.prototype.resetItems = function() {
    for (var i=0; i<this.items0.length; i++) {
        this.items0[i].enabled = false;
        this.items1[i].enabled = false;
    }
};

// update code called every frame
//FinishScreen.prototype.update = function(dt) {};

// swap method called for script hot-reloading
// inherit your script state here
// FinishScreen.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// introScript.js
var IntroScript = pc.createScript('introScript');

// initialize code called once per entity
IntroScript.prototype.initialize = function() {
    var app = this.app;
    
    this.intro = this.entity.findByName('Presents');
    this.finalPos = -10.59;
    this.fadeOut = false;
    this.introTimer = 0;
    this.introStarted = false;
};

// update code called every frame
IntroScript.prototype.update = function(dt) {
    var app = this.app;
    
    if (!this.introStarted) {
        var tween = this.intro.tween(this.intro.getLocalPosition())
        .to(new pc.Vec3(this.finalPos, this.intro.getLocalPosition().y, this.intro.getLocalPosition().z), 4, pc.Linear);
        tween.start();
        this.introStarted = true;
        //app.fire('startPlayinggg');
    }
    
    if (Math.abs(this.intro.getLocalPosition().x.toFixed(3) - this.finalPos) <= 20) {
        if (!this.fadeOut) {
            this.changeOpacity(this.intro);
            this.fadeOut = true;
        }
        if (this.introTimer > -1) {
            this.introTimer += dt;
        }
    }
    
    if (this.introTimer > 1.7) {
        app.fire('introFinished');
        this.introTimer = -5;
    }
};

IntroScript.prototype.changeOpacity = function(entity) {
    var opacity = {alpha: 1};
    var sprite = entity.element;
    this.app
        .tween(opacity)
        .to({alpha: 0}, 1.5, pc.Linear)
        .loop(false)
        .yoyo(false)
        .on('update', function () {
            entity.element.opacity = opacity.alpha;
        })
        .start();
};

// swap method called for script hot-reloading
// inherit your script state here
// IntroScript.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// titleScript.js
var TitleScript = pc.createScript('titleScript');

// initialize code called once per entity
TitleScript.prototype.initialize = function() {
    var app = this.app;
    
    this.buttonEnabled = false;
    
    this.started = false;
    
    this.title = this.entity.findByName('Title');
    this.controls = this.entity.findByName('Controls');
    // Find our button
    this.startButton = this.entity.findByTag('button')[0];
    // Catch the click event
    this.startButton.element.on('click', function() {
        if (this.buttonEnabled) {
            app.fire('startPlaying');
            this.entity.enabled = false;
        }
    }, this);
};

// update code called every frame
TitleScript.prototype.update = function(dt) {
    if (!this.started) {
        this.changeOpacity(this.title);
        this.changeOpacity(this.startButton);
        this.changeOpacity(this.controls);
        this.started = true;
    }
    
    if (this.startButton.element.opacity === 1) {
        this.buttonEnabled = true;
    }
};

TitleScript.prototype.changeOpacity = function(entity) {
    var opacity = {alpha: 0};
    var sprite = entity.element;
    this.app
        .tween(opacity)
        .to({alpha: 1}, 1, pc.Linear)
        .loop(false)
        .yoyo(false)
        .on('update', function () {
            sprite.opacity = opacity.alpha;
        })
        .start();
};

// swap method called for script hot-reloading
// inherit your script state here
// TitleScript.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// audioController.js
var AudioController = pc.createScript('audioController');

// initialize code called once per entity
AudioController.prototype.initialize = function() {
    var app = this.app;
    
    //app.on('startPlaying0', this.startMusic, this);
    app.on('startPlayinggg', this.startMusic2, this);
};

// update code called every frame
//AudioController.prototype.update = function(dt) {};

AudioController.prototype.startMusic2 = function() {
    this.entity.sound.play('backgroundSong');
};

// swap method called for script hot-reloading
// inherit your script state here
// AudioController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

