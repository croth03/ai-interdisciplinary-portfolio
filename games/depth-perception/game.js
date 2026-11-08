(() => {
  "use strict";

  const VIEW_W = 960;
  const VIEW_H = 540;
  const FLOOR_Y = 470;
  const DEMO_LEVEL_COUNT = 3;
  const TOUCH_CONTROLS_ENABLED = false;
  let WORLD_W = 3600;
  const TRANSITION_SAFETY = Object.freeze({ side: 40, headroom: 28, enemyPadding: 28, visualSide: 54, visualTop: 78 });
  const PLANE_NAMES = ["DISTANT", "PRESENT", "NEAR"];
  const DEPTH_ART_SOURCES = [
    "art/environment-panorama-v2.png",
    "art/environment-panorama-v2.png",
    "art/environment-hallucination-v2.png",
    "art/environment-hallucination-v2.png",
    "art/environment-lost-reality-v2.png"
  ];
  const ENVIRONMENT_ATLAS_SOURCES = Object.freeze({
    "platform-tops": "art/environment-kit-v3/platform-tops-atlas.png",
    "platform-faces": "art/environment-kit-v3/platform-faces-atlas.png",
    "natural-platforms": "art/environment-kit-v3/natural-platforms-atlas.png",
    "arches": "art/environment-kit-v3/arches-atlas.png",
    "platform-edges": "art/environment-kit-v3/platform-edges-atlas.png",
    "rocks": "art/environment-kit-v3/rocks-atlas.png",
    "ground-foliage": "art/environment-kit-v3/ground-foliage-atlas.png",
    "shrubs": "art/environment-kit-v3/shrubs-atlas.png",
    "hanging-growth": "art/environment-kit-v3/hanging-growth-atlas.png",
    "trees-distant": "art/environment-kit-v3/trees-distant-atlas.png",
    "trees-middle": "art/environment-kit-v3/trees-middle-atlas.png",
    "trees-foreground": "art/environment-kit-v3/trees-foreground-atlas.png",
    "ruins": "art/environment-kit-v3/ruins-atlas.png",
    "rubble": "art/environment-kit-v3/rubble-atlas.png",
    "under-platform-roots": "art/environment-kit-v3/under-platform-roots-atlas.png",
    "rare-plants": "art/environment-kit-v3/rare-plants-atlas.png",
    "ground-mist": "art/environment-kit-v3/ground-mist-atlas.png",
    "foreground-fog": "art/environment-kit-v3/foreground-fog-atlas.png",
    "overhead-rocks": "art/environment-kit-v3/overhead-rocks-atlas.png",
    "walls-cliffs": "art/environment-kit-v3/walls-cliffs-atlas.png"
  });
  const ENVIRONMENT_ATLAS_BOUNDS = Object.freeze({
    "platform-tops":[[24,198,843,150],[908,195,843,135],[24,603,843,147],[908,603,846,150]],
    "platform-faces":[[21,156,834,204],[914,156,837,213],[27,561,834,219],[914,564,840,216]],
    "natural-platforms":[[27,144,831,255],[911,159,828,243],[27,516,831,270],[908,516,840,264]],
    "arches":[[117,21,651,492],[768,24,657,489],[147,512,621,477],[768,512,612,477]],
    "platform-edges":[[54,84,525,540],[681,84,525,540],[57,624,516,513],[681,624,525,513]],
    "rocks":[[201,159,687,285],[887,15,768,333],[186,444,702,408],[887,501,834,354]],
    "ground-foliage":[[75,141,756,249],[929,198,777,186],[60,588,765,222],[911,570,813,237]],
    "shrubs":[[36,57,696,450],[834,12,609,492],[51,560,717,423],[768,551,738,438]],
    "hanging-growth":[[15,3,663,525],[748,0,687,519],[27,549,660,519],[748,549,681,504]],
    "trees-distant":[[243,24,357,444],[840,66,597,408],[114,515,654,465],[768,539,690,441]],
    "trees-middle":[[210,6,276,594],[659,12,606,573],[9,600,642,546],[668,609,636,537]],
    "trees-foreground":[[15,12,786,459],[938,12,720,459],[15,470,774,453],[1040,470,618,453]],
    "ruins":[[63,12,642,486],[804,21,684,477],[30,563,687,402],[795,572,720,393]],
    "rubble":[[39,180,807,210],[926,135,804,255],[45,522,816,255],[935,522,795,255]],
    "under-platform-roots":[[69,45,666,426],[792,39,690,456],[72,515,654,462],[789,515,693,477]],
    "rare-plants":[[81,195,645,276],[813,156,639,315],[75,599,636,330],[768,731,717,198]],
    "ground-mist":[[12,168,867,210],[905,237,816,105],[36,576,819,231],[890,633,876,198]],
    "foreground-fog":[[9,0,816,471],[851,0,810,471],[0,470,837,471],[836,470,837,471]],
    "overhead-rocks":[[21,18,849,309],[902,21,852,336],[21,453,852,384],[902,453,852,243]],
    "walls-cliffs":[[105,18,312,735],[614,18,312,738],[75,786,375,738],[596,783,336,741]]
  });
  const CHARACTER_ART_SOURCES = Object.freeze({
    idle: "art/character-v1/veilwalker-idle.png",
    run: "art/character-v1/veilwalker-run.png",
    airborne: "art/character-v1/veilwalker-airborne.png",
    slide: "art/character-v1/veilwalker-slide.png",
    castForward: "art/character-v1/veilwalker-cast-forward.png",
    castUp: "art/character-v1/veilwalker-cast-up.png",
    surge: "art/character-v1/veilwalker-surge.png",
    land: "art/character-v1/veilwalker-land.png",
    phase: "art/character-v1/veilwalker-phase.png",
    defeat: "art/character-v1/veilwalker-defeat.png"
  });
  const ENTITY_ART_SOURCES = Object.freeze({
    rootling: "art/entities-v1/rootling.png",
    guardian: "art/entities-v1/stone-guardian.png",
    bat: "art/entities-v1/ruin-bat.png",
    moth: "art/entities-v1/veil-moth.png",
    fragments: "art/entities-v1/memory-fragments.png",
    relics: "art/entities-v1/relics-checkpoint.png",
    portals: "art/entities-v1/portals-source.png"
  });
  const STATE = Object.freeze({
    TITLE: "title",
    LEVEL_SELECT: "levelSelect",
    PLAYING: "playing",
    TRANSITION: "depthTransition",
    PAUSED: "paused",
    PLAYER_DEAD: "playerDead",
    LEVEL_COMPLETE: "levelComplete",
    GAME_COMPLETE: "gameComplete",
    OPTIONS: "options",
    CREDITS: "credits"
  });
  const DEPTH_STYLE = [
    { scale: 0.72, parallax: 0.68, yOffset: -26, base: "#31566a", top: "#82d6df", glow: "#82e9ee" },
    { scale: 1.00, parallax: 1.00, yOffset: 0, base: "#574f77", top: "#ad8cff", glow: "#ad8cff" },
    { scale: 1.22, parallax: 1.20, yOffset: 16, base: "#744d68", top: "#e790bd", glow: "#f0a6cf" }
  ];
  const ENEMY_TYPES = Object.freeze({
    skitter: { w: 38, h: 26, health: 1, speed: 92, flying: false },
    brute: { w: 52, h: 46, health: 3, speed: 34, flying: false },
    sentry: { w: 38, h: 26, health: 2, speed: 72, flying: true },
    drifter: { w: 32, h: 32, health: 2, speed: 54, flying: true }
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const approach = (value, target, amount) => value < target
    ? Math.min(value + amount, target)
    : Math.max(value - amount, target);
  const aabb = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  class Input {
    constructor(target) {
      this.keyDown = new Set();
      this.keyPressed = new Set();
      this.actionDown = new Map();
      this.actionPressed = new Set();
      this.pointerActions = new Map();
      this.keyMap = new Map([
        ["ArrowLeft", "left"], ["KeyA", "left"],
        ["ArrowRight", "right"], ["KeyD", "right"],
        ["Space", "jump"], ["KeyW", "jump"],
        ["KeyS", "roll"], ["ArrowDown", "roll"],
        ["KeyJ", "shoot"], ["KeyX", "shoot"],
        ["ArrowUp", "aimUp"], ["KeyE", "shift"],
        ["Escape", "pause"], ["KeyP", "pause"],
        ["KeyR", "restart"], ["Enter", "confirm"]
      ]);
      this.blocked = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"]);
      window.addEventListener("keydown", event => {
        if (this.blocked.has(event.code)) event.preventDefault();
        if (!this.keyDown.has(event.code)) {
          this.keyPressed.add(event.code);
          const action = this.keyMap.get(event.code);
          if (action) this.actionPressed.add(action);
        }
        this.keyDown.add(event.code);
        const action = this.keyMap.get(event.code);
        if (action) this.actionDown.set(action, true);
      }, { passive: false });
      window.addEventListener("keyup", event => {
        this.keyDown.delete(event.code);
        const action = this.keyMap.get(event.code);
        if (action && ![...this.keyDown].some(code => this.keyMap.get(code) === action) && !this.pointerHasAction(action)) {
          this.actionDown.set(action, false);
        }
      });
      window.addEventListener("blur", () => this.clear());
      target.addEventListener("pointerdown", () => target.focus());
    }

    pointerHasAction(action) { return [...this.pointerActions.values()].includes(action); }
    setPointerAction(pointerId, action, active) {
      if (active) {
        this.pointerActions.set(pointerId, action);
        if (!this.actionDown.get(action)) this.actionPressed.add(action);
        this.actionDown.set(action, true);
        return;
      }
      const previous = this.pointerActions.get(pointerId);
      this.pointerActions.delete(pointerId);
      if (previous && !this.pointerHasAction(previous) && ![...this.keyDown].some(code => this.keyMap.get(code) === previous)) {
        this.actionDown.set(previous, false);
      }
    }
    isDown(action) { return Boolean(this.actionDown.get(action)); }
    wasPressed(action) { return this.actionPressed.has(action); }
    wasKeyPressed(...codes) { return codes.some(code => this.keyPressed.has(code)); }
    clear() {
      this.keyDown.clear();
      this.pointerActions.clear();
      this.actionDown.clear();
    }
    endFrame() {
      this.keyPressed.clear();
      this.actionPressed.clear();
    }
  }

  class AudioManager {
    constructor() {
      this.context = null;
      this.sfxVolume = 0.7;
      this.musicVolume = 0.45;
      this.muted = false;
      this.currentMusic = "";
      this.musicNodes = null;
      this.currentAmbience = "";
      this.ambienceNodes = null;
      this.buffers = new Map();
      this.loadedAssetCount = 0;
      this.preloadPromise = null;
      this.pendingLoads = new Map();
      this.filePlaybackCount = 0;
      this.lastPlayedAsset = "";
      this.lastMusicAsset = "";
      this.lastAmbienceAsset = "";
      this.manifestUrl = "audio/audio-manifest.json";
      this.assetPaths = Object.freeze({
        jump:"audio/sfx/player/player_jump.ogg", land:"audio/sfx/player/player_land.ogg",
        hurt:"audio/sfx/player/player_hurt.ogg", death:"audio/sfx/player/player_death.ogg",
        respawn:"audio/sfx/player/player_respawn.ogg",
        rocket:"audio/sfx/player/player_rocket.ogg", roll:"audio/sfx/player/player_roll.ogg",
        shot:"audio/sfx/player/player_shot.ogg", transitionPad:"audio/sfx/depth/transition_pad.ogg",
        phaseArrival:"audio/sfx/depth/phase_arrival.ogg", depthShiftForeground:"audio/sfx/depth/depth_shift_foreground.ogg",
        depthShiftBackground:"audio/sfx/depth/depth_shift_background.ogg",
        shard01:"audio/sfx/collectibles/shard_pickup_01.ogg", shard02:"audio/sfx/collectibles/shard_pickup_02.ogg",
        shard03:"audio/sfx/collectibles/shard_pickup_03.ogg", relic:"audio/sfx/collectibles/relic_pickup.ogg",
        checkpoint:"audio/sfx/collectibles/checkpoint.ogg",
        enemyHit:"audio/sfx/enemies/enemy_hit.ogg", enemyDestroyed:"audio/sfx/enemies/enemy_destroyed.ogg",
        enemyAlert:"audio/sfx/enemies/enemy_alert.ogg", machineryLoop:"audio/sfx/machinery/machinery_loop.ogg",
        piston:"audio/sfx/machinery/piston_movement.ogg", steam:"audio/sfx/machinery/steam_burst.ogg",
        electricArc:"audio/sfx/machinery/electric_arc.ogg", machineryClunk:"audio/sfx/machinery/machinery_clunk.ogg",
        uiMove:"audio/sfx/ui/ui_move.ogg", uiSelect:"audio/sfx/ui/ui_select.ogg",
        uiBack:"audio/sfx/ui/ui_back.ogg", uiPause:"audio/sfx/ui/ui_pause.ogg",
        warning:"audio/sfx/ui/warning_beep.ogg", levelStart:"audio/sfx/ui/level_start.ogg",
        levelComplete:"audio/sfx/ui/level_complete.ogg",
        foundry:"audio/ambient/ambient_foundry.ogg", turbine:"audio/ambient/ambient_turbine.ogg",
        core:"audio/ambient/ambient_core.ogg", deepAssembly:"audio/ambient/ambient_deep_assembly.ogg",
        zeroDepth:"audio/ambient/ambient_zero_depth.ogg",
        title:"audio/music/music_title.mp3", level1:"audio/music/music_level_1.mp3",
        level2:"audio/music/music_level_2.mp3", level3:"audio/music/music_level_3.mp3",
        level4:"audio/music/music_level_4.mp3", level5:"audio/music/music_level_5.mp3",
        gameComplete:"audio/music/music_title.mp3"
      });
      this.activeAssetPaths = { ...this.assetPaths };
      this.musicIds = new Set(["title","level1","level2","level3","level4","level5","gameComplete"]);
      this.sfxPoolIndex = 0;
      this.sfxPool = Array.from({ length:10 }, () => {
        const element = document.createElement("audio");
        element.preload = "auto";
        element.setAttribute("aria-hidden", "true");
        return element;
      });
      this.ambienceElement = document.createElement("audio");
      this.ambienceElement.preload = "auto";
      this.ambienceElement.loop = true;
      this.ambienceElement.setAttribute("aria-hidden", "true");
      this.musicElement = document.createElement("audio");
      this.musicElement.preload = "auto";
      this.musicElement.loop = true;
      this.musicElement.setAttribute("aria-hidden", "true");
      this.loadedAssetCount = Object.keys(this.activeAssetPaths).length;
      this.mediaPlaybackErrors = 0;
      this.lastAudioError = "";
      this.variants = Object.freeze({ shard:["shard01","shard02","shard03"] });
      this.pitchVariation = Object.freeze({ shard:[.96,1.04] });
      this.aliases = Object.freeze({ menuSelect:"uiSelect", menuNavigate:"uiMove" });
      this.placeholders = Object.freeze({
        jump:[185,.08,"square",.025,85], land:[92,.06,"triangle",.018,-20], shard:[620,.09,"triangle",.035,240],
        relic:[460,.18,"triangle",.04,330], depthShiftBackground:[390,.22,"sawtooth",.025,-210],
        depthShiftForeground:[170,.22,"sawtooth",.025,360], hurt:[105,.24,"sawtooth",.045,-50],
        death:[72,.32,"sawtooth",.04,-30], respawn:[250,.16,"triangle",.028,180], shot:[440,.055,"square",.018,-110], rocket:[145,.18,"sawtooth",.028,260],
        roll:[95,.12,"square",.02,45], enemyHit:[210,.07,"square",.02,-40], enemyDestroyed:[150,.1,"square",.03,120],
        enemyAlert:[430,.09,"square",.02,-80], checkpoint:[340,.16,"triangle",.025,160],
        transitionPad:[170,.08,"square",.02,35], phaseArrival:[300,.13,"triangle",.025,170],
        levelStart:[330,.14,"triangle",.02,110], levelComplete:[392,.2,"square",.025,12],
        uiMove:[260,.045,"square",.014,30], uiSelect:[360,.07,"triangle",.018,90], uiBack:[210,.07,"triangle",.018,-60],
        uiPause:[180,.08,"square",.018,30], warning:[220,.11,"square",.024,-35]
      });
    }
    unlock() {
      if (!this.context) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.context = new AudioCtx();
      }
      if (this.context?.state === "suspended") this.context.resume();
      if (this.context && !this.preloadPromise) this.preloadPromise = this.preloadSelected();
    }
    tone(frequency, duration = 0.08, type = "square", volume = 0.035, slide = 0) {
      this.unlock();
      if (!this.context || this.muted) return;
      const now = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), now + duration);
      gain.gain.setValueAtTime(Math.max(.0001, volume * this.sfxVolume), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(this.context.destination);
      osc.start(now);
      osc.stop(now + duration);
    }
    playMediaFile(resolvedName, semanticName, gainScale = 1) {
      const path = this.activeAssetPaths[resolvedName] || this.assetPaths[resolvedName];
      if (!path || this.muted) return false;
      const element = this.sfxPool[this.sfxPoolIndex % this.sfxPool.length];
      this.sfxPoolIndex += 1;
      element.pause();
      element.src = path;
      const pitch = this.pitchVariation[semanticName];
      element.playbackRate = pitch ? pitch[0] + Math.random() * (pitch[1] - pitch[0]) : 1;
      element.volume = clamp(this.sfxVolume * gainScale, 0, 1);
      element.muted = this.muted;
      element.currentTime = 0;
      element.play().then(() => {
        this.filePlaybackCount += 1;
        this.lastPlayedAsset = resolvedName;
        this.lastAudioError = "";
      }).catch(error => {
        this.mediaPlaybackErrors += 1;
        this.lastAudioError = `${resolvedName}: ${error?.name || "PLAYBACK_BLOCKED"}`;
      });
      return true;
    }
    play(name, options = {}) {
      if (this.muted) return;
      this.unlock();
      const semanticName = this.aliases[name] || name;
      const choices = this.variants[semanticName];
      const resolvedName = choices ? choices[Math.floor(Math.random() * choices.length)] : semanticName;
      const gainScale = clamp(Number(options.gainScale) || 1, 0, 2);
      if (this.playMediaFile(resolvedName, semanticName, gainScale)) return;
      const spec = this.placeholders[semanticName];
      if (spec) this.tone(...spec);
    }
    async load(name, path = this.activeAssetPaths[name] || this.assetPaths[name]) {
      if (this.buffers.has(name)) return true;
      if (!path || !this.context || typeof fetch !== "function") return false;
      try {
        const response = await fetch(path);
        if (!response.ok) return false;
        this.buffers.set(name, await this.context.decodeAudioData(await response.arrayBuffer()));
        this.loadedAssetCount = this.buffers.size;
        return true;
      } catch (_) { return false; }
    }
    ensureAsset(name, path = this.activeAssetPaths[name] || this.assetPaths[name]) {
      if (this.buffers.has(name)) return Promise.resolve(true);
      if (this.pendingLoads.has(name)) return this.pendingLoads.get(name);
      const pending = this.load(name, path).finally(() => this.pendingLoads.delete(name));
      this.pendingLoads.set(name, pending);
      return pending;
    }
    async preloadSelected() {
      try {
        const response = await fetch(this.manifestUrl, { cache:"no-store" });
        if (response.ok) {
          const manifest = await response.json();
          if (manifest?.selected) this.activeAssetPaths = { ...this.assetPaths, ...manifest.selected };
          if (manifest?.variants) this.variants = Object.freeze(manifest.variants);
          if (manifest?.pitchVariation) this.pitchVariation = Object.freeze(manifest.pitchVariation);
        }
      } catch (_) { /* Embedded paths remain available for offline fallback. */ }
      this.loadedAssetCount = Object.keys(this.activeAssetPaths).length;
      return this.loadedAssetCount;
    }
    playMusic(name) {
      this.unlock();
      const path = this.activeAssetPaths[name] || this.assetPaths[name];
      if (this.currentMusic === name && this.musicElement.dataset.assetId === name && !this.musicElement.paused) return;
      this.stopMusic();
      this.currentMusic = name;
      if (path) {
        this.musicElement.src = path;
        this.musicElement.dataset.assetId = name;
        this.musicElement.volume = this.muted ? 0 : this.musicVolume;
        this.musicElement.muted = this.muted;
        this.musicElement.play().then(() => {
          this.filePlaybackCount += 1;
          this.lastMusicAsset = name;
          this.lastAudioError = "";
        }).catch(error => {
          this.mediaPlaybackErrors += 1;
          this.lastAudioError = `${name}: ${error?.name || "PLAYBACK_BLOCKED"}`;
        });
        return;
      }
      if (!this.context || this.muted || this.musicVolume <= 0) return;
      const frequencies = { title:55, level1:62, level2:69, level3:73, level4:49, level5:41, gameComplete:82 };
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequencies[name] || 55;
      gain.gain.value = this.musicVolume * .018;
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start();
      this.musicNodes = { oscillator, gain, placeholder:true };
    }
    stopMusic() {
      this.musicElement.pause();
      try { (this.musicNodes?.source || this.musicNodes?.oscillator)?.stop(); } catch (_) { /* Already stopped. */ }
      this.musicNodes = null;
      this.currentMusic = "";
    }
    playAmbience(name) {
      if (this.currentAmbience === name && this.ambienceElement.dataset.assetId === name && !this.ambienceElement.paused) return;
      this.stopAmbience();
      this.currentAmbience = name;
      this.unlock();
      const path = this.activeAssetPaths[name] || this.assetPaths[name];
      if (!path) return;
      this.ambienceElement.src = path;
      this.ambienceElement.dataset.assetId = name;
      this.ambienceElement.volume = this.muted ? 0 : this.musicVolume * .32;
      this.ambienceElement.muted = this.muted;
      this.ambienceElement.currentTime = 0;
      this.ambienceElement.play().then(() => {
        this.filePlaybackCount += 1;
        this.lastAmbienceAsset = name;
        this.lastAudioError = "";
      }).catch(error => {
        this.mediaPlaybackErrors += 1;
        this.lastAudioError = `${name}: ${error?.name || "PLAYBACK_BLOCKED"}`;
      });
    }
    stopAmbience() {
      this.ambienceElement.pause();
      this.currentAmbience = "";
    }
    setVolumes(music, sfx) {
      this.musicVolume = clamp(music,0,1);
      this.sfxVolume = clamp(sfx,0,1);
      this.musicElement.volume = this.muted ? 0 : this.musicVolume;
      this.ambienceElement.volume = this.muted ? 0 : this.musicVolume * .32;
      this.sfxPool.forEach(element => { element.volume = this.muted ? 0 : this.sfxVolume; });
      if (this.musicNodes) this.musicNodes.gain.gain.value = this.muted ? 0 : this.musicVolume * .018;
    }
    setMuted(muted) {
      this.muted = Boolean(muted);
      this.musicElement.muted = this.muted;
      this.musicElement.volume = this.muted ? 0 : this.musicVolume;
      this.ambienceElement.muted = this.muted;
      this.ambienceElement.volume = this.muted ? 0 : this.musicVolume * .32;
      this.sfxPool.forEach(element => { element.muted = this.muted; });
      if (this.musicNodes) this.musicNodes.gain.gain.value = this.muted ? 0 : this.musicVolume * .018;
    }
  }

  class Camera {
    constructor() {
      this.x = 0;
      this.lookAhead = 0;
      this.verticalOffset = 0;
    }
    parallaxAt(depth) {
      const low = clamp(Math.floor(depth), 0, 2);
      const high = clamp(Math.ceil(depth), 0, 2);
      return lerp(DEPTH_STYLE[low].parallax, DEPTH_STYLE[high].parallax, depth - low);
    }
    reset(x = 0, depth = 1, width = 32) {
      const parallax = this.parallaxAt(depth);
      const maxCamera = (WORLD_W - VIEW_W) / parallax;
      this.lookAhead = 0;
      this.verticalOffset = 0;
      this.x = clamp((x + width * 0.5 - VIEW_W * 0.39) / parallax, 0, maxCamera);
    }
    update(player, dt, visualDepth = player.depth, transitioning = false, depthDirection = 0) {
      const parallax = this.parallaxAt(visualDepth);
      const maxCamera = (WORLD_W - VIEW_W) / parallax;
      const velocityIntent = clamp(player.vx / 285, -1, 1);
      const desiredLookAhead = transitioning ? depthDirection * 13 : velocityIntent * 72;
      this.lookAhead += (desiredLookAhead - this.lookAhead) * (1 - Math.exp(-3.8 * dt));
      const desiredVertical = clamp((265 - player.y) * 0.42, 0, 86) + (transitioning ? 5 : 0);
      this.verticalOffset += (desiredVertical - this.verticalOffset) * (1 - Math.exp(-3.25 * dt));
      const target = clamp((player.x + player.w * 0.5 - VIEW_W * 0.39 + this.lookAhead) / parallax, 0, maxCamera);
      const response = transitioning ? 3.1 : 5.2;
      this.x += (target - this.x) * (1 - Math.exp(-response * dt));
    }
  }

  class Platform {
    constructor(x, y, w, h, depth, kind = "floor", id = "PLATFORM") {
      Object.assign(this, { x, y, w, h, depth, kind, id });
    }
  }

  class Hazard {
    constructor(x, y, w, h, depth, type = "plasma", id = "HAZARD") { Object.assign(this, { x, y, w, h, depth, type, id }); }
  }

  class Checkpoint {
    constructor(x, y, depth, name, id) {
      Object.assign(this, { x, y, depth, name, id, w:34, h:54, active:false });
      this.arrivalZone = { x:x - 32, y:y - 22, w:98, h:76 };
      this.enemyExclusionZone = { x:x - 56, y:y - 42, w:146, h:116 };
    }
  }

  class Collectible {
    constructor(x, y, depth, kind = "shard", name = "", id = "COLLECTIBLE") {
      const size = kind === "relic" ? 32 : 20;
      Object.assign(this, {
        x, y, depth, kind, name, id,
        w: size,
        h: kind === "relic" ? 32 : 26,
        collected: false,
        phase: (x % 137) / 137 * Math.PI * 2
      });
    }
  }

  class Projectile {
    constructor(x, y, vx, vy, depth, damage = 1) {
      Object.assign(this, {
        x, y, vx, vy, depth, damage,
        w: vx === 0 ? 7 : 13,
        h: vx === 0 ? 13 : 7,
        life: 1.25,
        dead: false
      });
    }
  }

  class Enemy {
    constructor(type, x, y, depth, left, right, speed, id = "ENEMY") {
      const config = ENEMY_TYPES[type];
      Object.assign(this, {
        type, x, y, depth, left, right, id,
        speed: speed || config.speed,
        vx: speed || config.speed,
        vy: 0,
        w: config.w,
        h: config.h,
        health: config.health,
        maxHealth: config.health,
        flying: config.flying,
        dead: false,
        time: (x % 211) / 31,
        redirectTimer: 0.55,
        hitFlash: 0
      });
      this.spawnX = x;
      this.spawnY = y;
    }
    reset() {
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.vx = this.speed;
      this.vy = 0;
      this.health = this.maxHealth;
      this.dead = false;
      this.hitFlash = 0;
    }
    update(dt, exclusionZones = []) {
      if (this.dead) return;
      this.time += dt;
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      const previousX = this.x;
      this.x += this.vx * dt;
      if (this.x <= this.left) { this.x = this.left; this.vx = Math.abs(this.vx); }
      if (this.x + this.w >= this.right) { this.x = this.right - this.w; this.vx = -Math.abs(this.vx); }
      if (this.type === "sentry") this.y = this.spawnY + Math.sin(this.time * 2.4) * 13;
      if (this.type === "drifter") {
        this.redirectTimer -= dt;
        if (this.redirectTimer <= 0) {
          this.redirectTimer = 0.45 + (Math.sin(this.time * 7.1) + 1) * 0.24;
          this.vy = Math.sin(this.time * 11.7) * 95;
        }
        this.y = clamp(this.y + this.vy * dt, this.spawnY - 72, this.spawnY + 72);
      }
      const blockedZone = exclusionZones.find(zone => aabb(this, zone));
      if (blockedZone) {
        this.x = previousX;
        this.vx = this.vx >= 0 ? -Math.abs(this.speed) : Math.abs(this.speed);
        if (aabb(this, blockedZone)) {
          const leftDistance = Math.abs((blockedZone.x - this.w) - this.x);
          const rightDistance = Math.abs((blockedZone.x + blockedZone.w) - this.x);
          this.x = leftDistance <= rightDistance ? blockedZone.x - this.w - 1 : blockedZone.x + blockedZone.w + 1;
          this.x = clamp(this.x, this.left, this.right - this.w);
        }
        if (this.flying) this.vy *= -1;
      }
    }
    takeShot(damage) {
      this.hitFlash = 0.09;
      if (this.type === "skitter") return false;
      this.health -= damage;
      if (this.health <= 0) this.dead = true;
      return this.dead;
    }
  }

  class DepthTransition {
    constructor(x, y, sourceDepth, targetDepth, id = "SHIFT", returnRoute = false) {
      Object.assign(this, { x, y, sourceDepth, targetDepth, id, returnRoute, width: 64, height: 14 });
      this.w = this.width;
      this.h = this.height;
      this.sourcePosition = { x: x + 16, y: y - 30 };
      this.targetPosition = { x: x + 16, y: y - 30 };
      this.arrivalZone = {
        x: this.targetPosition.x - TRANSITION_SAFETY.side,
        y: this.targetPosition.y - TRANSITION_SAFETY.headroom,
        w: 32 + TRANSITION_SAFETY.side * 2,
        h: 44 + TRANSITION_SAFETY.headroom
      };
      this.enemyExclusionZone = {
        x: this.arrivalZone.x - TRANSITION_SAFETY.enemyPadding,
        y: this.arrivalZone.y - TRANSITION_SAFETY.enemyPadding,
        w: this.arrivalZone.w + TRANSITION_SAFETY.enemyPadding * 2,
        h: this.arrivalZone.h + TRANSITION_SAFETY.enemyPadding * 2
      };
      this.visualClearance = {
        x: x - TRANSITION_SAFETY.visualSide,
        y: y - TRANSITION_SAFETY.visualTop,
        w: this.w + TRANSITION_SAFETY.visualSide * 2,
        h: this.h + TRANSITION_SAFETY.visualTop + 12
      };
    }
    get directionName() { return PLANE_NAMES[this.targetDepth].toLowerCase(); }
  }

  class Goal {
    constructor(x, y, depth) {
      // Keep the original floor contact while making the final threshold a landmark.
      Object.assign(this, { x: x - 19, y: y - 64, depth, id: "EXIT_GOAL", w: 92, h: 164 });
    }
  }

  class Player {
    constructor() {
      this.w = 32;
      this.baseH = 44;
      this.rollH = 24;
      this.h = this.baseH;
      this.spawn = { x: 130, y: FLOOR_Y - this.h, depth: 1 };
      this.checkpoint = { ...this.spawn };
      this.resetToSpawn();
    }
    resetToSpawn() {
      this.x = this.spawn.x;
      this.y = this.spawn.y;
      this.depth = this.spawn.depth;
      this.vx = 0;
      this.vy = 0;
      this.grounded = false;
      this.facing = 1;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.rolling = false;
      this.rollTimer = 0;
      this.rocketTimer = 0;
      this.rocketUses = 0;
      this.shootCooldown = 0;
      this.castTimer = 0;
      this.castUp = false;
      this.h = this.baseH;
      this.animState = "idle";
      this.animTime = 0;
      this.landTimer = 0;
      this.runDustTimer = 0;
      this.hurtTimer = 0;
      this.arrivalGrace = 0;
    }
    respawn() {
      Object.assign(this, this.checkpoint);
      this.vx = 0;
      this.vy = 0;
      this.grounded = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.rolling = false;
      this.rollTimer = 0;
      this.rocketTimer = 0;
      this.rocketUses = 0;
      this.shootCooldown = 0;
      this.castTimer = 0;
      this.castUp = false;
      this.h = this.baseH;
      this.animState = "idle";
      this.animTime = 0;
      this.landTimer = 0;
      this.runDustTimer = 0;
      this.hurtTimer = 0;
      this.arrivalGrace = 0.4;
    }
    setCheckpoint() {
      this.checkpoint = { x: this.x, y: this.y, depth: this.depth };
    }
  }

  const LEVEL_DEFINITIONS = [
    {
      id: "foundry-intake",
      number: 1,
      name: "THE FIRST DOOR",
      subtitle: "Learn to read the distance between worlds.",
      targetMinutes: "3–4 MIN",
      width: 3600,
      spawn: { x: 130, y: 426, depth: 1 },
      goal: [3500, 370, 1],
      sections: [
        [0, 1050, "01 // WAKING SHORE"],
        [1050, 2380, "02 // DISTANT PATH"],
        [2380, 3600, "03 // THE FIRST DOOR"]
      ],
      platforms: [
        [0,470,1180,80,1,"floor"], [340,410,180,20,1], [650,350,180,20,1], [900,400,190,20,1],
        [1120,150,90,320,1,"wall"], [1040,470,1500,80,0,"floor"], [1370,410,190,20,0],
        [1660,350,190,20,0], [1960,290,220,20,0], [2240,390,180,20,0],
        [2350,470,730,80,1,"floor"], [2660,405,250,32,1,"ceiling"], [3020,170,90,300,1,"wall"],
        [2350,470,1150,80,2,"floor"], [3240,470,360,80,1,"floor"], [3230,470,260,80,2,"floor"]
      ],
      transitions: [[1070,1,0,470], [2390,0,1,470], [2500,1,2,470], [3290,2,1,470]],
      shards: [
        [250,430,1],[430,370,1],[710,310,1],[960,360,1],[1080,430,1],
        [1160,430,0],[1410,370,0],[1700,310,0],[2010,250,0],[2280,350,0],[2400,430,0],
        [2460,430,1],[2690,365,1],[2870,430,1],[2960,430,2],[3160,430,2],[3330,430,2],[3450,430,1]
      ],
      relics: [[735,300,1,"DOOR SEED"], [2045,238,0,"ECHO LENS"], [3150,416,2,"ROOTBOUND HEART"]],
      enemies: [
        ["skitter",930,null,1,880,1070,92], ["brute",2490,null,1,2430,2730,30],
        ["sentry",1780,220,0,1600,2100,65], ["drifter",3110,330,2,2940,3260,50]
      ],
      decorations: [
        ["tower",150,210,80,260,0,0], ["pipe",390,325,260,110,1,0], ["cable",820,50,300,250,0,0],
        ["piston",1250,215,230,255,1,0], ["machinery",1590,255,240,215,1,1], ["panel",1930,185,300,275,1,2],
        ["hanging",2580,45,58,300,2,2,true], ["gear",2860,220,270,240,0,1], ["crystal",3370,285,120,185,1,3]
      ]
    },
    {
      id: "turbine-works",
      number: 2,
      name: "MIST ARCHIVE",
      subtitle: "Climb through the memories held in the fog.",
      targetMinutes: "4–6 MIN",
      width: 4300,
      spawn: { x: 120, y: 426, depth: 1 },
      goal: [4200, 370, 1],
      sections: [
        [0, 900, "01 // ARCHIVE EDGE"], [900, 2100, "02 // SUNKEN CROWN"],
        [2100, 3350, "03 // PALE GARDEN"], [3350, 4300, "04 // MEMORY GATE"]
      ],
      platforms: [
        [0,470,920,80,1,"floor"], [690,470,430,80,2,"floor"], [850,410,220,24,2], [1030,350,220,24,2],
        [1210,290,220,24,2], [1390,230,460,24,2], [1550,230,430,24,1], [1900,300,210,22,1],
        [2070,370,220,22,1], [2240,470,620,80,1,"floor"], [2810,150,90,320,1,"wall"],
        [2520,470,1180,80,0,"floor"], [2790,410,190,20,0], [3030,350,190,20,0], [3270,290,210,20,0],
        [3500,470,520,80,1,"floor"], [3580,470,300,80,0,"floor"], [3980,470,320,80,1,"floor"]
      ],
      transitions: [[750,1,2,470],[1668,2,1,230],[2580,1,0,470],[3560,0,1,470]],
      shards: [
        [220,430,1],[420,430,1],[700,430,1],[780,430,2],[910,370,2],[1090,310,2],[1270,250,2],[1470,190,2],
        [1670,190,1],[1950,260,1],[2130,330,1],[2320,430,1],[2580,430,1],[2670,430,0],
        [2840,370,0],[3080,310,0],[3320,250,0],[3510,430,0],[3640,430,1],[3880,430,1],[4110,430,1]
      ],
      relics: [[490,416,1,"ARCHIVE SIGIL"], [1490,178,2,"PALE CROWN"], [3330,238,0,"MIST EYE"]],
      enemies: [
        ["skitter",560,null,1,500,690,96], ["sentry",1060,190,2,890,1390,70],
        ["brute",2280,null,1,2240,2540,28], ["drifter",3060,215,0,2820,3410,54],
        ["sentry",3740,335,1,3620,3980,76]
      ],
      decorations: [
        ["gear",720,180,330,290,0,0], ["turbine",900,105,650,365,1,0], ["rotor",800,70,820,430,2,0,true],
        ["beam",710,80,110,390,2,0,true], ["gear",1760,245,230,210,0,1], ["pipe",2170,275,420,160,2,2,true],
        ["tower",2730,90,120,380,0,2], ["panel",3100,145,300,300,1,3], ["crystal",3850,265,130,205,1,4]
      ]
    },
    {
      id: "phase-core",
      number: 3,
      name: "FALSE CROSSING",
      subtitle: "Break the illusion across every layer.",
      targetMinutes: "5–7 MIN",
      width: 5000,
      spawn: { x: 120, y: 426, depth: 1 },
      goal: [4890, 370, 1],
      sections: [
        [0, 1300, "01 // CROOKED ASCENT"], [1300, 2850, "02 // ECHO PASSAGE"],
        [2850, 4050, "03 // MIRROR LOCK"], [4050, 5000, "04 // THREE VEILS"]
      ],
      platforms: [
        [0,470,760,80,1,"floor"], [550,400,210,20,1], [730,330,210,20,1], [910,260,380,20,1],
        [1220,0,90,330,1,"wall"], [900,260,850,20,2], [1510,260,920,20,0],
        [2210,330,210,20,0], [2390,400,210,20,0], [2560,470,700,80,0,"floor"],
        [2720,470,690,80,1,"floor"], [3340,150,90,320,1,"wall"], [3060,470,730,80,0,"floor"],
        [3620,470,560,80,1,"floor"], [3930,470,620,80,2,"floor"], [4320,470,680,80,1,"floor"],
        [4480,400,190,20,1], [4640,330,190,20,1]
      ],
      transitions: [[1068,1,2,260],[1598,2,0,260],[2780,0,1,470],[3130,1,0,470],[3660,0,1,470],[4010,1,2,470],[4400,2,1,470]],
      shards: [
        [210,430,1],[420,430,1],[600,360,1],[780,290,1],[960,220,1],[1050,220,2],[1280,220,2],[1550,220,2],
        [1660,220,0],[1900,220,0],[2250,290,0],[2440,360,0],[2660,430,0],[2820,430,1],[3070,430,1],
        [3190,430,0],[3460,430,0],[3690,430,0],[3780,430,1],[4020,430,1],[4110,430,2],[4320,430,2],
        [4450,430,1],[4540,360,1],[4700,290,1],[4870,430,1]
      ],
      relics: [[1010,208,1,"MIRROR NEEDLE"], [2050,208,0,"NULL SEED"], [4200,416,2,"CROSSING HEART"]],
      enemies: [
        ["sentry",620,255,1,500,900,72], ["drifter",1370,120,2,1120,1650,52],
        ["brute",2820,null,1,2760,3070,25], ["sentry",3350,330,0,3160,3650,75],
        ["skitter",3820,null,1,3740,3940,98], ["drifter",4160,300,2,4010,4380,58],
        ["brute",4580,null,1,4490,4820,30]
      ],
      decorations: [
        ["tower",180,90,120,380,0,0], ["cable",520,20,300,300,0,0], ["hanging",1170,20,70,300,2,4,true],
        ["panel",1480,80,320,340,1,2], ["crystal",1940,80,130,180,0,2], ["gear",2860,205,300,260,0,4],
        ["reactor",3340,100,560,370,1,0], ["rotor",3370,80,520,410,2,5,true], ["beam",3900,40,120,430,2,5,true],
        ["crystal",4700,250,140,220,1,6]
      ]
    },
    {
      id: "deep-assembly",
      number: 4,
      name: "THE LONG FALL",
      subtitle: "Sustain the route through the buried world.",
      targetMinutes: "8–10 MIN",
      width: 8800,
      spawn: { x: 120, y: 426, depth: 1 },
      goal: [8690,370,1],
      sections: [
        [0,1500,"01 // FALLEN COURT"], [1500,2750,"02 // VERTICAL GRAVE"],
        [2750,5000,"03 // BURIED CROSSING"], [5000,7150,"04 // MEMORY TUNNELS"],
        [7150,8800,"05 // HOLLOW CHAMBER"]
      ],
      platforms: [
        [0,470,1150,80,1,"floor"], [310,410,190,20,1], [600,350,190,20,1],
        [800,470,700,80,0,"floor"], [1320,410,240,20,0], [1500,350,240,20,0], [1650,320,650,20,0],
        [1800,320,700,20,1], [2350,370,220,20,1], [2520,420,220,20,1], [2680,470,750,80,1,"floor"],
        [2750,470,900,80,2,"floor"], [3400,410,230,22,2], [3600,340,240,22,2], [3820,280,700,22,2],
        [3950,280,750,20,0], [4550,340,230,20,0], [4770,410,230,20,0], [4980,470,920,80,0,"floor"],
        [5350,470,1600,80,1,"floor"], [6830,170,90,300,1,"wall"],
        [6250,470,1300,80,2,"floor"], [7150,470,1350,80,0,"floor"], [8000,470,800,80,1,"floor"]
      ],
      transitions: [[900,1,0,470],[2018,0,1,320],[2850,1,2,470],[4203,2,0,280],[5450,0,1,470],[6550,1,2,470],[7300,2,0,470],[8100,0,1,470]],
      shards: [
        [220,430,1],[430,370,1],[660,310,1],[860,430,1],[980,430,0],[1190,430,0],[1380,370,0],[1560,310,0],[1730,280,0],[1940,280,0],
        [1980,280,1],[2200,280,1],[2400,330,1],[2580,380,1],[2790,430,1],[2920,430,2],[3180,430,2],[3450,370,2],[3650,300,2],[3890,240,2],[4130,240,2],
        [4300,240,0],[4600,300,0],[4820,370,0],[5100,430,0],[5360,430,0],[5530,430,1],[5780,430,1],[6060,430,1],[6360,430,1],[6640,430,1],
        [6760,430,2],[6880,430,2],[7240,430,2],[7420,430,0],[7650,430,0],[7890,430,0],[8180,430,0],[8320,430,1],[8520,430,1],[8700,430,1]
      ],
      relics: [[1520,294,0,"GRAVE KEY"],[4380,228,2,"BURIED CROWN"],[7700,416,0,"ASSEMBLY MEMORY"]],
      enemies: [
        ["brute",620,null,1,500,850,27],["sentry",1450,240,0,1250,1650,72],["skitter",3000,null,1,2900,3300,102],
        ["drifter",3500,250,2,3300,3800,56],["brute",4800,null,0,4680,4980,25],["sentry",6100,330,1,5850,6350,80],
        ["skitter",7000,null,2,6880,7140,105],["drifter",7700,330,0,7480,7920,58],["brute",8440,null,1,8320,8600,30]
      ],
      hazards: [[5920,452,130,18,1,"press"],[7020,452,100,18,2,"sparks"]],
      checkpoints: [[2380,266,1,"PRESS SHAFT CLEAR"],[5600,416,1,"MAINTENANCE LOCK"],[8200,416,1,"ASSEMBLY CHAMBER"]],
      decorations: [
        ["tower",120,170,90,300,0,0],["machinery",520,230,260,240,1,0],["piston",1220,120,180,350,1,1],
        ["beam",1500,40,100,430,2,0,true],["hanging",2050,20,70,250,2,1,true],["gear",2860,175,360,295,0,2],
        ["turbine",3400,110,620,360,1,2],["pipe",4450,235,500,180,2,2,true],["panel",5250,120,360,330,1,3],
        ["cable",5850,20,330,330,0,2],["machinery",6350,170,420,300,1,4],["tower",7250,80,140,390,0,5],
        ["reactor",7700,100,520,370,1,4],["rotor",7720,75,540,410,2,3,true],["crystal",8500,245,140,225,1,6]
      ]
    },
    {
      id: "zero-depth",
      number: 5,
      name: "LOST REALITY",
      subtitle: "Descend beyond certainty and recover what remains.",
      targetMinutes: "10–12 MIN",
      width: 11000,
      spawn: { x: 120, y: 426, depth: 1 },
      goal: [10890,370,1],
      sections: [
        [0,2200,"01 // DESCENT"], [2200,4500,"02 // PALE SUPPORTS"],
        [4500,7000,"03 // COLLAPSED MEMORY"], [7000,9300,"04 // THREE-LAYER ASCENT"],
        [9300,11000,"05 // FINAL THRESHOLD"]
      ],
      platforms: [
        [0,470,1150,80,1,"floor"], [300,400,210,20,1], [560,330,210,20,1],
        [800,470,700,80,0,"floor"], [1320,410,220,20,0], [1500,350,220,20,0], [1780,350,600,20,0],
        [1880,350,700,20,1], [2450,300,230,20,1], [2630,260,760,20,1],
        [2850,260,900,20,2], [3600,260,950,20,2], [4050,260,720,20,0],
        [4600,330,230,20,0], [4800,400,230,20,0], [4950,470,750,80,0,"floor"],
        [5100,470,1450,80,1,"floor"], [6000,470,1100,80,2,"floor"], [6600,400,250,20,2], [6700,330,650,20,2],
        [6650,330,750,20,1], [7200,400,240,20,1], [7300,470,600,80,1,"floor"], [7250,470,850,80,0,"floor"],
        [7800,400,240,20,0], [7950,330,240,20,0], [8050,260,1050,20,0], [8050,260,1300,20,1],
        [8900,260,850,20,2], [9450,330,240,20,2], [9620,400,240,20,2], [9700,470,500,80,2,"floor"],
        [9650,470,1050,80,0,"floor"], [10350,470,650,80,1,"floor"]
      ],
      transitions: [[900,1,0,470],[2098,0,1,350],[3088,1,2,260],[4268,2,0,260],[5200,0,1,470],[6100,1,2,470],[6993,2,1,330],[7400,1,0,470],[8543,0,1,260],[9093,1,2,260],[9800,2,0,470],[10500,0,1,470]],
      shards: [
        [220,430,1],[460,360,1],[620,290,1],[840,430,1],[1010,430,0],[1240,430,0],[1390,370,0],[1570,310,0],[1840,310,0],[2040,310,0],
        [2110,310,1],[2480,260,1],[2700,220,1],[2930,220,1],[3100,220,2],[3360,220,2],[3650,220,2],[3950,220,2],[4280,220,2],
        [4380,220,0],[4650,290,0],[4850,360,0],[5100,430,0],[5290,430,1],[5530,430,1],[5830,430,1],[6160,430,1],[6260,430,2],
        [6510,430,2],[6680,360,2],[6870,290,2],[7010,290,1],[7240,360,1],[7440,430,1],[7550,430,0],[7850,360,0],[8020,290,0],[8240,220,0],
        [8400,220,1],[8660,220,1],[8950,220,1],[9100,220,2],[9340,220,2],[9500,290,2],[9680,360,2],[9900,430,2],[10030,430,0],[10280,430,0],
        [10530,430,0],[10620,430,1],[10820,430,1]
      ],
      relics: [[4410,208,0,"GHOST LENS"],[6980,278,2,"OUTER HEART"],[8700,208,1,"ZERO SEAL"]],
      enemies: [
        ["skitter",580,null,1,500,820,105],["sentry",1450,235,0,1250,1700,78],["brute",2250,304,1,2120,2420,28],
        ["drifter",3450,120,2,3250,3850,60],["sentry",4550,175,0,4350,4750,82],["brute",5450,null,1,5300,5650,31],
        ["skitter",6420,null,2,6300,6580,108],["drifter",7050,220,1,6900,7200,62],["brute",7700,null,0,7550,7900,30],
        ["sentry",8500,130,1,8320,8800,86],["drifter",9300,140,2,9150,9450,65],["skitter",10050,null,0,9920,10280,112],
        ["brute",10720,null,1,10620,10850,32]
      ],
      hazards: [[5660,452,140,18,1,"plasma"],[6350,452,120,18,2,"sparks"],[7620,452,120,18,0,"void"],[10080,452,130,18,0,"plasma"]],
      checkpoints: [[2300,296,1,"CORE SUPPORTS"],[5350,416,1,"COLLAPSED REACTOR"],[7850,416,0,"ASCENT LOCK"],[8500,206,1,"FINAL CHAMBER"]],
      decorations: [
        ["tower",100,130,110,340,0,0],["cable",450,10,340,340,0,0],["piston",1200,100,200,370,1,1],
        ["beam",1700,30,120,440,2,1,true],["gear",2350,110,430,360,0,2],["reactor",2800,70,900,400,1,0],
        ["rotor",2850,45,880,440,2,2,true],["pipe",3900,190,760,220,2,3,true],["panel",4700,100,420,350,1,4],
        ["crystal",5600,250,160,220,0,4],["machinery",6100,120,600,350,1,5],["hanging",6900,15,90,300,2,6,true],
        ["tower",7350,50,150,420,0,6],["gear",8050,80,620,390,0,7],["reactor",8200,70,760,400,1,7],
        ["rotor",8250,40,700,450,2,7,true],["beam",9150,20,130,450,2,8,true],["crystal",10100,230,170,240,0,8],
        ["reactor",10400,120,500,350,1,9]
      ]
    }
  ];

  class Level {
    constructor(index = 0) {
      this.definition = LEVEL_DEFINITIONS[index];
      this.index = index;
      this.worldWidth = this.definition.width;
      this.platforms = [];
      this.transitions = [];
      this.collectibles = [];
      this.enemies = [];
      this.hazards = [];
      this.checkpoints = [];
      this.decorations = [];
      this.platformSerial = [0, 0, 0];
      this.transitionSerial = 0;
      this.shardSerial = 0;
      this.relicSerial = 0;
      this.enemySerial = 0;
      this.hazardSerial = 0;
      this.checkpointSerial = 0;
      this.sections = this.definition.sections.map(([start, end, name]) => ({ start, end, name }));
      this.goal = new Goal(...this.definition.goal);
      this.build();
    }

    platform(x, y, w, h, depth, kind) {
      this.platformSerial[depth] += 1;
      const prefix = ["BG", "MID", "FG"][depth];
      const id = `${prefix}_PLATFORM_${String(this.platformSerial[depth]).padStart(2, "0")}`;
      this.platforms.push(new Platform(x, y, w, h, depth, kind, id));
    }
    transition(x, sourceDepth, targetDepth, platformY = FLOOR_Y) {
      this.transitionSerial += 1;
      const id = `SHIFT_${String(this.transitionSerial).padStart(2, "0")}`;
      const outward = new DepthTransition(x, platformY - 14, sourceDepth, targetDepth, id, false);
      const returning = new DepthTransition(x, platformY - 14, targetDepth, sourceDepth, `${id}_RETURN`, true);
      outward.pairedId = id;
      returning.pairedId = id;
      this.transitions.push(outward, returning);
    }
    crystal(x, y, depth) {
      this.shardSerial += 1;
      const id = `SHARD_${String(this.shardSerial).padStart(3, "0")}`;
      this.collectibles.push(new Collectible(x, y, depth, "shard", "", id));
    }
    relic(x, y, depth, name) {
      this.relicSerial += 1;
      const id = `RELIC_${String(this.relicSerial).padStart(2, "0")}`;
      this.collectibles.push(new Collectible(x, y, depth, "relic", name, id));
    }
    decoration(type, x, y, w, h, depth, variant = 0, front = false) {
      this.decorations.push({ type, x, y, w, h, depth, variant, front });
    }
    enemy(type, x, y, depth, left, right, speed) {
      const top = y == null ? FLOOR_Y - ENEMY_TYPES[type].h : y;
      this.enemySerial += 1;
      const id = `ENEMY_${String(this.enemySerial).padStart(2, "0")}`;
      this.enemies.push(new Enemy(type, x, top, depth, left, right, speed, id));
    }
    hazard(x, y, w, h, depth, type = "plasma") {
      this.hazardSerial += 1;
      this.hazards.push(new Hazard(x, y, w, h, depth, type, `HAZARD_${String(this.hazardSerial).padStart(2,"0")}`));
    }
    checkpoint(x, y, depth, name = "CHECKPOINT") {
      this.checkpointSerial += 1;
      this.checkpoints.push(new Checkpoint(x, y, depth, name, `CHECKPOINT_${String(this.checkpointSerial).padStart(2,"0")}`));
    }

    build() {
      const data = this.definition;
      data.platforms.forEach(item => this.platform(...item));
      data.transitions.forEach(item => this.transition(...item));
      data.shards.forEach(item => this.crystal(...item));
      data.relics.forEach(item => this.relic(...item));
      data.enemies.forEach(item => this.enemy(...item));
      (data.hazards || []).forEach(item => this.hazard(...item));
      (data.checkpoints || []).forEach(item => this.checkpoint(...item));
      data.decorations.forEach(item => this.decoration(...item));
      this.reserveTransitionClearance();
      this.enforceEnemyExclusions();
    }

    platformsAt(depth) { return this.platforms.filter(platform => platform.depth === depth); }
    hazardsAt(depth) { return this.hazards.filter(hazard => hazard.depth === depth); }
    exclusionZonesAt(depth) {
      return [
        ...this.transitions.filter(device => device.targetDepth === depth).map(device => device.enemyExclusionZone),
        ...this.checkpoints.filter(checkpoint => checkpoint.depth === depth).map(checkpoint => checkpoint.enemyExclusionZone)
      ];
    }
    reserveTransitionClearance() {
      this.decorations = this.decorations.filter(decoration => !this.transitions.some(device => {
        const sourceBlocked = decoration.depth === device.sourceDepth && aabb(decoration, device.visualClearance);
        const targetClearance = { x: device.visualClearance.x, y: device.targetPosition.y - 58, w: device.visualClearance.w, h: 116 };
        const destinationBlocked = decoration.depth === device.targetDepth && aabb(decoration, targetClearance);
        return sourceBlocked || destinationBlocked;
      }));
    }
    enforceEnemyExclusions() {
      for (const enemy of this.enemies) {
        for (const zone of this.exclusionZonesAt(enemy.depth)) {
          if (!aabb(enemy, zone)) continue;
          const leftX = zone.x - enemy.w - 2;
          const rightX = zone.x + zone.w + 2;
          enemy.x = Math.abs(enemy.x - leftX) <= Math.abs(enemy.x - rightX) ? leftX : rightX;
          enemy.x = clamp(enemy.x, enemy.left, enemy.right - enemy.w);
          enemy.spawnX = enemy.x;
        }
      }
    }
    sectionAt(x) { return this.sections.find(section => x >= section.start && x < section.end) || this.sections.at(-1); }
    reset() {
      this.collectibles.forEach(item => item.collected = false);
      this.enemies.forEach(enemy => enemy.reset());
      this.checkpoints.forEach(checkpoint => checkpoint.active = false);
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = true;
      this.backdrops = DEPTH_ART_SOURCES.map(source => {
        const image = new Image();
        image.src = source;
        return image;
      });
      this.environmentArt = Object.fromEntries(Object.entries(ENVIRONMENT_ATLAS_SOURCES).map(([name, source]) => {
        const image = new Image();
        image.src = source;
        return [name, image];
      }));
      this.characterArt = Object.fromEntries(Object.entries(CHARACTER_ART_SOURCES).map(([name, source]) => {
        const image = new Image();
        image.src = source;
        return [name, image];
      }));
      this.entityArt = Object.fromEntries(Object.entries(ENTITY_ART_SOURCES).map(([name, source]) => {
        const image = new Image();
        image.src = source;
        return [name, image];
      }));
      this.input = new Input(canvas);
      this.audio = new AudioManager();
      this.camera = new Camera();
      this.currentLevelIndex = 0;
      this.level = new Level(this.currentLevelIndex);
      WORLD_W = this.level.worldWidth;
      this.player = new Player();
      this.player.spawn = { ...this.level.definition.spawn };
      this.player.checkpoint = { ...this.player.spawn };
      this.player.resetToSpawn();
      this.projectiles = [];
      this.particles = [];
      this.state = STATE.TITLE;
      this.returnState = STATE.TITLE;
      this.progress = this.loadProgress();
      this.options = this.loadOptions();
      this.orientationBlocked = false;
      this.debug = false;
      this.collisionDebug = false;
      this.labelDebug = false;
      this.nearTransition = null;
      this.transitionCandidate = null;
      this.transitionValidation = null;
      this.transitionData = null;
      this.returnSnapshots = new Map();
      this.groundSupport = null;
      this.lastTransitionId = "NONE";
      this.deathDiagnostic = null;
      this.deadTimer = 0;
      this.elapsed = 0;
      this.introTimer = 7;
      this.collected = 0;
      this.relicsFound = 0;
      this.shardReward = false;
      this.relicReward = false;
      this.rewardTimer = 0;
      this.rewardMessage = "";
      this.enemyKills = 0;
      this.deaths = 0;
      this.flash = 0;
      this.environmentAudioTimer = 2.4;
      this.environmentAudioIndex = 0;
      this.alertedEnemyIds = new Set();
      this.lastTime = performance.now();
      this.audio.setVolumes(this.options.music, this.options.sfx);
      this.camera.reset(this.player.x, this.player.depth, this.player.w);
      this.bindUi();
      this.updateResponsiveState();
      this.syncUi();
      window.addEventListener("pointerdown", () => { this.audio.unlock(); this.audio.playMusic(this.state === STATE.TITLE ? "title" : `level${this.currentLevelIndex + 1}`); }, { once: true });
      window.addEventListener("keydown", () => { this.audio.unlock(); this.audio.playMusic(this.state === STATE.TITLE ? "title" : `level${this.currentLevelIndex + 1}`); }, { once: true });
      window.addEventListener("resize", () => this.updateResponsiveState());
      window.addEventListener("orientationchange", () => this.updateResponsiveState());
      requestAnimationFrame(time => this.loop(time));
    }

    safeRead(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
    }

    safeWrite(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* Storage may be disabled in an iframe. */ }
    }

    loadProgress() {
      const saved = this.safeRead("phaseShiftFoundry.progress.v1", {});
      return {
        unlocked: clamp(Number(saved.unlocked) || 1, 1, DEMO_LEVEL_COUNT),
        levels: Array.from({ length: LEVEL_DEFINITIONS.length }, (_, index) => saved.levels?.[index] || null)
      };
    }

    loadOptions() {
      const saved = this.safeRead("phaseShiftFoundry.options.v1", {});
      return {
        music: clamp(Number.isFinite(saved.music) ? saved.music : 0.45, 0, 1),
        sfx: clamp(Number.isFinite(saved.sfx) ? saved.sfx : 0.7, 0, 1),
        touch: ["auto", "on", "off"].includes(saved.touch) ? saved.touch : "auto"
      };
    }

    bindUi() {
      const commandButtons = document.querySelectorAll?.("[data-command]") || [];
      this.canvas.dataset.uiButtons = String(commandButtons.length);
      commandButtons.forEach(button => {
        button.addEventListener("click", () => this.handleCommand(button.dataset.command));
        button.addEventListener("pointerenter", event => {
          if (event.pointerType !== "touch") this.audio.play("uiMove");
        });
      });
      if (TOUCH_CONTROLS_ENABLED) {
        document.querySelectorAll?.("[data-touch-action]").forEach(button => {
          const end = event => {
            event.preventDefault();
            this.input.setPointerAction(event.pointerId, button.dataset.touchAction, false);
            button.classList.remove("active");
          };
          button.addEventListener("pointerdown", event => {
            event.preventDefault();
            button.setPointerCapture?.(event.pointerId);
            this.input.setPointerAction(event.pointerId, button.dataset.touchAction, true);
            button.classList.add("active");
          });
          button.addEventListener("pointerup", end);
          button.addEventListener("pointercancel", end);
          button.addEventListener("lostpointercapture", end);
          button.addEventListener("contextmenu", event => event.preventDefault());
        });
      }
      const music = document.getElementById("music-volume");
      const sfx = document.getElementById("sfx-volume");
      if (music) {
        music.value = String(Math.round(this.options.music * 100));
        music.addEventListener("input", () => this.setVolume("music", Number(music.value) / 100));
      }
      if (sfx) {
        sfx.value = String(Math.round(this.options.sfx * 100));
        sfx.addEventListener("input", () => this.setVolume("sfx", Number(sfx.value) / 100));
      }
    }

    setVolume(channel, value) {
      this.options[channel] = clamp(value, 0, 1);
      this.audio.setVolumes(this.options.music, this.options.sfx);
      this.safeWrite("phaseShiftFoundry.options.v1", this.options);
    }

    handleCommand(command) {
      this.canvas.dataset.lastCommand = command || "";
      if (command === "back") this.audio.play("uiBack");
      else if (command !== "pause" && command !== "resume") this.audio.play("uiSelect");
      if (command === "enable-audio") {
        this.audio.unlock();
        this.audio.playMusic("title");
        const button = document.getElementById("enable-audio");
        if (button) { button.textContent = "Menu audio enabled"; button.disabled = true; }
        return;
      }
      if (command === "start") return this.startLevel(0);
      if (command === "level-select") return this.setState(STATE.LEVEL_SELECT);
      if (command === "title") return this.setState(STATE.TITLE);
      if (command === "credits") return this.setState(STATE.CREDITS);
      if (command === "pause") return this.pauseGame();
      if (command === "resume") return this.resumeGame();
      if (command === "restart") return this.restart();
      if (command === "next") return this.currentLevelIndex < DEMO_LEVEL_COUNT - 1 ? this.startLevel(this.currentLevelIndex + 1) : this.setState(STATE.GAME_COMPLETE);
      if (command === "options") {
        this.returnState = this.state === STATE.PAUSED ? STATE.PAUSED : STATE.TITLE;
        return this.setState(STATE.OPTIONS);
      }
      if (command === "back") return this.setState(this.returnState || STATE.TITLE);
      if (command === "touch-mode") {
        if (!TOUCH_CONTROLS_ENABLED) return;
        const modes = ["auto", "on", "off"];
        this.options.touch = modes[(modes.indexOf(this.options.touch) + 1) % modes.length];
        this.safeWrite("phaseShiftFoundry.options.v1", this.options);
        this.updateResponsiveState();
        this.syncUi();
      }
    }

    setState(next) {
      this.state = next;
      this.input.clear();
      if (next === STATE.TITLE) this.audio.playMusic("title");
      if (next === STATE.TITLE) this.audio.stopAmbience();
      if (next === STATE.GAME_COMPLETE) { this.audio.stopAmbience(); this.audio.playMusic("gameComplete"); }
      this.syncUi();
    }

    startLevel(index) {
      if (index < 0 || index >= DEMO_LEVEL_COUNT || index >= this.progress.unlocked) return false;
      this.currentLevelIndex = index;
      this.level = new Level(index);
      WORLD_W = this.level.worldWidth;
      this.player.spawn = { ...this.level.definition.spawn };
      this.player.checkpoint = { ...this.player.spawn };
      this.restart();
      this.audio.play("levelStart");
      this.audio.playMusic(`level${index + 1}`);
      // The supplied one-second ambience family contains 19 sharp clicks per
      // second. Keep those files preserved, but do not loop them during play.
      this.audio.stopAmbience();
      return true;
    }

    restart() {
      this.level.reset();
      this.player.resetToSpawn();
      this.player.checkpoint = { ...this.player.spawn };
      this.camera.reset(this.player.x, this.player.depth, this.player.w);
      this.state = STATE.PLAYING;
      this.transitionData = null;
      this.nearTransition = null;
      this.transitionCandidate = null;
      this.transitionValidation = null;
      this.returnSnapshots.clear();
      this.groundSupport = null;
      this.lastTransitionId = "NONE";
      this.deathDiagnostic = null;
      this.deadTimer = 0;
      this.elapsed = 0;
      this.introTimer = 4.5;
      this.collected = 0;
      this.relicsFound = 0;
      this.shardReward = false;
      this.relicReward = false;
      this.rewardTimer = 0;
      this.rewardMessage = "";
      this.enemyKills = 0;
      this.deaths = 0;
      this.environmentAudioTimer = 2.4;
      this.environmentAudioIndex = 0;
      this.alertedEnemyIds.clear();
      this.projectiles = [];
      this.particles = [];
      this.flash = 0;
      this.input.clear();
      this.syncUi();
    }

    pauseGame() {
      if (![STATE.PLAYING, STATE.TRANSITION, STATE.PLAYER_DEAD].includes(this.state)) return;
      this.audio.play("uiPause");
      this.returnState = this.state === STATE.TRANSITION ? STATE.PLAYING : this.state;
      this.setState(STATE.PAUSED);
    }

    resumeGame() {
      if (this.state !== STATE.PAUSED) return;
      this.audio.play("uiPause");
      this.setState(this.returnState === STATE.PLAYER_DEAD ? STATE.PLAYER_DEAD : STATE.PLAYING);
      this.lastTime = performance.now();
      this.canvas.focus({ preventScroll: true });
    }

    formatTime(seconds) {
      const whole = Math.max(0, Math.floor(seconds));
      return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
    }

    completeLevel() {
      if (this.state === STATE.LEVEL_COMPLETE || this.state === STATE.GAME_COMPLETE) return;
      const result = { time: this.elapsed, shards: this.collected, totalShards: this.totalShards(), relics: this.relicsFound, deaths: this.deaths };
      const previous = this.progress.levels[this.currentLevelIndex];
      this.progress.levels[this.currentLevelIndex] = {
        time: previous?.time ? Math.min(previous.time, result.time) : result.time,
        shards: Math.max(previous?.shards || 0, result.shards),
        totalShards: result.totalShards,
        relics: Math.max(previous?.relics || 0, result.relics),
        deaths: previous?.deaths == null ? result.deaths : Math.min(previous.deaths, result.deaths),
        complete: true
      };
      this.progress.unlocked = Math.min(DEMO_LEVEL_COUNT, Math.max(this.progress.unlocked, this.currentLevelIndex + 2));
      this.safeWrite("phaseShiftFoundry.progress.v1", this.progress);
      this.currentResult = result;
      this.player.vx = 0;
      this.player.vy = 0;
      this.audio.play("levelComplete");
      this.setState(STATE.LEVEL_COMPLETE);
    }

    renderLevelSelect() {
      const grid = document.getElementById("level-grid");
      if (!grid) return;
      grid.innerHTML = LEVEL_DEFINITIONS.map((level, index) => {
        const demoLocked = index >= DEMO_LEVEL_COUNT;
        const locked = demoLocked || index >= this.progress.unlocked;
        const best = this.progress.levels[index];
        const stats = demoLocked ? '<span class="level-lock">Not available in demo</span>' : locked ? '<span class="level-lock">Locked</span>' : best?.complete
          ? `${best.shards}/${best.totalShards} memories · ${best.relics}/3 anchors<br>${this.formatTime(best.time)} best time`
          : `${level.targetMinutes} · Unplayed`;
        return `<button class="level-card" type="button" data-level="${index}" ${locked ? "disabled" : ""}><span class="level-number">LEVEL 0${level.number}</span><strong class="level-name">${level.name}</strong><span class="level-stats">${stats}</span></button>`;
      }).join("");
      grid.querySelectorAll("[data-level]").forEach(button => button.addEventListener("click", () => this.startLevel(Number(button.dataset.level))));
    }

    resultsMarkup(result) {
      if (!result) return "";
      return `<div class="result-cell"><strong>${result.shards}/${result.totalShards}</strong><span>Memories</span></div><div class="result-cell"><strong>${result.relics}/3</strong><span>Anchors</span></div><div class="result-cell"><strong>${result.deaths}</strong><span>Deaths</span></div><div class="result-cell"><strong>${this.formatTime(result.time)}</strong><span>Time</span></div>`;
    }

    syncUi() {
      const screenState = {
        [STATE.TITLE]: "title", [STATE.LEVEL_SELECT]: "levelSelect", [STATE.OPTIONS]: "options", [STATE.CREDITS]: "credits",
        [STATE.PAUSED]: "paused", [STATE.LEVEL_COMPLETE]: "levelComplete", [STATE.GAME_COMPLETE]: "gameComplete"
      }[this.state] || "";
      document.querySelectorAll?.("[data-screen]").forEach(screen => { screen.hidden = screen.dataset.screen !== screenState; });
      const active = [STATE.PLAYING, STATE.TRANSITION, STATE.PLAYER_DEAD].includes(this.state);
      document.body?.classList.toggle("game-active", active);
      if (this.state === STATE.LEVEL_SELECT) this.renderLevelSelect();
      const touchButton = document.getElementById("touch-mode");
      if (touchButton) {
        touchButton.textContent = TOUCH_CONTROLS_ENABLED ? this.options.touch.toUpperCase() : "INACTIVE";
        touchButton.disabled = !TOUCH_CONTROLS_ENABLED;
      }
      const resultBox = document.getElementById("level-results");
      if (resultBox) resultBox.innerHTML = this.resultsMarkup(this.currentResult);
      const completeKicker = document.getElementById("complete-kicker");
      if (completeKicker) completeKicker.textContent = `Level ${this.currentLevelIndex + 1} secured · ${this.level.definition.name}`;
      const nextButton = document.querySelector?.('[data-screen="levelComplete"] [data-command="next"]');
      if (nextButton) nextButton.textContent = this.currentLevelIndex === DEMO_LEVEL_COUNT - 1 ? "Finish demo" : "Next level";
      const gameResults = document.getElementById("game-results");
      if (gameResults) {
        const completed = this.progress.levels.slice(0, DEMO_LEVEL_COUNT).filter(Boolean);
        const aggregate = { shards: completed.reduce((sum, item) => sum + item.shards, 0), totalShards: completed.reduce((sum, item) => sum + item.totalShards, 0), relics: completed.reduce((sum, item) => sum + item.relics, 0), deaths: completed.reduce((sum, item) => sum + item.deaths, 0), time: completed.reduce((sum, item) => sum + item.time, 0) };
        gameResults.innerHTML = `<div class="result-cell"><strong>${aggregate.shards}/${aggregate.totalShards}</strong><span>Total memories</span></div><div class="result-cell"><strong>${aggregate.relics}/${DEMO_LEVEL_COUNT * 3}</strong><span>Total anchors</span></div><div class="result-cell"><strong>${aggregate.deaths}</strong><span>Best deaths</span></div><div class="result-cell"><strong>${this.formatTime(aggregate.time)}</strong><span>Best time</span></div>`;
      }
    }

    updateResponsiveState() {
      const coarse = window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
      const visible = TOUCH_CONTROLS_ENABLED && (this.options.touch === "on" || (this.options.touch === "auto" && coarse));
      document.body?.classList.toggle("touch-visible", visible);
      const controls = document.getElementById("touch-controls");
      if (controls) controls.hidden = !TOUCH_CONTROLS_ENABLED;
      this.orientationBlocked = Boolean(visible && window.innerHeight > window.innerWidth);
      const rotate = document.getElementById("rotate-overlay");
      if (rotate) rotate.hidden = !this.orientationBlocked;
    }

    loop(now) {
      const dt = clamp((now - this.lastTime) / 1000, 0, 1 / 30);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.syncDiagnostics();
      this.input.endFrame();
      requestAnimationFrame(time => this.loop(time));
    }

    syncDiagnostics() {
      const playerVisual = this.visualRect(this.player, this.activeVisualDepth());
      const support = this.groundSupport || this.findGroundSupport();
      const collisionBounds = support ? this.platformCollisionBounds(support) : null;
      const renderedBounds = support ? this.platformRenderBounds(support) : null;
      const supportError = this.player.grounded && (!support || support.depth !== this.player.depth || !this.platformHasVisibleBase(support));
      Object.assign(this.canvas.dataset, {
        gameState: this.state,
        levelIndex: String(this.currentLevelIndex),
        levelName: this.level.definition.name,
        playerX: this.player.x.toFixed(2),
        playerY: this.player.y.toFixed(2),
        playerDepth: String(this.player.depth),
        grounded: String(this.player.grounded),
        cameraX: this.camera.x.toFixed(2),
        cameraY: this.camera.verticalOffset.toFixed(2),
        playerScreenX: playerVisual.x.toFixed(2),
        collected: String(this.collected),
        relics: String(this.relicsFound),
        deaths: String(this.deaths),
        rolling: String(this.player.rolling),
        animation: this.player.animState,
        section: this.level.sectionAt(this.player.x).name,
        particles: String(this.particles.length),
        lookAhead: this.camera.lookAhead.toFixed(2),
        rocketUses: String(this.player.rocketUses),
        projectiles: String(this.projectiles.length),
        audioLoaded: String(this.audio.loadedAssetCount),
        audioBuffers: String(this.audio.buffers.size),
        audioContextState: this.audio.context?.state || "media-only",
        audioMediaErrors: String(this.audio.mediaPlaybackErrors),
        audioLastError: this.audio.lastAudioError,
        audioFilePlays: String(this.audio.filePlaybackCount),
        audioLastSfx: this.audio.lastPlayedAsset,
        audioMusic: this.audio.lastMusicAsset,
        audioMusicTime: this.audio.musicElement.currentTime.toFixed(2),
        audioMusicPaused: String(this.audio.musicElement.paused),
        audioMusicReady: String(this.audio.musicElement.readyState),
        audioAmbience: this.audio.lastAmbienceAsset,
        audioAmbienceTime: this.audio.ambienceElement.currentTime.toFixed(2),
        audioAmbiencePaused: String(this.audio.ambienceElement.paused),
        debug: String(this.debug),
        collisionDebug: String(this.collisionDebug),
        labelDebug: String(this.labelDebug),
        supportId: support ? support.id : "NONE",
        supportDepth: support ? String(support.depth) : "NONE",
        supportX: support ? support.x.toFixed(2) : "",
        supportY: support ? support.y.toFixed(2) : "",
        supportWidth: support ? support.w.toFixed(2) : "",
        supportHeight: support ? support.h.toFixed(2) : "",
        renderedPlatformBounds: renderedBounds ? `${renderedBounds.x.toFixed(2)},${renderedBounds.y.toFixed(2)},${renderedBounds.w.toFixed(2)},${renderedBounds.h.toFixed(2)}` : "",
        collisionPlatformBounds: collisionBounds ? `${collisionBounds.x.toFixed(2)},${collisionBounds.y.toFixed(2)},${collisionBounds.w.toFixed(2)},${collisionBounds.h.toFixed(2)}` : "",
        supportError: String(supportError),
        transitionValid: this.transitionValidation ? String(this.transitionValidation.valid) : "",
        transitionReason: this.transitionValidation ? this.transitionValidation.reason : "",
        transitionDestination: this.transitionValidation?.destination ? `${this.transitionValidation.destination.x.toFixed(1)},${this.transitionValidation.destination.y.toFixed(1)}` : "",
        transitionEnemyClear: this.transitionValidation ? String(this.transitionValidation.enemyClear) : "",
        transitionSolidClear: this.transitionValidation ? String(this.transitionValidation.solidClear) : "",
        transitionHazardClear: this.transitionValidation ? String(this.transitionValidation.hazardClear) : "",
        transitionSupportValid: this.transitionValidation ? String(this.transitionValidation.supportValid) : "",
        transitionHeadroomClear: this.transitionValidation ? String(this.transitionValidation.headroomClear) : "",
        transitionMovementClear: this.transitionValidation ? String(this.transitionValidation.movementClear) : "",
        nearTransition: this.nearTransition ? `${this.nearTransition.sourceDepth}-${this.nearTransition.targetDepth}` : "",
        nearestEnemy: this.nearestEnemyTelemetry()
      });
    }

    nearestEnemyTelemetry() {
      const live = this.level.enemies
        .filter(enemy => !enemy.dead && enemy.depth === this.player.depth)
        .sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))[0];
      return live ? `${live.x.toFixed(1)},${live.y.toFixed(1)}` : "";
    }

    update(dt) {
      if (this.input.wasKeyPressed("F2")) this.debug = !this.debug;
      if (this.input.wasKeyPressed("F3")) this.collisionDebug = !this.collisionDebug;
      if (this.input.wasKeyPressed("F4")) this.labelDebug = !this.labelDebug;
      if (this.input.wasPressed("pause")) {
        if (this.state === STATE.PAUSED) this.resumeGame();
        else this.pauseGame();
      }
      if (this.input.wasPressed("restart") && [STATE.PLAYING, STATE.TRANSITION, STATE.PLAYER_DEAD].includes(this.state)) this.restart();
      if (this.input.wasPressed("confirm") && this.state === STATE.TITLE && document.activeElement === this.canvas) this.startLevel(0);
      if (this.orientationBlocked || ![STATE.PLAYING, STATE.TRANSITION, STATE.PLAYER_DEAD].includes(this.state)) return;
      this.elapsed += dt;
      this.introTimer = Math.max(0, this.introTimer - dt);
      this.flash = Math.max(0, this.flash - dt);
      this.rewardTimer = Math.max(0, this.rewardTimer - dt);
      if (this.deathDiagnostic) this.deathDiagnostic.time = Math.max(0, this.deathDiagnostic.time - dt);

      if (this.state === STATE.PLAYING) this.updatePlaying(dt);
      else if (this.state === STATE.TRANSITION) this.updateTransition(dt);
      else if (this.state === STATE.PLAYER_DEAD) this.updateDead(dt);

      this.updateParticles(dt);
      this.updatePlayerAnimation(dt);
      const depthDirection = this.transitionData ? Math.sign(this.transitionData.to - this.transitionData.from) : 0;
      this.camera.update(this.player, dt, this.activeVisualDepth(), this.state === STATE.TRANSITION, depthDirection);
    }

    updatePlaying(dt) {
      const p = this.player;
      const move = (this.input.isDown("right") ? 1 : 0) - (this.input.isDown("left") ? 1 : 0);
      const jumpPressed = this.input.wasPressed("jump");
      const rollPressed = this.input.wasPressed("roll");
      const shootHeld = this.input.isDown("shoot");
      const maxSpeed = 285;
      const acceleration = p.grounded ? 2100 : 1250;
      const braking = p.grounded ? 2550 : 620;

      p.shootCooldown = Math.max(0, p.shootCooldown - dt);
      p.castTimer = Math.max(0, p.castTimer - dt);
      p.rocketTimer = Math.max(0, p.rocketTimer - dt);
      if (p.rolling) {
        p.rollTimer -= dt;
        p.vx = p.facing * 420;
      } else if (move !== 0) {
        p.vx = approach(p.vx, move * maxSpeed, acceleration * dt);
        p.facing = move;
      } else {
        p.vx = approach(p.vx, 0, braking * dt);
      }

      p.coyote = p.grounded ? 0.10 : Math.max(0, p.coyote - dt);
      if (jumpPressed && !p.rolling && p.coyote > 0) {
        p.vy = -720;
        p.grounded = false;
        p.coyote = 0;
        this.audio.play("jump");
      } else if (jumpPressed && !p.rolling && !p.grounded && p.rocketUses < (this.relicReward ? 2 : 1)) {
        p.vy = Math.min(p.vy, -640);
        p.rocketTimer = 0.24;
        p.rocketUses += 1;
        this.audio.play("rocket");
      }

      if (rollPressed && p.grounded && !p.rolling) this.beginRoll();
      if (shootHeld && !p.rolling && p.shootCooldown <= 0) this.fireProjectile();

      // A released jump is cut short for crisp, variable-height arcade jumps.
      if (p.rocketTimer <= 0 && !this.input.isDown("jump") && p.vy < -250) p.vy += 1450 * dt;
      p.vy = Math.min(p.vy + 2050 * dt, 980);
      this.movePlayerX(dt);
      this.movePlayerY(dt);
      if (p.grounded) {
        p.rocketUses = 0;
        p.rocketTimer = 0;
      }
      if (p.rolling && p.rollTimer <= 0) this.tryEndRoll();
      if (p.grounded && !p.rolling && Math.abs(p.vx) > 150) {
        p.runDustTimer -= dt;
        if (p.runDustTimer <= 0) {
          p.runDustTimer = 0.085;
          this.emitDust(p.x + p.w * 0.5 - p.facing * 11, p.y + p.h - 2, p.depth, 1, p.facing);
        }
      } else {
        p.runDustTimer = 0;
      }

      this.player.arrivalGrace = Math.max(0, this.player.arrivalGrace - dt);
      this.level.enemies.forEach(enemy => enemy.update(dt, this.level.exclusionZonesAt(enemy.depth)));
      this.updateEnvironmentalAudio(dt);
      this.updateProjectiles(dt);
      this.checkEnemyContacts();
      this.checkHazards();
      this.checkCheckpoints();
      this.checkCollectibles();
      this.transitionCandidate = this.findNearbyTransition();
      this.transitionValidation = this.transitionCandidate ? this.validateTransition(this.transitionCandidate) : null;
      this.nearTransition = this.transitionValidation?.valid ? this.transitionCandidate : null;
      if (this.transitionCandidate && this.input.wasPressed("shift")) this.beginTransition(this.transitionCandidate);

      if (p.y > VIEW_H + 130) this.killPlayer("FALL");
      if (p.depth === this.level.goal.depth && aabb(p, this.level.goal)) {
        this.completeLevel();
      }
    }

    updateEnvironmentalAudio(dt) {
      const nearby = this.level.enemies.find(enemy =>
        !enemy.dead && enemy.depth === this.player.depth &&
        Math.abs((enemy.x + enemy.w * .5) - (this.player.x + this.player.w * .5)) < 250 &&
        !this.alertedEnemyIds.has(enemy.id)
      );
      if (nearby) {
        this.alertedEnemyIds.add(nearby.id);
        this.audio.play("enemyAlert", { gainScale:.48 });
      }

      this.environmentAudioTimer -= dt;
      if (this.environmentAudioTimer > 0) return;
      const palettes = [
        ["machineryClunk","piston","steam"],
        ["machineryClunk","piston","steam"],
        ["electricArc","machineryClunk","steam"],
        ["piston","machineryClunk","steam"],
        ["electricArc","machineryClunk","steam"]
      ];
      const palette = palettes[this.currentLevelIndex] || palettes[0];
      const effect = palette[this.environmentAudioIndex % palette.length];
      this.environmentAudioIndex += 1;
      this.environmentAudioTimer = 4.2 + (this.environmentAudioIndex % 3) * 1.35;
      this.audio.play(effect, { gainScale:.2 });
    }

    beginRoll() {
      const p = this.player;
      const feet = p.y + p.h;
      p.rolling = true;
      p.rollTimer = 0.46;
      p.h = p.rollH;
      p.y = feet - p.h;
      p.vx = p.facing * 420;
      this.audio.play("roll");
    }

    tryEndRoll(force = false) {
      const p = this.player;
      if (!p.rolling) return true;
      const standing = { x: p.x, y: p.y - (p.baseH - p.rollH), w: p.w, h: p.baseH };
      const blocked = this.level.platformsAt(p.depth).some(platform => aabb(standing, platform));
      if (blocked && !force) return false;
      p.y = standing.y;
      p.h = p.baseH;
      p.rolling = false;
      p.rollTimer = 0;
      return true;
    }

    fireProjectile() {
      const p = this.player;
      const aimUp = this.input.isDown("aimUp");
      const damage = this.relicReward ? 2 : 1;
      // The sprite extends well above its compact collision box. These anchors
      // align resonance with the raised casting hand rather than the feet.
      const handX = p.x + p.w * .5 + p.facing * 14;
      const handY = p.y - 3;
      if (aimUp) {
        this.projectiles.push(new Projectile(handX - 3, p.y - 21, 0, -620, p.depth, damage));
      } else {
        const x = p.facing > 0 ? handX : handX - 13;
        this.projectiles.push(new Projectile(x, handY, p.facing * 620, 0, p.depth, damage));
      }
      this.emitImpact(handX, aimUp ? p.y - 15 : handY + 3, p.depth, DEPTH_STYLE[p.depth].glow, 4);
      p.shootCooldown = this.shardReward ? 0.09 : 0.19;
      p.castTimer = this.shardReward ? 0.14 : 0.23;
      p.castUp = aimUp;
      this.audio.play("shot");
    }

    updateProjectiles(dt) {
      for (const projectile of this.projectiles) {
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;
        projectile.life -= dt;
        if (projectile.life <= 0 || projectile.x < 0 || projectile.x > this.level.worldWidth || projectile.y < -80 || projectile.y > VIEW_H + 180) {
          projectile.dead = true;
          continue;
        }
        if (this.level.platformsAt(projectile.depth).some(platform => aabb(projectile, platform))) {
          this.emitImpact(projectile.x, projectile.y, projectile.depth, DEPTH_STYLE[projectile.depth].glow);
          projectile.dead = true;
          continue;
        }
        const enemy = this.level.enemies.find(target => !target.dead && target.depth === projectile.depth && aabb(projectile, target));
        if (enemy) {
          const killed = enemy.takeShot(projectile.damage);
          this.emitImpact(projectile.x, projectile.y, projectile.depth, DEPTH_STYLE[projectile.depth].glow);
          projectile.dead = true;
          if (killed) {
            this.enemyKills += 1;
            this.audio.play("enemyDestroyed");
          } else {
            this.audio.play("enemyHit");
          }
        }
      }
      this.projectiles = this.projectiles.filter(projectile => !projectile.dead);
    }

    movePlayerX(dt) {
      const p = this.player;
      p.x += p.vx * dt;
      p.x = clamp(p.x, 0, this.level.worldWidth - p.w);
      for (const platform of this.level.platformsAt(p.depth)) {
        if (!aabb(p, platform)) continue;
        if (p.vx > 0) p.x = platform.x - p.w;
        else if (p.vx < 0) p.x = platform.x + platform.w;
        p.vx = 0;
      }
    }

    movePlayerY(dt) {
      const p = this.player;
      const wasGrounded = p.grounded;
      const impactSpeed = p.vy;
      const previousBottom = p.y + p.h;
      p.y += p.vy * dt;
      p.grounded = false;
      this.groundSupport = null;
      for (const platform of this.level.platformsAt(p.depth)) {
        if (!aabb(p, platform)) continue;
        if (p.vy >= 0 && previousBottom <= platform.y + 4) {
          p.y = platform.y - p.h;
          p.vy = 0;
          p.grounded = true;
          this.groundSupport = platform;
          if (!wasGrounded && impactSpeed > 210) {
            p.landTimer = 0.14;
            this.emitDust(p.x + p.w * 0.5, p.y + p.h - 1, p.depth, 6, 0);
            this.audio.play("land");
          }
        } else if (p.vy < 0) {
          p.y = platform.y + platform.h;
          p.vy = 0;
        }
      }
    }

    checkEnemyContacts() {
      const p = this.player;
      if (p.arrivalGrace > 0) return;
      for (const enemy of this.level.enemies) {
        if (enemy.dead || enemy.depth !== p.depth || !aabb(p, enemy)) continue;
        if (p.rolling && enemy.type === "skitter") {
          enemy.dead = true;
          this.enemyKills += 1;
          p.vx = p.facing * 440;
          this.audio.play("enemyDestroyed");
        } else {
          this.killPlayer(enemy.id);
        }
        break;
      }
    }

    checkHazards() {
      const hazard = this.level.hazardsAt(this.player.depth).find(item => aabb(this.player, item));
      if (hazard) this.killPlayer(hazard.id);
    }

    checkCheckpoints() {
      for (const checkpoint of this.level.checkpoints) {
        if (checkpoint.active || checkpoint.depth !== this.player.depth || !aabb(this.player, checkpoint)) continue;
        if (!this.validateCheckpoint(checkpoint).valid) continue;
        this.level.checkpoints.forEach(item => item.active = false);
        checkpoint.active = true;
        this.player.checkpoint = { x: checkpoint.x, y: checkpoint.y + checkpoint.h - this.player.baseH, depth: checkpoint.depth };
        this.showReward(`CHECKPOINT SECURED // ${checkpoint.name}`);
        this.audio.play("checkpoint");
      }
    }

    validateCheckpoint(checkpoint) {
      const destination = { x:checkpoint.x, y:checkpoint.y + checkpoint.h - this.player.baseH, w:this.player.w, h:this.player.baseH };
      const feet = destination.y + destination.h;
      const support = this.level.platformsAt(checkpoint.depth).find(platform =>
        destination.x - 28 >= platform.x && destination.x + destination.w + 28 <= platform.x + platform.w && Math.abs(platform.y - feet) <= 2
      );
      const solidClear = !this.level.platformsAt(checkpoint.depth).some(platform => platform !== support && aabb(destination,platform));
      const hazardClear = !this.level.hazardsAt(checkpoint.depth).some(hazard => aabb(checkpoint.arrivalZone,hazard));
      const enemyClear = !this.level.enemies.some(enemy => !enemy.dead && enemy.depth === checkpoint.depth && aabb(checkpoint.enemyExclusionZone,enemy));
      const valid = Boolean(support && solidClear && hazardClear && enemyClear && destination.y > -120 && feet <= VIEW_H + 100);
      return { valid, support, destination, solidClear, hazardClear, enemyClear };
    }

    checkCollectibles() {
      for (const item of this.level.collectibles) {
        if (item.collected || item.depth !== this.player.depth || !aabb(this.player, item)) continue;
        item.collected = true;
        if (item.kind === "relic") {
          this.relicsFound += 1;
        this.showReward(`${item.name} SECURED  //  REALITY ANCHOR ${this.relicsFound}/3`);
          if (this.relicsFound === 3) {
            this.relicReward = true;
            this.showReward("TRI-CORE ONLINE  //  DOUBLE ROCKET + POWER SHOTS");
          }
        } else {
          this.collected += 1;
          if (this.collected === this.totalShards()) {
            this.shardReward = true;
        this.showReward("MEMORY CHAIN COMPLETE  //  RAPID RESONANCE UNLOCKED");
          }
        }
        this.emitPickup(item);
        this.flash = 0.11;
        this.audio.play(item.kind === "relic" ? "relic" : "shard");
      }
    }

    totalShards() { return this.level.collectibles.filter(item => item.kind === "shard").length; }

    showReward(message) {
      this.rewardMessage = message;
      this.rewardTimer = 3.2;
    }

    findGroundSupport(player = this.player) {
      if (!player.grounded) return null;
      const feet = player.y + player.h;
      return this.level.platformsAt(player.depth).find(platform =>
        player.x + player.w > platform.x + 1 &&
        player.x < platform.x + platform.w - 1 &&
        Math.abs(feet - platform.y) <= 2.5
      ) || null;
    }

    validateTransition(device) {
      const failed = reason => ({ valid:false, reason, platform:null, destination:null, arrivalZone:null, enemyClear:false, solidClear:false, hazardClear:false, supportValid:false, headroomClear:false, movementClear:false, deathClear:false });
      if (!device) return failed("INVALID ROUTE");
      const p = this.player;
      const returnSnapshot = device.returnRoute ? this.returnSnapshots.get(device.pairedId) : null;
      let expectedY = returnSnapshot?.supportY ?? (device.y + device.h);
      const targetPlatforms = this.level.platformsAt(device.targetDepth);
      const clearance = device.returnRoute ? 6 : TRANSITION_SAFETY.side;
      const destination = { x:returnSnapshot?.x ?? device.targetPosition.x, y:expectedY - p.baseH, w:p.w, h:p.baseH };
      let support = null;
      if (device.returnRoute) {
        const targetCenter = destination.x + destination.w * .5;
        support = (returnSnapshot?.supportId
          ? targetPlatforms.find(platform => platform.id === returnSnapshot.supportId)
          : null) || targetPlatforms.find(platform =>
            targetCenter >= platform.x + 2 && targetCenter <= platform.x + platform.w - 2 &&
            platform.w >= p.w + 8 && Math.abs(platform.y - expectedY) <= 2
          ) || null;
        if (support) expectedY = support.y;
        destination.y = expectedY - p.baseH;
        if (support) destination.x = clamp(destination.x, support.x + 6, support.x + support.w - destination.w - 6);
      } else {
        const requiredLeft = destination.x - clearance;
        const requiredRight = destination.x + destination.w + clearance;
        support = targetPlatforms.find(platform =>
          requiredLeft >= platform.x && requiredRight <= platform.x + platform.w && Math.abs(platform.y - expectedY) <= 2
        ) || null;
      }
      const groundLeft = destination.x - clearance;
      const groundRight = destination.x + destination.w + clearance;
      const supportValid = Boolean(support);
      const arrivalZone = { x:groundLeft, y:destination.y - TRANSITION_SAFETY.headroom, w:groundRight - groundLeft, h:p.baseH + TRANSITION_SAFETY.headroom };
      // A return trip restores the exact position the player safely occupied
      // before shifting. Only test a small settling margin above that body;
      // the full arrival canopy can falsely reject valid spots beside ledges.
      const headroomHeight = device.returnRoute ? 4 : TRANSITION_SAFETY.headroom;
      const headroom = { x:destination.x, y:destination.y - headroomHeight, w:destination.w, h:headroomHeight };
      const bodyAndSides = device.returnRoute
        ? { ...destination }
        : { x:arrivalZone.x, y:destination.y, w:arrivalZone.w, h:destination.h };
      const solidOverlap = targetPlatforms.find(platform => platform !== support && aabb(bodyAndSides, platform));
      const headroomOverlap = targetPlatforms.find(platform => platform !== support && aabb(headroom, platform));
      const solidClear = !solidOverlap;
      const headroomClear = !headroomOverlap;
      const hazard = this.level.hazardsAt(device.targetDepth).find(item => aabb(arrivalZone, item));
      const hazardClear = !hazard;
      const enemy = this.level.enemies.find(item => !item.dead && item.depth === device.targetDepth && aabb(item, device.enemyExclusionZone));
      const enemyClear = !enemy;
      const movementOffsets = device.returnRoute ? [-12, 12] : [-TRANSITION_SAFETY.side, TRANSITION_SAFETY.side];
      const movementBoxes = movementOffsets.map(offset => ({ ...destination, x:destination.x + offset }));
      const movementTest = box =>
        box.x >= support.x && box.x + box.w <= support.x + support.w &&
        !targetPlatforms.some(platform => platform !== support && aabb(box, platform)) &&
        !this.level.hazardsAt(device.targetDepth).some(item => aabb(box, item));
      const movementClear = supportValid && (device.returnRoute ? movementBoxes.some(movementTest) : movementBoxes.every(movementTest));
      const deathClear = destination.y > -120 && destination.y + destination.h <= VIEW_H + 100;
      const result = { platform:support, destination, arrivalZone, enemyClear, solidClear, hazardClear, supportValid, headroomClear, movementClear, deathClear };
      if (!supportValid) return { ...result, valid:false, reason:"SUPPORT INVALID" };
      if (!deathClear) return { ...result, valid:false, reason:"DESTINATION IN DEATH ZONE" };
      if (!solidClear) return { ...result, valid:false, reason:`SOLID OBSTRUCTING ARRIVAL${solidOverlap ? ` // ${solidOverlap.id}` : ""}` };
      if (!headroomClear) return { ...result, valid:false, reason:`INSUFFICIENT HEADROOM${headroomOverlap ? ` // ${headroomOverlap.id}` : ""}` };
      if (!hazardClear) return { ...result, valid:false, reason:`HAZARD OCCUPYING ARRIVAL ZONE // ${hazard.id}` };
      if (!enemyClear) return { ...result, valid:false, reason:`ENEMY OCCUPYING ARRIVAL ZONE // ${enemy.id}` };
      if (!movementClear) return { ...result, valid:false, reason:"NO IMMEDIATE MOVEMENT SPACE" };
      return { ...result, valid:true, reason:"SAFE" };
    }

    canTransitionToDepth(targetDepth, device = this.transitionCandidate) {
      if (!device || device.targetDepth !== targetDepth) return false;
      return this.validateTransition(device).valid;
    }

    validateCollectiblePlacement(item) {
      const center = item.x + item.w * 0.5;
      const bottom = item.y + item.h;
      const support = this.level.platformsAt(item.depth)
        .filter(platform =>
          center >= platform.x + this.player.w * 0.45 &&
          center <= platform.x + platform.w - this.player.w * 0.45 &&
          platform.y >= bottom - 3 &&
          platform.y - bottom <= 210
        )
        .sort((a, b) => a.y - b.y)[0];
      if (!support) return { valid: false, reason: "NO SAFE SUPPORT", platform: null };
      if (support.w < this.player.w * 2) return { valid: false, reason: "NO SAFE EXIT", platform: support };
      const standing = { x: center - this.player.w * 0.5, y: support.y - this.player.baseH, w: this.player.w, h: this.player.baseH };
      if (this.level.hazardsAt(item.depth).some(hazard => aabb(standing,hazard))) return { valid:false, reason:"HAZARD AT COLLECTIBLE", platform:support };
      const blocker = this.level.platformsAt(item.depth).find(platform => platform !== support && aabb(standing, platform));
      if (blocker) {
        const rolling = { x: standing.x, y: support.y - this.player.rollH, w: this.player.w, h: this.player.rollH };
        const rollBlocker = this.level.platformsAt(item.depth).find(platform => platform !== support && aabb(rolling, platform));
        if (!rollBlocker) return { valid: true, reason: "SAFE ROLL", platform: support };
        return { valid: false, reason: `SOLID OVERLAP ${blocker.id}`, platform: support };
      }
      const exitClear = [-this.player.w,this.player.w].some(offset => {
        const exit = { ...standing, x:standing.x + offset };
        return exit.x >= support.x && exit.x + exit.w <= support.x + support.w &&
          !this.level.platformsAt(item.depth).some(platform => platform !== support && aabb(exit,platform)) &&
          !this.level.hazardsAt(item.depth).some(hazard => aabb(exit,hazard));
      });
      if (!exitClear) return { valid:false, reason:"NO SAFE EXIT", platform:support };
      return { valid: true, reason: "SAFE", platform: support };
    }

    findNearbyTransition() {
      if (!this.player.grounded) return null;
      const center = this.player.x + this.player.w * 0.5;
      const feet = this.player.y + this.player.h;
      return this.level.transitions.find(device =>
        device.sourceDepth === this.player.depth &&
        Math.abs(center - (device.x + device.w * 0.5)) < 76 &&
        Math.abs(feet - (device.y + device.h)) < 30
      ) || null;
    }

    beginTransition(device) {
      const validation = this.validateTransition(device);
      this.transitionValidation = validation;
      if (!validation.valid) {
        if (this.debug) this.showReward(`SHIFT BLOCKED // ${validation.reason}`);
        this.audio.play("warning");
        return false;
      }
      if (!device.returnRoute) {
        const originSupport = this.findGroundSupport() || this.groundSupport;
        if (originSupport) {
          this.returnSnapshots.set(device.pairedId, {
            x: this.player.x,
            depth: this.player.depth,
            supportId: originSupport.id,
            supportY: originSupport.y
          });
        }
      }
      this.state = STATE.TRANSITION;
      this.nearTransition = null;
      this.tryEndRoll(true);
      this.player.vx = 0;
      this.player.vy = 0;
      this.transitionData = {
        device,
        from: device.sourceDepth,
        to: device.targetDepth,
        time: 0,
        duration: 0.38,
        anticipation: 0.075,
        recovery: 0.065,
        startY: this.player.y,
        burstMidway: false,
        destinationPlatform: validation.platform
      };
      this.emitTransitionBurst(device.sourceDepth, 8);
      this.audio.play("transitionPad");
      this.audio.play(device.targetDepth > device.sourceDepth ? "depthShiftForeground" : "depthShiftBackground");
      return true;
    }

    updateTransition(dt) {
      const data = this.transitionData;
      data.time += dt;
      if (!data.burstMidway && data.time >= data.duration * 0.52) {
        data.burstMidway = true;
        this.emitTransitionBurst(data.to, 12);
      }
      if (data.time < data.duration) return;
      const validation = this.validateTransition(data.device);
      if (!validation.valid) {
        this.state = STATE.PLAYING;
        this.transitionData = null;
        this.transitionValidation = validation;
        if (this.debug) this.showReward(`SHIFT CANCELLED // ${validation.reason}`);
        this.audio.play("warning");
        return;
      }
      this.player.depth = data.to;
      this.player.x = validation.destination.x;
      this.settleOnDestination(validation.platform);
      this.player.arrivalGrace = 0.42;
      this.lastTransitionId = data.device.id;
      this.state = STATE.PLAYING;
      this.transitionData = null;
      this.player.landTimer = 0.12;
      this.audio.play("phaseArrival");
      this.emitDust(this.player.x + this.player.w * 0.5, this.player.y + this.player.h - 1, this.player.depth, 7, 0);
      this.flash = 0.16;
    }

    settleOnDestination(preferredPlatform = null) {
      const p = this.player;
      const center = p.x + p.w * 0.5;
      const candidates = this.level.platformsAt(p.depth)
        .filter(platform => center >= platform.x && center <= platform.x + platform.w)
        .sort((a, b) => Math.abs(a.y - (p.y + p.h)) - Math.abs(b.y - (p.y + p.h)));
      const support = preferredPlatform || candidates[0] || null;
      if (support) p.y = support.y - p.h;
      p.vy = 0;
      p.grounded = Boolean(support);
      this.groundSupport = support;
      p.rocketUses = 0;
      p.rocketTimer = 0;
    }

    killPlayer(cause = "UNKNOWN") {
      if (this.state !== STATE.PLAYING) return;
      const support = this.groundSupport || this.findGroundSupport();
      this.deathDiagnostic = {
        cause,
        x: this.player.x,
        y: this.player.y,
        depth: this.player.depth,
        supportId: support ? support.id : "NONE",
        transitionId: this.lastTransitionId,
        time: 2.4
      };
      this.state = STATE.PLAYER_DEAD;
      this.deaths += 1;
      this.deadTimer = 0;
      this.player.hurtTimer = 0.14;
      this.player.vx = 0;
      this.emitImpact(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.45, this.player.depth, "#ff8e5b", 12);
      this.audio.play("hurt");
      setTimeout(() => this.audio.play("death"), 110);
    }

    updateDead(dt) {
      this.deadTimer += dt;
      this.player.vy = Math.min(this.player.vy + 1100 * dt, 700);
      this.player.y += this.player.vy * dt;
      if (this.deadTimer > 0.78) {
        this.player.respawn();
        this.audio.play("respawn");
        this.groundSupport = null;
        this.camera.reset(this.player.x, this.player.depth, this.player.w);
        this.state = STATE.PLAYING;
        this.flash = 0.18;
      }
    }

    setPlayerAnimation(next) {
      const p = this.player;
      if (p.animState === next) return;
      p.animState = next;
      p.animTime = 0;
    }

    updatePlayerAnimation(dt) {
      const p = this.player;
      p.animTime += dt;
      p.landTimer = Math.max(0, p.landTimer - dt);
      p.hurtTimer = Math.max(0, p.hurtTimer - dt);
      if (this.state === STATE.TRANSITION) {
        this.setPlayerAnimation(this.transitionData.to > this.transitionData.from ? "depthForward" : "depthBackward");
      } else if (this.state === STATE.PLAYER_DEAD) {
        this.setPlayerAnimation(this.deadTimer < 0.14 ? "hurt" : "death");
      } else if (p.rolling) {
        this.setPlayerAnimation("roll");
      } else if (p.castTimer > 0) {
        this.setPlayerAnimation(p.castUp ? "castUp" : "castForward");
      } else if (p.landTimer > 0) {
        this.setPlayerAnimation("land");
      } else if (!p.grounded) {
        this.setPlayerAnimation(p.vy < 40 ? "jump" : "fall");
      } else if (Math.abs(p.vx) > 28) {
        this.setPlayerAnimation("run");
      } else {
        this.setPlayerAnimation("idle");
      }
    }

    spawnParticle(x, y, depth, options = {}) {
      const life = options.life || 0.34;
      this.particles.push({
        x, y, depth,
        vx: options.vx || 0,
        vy: options.vy || 0,
        gravity: options.gravity || 0,
        life,
        maxLife: life,
        size: options.size || 4,
        color: options.color || DEPTH_STYLE[Math.round(depth)].glow,
        shape: options.shape || "square"
      });
    }

    emitDust(x, y, depth, count = 5, facing = 0) {
      for (let i = 0; i < count; i += 1) {
        const spread = (i - (count - 1) * 0.5) * 11;
        this.spawnParticle(x + spread * 0.25, y, depth, {
          vx: -facing * (28 + i * 5) + spread,
          vy: -28 - (i % 3) * 13,
          gravity: 110,
          life: 0.24 + (i % 2) * 0.08,
          size: 3 + (i % 3),
          color: depth === 0 ? "#5d9091" : depth === 1 ? "#7d9861" : "#a76b57"
        });
      }
    }

    emitImpact(x, y, depth, color, count = 6) {
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        this.spawnParticle(x, y, depth, {
          vx: Math.cos(angle) * (55 + (i % 3) * 22),
          vy: Math.sin(angle) * (55 + (i % 2) * 25),
          gravity: 90,
          life: 0.18 + (i % 3) * 0.055,
          size: 2 + (i % 2) * 2,
          color
        });
      }
    }

    emitPickup(item) {
      const color = item.kind === "relic" ? "#fff3a1" : DEPTH_STYLE[item.depth].glow;
      this.emitImpact(item.x + item.w * 0.5, item.y + item.h * 0.5, item.depth, color, item.kind === "relic" ? 16 : 9);
    }

    emitTransitionBurst(depth, count) {
      const p = this.player;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + this.elapsed;
        this.spawnParticle(p.x + p.w * 0.5, p.y + p.h * 0.5, depth, {
          vx: Math.cos(angle) * (75 + (i % 4) * 18),
          vy: Math.sin(angle) * (55 + (i % 3) * 20) - 25,
          gravity: 60,
          life: 0.28 + (i % 3) * 0.06,
          size: 3 + (i % 3),
          color: DEPTH_STYLE[depth].glow,
          shape: "streak"
        });
      }
    }

    updateParticles(dt) {
      for (const particle of this.particles) {
        particle.life -= dt;
        particle.vy += particle.gravity * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
      }
      this.particles = this.particles.filter(particle => particle.life > 0);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);
      this.drawSky();

      // Structural supports belong behind every gameplay layer so columns from a
      // nearer reality can never cover platforms, actors, or portals below them.
      for (let depth = 0; depth < 3; depth += 1) {
        ctx.save();
        ctx.globalAlpha = this.planeAlpha(depth) * .9;
        this.drawPlatformSupports(depth);
        ctx.restore();
      }

      for (let depth = 0; depth < 3; depth += 1) {
        const alpha = this.planeAlpha(depth);
        ctx.save();
        ctx.globalAlpha = alpha;
        this.drawScenery(depth);
        this.drawGameplayLayer(depth);
        ctx.restore();
      }

      if (this.state === STATE.TRANSITION) this.drawTransitioningPlayer();
      this.drawForegroundOccluders();
      this.drawGroundSupportEmphasis();
      this.drawAtmosphere();
      if (this.collisionDebug || this.labelDebug) this.drawCollisionDebug();
      this.drawHud();
      if (this.debug) this.drawDebug();
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(210,255,184,${this.flash * 0.75})`;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }
    }

    activeVisualDepth() {
      if (this.state !== STATE.TRANSITION) return this.player.depth;
      const data = this.transitionData;
      const travelStart = data.anticipation;
      const travelEnd = data.duration - data.recovery;
      const travelT = clamp((data.time - travelStart) / (travelEnd - travelStart), 0, 1);
      return lerp(data.from, data.to, easeInOut(travelT));
    }

    planeAlpha(depth) {
      const active = this.activeVisualDepth();
      const distance = Math.min(1, Math.abs(active - depth));
      const inactiveBase = [0.57, 0.48, 0.54][depth];
      let alpha = lerp(1, inactiveBase, distance);
      if (this.state === STATE.TRANSITION && depth === this.transitionData.to) {
        const pulse = Math.sin(clamp(this.transitionData.time / this.transitionData.duration, 0, 1) * Math.PI);
        alpha = Math.min(1, alpha + pulse * 0.24);
      }
      if (this.state === STATE.TRANSITION && depth === this.transitionData.from) {
        const pulse = Math.sin(clamp(this.transitionData.time / this.transitionData.duration, 0, 1) * Math.PI);
        alpha = Math.max(0.34, alpha - pulse * 0.20);
      }
      return alpha;
    }

    depthMetrics(depth) {
      if (Number.isInteger(depth)) return DEPTH_STYLE[depth];
      const low = clamp(Math.floor(depth), 0, 2);
      const high = clamp(Math.ceil(depth), 0, 2);
      const t = depth - low;
      return {
        scale: lerp(DEPTH_STYLE[low].scale, DEPTH_STYLE[high].scale, t),
        parallax: lerp(DEPTH_STYLE[low].parallax, DEPTH_STYLE[high].parallax, t),
        yOffset: lerp(DEPTH_STYLE[low].yOffset, DEPTH_STYLE[high].yOffset, t),
        glow: t < 0.5 ? DEPTH_STYLE[low].glow : DEPTH_STYLE[high].glow
      };
    }

    visualRect(entity, depth = entity.depth) {
      const style = this.depthMetrics(depth);
      const sw = entity.w * style.scale;
      const sh = entity.h * style.scale;
      return {
        x: entity.x - this.camera.x * style.parallax + (entity.w - sw) * 0.5,
        y: FLOOR_Y + style.yOffset - (FLOOR_Y - entity.y) * style.scale + this.camera.verticalOffset,
        w: sw,
        h: sh,
        scale: style.scale
      };
    }

    drawSky() {
      const ctx = this.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      gradient.addColorStop(0, "#0a0b20");
      gradient.addColorStop(0.55, "#263149");
      gradient.addColorStop(1, "#596072");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      const art = this.backdrops[this.currentLevelIndex];
      if (art && art.complete && art.naturalWidth) {
        // Pan across one oversized panorama instead of wrapping full-image tiles.
        // The former wrap exposed hard seams whenever unrelated image edges met.
        const coverScale = Math.max(VIEW_H / art.naturalHeight, (VIEW_W * 1.18) / art.naturalWidth);
        const drawW = art.naturalWidth * coverScale;
        const drawH = art.naturalHeight * coverScale;
        const travel = clamp(this.camera.x / Math.max(1, (this.level?.worldWidth || WORLD_W) - VIEW_W), 0, 1);
        const panRange = Math.max(0, drawW - VIEW_W);
        const drawX = -panRange * travel;
        const drawY = (VIEW_H - drawH) * .5;
        const levelFilters = [
          "saturate(.82) contrast(.94) brightness(.74)",
          "saturate(.94) contrast(.97) brightness(.70) hue-rotate(5deg)",
          "saturate(.92) contrast(.98) brightness(.66)",
          "saturate(1.02) contrast(1.04) brightness(.61) hue-rotate(-4deg)",
          "saturate(.98) contrast(1.08) brightness(.56)"
        ];
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.filter = levelFilters[this.currentLevelIndex];
        ctx.drawImage(art, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      // Cool mist and a soft horizon marry the concept painting to the playable geometry.
      const haze = ctx.createLinearGradient(0, 150, 0, FLOOR_Y);
      haze.addColorStop(0, "rgba(142,176,205,0)");
      haze.addColorStop(0.62, "rgba(151,177,204,.12)");
      haze.addColorStop(1, "rgba(176,183,203,.28)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 145, VIEW_W, FLOOR_Y - 145);

      ctx.fillStyle = "rgba(7,8,20,.25)";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }

    drawAtlasCell(name, cell, x, y, w, h, options = {}) {
      const image = this.environmentArt[name];
      const cells = ENVIRONMENT_ATLAS_BOUNDS[name];
      if (!image || !cells || !image.complete || !image.naturalWidth) return false;
      const bounds = cells[Math.abs(Math.floor(cell || 0)) % cells.length];
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha *= options.alpha ?? 1;
      if (options.filter) ctx.filter = options.filter;
      if (options.flip) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(image, bounds[0], bounds[1], bounds[2], bounds[3], 0, 0, w, h);
      } else {
        ctx.drawImage(image, bounds[0], bounds[1], bounds[2], bounds[3], x, y, w, h);
      }
      ctx.restore();
      return true;
    }

    drawGridCell(image, columns, rows, cell, x, y, w, h, options = {}) {
      if (!image || !image.complete || !image.naturalWidth) return false;
      const count = columns * rows;
      const frame = ((Math.floor(cell || 0) % count) + count) % count;
      const cellW = image.naturalWidth / columns;
      const cellH = image.naturalHeight / rows;
      const sx = (frame % columns) * cellW;
      const sy = Math.floor(frame / columns) * cellH;
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha *= options.alpha ?? 1;
      if (options.filter) ctx.filter = options.filter;
      if (options.flip) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(image, sx, sy, cellW, cellH, 0, 0, w, h);
      } else {
        ctx.drawImage(image, sx, sy, cellW, cellH, x, y, w, h);
      }
      ctx.restore();
      return true;
    }

    drawEnvironmentDepth(depth) {
      const style = DEPTH_STYLE[depth];
      const baseY = FLOOR_Y + style.yOffset + this.camera.verticalOffset;
      const spacing = [490, 620, 780][depth];
      const drift = this.camera.x * style.parallax * [0.72, 0.82, 0.9][depth];
      const first = Math.floor(drift / spacing) - 2;
      for (let index = first; index < first + 6; index += 1) {
        const seed = Math.abs(index * 17 + depth * 11 + this.currentLevelIndex * 7);
        const x = index * spacing - drift + (seed % 97);
        if (depth === 0) {
          const h = 210 + seed % 85;
          this.drawAtlasCell("trees-distant", seed, x, baseY - h + 18, 150 + seed % 80, h, {
            alpha: .52, flip: seed % 2 === 0, filter: "saturate(.74) brightness(.68) hue-rotate(8deg)"
          });
          const companionH = 150 + (seed * 7) % 105;
          this.drawAtlasCell("trees-distant", seed + 2, x + spacing * .46, baseY - companionH + 20, 112 + seed % 70, companionH, {
            alpha: .42, flip: seed % 3 === 0, filter: "saturate(.7) brightness(.62) hue-rotate(8deg)"
          });
          if (seed % 3 === 0) this.drawAtlasCell("ruins", seed + 1, x + 125, baseY - 155, 190, 155, {
            alpha: .42, filter: "saturate(.68) brightness(.66)"
          });
          this.drawAtlasCell(seed % 2 ? "shrubs" : "ground-foliage", seed + 2, x - 30, baseY - 52, 175, 58, {
            alpha: .44, flip: seed % 2 === 0, filter: "saturate(.72) brightness(.65)"
          });
        } else if (depth === 1) {
          const h = 260 + seed % 105;
          this.drawAtlasCell("trees-middle", seed, x, baseY - h + 12, 190 + seed % 105, h, {
            alpha: .58, flip: seed % 2 === 1, filter: "saturate(.82) brightness(.72)"
          });
          const companionH = 205 + (seed * 9) % 115;
          this.drawAtlasCell("trees-middle", seed + 3, x + spacing * .5, baseY - companionH + 14, 150 + seed % 100, companionH, {
            alpha: .46, flip: seed % 2 === 0, filter: "saturate(.76) brightness(.64)"
          });
          if (seed % 2 === 0) this.drawAtlasCell("ruins", seed, x + 145, baseY - 175, 225, 175, {
            alpha: .5, flip: seed % 4 === 0, filter: "saturate(.78) brightness(.74)"
          });
          this.drawAtlasCell(seed % 3 === 0 ? "rocks" : "shrubs", seed + 3, x + 35, baseY - 72, 190, 78, {
            alpha: .56, flip: seed % 2 === 1, filter: "saturate(.78) brightness(.7)"
          });
        } else {
          this.drawAtlasCell("overhead-rocks", seed, x - 80, -8, 340, 150, {
            alpha: .9, flip: seed % 4 === 0, filter: "brightness(.68) saturate(.78)"
          });
          this.drawAtlasCell("hanging-growth", seed + 1, x + 80, -8, 130, 185 + seed % 75, {
            alpha: .76, flip: seed % 2 === 0, filter: "brightness(.7) saturate(.84)"
          });
        }
      }
      if (depth === 2) {
        // Stable corner silhouettes ensure the ceiling treatment always peeks
        // into frame even when the scrolling atlas cells fall between repeats.
        this.drawAtlasCell("overhead-rocks", this.currentLevelIndex + 1, -58, -18, 315, 126, {
          alpha: .84, filter: "brightness(.6) saturate(.72)"
        });
        this.drawAtlasCell("overhead-rocks", this.currentLevelIndex + 3, VIEW_W - 286, -14, 344, 132, {
          alpha: .8, flip: true, filter: "brightness(.58) saturate(.7)"
        });
      }
      const fogY = baseY - (depth === 0 ? 70 : depth === 1 ? 48 : 26);
      const fogW = depth === 0 ? 560 : 650;
      const fogOffset = (this.camera.x * style.parallax * .35) % fogW;
      for (let x = -fogOffset - fogW; x < VIEW_W + fogW; x += fogW) {
        this.drawAtlasCell("ground-mist", depth + this.currentLevelIndex, x, fogY, fogW, 92 + depth * 10, {
          alpha: depth === 0 ? .22 : depth === 1 ? .17 : .12,
          flip: Math.floor(x / fogW) % 2 === 0,
          filter: "saturate(.55) brightness(.9)"
        });
      }
    }

    drawScenery(depth) {
      this.drawEnvironmentDepth(depth);
      for (const decoration of this.level.decorations) {
        if (decoration.depth === depth && !decoration.front) this.drawDecoration(decoration);
      }
    }

    drawDecoration(decoration) {
      const ctx = this.ctx;
      const r = this.visualRect(decoration);
      if (r.x + r.w < -180 || r.x > VIEW_W + 180) return;
      const style = DEPTH_STYLE[decoration.depth];
      const dark = decoration.depth === 0 ? "#1b3043" : decoration.depth === 1 ? "#2f2b43" : "#382738";
      const metal = decoration.depth === 0 ? "#45697d" : decoration.depth === 1 ? "#655b7d" : "#795269";
      const pulse = 0.55 + Math.sin(this.elapsed * 3.2 + decoration.x * 0.01) * 0.28;
      ctx.save();
      ctx.translate(r.x, r.y);

      // The old horizontal pipe decorations read as platforms but had no collision.
      // Remove them; root-covered silhouettes now appear only on real platforms.
      if (decoration.type === "pipe") {
        ctx.restore();
        return;
      }

      const seed = Math.abs(Math.floor(decoration.x / 37) + decoration.depth * 13 + (decoration.variant || 0));
      const atlasStyle = decoration.depth === 0
        ? { alpha: .54, filter: "saturate(.68) brightness(.62)" }
        : decoration.depth === 1
          ? { alpha: .72, filter: "saturate(.78) brightness(.72)" }
          : { alpha: .82, filter: "saturate(.82) brightness(.68)" };
      let atlasName = "ruins";
      let drawX = 0;
      let drawY = 0;
      let drawW = r.w;
      let drawH = r.h;
      if (["cable", "hanging"].includes(decoration.type)) atlasName = "hanging-growth";
      else if (decoration.type === "crystal") atlasName = seed % 2 ? "rare-plants" : "ground-foliage";
      else if (["tower", "beam", "piston"].includes(decoration.type)) atlasName = seed % 3 === 0 ? "walls-cliffs" : "ruins";
      else if (["gear", "turbine", "rotor", "reactor", "machinery", "panel", "vent"].includes(decoration.type)) atlasName = seed % 3 === 0 ? "arches" : "ruins";
      else atlasName = seed % 2 ? "rubble" : "rocks";
      if (["crystal", "panel", "vent"].includes(decoration.type)) {
        drawY = r.h * .34;
        drawH = r.h * .66;
      }
      const drewAtlas = this.drawAtlasCell(atlasName, seed, drawX, drawY, drawW, drawH, {
        ...atlasStyle,
        flip: seed % 2 === 0
      });
      if (drewAtlas) {
        ctx.restore();
        return;
      }

      // Legacy decoration labels now drive a coherent ruin vocabulary without changing layout data.
      if (["cable", "hanging", "pipe"].includes(decoration.type)) {
        ctx.strokeStyle = decoration.depth === 2 ? "rgba(20,14,27,.82)" : "rgba(52,60,77,.58)";
        ctx.lineWidth = Math.max(2, (2.5 + decoration.depth) * r.scale);
        for (let vine = 0; vine < 3; vine += 1) {
          ctx.beginPath();
          ctx.moveTo(r.w * (.12 + vine * .32), 0);
          ctx.bezierCurveTo(r.w * (.08 + vine * .28), r.h * .32, r.w * (.28 + vine * .22), r.h * .62, r.w * (.14 + vine * .31), r.h);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(149,116,187,${.12 + pulse * .12})`;
        for (let leaf = 0; leaf < 7; leaf += 1) {
          const lx = r.w * (.12 + ((leaf * 37) % 76) / 100);
          const ly = r.h * (.15 + leaf * .11);
          ctx.beginPath(); ctx.ellipse(lx, ly, 4*r.scale, 2*r.scale, leaf*.7, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (decoration.type === "crystal") {
        ctx.fillStyle = dark;
        ctx.fillRect(r.w*.34, r.h*.18, r.w*.32, r.h*.82);
        ctx.fillStyle = `rgba(173,140,255,${.34 + pulse*.28})`;
        for (let bloom = 0; bloom < 9; bloom += 1) {
          const bx = r.w * (.12 + ((bloom * 29) % 78) / 100);
          const by = r.h * (.56 + ((bloom * 17) % 32) / 100);
          ctx.beginPath(); ctx.arc(bx, by, Math.max(2, 3.2*r.scale), 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (["tower", "beam", "piston"].includes(decoration.type)) {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(r.w*.18,r.h); ctx.lineTo(r.w*.23,r.h*.08); ctx.lineTo(r.w*.42,0); ctx.lineTo(r.w*.58,r.h*.07); ctx.lineTo(r.w*.78,r.h*.02); ctx.lineTo(r.w*.82,r.h); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = metal; ctx.lineWidth = Math.max(1,r.scale*1.4);
        for(let y=r.h*.2;y<r.h;y+=Math.max(18,r.h*.19)){ctx.beginPath();ctx.moveTo(r.w*.22,y);ctx.lineTo(r.w*.8,y+r.scale*2);ctx.stroke();}
        ctx.restore();
        return;
      }
      if (["gear", "turbine", "rotor", "reactor", "machinery", "panel", "vent"].includes(decoration.type)) {
        ctx.strokeStyle = dark;
        ctx.lineWidth = Math.max(10, r.w*.09);
        ctx.beginPath();
        ctx.moveTo(r.w*.08,r.h); ctx.lineTo(r.w*.08,r.h*.46);
        ctx.arc(r.w*.5,r.h*.46,r.w*.42,Math.PI,0);
        ctx.lineTo(r.w*.92,r.h); ctx.stroke();
        ctx.strokeStyle = metal; ctx.lineWidth = Math.max(1.5,r.scale*2);
        ctx.beginPath(); ctx.moveTo(r.w*.08,r.h); ctx.lineTo(r.w*.08,r.h*.46); ctx.arc(r.w*.5,r.h*.46,r.w*.42,Math.PI,0); ctx.lineTo(r.w*.92,r.h); ctx.stroke();
        ctx.fillStyle = `rgba(173,140,255,${.08 + pulse*.08})`;
        ctx.fillRect(r.w*.12,r.h*.78,r.w*.76,Math.max(2,3*r.scale));
        ctx.restore();
        return;
      }

      if (decoration.type === "tower") {
        ctx.fillStyle = dark;
        ctx.fillRect(r.w * 0.18, 0, r.w * 0.64, r.h);
        ctx.fillStyle = metal;
        for (let y = r.h * 0.12; y < r.h; y += r.h * 0.19) ctx.fillRect(r.w * 0.08, y, r.w * 0.84, r.h * 0.035);
        ctx.fillStyle = `rgba(92,225,230,${0.12 + pulse * 0.18})`;
        for (let y = r.h * 0.20; y < r.h * 0.86; y += r.h * 0.23) ctx.fillRect(r.w * 0.40, y, r.w * 0.18, r.h * 0.045);
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(r.w * 0.18, 0);
        ctx.lineTo(r.w * 0.5, -r.h * 0.13);
        ctx.lineTo(r.w * 0.82, 0);
        ctx.fill();
      } else if (decoration.type === "pipe") {
        ctx.strokeStyle = dark;
        ctx.lineWidth = Math.max(8, r.h * 0.22);
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(0, r.h * 0.24);
        ctx.lineTo(r.w * 0.42, r.h * 0.24);
        ctx.lineTo(r.w * 0.42, r.h * 0.76);
        ctx.lineTo(r.w, r.h * 0.76);
        ctx.stroke();
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(3, r.h * 0.07);
        ctx.stroke();
        ctx.fillStyle = style.glow;
        [0.16, 0.68].forEach(position => ctx.fillRect(r.w * position, r.h * 0.14, r.w * 0.035, r.h * 0.20));
      } else if (decoration.type === "cable") {
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(2, 3 * r.scale);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(r.w * 0.18, r.h * 0.9, r.w * 0.72, r.h * 0.12, r.w, r.h * 0.82);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.08 + pulse * 0.06})`;
        ctx.lineWidth = Math.max(1, r.scale);
        ctx.stroke();
      } else if (decoration.type === "panel" || decoration.type === "vent") {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(r.w * 0.08, 0);
        ctx.lineTo(r.w, r.h * 0.08);
        ctx.lineTo(r.w * 0.93, r.h);
        ctx.lineTo(0, r.h * 0.82);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(2, r.scale * 2);
        ctx.stroke();
        ctx.fillStyle = metal;
        if (decoration.type === "vent") {
          for (let y = r.h * 0.2; y < r.h * 0.78; y += r.h * 0.14) ctx.fillRect(r.w * 0.18, y, r.w * 0.64, r.h * 0.045);
        } else {
          ctx.fillRect(r.w * 0.18, r.h * 0.24, r.w * 0.26, r.h * 0.18);
          ctx.fillRect(r.w * 0.56, r.h * 0.24, r.w * 0.25, r.h * 0.18);
          ctx.fillStyle = style.glow;
          ctx.fillRect(r.w * 0.18, r.h * 0.62, r.w * 0.12, r.h * 0.07);
        }
      } else if (decoration.type === "beam") {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(0, r.h);
        ctx.lineTo(r.w * 0.24, r.h);
        ctx.lineTo(r.w, 0);
        ctx.lineTo(r.w * 0.76, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(4, r.w * 0.08);
        ctx.stroke();
      } else if (decoration.type === "machinery" || decoration.type === "piston" || decoration.type === "reactor") {
        const pump = Math.sin(this.elapsed * 2.8 + decoration.variant) * r.h * 0.06;
        ctx.fillStyle = dark;
        ctx.fillRect(r.w * 0.08, r.h * 0.22, r.w * 0.84, r.h * 0.78);
        ctx.fillStyle = metal;
        ctx.fillRect(0, r.h * 0.33, r.w, r.h * 0.16);
        ctx.fillRect(r.w * 0.18, r.h * 0.04 + pump, r.w * 0.18, r.h * 0.36);
        ctx.fillRect(r.w * 0.64, r.h * 0.04 - pump, r.w * 0.18, r.h * 0.36);
        ctx.fillStyle = style.glow;
        ctx.fillRect(r.w * 0.22, r.h * 0.58, r.w * 0.56, r.h * 0.10);
        ctx.fillStyle = `rgba(255,255,255,${0.12 + pulse * 0.18})`;
        ctx.fillRect(r.w * 0.32, r.h * 0.60, r.w * 0.12, r.h * 0.055);
      } else if (decoration.type === "crystal") {
        ctx.shadowColor = style.glow;
        ctx.shadowBlur = 18;
        ctx.fillStyle = style.glow;
        const sway = 0;
        ctx.beginPath();
        ctx.moveTo(r.w * 0.52 + sway, 0);
        ctx.lineTo(r.w, r.h * 0.72);
        ctx.lineTo(r.w * 0.66, r.h);
        ctx.lineTo(r.w * 0.18, r.h * 0.80);
        ctx.lineTo(0, r.h * 0.34);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.35)";
        ctx.fillRect(r.w * 0.50 + sway, r.h * 0.18, r.w * 0.08, r.h * 0.48);
      } else if (decoration.type === "ruin") {
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(0, r.h);
        ctx.lineTo(0, r.h * 0.32);
        ctx.lineTo(r.w * 0.18, r.h * 0.12);
        ctx.lineTo(r.w * 0.35, r.h * 0.40);
        ctx.lineTo(r.w * 0.56, 0);
        ctx.lineTo(r.w * 0.73, r.h * 0.48);
        ctx.lineTo(r.w, r.h * 0.28);
        ctx.lineTo(r.w, r.h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(3, r.scale * 4);
        ctx.beginPath();
        ctx.moveTo(r.w * 0.12, r.h * 0.7);
        ctx.lineTo(r.w * 0.83, r.h * 0.48);
        ctx.stroke();
      } else if (decoration.type === "vegetation") {
        const sway = 0;
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(3, r.scale * 4);
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.moveTo(r.w * (0.18 + i * 0.2), r.h);
          ctx.quadraticCurveTo(r.w * (0.2 + i * 0.2) + sway, r.h * 0.55, r.w * (0.1 + i * 0.24) + sway, r.h * (0.08 + (i % 2) * 0.18));
          ctx.stroke();
        }
        ctx.fillStyle = style.glow;
        ctx.globalAlpha *= 0.46;
        for (let i = 0; i < 4; i += 1) ctx.fillRect(r.w * (0.06 + i * 0.24) + sway, r.h * (0.18 + (i % 2) * 0.2), r.w * 0.23, r.h * 0.09);
      } else if (decoration.type === "hanging") {
        const swing = 0;
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(2, r.scale * 3);
        ctx.beginPath();
        ctx.moveTo(r.w * 0.5, 0);
        ctx.lineTo(r.w * 0.5 + swing, r.h * 0.76);
        ctx.stroke();
        ctx.fillStyle = dark;
        ctx.fillRect(r.w * 0.18 + swing, r.h * 0.72, r.w * 0.64, r.h * 0.23);
        ctx.fillStyle = style.glow;
        ctx.fillRect(r.w * 0.35 + swing, r.h * 0.78, r.w * 0.30, r.h * 0.08);
      } else if (decoration.type === "warning") {
        ctx.fillStyle = dark;
        ctx.fillRect(r.w * 0.32, r.h * 0.35, r.w * 0.36, r.h * 0.65);
        ctx.shadowColor = "#ffbc58";
        ctx.shadowBlur = 13 * pulse;
        ctx.fillStyle = `rgba(255,188,88,${pulse})`;
        ctx.fillRect(0, 0, r.w, r.h * 0.42);
      } else if (["gear", "turbine", "rotor"].includes(decoration.type)) {
        ctx.translate(r.w * 0.5, r.h * 0.5);
        const rotation = this.elapsed * (decoration.type === "rotor" ? -0.42 : 0.28);
        ctx.rotate(rotation);
        ctx.strokeStyle = dark;
        ctx.lineWidth = Math.max(10, r.w * 0.12);
        ctx.beginPath();
        ctx.arc(0, 0, r.w * 0.33, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = metal;
        ctx.lineWidth = Math.max(3, r.w * 0.035);
        ctx.stroke();
        ctx.fillStyle = dark;
        for (let i = 0; i < 8; i += 1) {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-r.w * 0.055, -r.h * 0.49, r.w * 0.11, r.h * 0.30);
        }
        ctx.fillStyle = style.glow;
        ctx.globalAlpha *= decoration.type === "rotor" ? 0.28 : 0.65;
        ctx.beginPath();
        ctx.arc(0, 0, r.w * 0.10 + pulse * r.w * 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawForegroundOccluders() {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = 0.56 + (this.player.depth === 2 ? 0.12 : 0);
      for (const decoration of this.level.decorations) if (decoration.front) this.drawDecoration(decoration);
      ctx.restore();
      const spacing = 640;
      const drift = this.camera.x * 1.28;
      const first = Math.floor(drift / spacing) - 1;
      for (let index = first; index < first + 5; index += 1) {
        const seed = Math.abs(index * 23 + this.currentLevelIndex * 5);
        const x = index * spacing - drift + (seed % 120) - 110;
        const h = 255 + seed % 90;
        this.drawAtlasCell("trees-foreground", seed, x, FLOOR_Y - h + 105, 215 + seed % 80, h, {
          alpha: this.player.depth === 2 ? .42 : .3,
          flip: seed % 2 === 0,
          filter: "saturate(.58) brightness(.42)"
        });
      }
      const fogWidth = 640;
      const fogOffset = (this.camera.x * .22) % fogWidth;
      for (let x = -fogOffset - fogWidth; x < VIEW_W + fogWidth; x += fogWidth) {
        this.drawAtlasCell("foreground-fog", this.currentLevelIndex + Math.floor(x / fogWidth), x, 335, fogWidth, 205, {
          alpha: .075,
          flip: Math.floor(x / fogWidth) % 2 === 0,
          filter: "saturate(.45) brightness(.85)"
        });
      }
    }

    drawParticle(particle) {
      const ctx = this.ctx;
      const r = this.visualRect({ ...particle, w: particle.size, h: particle.size });
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      if (particle.shape === "streak") {
        ctx.translate(r.x + r.w * 0.5, r.y + r.h * 0.5);
        ctx.rotate(Math.atan2(particle.vy, particle.vx));
        ctx.fillRect(-r.w * 1.8, -r.h * 0.5, r.w * 3.6, r.h);
      } else {
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      ctx.restore();
    }

    drawGameplayLayer(depth) {
      const ctx = this.ctx;
      const platforms = this.level.platforms.filter(platform => platform.depth === depth);
      for (const platform of platforms) this.drawPlatform(platform);
      for (const transition of this.level.transitions) if (transition.sourceDepth === depth) this.drawTransitionDevice(transition);
      for (const hazard of this.level.hazards) if (hazard.depth === depth) this.drawHazard(hazard);
      for (const checkpoint of this.level.checkpoints) if (checkpoint.depth === depth) this.drawCheckpoint(checkpoint);
      for (const item of this.level.collectibles) if (item.depth === depth && !item.collected) this.drawCollectible(item);
      for (const particle of this.particles) if (particle.depth === depth) this.drawParticle(particle);
      for (const projectile of this.projectiles) if (projectile.depth === depth) this.drawProjectile(projectile);
      for (const enemy of this.level.enemies) if (enemy.depth === depth && !enemy.dead) this.drawEnemy(enemy);
      if (this.level.goal.depth === depth) this.drawGoal(this.level.goal);
      if (this.player.depth === depth && this.state !== STATE.TRANSITION) this.drawPlayer(this.player, depth, this.state === STATE.PLAYER_DEAD);

    }

    platformCollisionBounds(platform) {
      const style = this.depthMetrics(platform.depth);
      return {
        x: platform.x - this.camera.x * style.parallax,
        y: FLOOR_Y + style.yOffset - (FLOOR_Y - platform.y) * style.scale + this.camera.verticalOffset,
        w: platform.w,
        h: platform.h * style.scale,
        scale: style.scale
      };
    }

    platformRenderBounds(platform) {
      const collision = this.platformCollisionBounds(platform);
      const minimumBody = platform.depth === 0 && platform.kind !== "wall" ? 14 : 10;
      return { ...collision, h: Math.max(collision.h, minimumBody) };
    }

    platformHasVisibleBase(platform) {
      if (!platform) return false;
      const collision = this.platformCollisionBounds(platform);
      const rendered = this.platformRenderBounds(platform);
      return rendered.w >= 1 && rendered.h >= 10 &&
        Math.abs(rendered.x - collision.x) < 0.01 &&
        Math.abs(rendered.y - collision.y) < 0.01 &&
        Math.abs(rendered.w - collision.w) < 0.01;
    }

    drawPlatformSupports(depth) {
      const ctx = this.ctx;
      const depthFloor = FLOOR_Y + DEPTH_STYLE[depth].yOffset + this.camera.verticalOffset;
      const stoneTones = [
        ["rgba(45,57,61,.84)", "rgba(16,23,27,.72)"],
        ["rgba(68,72,72,.9)", "rgba(22,27,29,.78)"],
        ["rgba(69,66,67,.88)", "rgba(23,22,25,.76)"]
      ][depth];
      for (const platform of this.level.platforms) {
        if (platform.depth !== depth || platform.kind === "wall" || platform.kind === "ceiling") continue;
        if (platform.y + platform.h >= FLOOR_Y - 18) continue;
        const r = this.platformRenderBounds(platform);
        if (r.x + r.w < -100 || r.x > VIEW_W + 100) continue;
        const top = r.y + Math.max(r.h, 8 * r.scale);
        const ground = depthFloor + 42 * r.scale;
        const height = ground - top;
        if (height < 42) continue;
        const seed = Math.abs(Math.floor(platform.x / 47) + depth * 19 + Math.floor(platform.y / 31));
        const wide = r.w >= 285;
        const medium = r.w >= 170;
        const columnWidth = clamp(r.w * (wide ? .17 : medium ? .28 : .48), 34 * r.scale, 76 * r.scale);
        const positions = wide ? [.24, .76] : [.5];

        ctx.save();
        if (wide) {
          const left = r.x + r.w * positions[0];
          const right = r.x + r.w * positions[1];
          const archHeight = Math.min(72 * r.scale, height * .34);
          ctx.strokeStyle = stoneTones[0];
          ctx.lineWidth = Math.max(9, 13 * r.scale);
          ctx.beginPath();
          ctx.moveTo(left, top + archHeight);
          ctx.lineTo(left, top + archHeight * .58);
          ctx.bezierCurveTo(left, top + 2, right, top + 2, right, top + archHeight * .58);
          ctx.lineTo(right, top + archHeight);
          ctx.stroke();
          ctx.strokeStyle = "rgba(153,163,157,.18)";
          ctx.lineWidth = Math.max(1, 1.5 * r.scale);
          ctx.stroke();
        }

        for (let index = 0; index < positions.length; index += 1) {
          const center = r.x + r.w * positions[index];
          const lean = ((seed + index * 7) % 5 - 2) * 2 * r.scale;
          const baseWidth = columnWidth * (medium ? 1.18 : 1.38);
          const column = ctx.createLinearGradient(0, top, 0, ground);
          column.addColorStop(0, stoneTones[0]);
          column.addColorStop(.76, stoneTones[1]);
          column.addColorStop(.9, stoneTones[1]);
          column.addColorStop(1, "rgba(12,18,22,0)");
          ctx.fillStyle = column;
          ctx.beginPath();
          ctx.moveTo(center - columnWidth * .5, top - 3 * r.scale);
          ctx.lineTo(center + columnWidth * .5, top - 3 * r.scale);
          ctx.lineTo(center + baseWidth * .5 + lean, ground);
          ctx.lineTo(center - baseWidth * .5 + lean, ground);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "rgba(9,13,16,.34)";
          ctx.lineWidth = Math.max(1, r.scale);
          const jointStep = Math.max(28, 42 * r.scale);
          for (let y = top + jointStep; y < depthFloor + 4; y += jointStep) {
            const t = clamp((y - top) / height, 0, 1);
            const half = lerp(columnWidth, baseWidth, t) * .48;
            ctx.beginPath();
            ctx.moveTo(center - half + lean * t, y);
            ctx.lineTo(center + half + lean * t, y + ((seed + Math.floor(y)) % 3 - 1) * r.scale);
            ctx.stroke();
          }
          ctx.strokeStyle = "rgba(158,166,154,.12)";
          ctx.beginPath();
          ctx.moveTo(center - columnWidth * .18, top + 8 * r.scale);
          ctx.lineTo(center - baseWidth * .12 + lean, depthFloor + 16 * r.scale);
          ctx.stroke();
        }

        const baseMist = ctx.createRadialGradient(r.x + r.w * .5, depthFloor, 0, r.x + r.w * .5, depthFloor, Math.max(70, r.w * .48));
        baseMist.addColorStop(0, "rgba(150,171,184,.2)");
        baseMist.addColorStop(1, "rgba(150,171,184,0)");
        ctx.fillStyle = baseMist;
        ctx.beginPath();
        ctx.ellipse(r.x + r.w * .5, depthFloor + 8, Math.max(65, r.w * .46), 28 * r.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawPlatformBase(platform, emphasis = false) {
      const ctx = this.ctx;
      const r = this.platformRenderBounds(platform);
      if (r.x + r.w < -80 || r.x > VIEW_W + 80) return r;
      const seed = Math.abs(Math.floor(platform.x / 47) + platform.depth * 19 + Math.floor(platform.y / 31));
      const elevated = platform.kind !== "wall" && platform.kind !== "ceiling" && platform.y + platform.h < FLOOR_Y - 18;
      const isolated = elevated || (platform.kind !== "floor" && platform.kind !== "wall");
      const active = Math.round(this.activeVisualDepth()) === platform.depth;
      const palette = [
        { body: "#38454a", lower: "#151d20", top: "#788989", edge: "#56686a", moss: "#617363" },
        { body: "#41464a", lower: "#1b1e20", top: "#888d87", edge: "#626962", moss: "#6f7a67" },
        { body: "#3d3d3f", lower: "#171719", top: "#807b7d", edge: "#625e60", moss: "#746c63" }
      ][platform.depth];
      const topHeight = Math.max(platform.depth === 0 ? 5 : 4, Math.round((active || emphasis ? 7 : 5) * r.scale));
      ctx.save();
      // Platform depth is communicated by scale, contrast, and parallax. The old
      // depth-coloured shadow produced purple rectangular backings on tall ruins.
      ctx.shadowColor = "rgba(3,7,10,.72)";
      ctx.shadowBlur = emphasis ? 6 : active ? 2 : 0;
      const stone = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
      stone.addColorStop(0, palette.body);
      stone.addColorStop(.58, palette.body);
      stone.addColorStop(1, palette.lower);
      ctx.fillStyle = stone;
      ctx.beginPath();
      ctx.moveTo(Math.floor(r.x), Math.floor(r.y + topHeight * .35));
      for (let x = 0; x <= r.w; x += Math.max(22, 34 * r.scale)) {
        const chip = ((Math.floor((platform.x + x) / 23) * 17) % 7) * r.scale;
        ctx.lineTo(Math.floor(r.x + x), Math.floor(r.y + chip * .38));
      }
      ctx.lineTo(Math.ceil(r.x + r.w), Math.ceil(r.y + r.h));
      ctx.lineTo(Math.floor(r.x), Math.ceil(r.y + r.h));
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = palette.top;
      ctx.fillRect(Math.floor(r.x), Math.floor(r.y), Math.ceil(r.w), Math.ceil(Math.max(2, topHeight * .42)));
      ctx.fillStyle = palette.moss;
      for (let x = r.x + 8; x < r.x + r.w - 4; x += 31 + ((x + platform.x) % 17)) {
        const tuft = 2 + ((x * 7 + platform.x) % 5);
        ctx.fillRect(Math.floor(x), Math.floor(r.y - tuft * r.scale), Math.max(2, Math.ceil(3 * r.scale)), Math.ceil(tuft * r.scale));
      }
      ctx.strokeStyle = "rgba(7,8,18,.38)";
      ctx.lineWidth = Math.max(1, r.scale);
      const blockW = Math.max(28, 44 * r.scale);
      for (let x = r.x + blockW; x < r.x + r.w; x += blockW) {
        ctx.beginPath();
        ctx.moveTo(Math.floor(x), Math.floor(r.y + topHeight));
        ctx.lineTo(Math.floor(x - 3 * r.scale), Math.floor(r.y + Math.min(r.h, 14 * r.scale)));
        ctx.lineTo(Math.floor(x + 2 * r.scale), Math.floor(r.y + Math.min(r.h, 26 * r.scale)));
        ctx.stroke();
      }
      ctx.strokeStyle = emphasis ? DEPTH_STYLE[platform.depth].glow : palette.edge;
      ctx.lineWidth = emphasis ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(Math.floor(r.x), Math.floor(r.y + 1));
      ctx.lineTo(Math.ceil(r.x + r.w), Math.floor(r.y + 1));
      ctx.stroke();
      if (!emphasis) {
        if (platform.kind === "wall") {
          this.drawAtlasCell("walls-cliffs", seed, r.x - 8 * r.scale, r.y - 5 * r.scale, r.w + 16 * r.scale, Math.max(r.h, 125 * r.scale), {
            alpha: .96,
            flip: seed % 2 === 0,
            filter: platform.depth === 0 ? "saturate(.72) brightness(.7)" : "saturate(.85) brightness(.82)"
          });
        } else {
          const natural = seed % 3 === 0 || (platform.w >= 420 && platform.kind !== "floor");
          const faceName = natural ? "natural-platforms" : "platform-faces";
          const faceHeight = Math.max(r.h, platform.kind === "floor" ? 82 * r.scale : 46 * r.scale);
          const tileTarget = natural ? 340 : 285;
          const tileCount = Math.max(1, Math.ceil(r.w / tileTarget));
          const tileW = r.w / tileCount + 1;
          for (let tile = 0; tile < tileCount; tile += 1) {
            this.drawAtlasCell(faceName, seed + tile, r.x + tile * tileW, r.y - 2 * r.scale, tileW + 1, faceHeight, {
              alpha: .97,
              flip: (seed + tile) % 2 === 0,
              filter: platform.depth === 0 ? "saturate(.72) brightness(.72)" : platform.depth === 1 ? "saturate(.86) brightness(.84)" : "saturate(.88) brightness(.79)"
            });
          }
          const topH = clamp(24 * r.scale, 18, 36);
          for (let tile = 0; tile < tileCount; tile += 1) {
            this.drawAtlasCell("platform-tops", seed + tile, r.x + tile * tileW, r.y - topH * .42, tileW + 1, topH, {
              alpha: .98,
              flip: (seed + tile) % 2 === 1,
              filter: platform.depth === 0 ? "saturate(.72) brightness(.76)" : "saturate(.9) brightness(.9)"
            });
          }
          if (isolated && r.w > 95) {
            const edgeW = clamp(34 * r.scale, 24, 47);
            const edgeH = clamp(54 * r.scale, 38, 72);
            this.drawAtlasCell("platform-edges", seed, r.x - edgeW * .24, r.y - 5, edgeW, edgeH, { alpha: .92, filter: "brightness(.79)" });
            this.drawAtlasCell("platform-edges", seed + 1, r.x + r.w - edgeW * .76, r.y - 5, edgeW, edgeH, { alpha: .92, flip: true, filter: "brightness(.79)" });
          }
          const arcade = !elevated && platform.kind === "floor" && r.h >= 55 && r.w >= 500;
          if (arcade) {
            const bayCount = clamp(Math.floor(r.w / 330), 1, 5);
            const baySpacing = r.w / (bayCount + 1);
            for (let bay = 0; bay < bayCount; bay += 1) {
              const archW = clamp(150 * r.scale, 105, 190);
              const archH = clamp(82 * r.scale, 62, 104);
              const archX = r.x + baySpacing * (bay + 1) - archW * .5;
              const archY = r.y + 8 * r.scale;
              ctx.fillStyle = "rgba(3,7,9,.72)";
              ctx.beginPath();
              ctx.moveTo(archX + archW * .2, archY + archH);
              ctx.lineTo(archX + archW * .2, archY + archH * .48);
              ctx.arc(archX + archW * .5, archY + archH * .48, archW * .3, Math.PI, 0);
              ctx.lineTo(archX + archW * .8, archY + archH);
              ctx.closePath();
              ctx.fill();
              this.drawAtlasCell("arches", seed + bay, archX, archY, archW, archH, {
                alpha: platform.depth === 0 ? .66 : .84,
                flip: (seed + bay) % 2 === 0,
                filter: "saturate(.72) brightness(.72)"
              });
            }
          }
          if (isolated && seed % 3 !== 2) {
            const rootW = Math.min(r.w * .82, 230 * r.scale);
            this.drawAtlasCell("under-platform-roots", seed, r.x + (r.w - rootW) * .5, r.y + Math.max(8, r.h * .26), rootW, clamp(88 * r.scale, 60, 122), {
              alpha: .86,
              flip: seed % 2 === 0,
              filter: "saturate(.74) brightness(.7)"
            });
          }
          if (r.w > 145) {
            const clusterCount = clamp(Math.ceil(r.w / (platform.kind === "floor" ? 120 : 145)) + (seed % 2), 2, 12);
            const spacing = r.w / (clusterCount + 1);
            for (let cluster = 0; cluster < clusterCount; cluster += 1) {
              const clusterSeed = seed + cluster * 5;
              const foliageW = clamp((78 + clusterSeed % 68) * r.scale, 54, 152);
              const foliageH = clamp((29 + clusterSeed % 31) * r.scale, 21, 60);
              const foliageX = r.x + spacing * (cluster + 1) - foliageW * .5;
              this.drawAtlasCell(clusterSeed % 11 === 0 ? "rare-plants" : clusterSeed % 4 === 0 ? "shrubs" : "ground-foliage", clusterSeed, foliageX, r.y - foliageH * .72, foliageW, foliageH, {
                alpha: platform.depth === 0 ? .78 : .94,
                flip: clusterSeed % 2 === 0,
                filter: platform.depth === 0 ? "saturate(.76) brightness(.7)" : "saturate(.98) brightness(.86)"
              });
            }
          }
        }
      }
      ctx.restore();
      return r;
    }

    drawGroundSupportEmphasis() {
      // Platforms remain visually static when landed on. Landing feedback belongs
      // to the player animation and dust particles, not the supporting geometry.
      return;
    }

    drawPlatform(platform) {
      const ctx = this.ctx;
      const r = this.drawPlatformBase(platform);
      if (r.x + r.w < -80 || r.x > VIEW_W + 80) return;
      const step = 42 * r.scale;
      ctx.save();
      // Keep a few quiet stone cracks, but no industrial bands, hazard strips,
      // or geometric cut-outs from Phase Shift Foundry.
      for (let x = r.x + 14 * r.scale; x < r.x + r.w - 5; x += step) {
        const detailY = Math.min(r.y + r.h - 5 * r.scale, r.y + 11 * r.scale);
        ctx.beginPath();
        ctx.moveTo(Math.floor(x), Math.floor(detailY));
        ctx.lineTo(Math.floor(x + 8 * r.scale), Math.floor(detailY + 3 * r.scale));
        ctx.lineTo(Math.floor(x + 14 * r.scale), Math.floor(detailY));
        ctx.strokeStyle = "rgba(4,5,15,.42)";
        ctx.lineWidth = Math.max(1, r.scale * 1.5);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawTransitionDevice(device) {
      const ctx = this.ctx;
      const r = this.visualRect({ x: device.x, y: device.y, w: device.w, h: device.h, depth: device.sourceDepth });
      if (r.x + r.w < -60 || r.x > VIEW_W + 60) return;
      const style = DEPTH_STYLE[device.targetDepth];
      const baseY = r.y + r.h + 1 * r.scale;
      const centerX = r.x + r.w * .5;
      const gap = clamp(76 * r.scale, 56, 92);
      const totemH = clamp(34 * r.scale, 25, 43);
      const totemW = clamp(18 * r.scale, 13, 23);
      const pulse = .62 + Math.sin(this.elapsed * 3.4 + device.x * .01) * .16;
      const activeAlpha = device.sourceDepth === this.player.depth ? .88 : .4;

      ctx.save();
      ctx.globalAlpha = activeAlpha;

      // A soft energy field marks the traversable space without forming a door.
      const groundGlow = ctx.createRadialGradient(centerX, baseY - 4, 0, centerX, baseY - 4, gap * .82);
      groundGlow.addColorStop(0, `${style.glow}70`);
      groundGlow.addColorStop(.46, `${style.glow}2e`);
      groundGlow.addColorStop(1, `${style.glow}00`);
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(centerX, baseY - 2, gap * .82, 12 * r.scale, 0, 0, Math.PI * 2);
      ctx.fill();

      for (const side of [-1, 1]) {
        const x = centerX + side * gap * .5;
        const lean = side * 2 * r.scale;
        const stone = ctx.createLinearGradient(x - totemW, 0, x + totemW, 0);
        stone.addColorStop(0, "#1b2326");
        stone.addColorStop(.48, "#697273");
        stone.addColorStop(1, "#20272a");
        ctx.fillStyle = stone;
        ctx.strokeStyle = "rgba(5,9,11,.78)";
        ctx.lineWidth = Math.max(1, r.scale);
        ctx.beginPath();
        ctx.moveTo(x - totemW * .62, baseY);
        ctx.lineTo(x - totemW * .48 + lean, baseY - totemH * .84);
        ctx.lineTo(x - totemW * .16, baseY - totemH);
        ctx.lineTo(x + totemW * .42, baseY - totemH * .91);
        ctx.lineTo(x + totemW * .62, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(166,177,169,.2)";
        ctx.beginPath();
        ctx.moveTo(x - totemW * .12, baseY - totemH * .82);
        ctx.lineTo(x - totemW * .23, baseY - totemH * .16);
        ctx.stroke();
        ctx.strokeStyle = "rgba(7,11,13,.48)";
        for (let joint = 1; joint < 4; joint += 1) {
          const jy = baseY - totemH * joint / 4;
          ctx.beginPath();
          ctx.moveTo(x - totemW * .42, jy);
          ctx.lineTo(x + totemW * .43, jy + (joint % 2 ? 1 : -1) * r.scale);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(82,101,80,.52)";
        ctx.fillRect(x - totemW * .48, baseY - 4 * r.scale, totemW * .9, Math.max(2, 3 * r.scale));
        ctx.fillStyle = "rgba(172,178,163,.16)";
        ctx.beginPath();
        ctx.moveTo(x - totemW * .42, baseY - totemH * .82);
        ctx.lineTo(x - totemW * .12, baseY - totemH * .91);
        ctx.lineTo(x - totemW * .28, baseY - totemH * .68);
        ctx.closePath();
        ctx.fill();

        // Matching runes make the pair read as one transition marker.
        ctx.shadowColor = style.glow;
        ctx.shadowBlur = 7 * pulse;
        ctx.strokeStyle = style.glow;
        ctx.lineWidth = Math.max(1.5, 2 * r.scale);
        ctx.beginPath();
        ctx.moveTo(x, baseY - totemH * .7);
        ctx.lineTo(x - side * 4 * r.scale, baseY - totemH * .55);
        ctx.lineTo(x, baseY - totemH * .4);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // A broken, flickering ground sigil takes inspiration from a circular
      // ritual marker without becoming a solid platform or doorway.
      const ringRadius = gap * .38;
      ctx.save();
      ctx.translate(centerX, baseY - 2 * r.scale);
      ctx.scale(1, .3);
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 10 * pulse;
      ctx.strokeStyle = `${style.glow}74`;
      ctx.lineWidth = Math.max(1.5, 2.2 * r.scale);
      for (let arc = 0; arc < 4; arc += 1) {
        const start = arc * Math.PI * .5 + Math.sin(this.elapsed * 2.1 + arc) * .08;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius * (arc % 2 ? .72 : 1), start, start + Math.PI * (.28 + (arc % 2) * .12));
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = style.glow;
      ctx.shadowColor = style.glow;
      for (let mote = 0; mote < 9; mote += 1) {
        const angle = mote * Math.PI * 2 / 9 + this.elapsed * (mote % 2 ? .22 : -.16);
        const flicker = .35 + (Math.sin(this.elapsed * (5.2 + mote * .17) + mote * 1.9) + 1) * .32;
        const distance = ringRadius * (.42 + (mote % 3) * .24);
        const mx = centerX + Math.cos(angle) * distance;
        const my = baseY - 3 * r.scale + Math.sin(angle) * distance * .22 - flicker * 5 * r.scale;
        ctx.globalAlpha = activeAlpha * flicker;
        ctx.shadowBlur = 5 + flicker * 7;
        ctx.beginPath();
        ctx.arc(mx, my, Math.max(1, (1.1 + mote % 2) * r.scale), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawLegacyTransitionDevice(device, priority = false) {
      const ctx = this.ctx;
      const r = this.visualRect({ x: device.x, y: device.y, w: device.w, h: device.h, depth: device.sourceDepth });
      if (r.x + r.w < -60 || r.x > VIEW_W + 60) return;
      const style = DEPTH_STYLE[device.targetDepth];
      const pulse = 0.55 + Math.sin(this.elapsed * 6 + device.x) * 0.25;
      const portalW = clamp(78 * r.scale, 54, 96);
      const portalH = clamp(102 * r.scale, 72, 126);
      const portalX = r.x + r.w * .5 - portalW * .5;
      const portalBottom = r.y + r.h + 2 * r.scale;
      const portalY = portalBottom - portalH;
      const centerX = portalX + portalW * .5;
      const archRadius = portalW * .31;
      const archCenterY = portalY + portalW * .39;
      const activeAlpha = device.sourceDepth === this.player.depth ? .72 : .38;

      // A restrained ruin silhouette sits behind the functional threshold.
      this.drawAtlasCell("arches", Math.floor(device.x / 120) + device.targetDepth, portalX - portalW * .18, portalY - portalH * .04, portalW * 1.36, portalH * 1.12, {
        alpha: .18 * activeAlpha,
        flip: device.targetDepth === 0,
        filter: "saturate(.46) brightness(.48)"
      });
      ctx.save();
      ctx.globalAlpha = activeAlpha;

      // Interior darkness and depth-coloured mist.
      ctx.beginPath();
      ctx.moveTo(centerX - archRadius, portalBottom);
      ctx.lineTo(centerX - archRadius, archCenterY);
      ctx.arc(centerX, archCenterY, archRadius, Math.PI, 0);
      ctx.lineTo(centerX + archRadius, portalBottom);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      const interior = ctx.createLinearGradient(0, portalY, 0, portalBottom);
      interior.addColorStop(0, "rgba(2,5,11,.68)");
      interior.addColorStop(.5, `${style.glow}22`);
      interior.addColorStop(1, `${style.glow}58`);
      ctx.fillStyle = interior;
      ctx.fillRect(portalX, portalY, portalW, portalH);
      for (let wisp = 0; wisp < 4; wisp += 1) {
        const offset = (wisp - 1.5) * portalW * .12;
        ctx.strokeStyle = `${style.glow}${wisp % 2 ? "34" : "24"}`;
        ctx.lineWidth = Math.max(1, 1.8 * r.scale);
        ctx.beginPath();
        ctx.moveTo(centerX + offset, portalBottom + 2);
        ctx.bezierCurveTo(
          centerX - offset * .6 + Math.sin(this.elapsed * 1.2 + wisp) * 5,
          portalY + portalH * .7,
          centerX + offset * .4,
          portalY + portalH * .42,
          centerX - offset * .28,
          portalY + portalH * .22
        );
        ctx.stroke();
      }
      ctx.restore();

      // Heavy, uneven stone uprights and a segmented arch replace the mirror frame.
      const stone = ctx.createLinearGradient(portalX, 0, portalX + portalW, 0);
      stone.addColorStop(0, "#252d31");
      stone.addColorStop(.48, "#697071");
      stone.addColorStop(1, "#20272b");
      ctx.fillStyle = stone;
      ctx.strokeStyle = "rgba(5,8,11,.82)";
      ctx.lineWidth = Math.max(1, 1.5 * r.scale);
      for (const side of [-1, 1]) {
        const inner = centerX + side * archRadius;
        const outer = centerX + side * portalW * .48;
        ctx.beginPath();
        ctx.moveTo(inner, archCenterY - 2);
        ctx.lineTo(outer, archCenterY + portalH * .04);
        ctx.lineTo(outer + side * portalW * .035, portalBottom);
        ctx.lineTo(inner - side * portalW * .025, portalBottom);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 7 * pulse;
      ctx.strokeStyle = "#555d5f";
      ctx.lineWidth = Math.max(8, 11 * r.scale);
      ctx.beginPath();
      ctx.arc(centerX, archCenterY, archRadius + 2 * r.scale, Math.PI, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(155,164,158,.38)";
      ctx.lineWidth = Math.max(1.5, 2 * r.scale);
      ctx.stroke();

      // Broken block joints, moss, and a small directional rune.
      ctx.strokeStyle = "rgba(10,14,16,.58)";
      ctx.lineWidth = Math.max(1, r.scale);
      for (let block = 1; block < 5; block += 1) {
        const by = archCenterY + (portalBottom - archCenterY) * block / 5;
        ctx.beginPath();
        ctx.moveTo(portalX + portalW * .08, by);
        ctx.lineTo(portalX + portalW * .25, by + (block % 2 ? 2 : -2));
        ctx.moveTo(portalX + portalW * .75, by + (block % 2 ? -2 : 2));
        ctx.lineTo(portalX + portalW * .92, by);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(83,104,84,.72)";
      ctx.fillRect(portalX + portalW * .08, portalBottom - 5 * r.scale, portalW * .84, Math.max(2, 4 * r.scale));
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 6;
      ctx.fillStyle = style.glow;
      const runeY = portalY + 7 * r.scale;
      ctx.beginPath();
      if (device.targetDepth > device.sourceDepth) {
        ctx.moveTo(centerX, runeY + 10 * r.scale);
        ctx.lineTo(centerX - 7 * r.scale, runeY + 2 * r.scale);
        ctx.lineTo(centerX + 7 * r.scale, runeY + 2 * r.scale);
      } else {
        ctx.moveTo(centerX, runeY + 2 * r.scale);
        ctx.lineTo(centerX - 7 * r.scale, runeY + 10 * r.scale);
        ctx.lineTo(centerX + 7 * r.scale, runeY + 10 * r.scale);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = `bold ${Math.max(7, Math.round(8 * r.scale))}px Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(PLANE_NAMES[device.targetDepth], centerX, portalY - 7 * r.scale);
      ctx.restore();
    }

    drawPriorityTransitionPads() {
      for (const device of this.level.transitions) this.drawTransitionDevice(device, true);
    }

    drawHazard(hazard) {
      const ctx = this.ctx;
      const r = this.visualRect(hazard);
      if (r.x + r.w < -40 || r.x > VIEW_W + 40) return;
      const pulse = .65 + Math.sin(this.elapsed * 8 + hazard.x) * .22;
      ctx.save();
      ctx.fillStyle = "rgba(20,10,26,.92)";
      ctx.fillRect(r.x, r.y, r.w, Math.max(6,r.h));
      ctx.fillStyle = hazard.type === "void" ? "#ad8cff" : hazard.type === "sparks" ? "#82e9ee" : "#e790bd";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12 * pulse;
      const teeth = Math.max(2, Math.floor(r.w / 18));
      for (let i = 0; i < teeth; i += 1) {
        const x = r.x + i * (r.w / teeth);
        ctx.beginPath();
        ctx.moveTo(x, r.y + r.h);
        ctx.lineTo(x + r.w / teeth * .5, r.y - 9 * r.scale);
        ctx.lineTo(x + r.w / teeth, r.y + r.h);
        ctx.fill();
      }
      ctx.restore();
    }

    drawCheckpoint(checkpoint) {
      const ctx = this.ctx;
      const r = this.visualRect(checkpoint);
      if (r.x + r.w < -40 || r.x > VIEW_W + 40) return;
      const color = checkpoint.active ? "#d8c0ff" : "#82e9ee";
      const shrineArt = this.entityArt.relics;
      if (shrineArt?.complete && shrineArt.naturalWidth) {
        const size = 66 * r.scale;
        this.drawGridCell(shrineArt, 2, 2, 3, r.x + r.w * .5 - size * .5, r.y + r.h - size, size, size, {
          alpha: checkpoint.active ? 1 : .88,
          filter: `drop-shadow(0 0 ${checkpoint.active ? 11 : 6}px ${color})`
        });
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.max(7,Math.round(8*r.scale))}px Consolas, monospace`;
        ctx.textAlign = "center";
        ctx.fillText(checkpoint.active ? "REMEMBERED" : "REMEMBER",r.x + r.w*.5,r.y - 8*r.scale);
        ctx.restore();
        return;
      }
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3 * r.scale;
      ctx.shadowColor = color;
      ctx.shadowBlur = checkpoint.active ? 16 : 7;
      ctx.beginPath();
      ctx.moveTo(r.x + r.w * .5,r.y + r.h);
      ctx.lineTo(r.x + r.w * .5,r.y + 13 * r.scale);
      ctx.stroke();
      ctx.fillStyle = "#28233a";
      ctx.beginPath();
      ctx.moveTo(r.x+r.w*.24,r.y+r.h); ctx.lineTo(r.x+r.w*.34,r.y+12*r.scale); ctx.lineTo(r.x+r.w*.5,r.y); ctx.lineTo(r.x+r.w*.67,r.y+12*r.scale); ctx.lineTo(r.x+r.w*.76,r.y+r.h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(r.x+r.w*.5,r.y+11*r.scale,Math.max(3,5*r.scale),0,Math.PI*2); ctx.fill();
      ctx.font = `bold ${Math.max(7,Math.round(8*r.scale))}px Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(checkpoint.active ? "REMEMBERED" : "REMEMBER",r.x + r.w*.5,r.y - 8*r.scale);
      ctx.restore();
    }

    drawCollectible(item) {
      const ctx = this.ctx;
      const bob = Math.sin(this.elapsed * 3.6 + item.phase) * 5;
      const r = this.visualRect({ ...item, y: item.y + bob });
      if (r.x + r.w < -30 || r.x > VIEW_W + 30) return;
      const color = DEPTH_STYLE[item.depth].glow;
      const art = item.kind === "relic" ? this.entityArt.relics : this.entityArt.fragments;
      if (art?.complete && art.naturalWidth) {
        const size = (item.kind === "relic" ? 48 : 31) * r.scale;
        const cell = item.kind === "relic" ? item.depth : Math.abs(Math.floor(item.phase * 17 + item.x / 83)) % 4;
        this.drawGridCell(art, 2, 2, cell, r.x + r.w * .5 - size * .5, r.y + r.h * .5 - size * .5, size, size, {
          alpha: .96,
          filter: `drop-shadow(0 0 ${item.kind === "relic" ? 13 : 8}px ${color})`
        });
        return;
      }
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = item.kind === "relic" ? 22 : 12;
      if (item.kind === "relic") {
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        ctx.rotate(this.elapsed * 0.7);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, r.scale * 2);
        ctx.strokeRect(-r.w * 0.46, -r.h * 0.46, r.w * 0.92, r.h * 0.92);
        ctx.rotate(-this.elapsed * 1.4);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -r.h * 0.38);
        ctx.lineTo(r.w * 0.30, 0);
        ctx.lineTo(0, r.h * 0.38);
        ctx.lineTo(-r.w * 0.30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.78)";
        ctx.fillRect(-2 * r.scale, -8 * r.scale, 4 * r.scale, 10 * r.scale);
        ctx.restore();
        return;
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(r.x + r.w / 2, r.y);
      ctx.lineTo(r.x + r.w, r.y + r.h * 0.38);
      ctx.lineTo(r.x + r.w * 0.72, r.y + r.h);
      ctx.lineTo(r.x + r.w * 0.28, r.y + r.h);
      ctx.lineTo(r.x, r.y + r.h * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.65)";
      ctx.fillRect(r.x + r.w * 0.43, r.y + r.h * 0.2, Math.max(2, r.w * 0.13), r.h * 0.38);
      ctx.restore();
    }

    drawProjectile(projectile) {
      const ctx = this.ctx;
      const r = this.visualRect(projectile);
      const color = this.relicReward ? "#fff3a1" : DEPTH_STYLE[projectile.depth].glow;
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = this.relicReward ? 16 : 11;
      ctx.translate(r.x + r.w * .5, r.y + r.h * .5);
      const vertical = Math.abs(projectile.vy) > Math.abs(projectile.vx);
      ctx.rotate(vertical ? -Math.PI * .5 : projectile.vx < 0 ? Math.PI : 0);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(6, r.w * 1.25), Math.max(3, r.h * .85), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(242,248,255,.9)";
      ctx.lineWidth = Math.max(1, r.scale);
      ctx.beginPath();
      ctx.arc(-r.w * .15, 0, Math.max(2, r.h * .55), -.9, .9);
      ctx.stroke();
      ctx.restore();
    }

    drawGeneratedEnemy(enemy, r, color) {
      const setup = {
        skitter: { art: this.entityArt.rootling, size: 72, fps: 11 },
        brute: { art: this.entityArt.guardian, size: 88, fps: 5.5 },
        sentry: { art: this.entityArt.bat, size: 70, fps: 10 },
        drifter: { art: this.entityArt.moth, size: 72, fps: 7 }
      }[enemy.type];
      if (!setup?.art?.complete || !setup.art.naturalWidth) return false;
      const frame = Math.floor((enemy.time + enemy.spawnX * .0017) * setup.fps) % 8;
      const size = setup.size * r.scale;
      const x = r.x + r.w * .5 - size * .5;
      const y = enemy.flying ? r.y + r.h * .5 - size * .5 : r.y + r.h - size;
      const filter = enemy.hitFlash > 0
        ? `brightness(2.1) saturate(.4) drop-shadow(0 0 8px ${color})`
        : `brightness(1.03) drop-shadow(0 2px 3px rgba(2,3,12,.88))`;
      this.drawGridCell(setup.art, 4, 2, frame, x, y, size, size, {
        alpha: enemy.hitFlash > 0 ? .72 : 1,
        flip: enemy.vx < 0,
        filter
      });
      if (enemy.maxHealth > 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(2,8,10,.78)";
        ctx.fillRect(r.x, r.y - 7, r.w, 3);
        ctx.fillStyle = color;
        ctx.fillRect(r.x, r.y - 7, r.w * (enemy.health / enemy.maxHealth), 3);
        ctx.restore();
      }
      return true;
    }

    drawEnemy(enemy) {
      const ctx = this.ctx;
      const r = this.visualRect(enemy);
      if (r.x + r.w < -40 || r.x > VIEW_W + 40) return;
      const color = DEPTH_STYLE[enemy.depth].glow;
      if (this.drawGeneratedEnemy(enemy, r, color)) return;
      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.scale(Math.sign(enemy.vx), 1);
      if (enemy.hitFlash > 0) ctx.globalAlpha = 0.45;
      if (enemy.type === "skitter") {
        ctx.strokeStyle = "#0b0a12";
        ctx.lineWidth = Math.max(2, r.scale * 2.3);
        for (let i = -1; i <= 1; i += 1) {
          ctx.beginPath();
          ctx.moveTo(i * r.w * .2, 0);
          ctx.lineTo((i * .2 - .16) * r.w, r.h * .42);
          ctx.moveTo(i * r.w * .2, 0);
          ctx.lineTo((i * .2 + .17) * r.w, r.h * .36);
          ctx.stroke();
        }
        const shell = ctx.createRadialGradient(0, -r.h * .12, 1, 0, 0, r.w * .46);
        shell.addColorStop(0, color);
        shell.addColorStop(.28, "#403452");
        shell.addColorStop(1, "#100d19");
        ctx.fillStyle = shell;
        ctx.beginPath();
        ctx.ellipse(0, 0, r.w * .46, r.h * .34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e6e0f2";
        ctx.beginPath(); ctx.arc(r.w * .24, -r.h * .05, Math.max(1.5, r.scale * 2), 0, Math.PI * 2); ctx.fill();
      } else if (enemy.type === "brute") {
        ctx.fillStyle = "#1a1724";
        ctx.beginPath();
        ctx.moveTo(-r.w*.34,-r.h*.48); ctx.lineTo(r.w*.24,-r.h*.44); ctx.lineTo(r.w*.44,-r.h*.08);
        ctx.lineTo(r.w*.35,r.h*.47); ctx.lineTo(-r.w*.38,r.h*.43); ctx.lineTo(-r.w*.46,-r.h*.05); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#6f627d"; ctx.lineWidth = Math.max(1.5, r.scale*2); ctx.stroke();
        ctx.strokeStyle = "#292334"; ctx.lineWidth = Math.max(5, r.scale*7);
        ctx.beginPath(); ctx.moveTo(-r.w*.34,-r.h*.04); ctx.lineTo(-r.w*.52,r.h*.33); ctx.moveTo(r.w*.33,-r.h*.04); ctx.lineTo(r.w*.51,r.h*.33); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(-r.w*.18,-r.h*.21); ctx.lineTo(r.w*.18,-r.h*.21); ctx.lineTo(0,-r.h*.06); ctx.closePath(); ctx.fill();
      } else if (enemy.type === "sentry") {
        const wing = Math.sin(this.elapsed * 9 + enemy.x * .01) * r.h * .12;
        ctx.fillStyle = "rgba(18,20,35,.92)";
        ctx.beginPath();
        ctx.moveTo(0,-r.h*.2); ctx.quadraticCurveTo(-r.w*.48,-r.h*.55-wing,-r.w*.5,r.h*.18); ctx.quadraticCurveTo(-r.w*.2,0,0,r.h*.25);
        ctx.quadraticCurveTo(r.w*.2,0,r.w*.5,r.h*.18); ctx.quadraticCurveTo(r.w*.48,-r.h*.55-wing,0,-r.h*.2); ctx.fill();
        ctx.fillStyle = "#cfeff2";
        ctx.beginPath(); ctx.arc(r.w*.05,-r.h*.08, r.h*.11,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, r.scale*1.5); ctx.stroke();
      } else {
        ctx.rotate(Math.sin(this.elapsed * 1.3) * .18);
        const wisp = ctx.createRadialGradient(0,0,1,0,0,r.w*.55);
        wisp.addColorStop(0,"#f0ebfa"); wisp.addColorStop(.2,color); wisp.addColorStop(.62,"rgba(76,58,104,.8)"); wisp.addColorStop(1,"rgba(18,14,29,0)");
        ctx.fillStyle = wisp; ctx.beginPath(); ctx.arc(0,0,r.w*.55,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = "rgba(198,168,255,.65)"; ctx.lineWidth = Math.max(1,r.scale*1.4);
        for(let i=-1;i<=1;i+=1){ctx.beginPath();ctx.moveTo(i*r.w*.12,r.h*.18);ctx.bezierCurveTo(i*r.w*.28,r.h*.42,-i*r.w*.18,r.h*.5,i*r.w*.08,r.h*.65);ctx.stroke();}
      }
      if (enemy.maxHealth > 1) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "rgba(2,8,10,.78)";
        ctx.fillRect(r.x, r.y - 7, r.w, 3);
        ctx.fillStyle = color;
        ctx.fillRect(r.x, r.y - 7, r.w * (enemy.health / enemy.maxHealth), 3);
      }
      ctx.restore();
    }

    drawGoal(goal) {
      const ctx = this.ctx;
      const r = this.visualRect(goal);
      if (r.x + r.w < -80 || r.x > VIEW_W + 80) return;
      const pulse = 0.55 + Math.sin(this.elapsed * 4) * 0.18;
      const centerX = r.x + r.w * .5;
      const bottom = r.y + r.h;
      const radius = r.w * .3;
      const archY = r.y + r.w * .38;
      this.drawAtlasCell("arches", this.currentLevelIndex + 2, r.x - r.w * .32, r.y - r.h * .05, r.w * 1.64, r.h * 1.12, {
        alpha: .62,
        flip: this.currentLevelIndex % 2 === 0,
        filter: "saturate(.58) brightness(.58)"
      });
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX - radius, bottom);
      ctx.lineTo(centerX - radius, archY);
      ctx.arc(centerX, archY, radius, Math.PI, 0);
      ctx.lineTo(centerX + radius, bottom);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      const portal = ctx.createRadialGradient(centerX, r.y + r.h * .48, 3, centerX, r.y + r.h * .48, r.h * .62);
      portal.addColorStop(0, `rgba(229,246,231,${.62 + pulse * .2})`);
      portal.addColorStop(.35, `rgba(128,211,201,${.36 + pulse * .18})`);
      portal.addColorStop(.72, "rgba(39,69,76,.48)");
      portal.addColorStop(1, "rgba(3,8,14,.98)");
      ctx.fillStyle = portal;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      for (let ring = 0; ring < 5; ring += 1) {
        ctx.strokeStyle = `rgba(192,231,211,${.12 - ring * .014})`;
        ctx.lineWidth = Math.max(1, 2 * r.scale);
        ctx.beginPath();
        ctx.ellipse(centerX, r.y + r.h * (.36 + ring * .11) + Math.sin(this.elapsed * 1.2 + ring) * 3, r.w * (.2 + ring * .035), r.h * .035, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Substantial masonry keeps the exit ceremonial and distinct from totems.
      const frameStone = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
      frameStone.addColorStop(0, "#222a2d");
      frameStone.addColorStop(.48, "#737b78");
      frameStone.addColorStop(1, "#252b2d");
      ctx.fillStyle = frameStone;
      ctx.strokeStyle = "rgba(7,10,12,.78)";
      ctx.lineWidth = Math.max(1, 1.5 * r.scale);
      for (const side of [-1, 1]) {
        const inner = centerX + side * radius;
        const outer = centerX + side * (radius + 14 * r.scale);
        ctx.beginPath();
        ctx.moveTo(inner, archY - 2 * r.scale);
        ctx.lineTo(outer, archY + 3 * r.scale);
        ctx.lineTo(outer + side * 3 * r.scale, bottom);
        ctx.lineTo(inner - side * 2 * r.scale, bottom);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        for (let joint = 1; joint < 5; joint += 1) {
          const jy = archY + (bottom - archY) * joint / 5;
          ctx.beginPath();
          ctx.moveTo(inner - side * 1.5 * r.scale, jy);
          ctx.lineTo(outer + side * 1.5 * r.scale, jy + (joint % 2 ? 1 : -1) * r.scale);
          ctx.stroke();
        }
      }

      ctx.shadowColor = "#9fe7d5";
      ctx.shadowBlur = 16 * pulse;
      ctx.strokeStyle = "#596366";
      ctx.lineWidth = Math.max(12, 16 * r.scale);
      ctx.beginPath();
      ctx.moveTo(centerX - radius, bottom);
      ctx.lineTo(centerX - radius, archY);
      ctx.arc(centerX, archY, radius, Math.PI, 0);
      ctx.lineTo(centerX + radius, bottom);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(174,187,179,.42)";
      ctx.lineWidth = Math.max(1.5, 2 * r.scale);
      ctx.stroke();
      ctx.fillStyle = "#242b2d";
      ctx.fillRect(r.x - r.w * .08, bottom - 11 * r.scale, r.w * 1.16, 11 * r.scale);
      ctx.fillStyle = "rgba(89,116,87,.76)";
      ctx.fillRect(r.x - r.w * .04, bottom - 13 * r.scale, r.w * 1.08, 4 * r.scale);

      // Crown stone and completion sigil make this unmistakably different from shift portals.
      ctx.fillStyle = "#4f5859";
      ctx.beginPath();
      ctx.moveTo(centerX, r.y - 13 * r.scale);
      ctx.lineTo(centerX + 13 * r.scale, r.y + 2 * r.scale);
      ctx.lineTo(centerX, r.y + 17 * r.scale);
      ctx.lineTo(centerX - 13 * r.scale, r.y + 2 * r.scale);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#b9dfcf";
      ctx.lineWidth = Math.max(1, 1.5 * r.scale);
      ctx.stroke();
      ctx.fillStyle = "#d8eee2";
      ctx.shadowColor = "#9fe7d5";
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.arc(centerX, r.y + 2 * r.scale, 4 * r.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawVeilwalkerSprite(player, depth, dead = false, yOffset = 0, xOffset = 0) {
      const state = player.animState || "idle";
      let sheet = "idle";
      let frame = 0;
      if (dead || state === "death" || state === "hurt") {
        sheet = "defeat";
        frame = state === "hurt" ? 0 : clamp(Math.floor((this.deadTimer / .78) * 8), 1, 7);
      } else if (player.rolling || state === "roll") {
        sheet = "slide";
        frame = clamp(Math.floor(((.46 - player.rollTimer) / .46) * 8), 0, 7);
      } else if (player.rocketTimer > 0) {
        sheet = "surge";
        frame = clamp(Math.floor(((.24 - player.rocketTimer) / .24) * 8), 0, 7);
      } else if (state === "castForward" || state === "castUp") {
        sheet = state === "castUp" ? "castUp" : "castForward";
        const duration = this.shardReward ? .14 : .23;
        frame = clamp(Math.floor(((duration - player.castTimer) / duration) * 8), 0, 7);
      } else if (state === "depthForward" || state === "depthBackward") {
        sheet = "phase";
        frame = clamp(Math.floor((this.transitionData?.time || 0) / Math.max(.01, this.transitionData?.duration || 1) * 8), 0, 7);
      } else if (player.arrivalGrace > 0) {
        sheet = "phase";
        frame = clamp(Math.floor(((.42 - player.arrivalGrace) / .42) * 8), 0, 7);
      } else if (state === "run") {
        sheet = "run";
        frame = Math.floor(player.animTime * 12) % 8;
      } else if (state === "jump") {
        sheet = "airborne";
        frame = clamp(1 + Math.floor(player.animTime * 10), 1, 4);
      } else if (state === "fall") {
        sheet = "airborne";
        frame = clamp(4 + Math.floor(player.animTime * 7), 4, 7);
      } else if (state === "land") {
        sheet = "land";
        frame = clamp(Math.floor(((.14 - player.landTimer) / .14) * 8), 0, 7);
      } else {
        frame = Math.floor(player.animTime * 6) % 8;
      }

      const image = this.characterArt[sheet];
      if (!image || !image.complete || !image.naturalWidth) return false;
      const r = this.visualRect({ ...player, x: player.x + xOffset, y: player.y + yOffset }, depth);
      const cellW = image.naturalWidth / 4;
      const cellH = image.naturalHeight / 2;
      const sx = (frame % 4) * cellW;
      const sy = Math.floor(frame / 4) * cellH;
      const size = 86 * r.scale;
      const feet = r.y + r.h;
      const drawX = r.x + r.w * .5 - size * .5;
      const drawY = feet - size * .955;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(drawX + size * .5, 0);
      ctx.scale(player.facing, 1);
      const rim = this.depthMetrics(depth).glow;
      ctx.filter = `brightness(1.16) contrast(1.06) drop-shadow(0 0 ${Math.max(1, 1.5 * r.scale)}px ${rim}) drop-shadow(0 ${Math.max(1, 2 * r.scale)}px ${Math.max(2, 3 * r.scale)}px rgba(2,3,12,.92))`;
      if (state === "hurt") ctx.globalAlpha *= .68 + Math.sin(player.animTime * 70) * .18;
      ctx.drawImage(image, sx, sy, cellW, cellH, -size * .5, drawY, size, size);
      ctx.restore();
      return true;
    }

    drawPlayer(player, depth, dead = false, yOffset = 0, xOffset = 0) {
      if (this.drawVeilwalkerSprite(player, depth, dead, yOffset, xOffset)) return;
      const ctx = this.ctx;
      const r = this.visualRect({ ...player, x: player.x + xOffset, y: player.y + yOffset }, depth);
      const color = this.depthMetrics(depth).glow;
      const state = player.animState || "idle";
      const runFrame = Math.floor(player.animTime * 13) % 6;
      const runCycle = [0, 1, 0, -1, 0, 1][runFrame];
      const idleBob = Math.sin(player.animTime * 3.1) * 0.8;
      const blink = state === "idle" && Math.floor((player.animTime + 0.35) % 3.4 * 10) === 0;
      let bodyY = state === "idle" ? idleBob : 0;
      let scaleX = 1;
      let scaleY = 1;
      let rotation = 0;
      let armFront = 0;
      let armBack = 0;
      let legFront = 0;
      let legBack = 0;

      if (state === "run") {
        bodyY = Math.abs(Math.sin(player.animTime * 13)) * 1.4;
        armFront = -runCycle * 5;
        armBack = runCycle * 4;
        legFront = runCycle * 5;
        legBack = -runCycle * 5;
      } else if (state === "jump") {
        bodyY = -2;
        rotation = -0.05;
        armFront = -6;
        armBack = 5;
        legFront = -4;
        legBack = 3;
      } else if (state === "fall") {
        rotation = 0.04;
        armFront = 4;
        armBack = -5;
        legFront = 3;
        legBack = -2;
      } else if (state === "land") {
        const recover = clamp(player.landTimer / 0.14, 0, 1);
        scaleX = 1.12 - (1 - recover) * 0.12;
        scaleY = 0.76 + (1 - recover) * 0.24;
        bodyY = 7 * recover;
        armFront = 3;
        armBack = 3;
      } else if (state === "depthForward" || state === "depthBackward") {
        const direction = state === "depthForward" ? 1 : -1;
        scaleX = 0.84;
        scaleY = 1.13;
        rotation = direction * 0.06;
        armFront = -7;
        armBack = -7;
        legFront = 3;
        legBack = -3;
      } else if (state === "hurt") {
        rotation = Math.sin(player.animTime * 70) * 0.08;
        scaleX = 1.08;
        scaleY = 0.92;
        armFront = 7;
        armBack = -6;
      } else if (state === "death" || dead) {
        rotation = clamp(this.deadTimer * 4.2, 0, 1.35);
        bodyY = Math.min(10, this.deadTimer * 18);
        armFront = 8;
        armBack = -8;
        legFront = 5;
        legBack = -4;
      }

      ctx.save();
      ctx.translate(Math.floor(r.x + r.w / 2), Math.floor(r.y + r.h / 2 + bodyY * r.scale));
      ctx.rotate(rotation);
      const spriteScale = 1.46;
      ctx.shadowColor = "rgba(2,3,12,.95)";
      ctx.shadowBlur = Math.max(3, 5 * r.scale);
      ctx.scale(player.facing * scaleX * spriteScale, scaleY * spriteScale);
      const s = r.scale;

      if (player.rolling || state === "roll") {
        ctx.rotate(this.elapsed * 13 * player.facing);
        const rollGlow = ctx.createRadialGradient(0, 0, 2 * s, 0, 0, 14 * s);
        rollGlow.addColorStop(0, "#eeeafa");
        rollGlow.addColorStop(.35, color);
        rollGlow.addColorStop(1, "#11101b");
        ctx.fillStyle = rollGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 13 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(235,226,255,.7)";
        ctx.lineWidth = Math.max(1, 1.5 * s);
        ctx.beginPath();
        ctx.arc(0, 0, 10 * s, -.8, 1.5);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (this.relicReward) {
        ctx.strokeStyle = "rgba(214,190,255,.65)";
        ctx.lineWidth = Math.max(1, 1.4 * s);
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 * s, 28 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (state === "hurt") ctx.globalAlpha = 0.62 + Math.sin(player.animTime * 70) * 0.22;
      if (player.rocketTimer > 0) {
        const flame = 8 + Math.sin(this.elapsed * 38) * 4;
        const surge = ctx.createLinearGradient(-14 * s, 8 * s, -14 * s, (10 + flame) * s);
        surge.addColorStop(0, "#e9faff");
        surge.addColorStop(.35, "#82e9ee");
        surge.addColorStop(1, "rgba(173,140,255,0)");
        ctx.fillStyle = surge;
        ctx.beginPath();
        ctx.moveTo(-17 * s, 7 * s);
        ctx.quadraticCurveTo(-12 * s, (12 + flame) * s, -9 * s, 7 * s);
        ctx.fill();
      }

      // Flowing scarf and coat make the playable silhouette match the presentation figure.
      const scarfWave = Math.sin(player.animTime * 8) * 2;
      ctx.strokeStyle = "#171421";
      ctx.lineWidth = Math.max(3, 4.5 * s);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-6 * s, -14 * s);
      ctx.bezierCurveTo(-17 * s, (-11 + scarfWave) * s, -20 * s, (-3 - scarfWave) * s, -27 * s, (-5 + scarfWave) * s);
      ctx.stroke();

      // Legs and boots.
      ctx.strokeStyle = "#0d0c15";
      ctx.lineWidth = Math.max(4, 5 * s);
      ctx.beginPath();
      ctx.moveTo(-4 * s, 9 * s); ctx.lineTo((-5 + legBack * .45) * s, 21 * s);
      ctx.moveTo(4 * s, 9 * s); ctx.lineTo((5 + legFront * .45) * s, 21 * s);
      ctx.stroke();

      // Long dark coat with a lavender moonlit edge.
      const coat = ctx.createLinearGradient(-10 * s, -12 * s, 12 * s, 18 * s);
      coat.addColorStop(0, "#232036");
      coat.addColorStop(.62, "#15131f");
      coat.addColorStop(1, "#090812");
      ctx.fillStyle = coat;
      ctx.beginPath();
      ctx.moveTo(-8 * s, -12 * s);
      ctx.quadraticCurveTo(-13 * s, 1 * s, -12 * s, 16 * s);
      ctx.lineTo(-2 * s, 12 * s);
      ctx.lineTo(3 * s, 18 * s);
      ctx.lineTo(12 * s, 14 * s);
      ctx.quadraticCurveTo(11 * s, -2 * s, 7 * s, -12 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(189,161,238,.55)";
      ctx.lineWidth = Math.max(1, s);
      ctx.stroke();

      // Head, hair, and a small pale face profile.
      ctx.fillStyle = "#d8d2df";
      ctx.beginPath();
      ctx.arc(2 * s, -20 * s, 6.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#10101a";
      ctx.beginPath();
      ctx.arc(-.5 * s, -22 * s, 6.5 * s, Math.PI * .84, Math.PI * 2.02);
      ctx.lineTo(8 * s, -18 * s);
      ctx.quadraticCurveTo(3 * s, -16 * s, -4 * s, -17 * s);
      ctx.closePath();
      ctx.fill();
      if (!blink) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(5 * s, -20 * s, Math.max(1, 1.2 * s), 0, Math.PI * 2);
        ctx.fill();
      }

      // Arm and compact rune caster follow aim direction.
      ctx.strokeStyle = "#1a1726";
      ctx.lineWidth = Math.max(3, 4 * s);
      if (this.input.isDown("aimUp") && state !== "hurt" && state !== "death") {
        ctx.beginPath(); ctx.moveTo(7 * s, -7 * s); ctx.lineTo(11 * s, -20 * s); ctx.stroke();
        ctx.fillStyle = color; ctx.fillRect(9 * s, -27 * s, 4 * s, 9 * s);
      } else {
        ctx.beginPath(); ctx.moveTo(7 * s, -6 * s); ctx.lineTo(17 * s, (1 + armFront * .18) * s); ctx.stroke();
        ctx.fillStyle = "#252136"; ctx.fillRect(14 * s, -1 * s, 12 * s, 5 * s);
        ctx.fillStyle = color; ctx.fillRect(24 * s, 0, 4 * s, 3 * s);
      }
      ctx.restore();
    }

    drawTransitioningPlayer() {
      const data = this.transitionData;
      const rawT = clamp(data.time / data.duration, 0, 1);
      const travelEnd = data.duration - data.recovery;
      const travelT = clamp((data.time - data.anticipation) / (travelEnd - data.anticipation), 0, 1);
      const t = easeInOut(travelT);
      const depth = lerp(data.from, data.to, t);
      const direction = Math.sign(data.to - data.from);
      const anticipationT = clamp(data.time / data.anticipation, 0, 1);
      const recoveryT = clamp((data.time - travelEnd) / data.recovery, 0, 1);
      const lift = data.time < data.anticipation
        ? anticipationT * 5
        : -Math.sin(Math.PI * travelT) * 39 + recoveryT * 5;
      const lateral = data.time < data.anticipation
        ? -direction * anticipationT * 7
        : direction * Math.sin(Math.PI * travelT) * 17 * (1 - recoveryT);

      if (travelT > 0 && travelT < 1) {
        for (let index = 4; index >= 1; index -= 1) {
          const trailTime = Math.max(data.anticipation, data.time - index * 0.032);
          const trailT = clamp((trailTime - data.anticipation) / (travelEnd - data.anticipation), 0, 1);
          const trailEase = easeInOut(trailT);
          const trailDepth = lerp(data.from, data.to, trailEase);
          const trailLift = -Math.sin(Math.PI * trailT) * 39;
          const trailX = direction * Math.sin(Math.PI * trailT) * 17;
          this.ctx.save();
          this.ctx.globalAlpha = 0.045 + (4 - index) * 0.035;
          this.ctx.globalCompositeOperation = "lighter";
          this.drawPlayer(this.player, trailDepth, false, trailLift, trailX);
          this.ctx.restore();
        }
      }
      this.ctx.save();
      this.ctx.globalAlpha = 0.9 + Math.sin(rawT * Math.PI) * 0.1;
      this.ctx.shadowColor = this.depthMetrics(depth).glow;
      this.ctx.shadowBlur = 22 * Math.sin(travelT * Math.PI);
      this.drawPlayer(this.player, depth, false, lift, lateral);
      this.ctx.restore();
    }

    drawAtmosphere() {
      const ctx = this.ctx;
      // Feather fog vertically so it never reads as a rectangular background tile.
      ctx.save();
      for (let band = 0; band < 3; band += 1) {
        const y = 292 + band * 66 + Math.sin(this.elapsed * .16 + band) * 10;
        const height = 58 + band * 14;
        const fog = ctx.createLinearGradient(0, y, 0, y + height);
        fog.addColorStop(0, "rgba(181,198,220,0)");
        fog.addColorStop(.32, `rgba(181,198,220,${.026 + band * .014})`);
        fog.addColorStop(.58, `rgba(210,204,228,${.036 + band * .013})`);
        fog.addColorStop(1, "rgba(181,198,220,0)");
        ctx.fillStyle = fog;
        ctx.fillRect(0, y, VIEW_W, height);
      }
      ctx.restore();
      const vignette = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.24, VIEW_W / 2, VIEW_H / 2, VIEW_W * 0.67);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(3,2,12,.64)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }

    drawHud() {
      const ctx = this.ctx;
      ctx.save();
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(8,8,22,.82)";
      ctx.fillRect(18, 17, 282, 76);
      ctx.fillRect(VIEW_W - 263, 17, 245, 76);
      ctx.strokeStyle = "rgba(173,140,255,.34)";
      ctx.strokeRect(18.5, 17.5, 281, 75);
      ctx.strokeRect(VIEW_W - 262.5, 17.5, 244, 75);

      ctx.font = "bold 11px Consolas, monospace";
      ctx.fillStyle = "#aaa8c4";
      ctx.fillText(`LEVEL 0${this.level.definition.number} // ${this.level.definition.name}`, 31, 27);
      ctx.font = "bold 16px Consolas, monospace";
      ctx.fillStyle = "#f4f0ff";
      ctx.fillText(`MEMORIES  ${String(this.collected).padStart(2, "0")} / ${this.totalShards()}`, 31, 44);
      ctx.font = "bold 11px Consolas, monospace";
      ctx.fillStyle = this.relicsFound === 3 ? "#ffe7a8" : "#b6b3ca";
      ctx.fillText(`ANCHORS  ${this.relicsFound} / 3`, 31, 70);
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = i < this.relicsFound ? DEPTH_STYLE[i].glow : "#3a3850";
        ctx.fillRect(125 + i * 17, 70, 10, 10);
      }

      const activeDepth = Math.round(this.activeVisualDepth());
      ctx.font = "bold 10px Consolas, monospace";
      ctx.fillStyle = "#aaa8c4";
      ctx.fillText("ACTIVE REALITY LAYER", VIEW_W - 248, 28);
      ctx.font = "bold 17px Consolas, monospace";
      ctx.fillStyle = DEPTH_STYLE[activeDepth].glow;
      ctx.fillText(`${activeDepth}  ${PLANE_NAMES[activeDepth]}`, VIEW_W - 248, 47);
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = i === activeDepth ? DEPTH_STYLE[i].glow : "#3a3850";
        ctx.fillRect(VIEW_W - 72 + i * 14, 50, 8, 8);
      }
      ctx.font = "bold 9px Consolas, monospace";
      ctx.fillStyle = "#b7b5ca";
        ctx.fillText(`${this.relicReward ? "DUAL" : "SINGLE"} SURGE  //  ${this.shardReward ? "RAPID" : "STD"} RESONANCE`, VIEW_W - 248, 72);

      // World progress line.
      const progressX = 320;
      const progressW = 355;
      const ratio = clamp((this.player.x + this.player.w / 2) / this.level.worldWidth, 0, 1);
      ctx.fillStyle = "rgba(8,8,22,.76)";
      ctx.fillRect(progressX, 28, progressW, 32);
      ctx.fillStyle = "#3c3a52";
      ctx.fillRect(progressX + 14, 43, progressW - 28, 3);
      ctx.fillStyle = "#ad8cff";
      ctx.fillRect(progressX + 14, 43, (progressW - 28) * ratio, 3);
      ctx.fillRect(progressX + 12 + (progressW - 28) * ratio, 38, 5, 13);
      ctx.font = "bold 9px Consolas, monospace";
      ctx.fillStyle = "#9795ae";
      ctx.fillText("ENTRY", progressX + 13, 50);
      ctx.textAlign = "right";
      ctx.fillText("EXIT", progressX + progressW - 13, 50);
      ctx.textAlign = "center";
      ctx.fillStyle = "#d0ccdf";
      ctx.fillText(this.level.sectionAt(this.player.x).name, progressX + progressW / 2, 31);
      ctx.textAlign = "left";

      if (this.nearTransition && this.state === STATE.PLAYING) {
        const label = `E / SHIFT  //  MOVE TO ${PLANE_NAMES[this.nearTransition.targetDepth]}`;
        ctx.font = "bold 14px Consolas, monospace";
        const width = ctx.measureText(label).width + 44;
        ctx.fillStyle = "rgba(6,16,20,.92)";
        ctx.fillRect((VIEW_W - width) / 2, VIEW_H - 76, width, 38);
        ctx.strokeStyle = DEPTH_STYLE[this.nearTransition.targetDepth].glow;
        ctx.strokeRect((VIEW_W - width) / 2 + .5, VIEW_H - 75.5, width - 1, 37);
        ctx.fillStyle = DEPTH_STYLE[this.nearTransition.targetDepth].glow;
        ctx.fillText(label, (VIEW_W - width) / 2 + 22, VIEW_H - 64);
      }

      if (this.debug && this.transitionCandidate && this.transitionValidation && !this.transitionValidation.valid && this.state === STATE.PLAYING) {
        const label = `${this.transitionCandidate.id} BLOCKED // ${this.transitionValidation.reason}`;
        ctx.font = "bold 12px Consolas, monospace";
        const width = ctx.measureText(label).width + 34;
        ctx.fillStyle = "rgba(30,6,8,.92)";
        ctx.fillRect((VIEW_W - width) / 2, VIEW_H - 76, width, 34);
        ctx.strokeStyle = "#ff6677";
        ctx.strokeRect((VIEW_W - width) / 2 + .5, VIEW_H - 75.5, width - 1, 33);
        ctx.fillStyle = "#ff8794";
        ctx.fillText(label, (VIEW_W - width) / 2 + 17, VIEW_H - 65);
      }

      if (this.introTimer > 0 && this.state === STATE.PLAYING) {
        const alpha = Math.min(1, this.introTimer, (7 - this.introTimer) * 2);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(8,8,22,.9)";
        ctx.fillRect(205, 110, 550, 94);
        ctx.strokeStyle = "#777397";
        ctx.strokeRect(205.5, 110.5, 549, 93);
        ctx.textAlign = "center";
        ctx.font = "bold 15px Consolas, monospace";
        ctx.fillStyle = "#ad8cff";
        ctx.fillText(`LEVEL 0${this.level.definition.number}: ${this.level.definition.name}`, VIEW_W / 2, 126);
        ctx.font = "11px Consolas, monospace";
        ctx.fillStyle = "#c9c5d8";
        const introLines = [
          ["Jump again in midair to surge higher. Phase-slide through rootlings.", "Cast resonance straight or hold ↑ to cast upward. Stone guardians take several hits.", "Use ancient thresholds. Recover one reality anchor from every layer."],
          ["Climb the broken crown in the near layer.", "Search each reality for an anchor; the distant garden hides one.", "Read platform scale and portal mist before every depth shift."],
          ["The False Crossing chains every skill across all three realities.", "Surge, slide, cast, and shift—the mirror lock has no single-layer route.", "Reach the final door to break the illusion."],
          ["Sustain long three-layer routes through the buried world.", "Checkpoint beacons secure major passages. Plan before shifting.", "Enemies guard direct routes; alternate realities can be safer."],
          ["Lost Reality is the final mastery test. Read the whole structure.", "Hazards remain fixed; use depth to route around them.", "The final chamber chains every layer before the last door."]
        ][this.currentLevelIndex];
        introLines.forEach((line, index) => ctx.fillText(line, VIEW_W / 2, 151 + index * 17));
        ctx.textAlign = "left";
      }

      if (this.rewardTimer > 0 && this.state === STATE.PLAYING) {
        const alpha = Math.min(1, this.rewardTimer * 2);
        ctx.globalAlpha = alpha;
        ctx.font = "bold 12px Consolas, monospace";
        const width = Math.min(650, ctx.measureText(this.rewardMessage).width + 42);
        ctx.fillStyle = "rgba(20,15,8,.92)";
        ctx.fillRect((VIEW_W - width) / 2, 101, width, 34);
        ctx.strokeStyle = "#fff3a1";
        ctx.strokeRect((VIEW_W - width) / 2 + .5, 101.5, width - 1, 33);
        ctx.fillStyle = "#fff3a1";
        ctx.textAlign = "center";
        ctx.fillText(this.rewardMessage, VIEW_W / 2, 112);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }

      if (this.state === STATE.PLAYER_DEAD) this.drawCenteredBanner("PERCEPTION LOST", "Returning to the last remembered threshold…", "#e790bd");
      ctx.restore();
    }

    drawCenteredBanner(title, subtitle, color) {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(3,10,13,.92)";
      ctx.fillRect(190, 208, 580, 118);
      ctx.strokeStyle = color;
      ctx.strokeRect(190.5, 208.5, 579, 117);
      ctx.textAlign = "center";
      ctx.font = "bold 28px Consolas, monospace";
      ctx.fillStyle = color;
      ctx.fillText(title, VIEW_W / 2, 235);
      ctx.font = "12px Consolas, monospace";
      ctx.fillStyle = "#c3d5cd";
      ctx.fillText(subtitle, VIEW_W / 2, 282);
      ctx.textAlign = "left";
    }

    drawCollisionDebug() {
      const ctx = this.ctx;
      const activeDepth = this.player.depth;
      const support = this.groundSupport || this.findGroundSupport();
      ctx.save();
      ctx.font = "bold 8px Consolas, monospace";
      ctx.textBaseline = "bottom";

      for (const platform of this.level.platforms) {
        const collision = this.platformCollisionBounds(platform);
        const rendered = this.platformRenderBounds(platform);
        if (collision.x + collision.w < 0 || collision.x > VIEW_W) continue;
        const active = platform.depth === activeDepth;
        ctx.globalAlpha = active ? 0.92 : 0.34;
        ctx.strokeStyle = "#ff4f8b";
        ctx.lineWidth = platform === support ? 3 : 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(collision.x + 0.5, collision.y + 0.5, Math.max(1, collision.w - 1), Math.max(1, collision.h - 1));
        ctx.strokeStyle = platform === support ? "#ffffff" : DEPTH_STYLE[platform.depth].glow;
        ctx.lineWidth = platform === support ? 2.5 : active ? 2 : 1;
        ctx.setLineDash([]);
        ctx.strokeRect(rendered.x + 0.5, rendered.y + 0.5, Math.max(1, rendered.w - 1), Math.max(1, rendered.h - 1));
        if (this.labelDebug) {
          ctx.fillStyle = platform === support ? "#ffffff" : DEPTH_STYLE[platform.depth].glow;
          ctx.fillText(`${platform.id} D${platform.depth} RENDER`, rendered.x + 2, rendered.y - 3);
          ctx.fillStyle = "#ff7cab";
          ctx.fillText("COLLISION", collision.x + 2, collision.y + collision.h + 10);
        }
      }

      ctx.setLineDash([3, 3]);
      for (const device of this.level.transitions) {
        const r = this.visualRect({ ...device, depth: device.sourceDepth });
        if (r.x + r.w < 0 || r.x > VIEW_W) continue;
        const isCandidate = device === this.transitionCandidate;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = isCandidate && this.transitionValidation && !this.transitionValidation.valid ? "#ff5f65" : "#fff3a1";
        ctx.lineWidth = isCandidate ? 3 : 1.5;
        ctx.strokeRect(r.x, r.y - 30 * r.scale, r.w, r.h + 30 * r.scale);
        const arrival = this.visualRect({ ...device.arrivalZone, depth:device.targetDepth });
        const exclusion = this.visualRect({ ...device.enemyExclusionZone, depth:device.targetDepth });
        ctx.strokeStyle = isCandidate && this.transitionValidation?.valid === false ? "#ff5f65" : "#5ce1e6";
        ctx.setLineDash([6,3]);
        ctx.strokeRect(arrival.x,arrival.y,arrival.w,arrival.h);
        ctx.strokeStyle = "#fff3a1";
        ctx.setLineDash([2,4]);
        ctx.strokeRect(exclusion.x,exclusion.y,exclusion.w,exclusion.h);
        if (this.labelDebug) {
          const status = isCandidate && this.transitionValidation ? ` ${this.transitionValidation.valid ? "SAFE" : this.transitionValidation.reason}` : "";
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillText(`${device.id} D${device.sourceDepth}>D${device.targetDepth}${status}`, r.x, r.y - 34 * r.scale);
        }
      }

      ctx.setLineDash([]);
      for (const enemy of this.level.enemies) {
        if (enemy.dead) continue;
        const r = this.visualRect(enemy);
        if (r.x + r.w < 0 || r.x > VIEW_W) continue;
        ctx.globalAlpha = enemy.depth === activeDepth ? 0.95 : 0.35;
        ctx.strokeStyle = "#ff5f65";
        ctx.lineWidth = enemy.depth === activeDepth ? 2 : 1;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        if (this.labelDebug) {
          ctx.fillStyle = "#ff9a9d";
          ctx.fillText(`${enemy.id} D${enemy.depth}`, r.x, r.y - 2);
        }
      }

      for (const item of this.level.collectibles) {
        if (item.collected) continue;
        const r = this.visualRect(item);
        if (r.x + r.w < 0 || r.x > VIEW_W) continue;
        const safety = this.validateCollectiblePlacement(item);
        ctx.globalAlpha = item.depth === activeDepth ? 0.95 : 0.38;
        ctx.strokeStyle = safety.valid ? "#f7fbff" : "#ff3d47";
        ctx.lineWidth = safety.valid ? 1 : 3;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        if (this.labelDebug) {
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillText(`${item.id} D${item.depth} ${Math.round(item.x)},${Math.round(item.y)}${safety.valid ? "" : ` ${safety.reason}`}`, r.x, r.y - 2);
        }
      }

      const playerRect = this.visualRect(this.player);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(playerRect.x + 0.5, playerRect.y + 0.5, playerRect.w - 1, playerRect.h - 1);
      ctx.strokeStyle = "#ff3d47";
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.moveTo(0, VIEW_H - 10);
      ctx.lineTo(VIEW_W, VIEW_H - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ff7a7f";
      ctx.fillText("FALL DEATH ZONE BELOW", VIEW_W - 154, VIEW_H - 14);
      ctx.restore();
    }

    drawDebug() {
      const ctx = this.ctx;
      const p = this.player;
      const support = this.groundSupport || this.findGroundSupport();
      const collisionBounds = support ? this.platformCollisionBounds(support) : null;
      const renderedBounds = support ? this.platformRenderBounds(support) : null;
      const supportError = p.grounded && (!support || support.depth !== p.depth || !this.platformHasVisibleBase(support));
      const candidate = this.transitionCandidate;
      const validation = this.transitionValidation;
      const lines = [
        `PLAYER  X ${p.x.toFixed(1)}  Y ${p.y.toFixed(1)}`,
        `PLAYER DEPTH  ${p.depth} / ${PLANE_NAMES[p.depth]}`,
        `GROUNDED  ${String(p.grounded).toUpperCase()}`,
        `GROUND PLATFORM ID  ${support ? support.id : "NONE"}`,
        `GROUND PLATFORM DEPTH  ${support ? support.depth : "NONE"}`,
        `GROUND PLATFORM X  ${support ? support.x.toFixed(1) : "—"}`,
        `GROUND PLATFORM Y  ${support ? support.y.toFixed(1) : "—"}`,
        `GROUND PLATFORM WIDTH  ${support ? support.w.toFixed(1) : "—"}`,
        `GROUND PLATFORM HEIGHT  ${support ? support.h.toFixed(1) : "—"}`,
        `RENDERED PLATFORM BOUNDS  ${renderedBounds ? `${renderedBounds.x.toFixed(1)},${renderedBounds.y.toFixed(1)},${renderedBounds.w.toFixed(1)},${renderedBounds.h.toFixed(1)}` : "—"}`,
        `COLLISION PLATFORM BOUNDS  ${collisionBounds ? `${collisionBounds.x.toFixed(1)},${collisionBounds.y.toFixed(1)},${collisionBounds.w.toFixed(1)},${collisionBounds.h.toFixed(1)}` : "—"}`,
        `VELOCITY  X ${p.vx.toFixed(1)}  Y ${p.vy.toFixed(1)}`,
        `CAMERA  X ${this.camera.x.toFixed(1)}  Y ${this.camera.verticalOffset.toFixed(1)}`,
        `STATE  ${this.state}`,
        `LAST SHIFT  ${this.lastTransitionId}`,
        candidate ? `NEAR  ${candidate.id}  D${candidate.sourceDepth}>D${candidate.targetDepth}` : "NEAR SHIFT  NONE",
        validation ? `DESTINATION VALID  ${validation.valid ? "YES" : "NO"}` : "DESTINATION VALID  —",
        validation?.destination ? `DESTINATION X/Y  ${validation.destination.x.toFixed(1)} / ${validation.destination.y.toFixed(1)}` : "DESTINATION X/Y  —",
        validation ? `ENEMY CLEAR  ${validation.enemyClear ? "YES" : "NO"}` : "ENEMY CLEAR  —",
        validation ? `SOLID CLEAR  ${validation.solidClear ? "YES" : "NO"}` : "SOLID CLEAR  —",
        validation ? `HAZARD CLEAR  ${validation.hazardClear ? "YES" : "NO"}` : "HAZARD CLEAR  —",
        validation ? `SUPPORT VALID  ${validation.supportValid ? "YES" : "NO"}` : "SUPPORT VALID  —",
        validation ? `HEADROOM CLEAR  ${validation.headroomClear ? "YES" : "NO"}` : "HEADROOM CLEAR  —",
        validation ? `MOVEMENT CLEAR  ${validation.movementClear ? "YES" : "NO"}` : "MOVEMENT CLEAR  —",
        validation ? `TRANSITION  ${validation.valid ? "SAFE" : `INVALID: ${validation.reason}`}` : "TRANSITION  —"
      ];
      if (supportError) lines.push("ERROR: INVISIBLE GROUND SUPPORT");
      if (this.deathDiagnostic && this.deathDiagnostic.time > 0) {
        const death = this.deathDiagnostic;
        lines.push(
          `DEATH  ${death.cause}`,
          `AT  ${death.x.toFixed(1)},${death.y.toFixed(1)}  D${death.depth}`,
          `SUPPORT  ${death.supportId}`,
          `AFTER SHIFT  ${death.transitionId}`
        );
      }
      const panelHeight = 43 + lines.length * 14;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,.83)";
      ctx.fillRect(18, 101, 520, panelHeight);
      ctx.strokeStyle = supportError ? "#ff5f65" : "#5ce1e6";
      ctx.strokeRect(18.5, 101.5, 519, panelHeight - 1);
      ctx.fillStyle = supportError ? "#ff7a7f" : "#5ce1e6";
      ctx.font = "bold 11px Consolas, monospace";
      ctx.fillText("F2 QA // F3 BOUNDS // F4 IDS", 30, 116);
      ctx.fillStyle = "#d8ebe3";
      ctx.font = "11px Consolas, monospace";
      lines.forEach((line, index) => {
        if (line === "ERROR: INVISIBLE GROUND SUPPORT" || line.startsWith("DEATH  ") || line.startsWith("DESTINATION  SOLID") || line === "DESTINATION  NO SUPPORT") ctx.fillStyle = "#ff7a7f";
        else ctx.fillStyle = "#d8ebe3";
        ctx.fillText(line, 30, 138 + index * 14);
      });
      ctx.restore();
    }
  }

  const canvas = document.getElementById("game");
  if (canvas) {
    window.addEventListener("error", event => { canvas.dataset.runtimeError = event.message || "Unknown runtime error"; });
    window.addEventListener("unhandledrejection", event => { canvas.dataset.runtimeError = String(event.reason || "Unhandled promise rejection"); });
    canvas.focus({ preventScroll: true });
    const game = new Game(canvas);
    // Read-only-friendly handle for automated smoke tests and future level tooling.
    Object.defineProperty(window, "phaseShiftFoundry", { value: game, configurable: false });
  }
})();
