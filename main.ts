// =====================================================
//  رالي الخليج  |  GULF RALLY
//  A = بنزين | gas      B = فرامل، ومع اللف = تفحيط | brake, with steering = DRIFT
//  ⬅️ ➡️ = لف | steer   ⬆️ = نيترو | nitro
//  سابق الباترول الأحمر لخط النهاية!  Beat the red Patrol to the finish!
// =====================================================

// ---------- الشاشة والكاميرا | Screen & camera ----------
const SW = 160
const SH = 120
const HALF_W = 80
const HALF_H = 60
let SEGMENT = 200          // طول كل قطعة من الطريق | length of one road piece
let ROAD_WIDTH = 1100      // نص عرض الطريق | half the road width
let CAMERA_HEIGHT = 950    // ارتفاع الكاميرا | camera height
let CAMERA_DEPTH = 0.84    // زاوية النظر | field of view
let DRAW_DISTANCE = 48     // كم قطعة نرسم قدامنا | how far we draw
let PLAYER_Z = 800         // بعد السيارة عن الكاميرا | car distance from camera

// ---------- السيارة | Car ----------
let MAX_SPEED = SEGMENT * 32
let ACCEL = MAX_SPEED / 4
let BRAKE = -MAX_SPEED
let COAST = -MAX_SPEED / 6
let OFFROAD_SLOW = -MAX_SPEED / 1.4
let OFFROAD_LIMIT = MAX_SPEED / 3
let CENTRIFUGAL = 0.26
let FUEL_USE = 1.5        // كم بنزين يصرف بالثانية | fuel used per second
let CAR_WORLD_WIDTH = 420

// ---------- الطريق | Track data ----------
let segCurve: number[] = []
let segY1: number[] = []
let segY2: number[] = []
let segKind: number[] = []     // 0 عادي normal، 1 سبخة sabkha، 2 منصة قفز ramp
let segProps: number[][] = []
let paintKind = 0
let trackLength = 0
let finishZ = 0

// ---------- الأشياء على الطريق | Things on the road ----------
const P_CAMEL = 0
const P_FUEL = 1
const P_NITRO = 2
const P_SHRUB = 3
const P_FLAG = 4
const P_DUNE = 5
const P_BANNER = 6
const P_SIGN = 7
const P_POST = 8
const P_TENT = 9
const P_CROWD = 10
let propSeg: number[] = []
let propX: number[] = []
let propType: number[] = []
let propAlive: boolean[] = []
let propPhase: number[] = []

// ---------- حالة اللعبة | Game state ----------
let position = 0
let playerX = 0
let speed = 0
let fuel = 100
let nitroCount = 1
let nitroUntil = 0
let spinUntil = 0
let airborne = false
let jumpHeight = 0
let jumpSpeed = 0
let lastKind = 0
let depthNow = CAMERA_DEPTH
let rivalZ = 0
let rivalX = 0.35
let rivalSpeed = 0
let skyOffset = 0
let raceStarted = false
let raceOver = false
let startTime = 0
let lastTime = 0
let message = ""
let messageUntil = 0
let crashCount = 0
let yawNow = 0              // زاوية السيارة الحالية | current car angle
let drifting = false
let driftDir = 0
let driftMeter = 0          // يتعبى بالتفحيط ويعطيك نيترو | fills while drifting, gives nitro
let lastScreech = 0
let startLights = 0         // 0 مطفي، 1-3 أحمر، 4 أخضر | 0 off, 1-3 red, 4 green
let rivalScreenX = -100
let rivalScreenY = -100
let rivalScreenW = 0
// جزيئات الدخان والغبار | smoke and dust particles
let partX: number[] = []
let partY: number[] = []
let partVX: number[] = []
let partVY: number[] = []
let partR: number[] = []
let partLife: number[] = []
let partColor: number[] = []

// ---------- الرسومات | Pictures ----------
// صور اللاندكروزر بزوايا مختلفة (من نموذج ثلاثي الأبعاد) | Land Cruiser at different angles (from a 3D model)
let carAngles = [-36, -24, -12, 0, 12, 24, 36]
let carFramesA = [img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . f f f f f f b f f f f . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . f f f f f f b b b b b b b b b b b f f f . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . f f f f f b b b b b b b b b b b b 1 b b b b b b b f f f . . . . . . . . . . . . . .
        . . . . . . . . . . . f f b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b f f f f . . . . . . . . . .
        . . . . . . . . . . f 1 1 1 b b b b b b b 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b f f f f . . . . . .
        . . . . . . . . . . f 9 1 1 1 1 1 b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b f . . . . .
        . . . . . . . . . . f 9 9 9 9 9 1 1 1 1 1 b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b f f . . . .
        . . . . . . . . . . f 9 f f f 9 9 9 9 1 1 1 1 1 b b b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 1 f . . .
        . . . . . . . . . f f 9 f f f f f f f 9 9 9 9 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . . . f f f f f f 1 1 9 f f f f f f f f 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . f f 1 1 1 1 1 1 1 1 9 f f f f f f f f 9 9 f f f f 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 1 1 f . . .
        f 1 1 1 1 1 1 1 1 1 1 9 f f f f f f f f 9 9 f f f f f f f f 9 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 1 1 1 1 1 1 1 9 f f f f f f f f 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 9 9 9 1 1 1 1 1 9 9 9 f f f f f 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 9 f f 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 b b f f 9 9 9 9 9 9 9 1 1 1 1 9 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f f f .
        f 9 9 b b b f b b 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 9 f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 f
        f 9 9 b b b b b b b 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 9 9 f 9 1 1 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 9 9 b b b b b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 1 1 1 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 2 f
        f 9 9 b b a b b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 1 2 2 2 f
        . f f b a a a b f f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 1 2 2 2 f
        . . f b a a a b b f f 9 9 9 9 9 9 9 9 9 9 9 9 b f f b b 9 9 9 9 2 2 2 2 1 1 1 1 1 f f a f f f 1 1 1 1 2 2 2 f
        . . f b b a a b b b b 9 9 9 9 9 9 9 9 9 9 9 b b b b b b b 9 9 9 2 2 2 2 1 1 1 1 f f a a a f f 1 1 1 1 1 1 1 f
        . . f b b b b b b b b b b b 9 9 9 9 9 9 9 9 b b b b b b f 9 9 9 2 2 2 2 1 1 1 1 f f a a f f 1 1 1 1 1 1 1 1 f
        . . . f b b b b b b f f f f f f f b 9 9 9 9 b b a b b f f 9 9 9 2 2 2 2 1 1 1 1 1 f f f f f 1 1 1 1 1 a 1 1 f
        . . . . f b b f f f f . . . . . . f f f b 9 b a a a b f f 9 9 9 1 1 1 1 1 1 1 1 1 f f f a b b b b b b b 1 1 f
        . . . . . f f . . . . . . . . . . . . . f f b a a a b f f f 9 9 1 1 1 1 1 a a b b b b b b b b b b b b b f f .
        . . . . . . . . . . . . . . . . . . . . . f b b a a b b b 9 9 9 1 1 1 b b b b b b b b b b b b b b b b b f . .
        . . . . . . . . . . . . . . . . . . . . . f b b a a b b b b b b 1 1 1 b b b b b b b b b b b b b b f f f . . .
        . . . . . . . . . . . . . . . . . . . . . . f b b b b b b b b f f f b b b b b b b b f f f f f f f . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . f b b b f f f f . . . f f f f f f f f . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . f b b b f . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . f f f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . f f f f f f f f f f . . . . . . . . . . . . . . . .
        . . . . . . . . . . f f f f f f f f f f f b b b b b b b b b b f f f . . . . . . . . . . . . .
        . . . . . . . . f f b b b b b b b b b b b b b b b b b b b b b b b b f f . . . . . . . . . . .
        . . . . . . . f 1 1 b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b f f . . . . . . . . .
        . . . . . . . f 1 1 1 b b b b b b 1 1 1 1 1 1 b b b b b b b b b b b b b b b f f . . . . . . .
        . . . . . . . f 9 9 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 b b b b b f f . . . . .
        . . . . . . . f 9 f 9 9 1 1 1 1 b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b f . . . .
        . . . . . . . f 9 f f f 9 9 1 1 1 1 b b b b b 1 b b b b b b b b b b b b b b b b b b 1 f . . .
        . . . f f f f f 9 f f f f f 9 9 9 1 1 1 b b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . f f 1 1 1 1 1 9 f f f f f 9 f 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        f 1 1 1 1 1 1 1 9 f f f f f 9 f f f 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 1 1 f . .
        f 9 9 1 1 1 1 1 9 f f f f f 9 f f f f f f 9 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f 9 9 9 9 1 1 1 9 9 f f f f 9 f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f 9 9 9 9 9 9 1 1 1 9 9 f f 9 f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f 9 f f f 9 9 9 9 1 1 1 9 9 9 f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f b b f b b 9 9 9 9 9 1 1 1 9 9 f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f b b b b b 9 9 9 9 9 9 9 1 1 1 9 9 f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f f .
        f b b b b f f 9 9 9 9 9 9 9 9 1 1 1 1 9 f 9 1 1 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f b a b b f f 9 9 9 9 9 9 9 9 9 9 9 1 1 1 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f b a a b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 f
        f b a a b f f 9 9 9 9 9 9 9 9 b f f 9 9 9 9 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 2 2 2 f
        f b a a b b b 9 9 9 9 9 9 9 9 b f b b 9 9 9 1 1 2 2 1 1 1 1 1 f f f a f f f 1 1 1 1 1 2 2 2 f
        f b b b b b b b b 9 9 9 9 9 b b b b b b 9 9 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 f
        . f b b b b b b b f b 9 9 9 b b b b f f 9 9 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 1 1 1 f
        . f b b f f f f f . f f b 9 b a a b f f 9 9 2 2 2 2 1 1 1 1 1 f f f f f f f 1 1 1 1 1 1 1 1 f
        . . f f . . . . . . . . f f b a a b f f 9 9 1 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 a a a 1 1 f
        . . . . . . . . . . . . . f b a a b f f 9 9 1 1 1 1 1 1 1 1 1 a a b b b b b b b b b b b 1 1 f
        . . . . . . . . . . . . . f b a a b b b 9 9 1 1 1 b b b b b b b b b b b b b b b b b b b b b f
        . . . . . . . . . . . . . . f b a b b b b b 1 1 1 b b b b b b b b b b b b b b b b b b b f f .
        . . . . . . . . . . . . . . f b b b b b b b b f b b b b b b b b b b b b b b b f f f f f . . .
        . . . . . . . . . . . . . . . f b f f f f f f . f b b b f f f f f f f f f f f . . . . . . . .
        . . . . . . . . . . . . . . . f b b f . . . . . . f f f . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . f f f f f f f f f f f . . . . . . . . . . .
        . . . . . . . . f f f f f f f f f f f b b b b b b b b b b b f . . . . . . . . . .
        . . . . . . f f b b b b b b b b b b b b b b b b b b b b b b b f . . . . . . . . .
        . . . . . f 1 1 b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b f . . . . . . . .
        . . . . . f 9 1 1 b b b b 1 1 1 1 b b b b b b b b b b b b b b b b f . . . . . . .
        . . . . . f 9 9 1 1 b b b b b b b b b b b b b b b b b b b b b b b b f . . . . . .
        . . . . . f 9 f 9 1 1 b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b f . . . . .
        . . . . . f 9 f f 9 1 1 b b b b b b b b b b b b b b b b b b b b b b b 1 f . . . .
        . . f f f f 9 f f f 9 1 1 b b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 f . . .
        . f 1 1 1 1 9 f f f f 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . f 9 1 1 1 9 f f f f f 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . f 9 9 1 1 9 f f f f f f 9 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        . f 9 9 9 1 1 9 f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        . f f f 9 9 1 1 9 f f f f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b b b 9 9 1 1 9 f f f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b b b 9 9 9 1 1 9 f f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b b b 9 9 9 9 1 1 9 f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b f f 9 9 9 9 9 1 1 9 9 1 1 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 f . .
        f b a f f 9 9 9 9 9 9 1 1 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f .
        f b a f f 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 1 1 1 f .
        f b a b b 9 9 9 b f f 9 9 1 1 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 1 1 2 2 2 2 f .
        f b b b b b 9 9 b b b b 9 2 2 2 2 1 1 1 1 1 1 f f f f f f f 1 1 1 1 1 2 2 2 2 b f
        . f b b b b b 9 b b b b 9 2 2 2 2 1 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 f .
        . f b f f f f f b b f f 9 2 2 2 2 1 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 f .
        . f b f b f . f b b f f 9 2 2 2 2 1 1 1 1 1 1 f f f a f f f 1 1 1 1 1 1 1 1 1 f .
        . . f . f . . f b b f f 9 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 f .
        . . . . . . . f b b f f 9 1 1 1 1 1 1 1 1 1 1 1 f f a a a a a b b b b b 1 1 1 b f
        . . . . . . . f b b b b 9 1 1 1 b b b b b b b b b b b b b b b b b b b b 1 1 1 b f
        . . . . . . . f b b b b b 1 1 1 b b b b b b b b b b b b b b b b b b b b b b f b f
        . . . . . . . f b b b b b b b f b b b b b b b b b b b b b b b b b b b b f f f f .
        . . . . . . . . f b f f f f b f b b b f f f f f f f f f f f f f f f f f . . . . .
        . . . . . . . . . f . . . . f . f f f . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . f f f f f f f f f f f f f f f f f f f f f . . . . . .
        . . . . f f b b b b b b b b b b b b b b b b b b b b b f f . . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . f 1 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f . .
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        f b b 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 b b f
        f b b 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 b b f
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        . f f 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 2 2 2 2 2 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 2 2 2 2 b b f
        f b b 2 2 2 2 2 1 1 1 1 1 f f f a a f f f 1 1 1 1 1 2 2 2 2 b b f
        . f f 2 2 2 2 2 1 1 1 1 1 f f a a a f f f 1 1 1 1 1 2 2 2 2 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 f f f a a f f 1 1 1 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 1 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 1 b b f
        f b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b f
        . f f f f f b b b b b b b b b b b b b b b b b b b b b f f f f f .
        . f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . f f f f f f f f f f f . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . f b b b b b b b b b b b f f f f f f f f f f f . . . . . . . .
        . . . . . . . . . f b b b b b b b b b b b b b b b b b b b b b b b f f . . . . . .
        . . . . . . . . f b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b 1 1 f . . . . .
        . . . . . . . f b b b b b b b b b b b b b b b b 1 1 1 1 b b b b 1 1 a f . . . . .
        . . . . . . f b b b b b b b b b b b b b b b b b b b b b b b b 1 1 a a f . . . . .
        . . . . . f b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b 1 1 a f a f . . . . .
        . . . . f 1 b b b b b b b b b b b b b b b b b b b b b b b 1 1 a f f a f . . . . .
        . . . f 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b b 1 1 a f f f a f f f f . .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a f f f f a 1 1 1 1 f .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a f f f f f a 1 1 1 a f .
        . . . f 1 1 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 a f f f f f f a 1 1 a a f .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f a 1 1 a a a f .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f a 1 1 a a f f . .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f a 1 1 a a b b b f .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f a 1 1 a a a b b b b f
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f a 1 1 a a a a b b b b f
        . . f 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a a 1 1 a a a a a f f b b f
        . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a 1 1 a a a a a a f f a b f
        . f 1 1 1 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a f f a b f
        . f 2 2 2 2 1 1 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 1 1 a a f f b a a a b b a b f
        f b 2 2 2 2 1 1 1 1 1 f f f f f f f 1 1 1 1 1 1 2 2 2 2 a b b b b a a b b b b b f
        . f 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 1 2 2 2 2 a b b b b a b b b b b f .
        . f 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 1 2 2 2 2 a f f b b f f f f f b f .
        . f 1 1 1 1 1 1 1 1 1 f f f a f f f 1 1 1 1 1 1 2 2 2 2 a f f b b f . f b f b f .
        . f 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 a f f b b f . . f . f . .
        f b 1 1 1 b b b b b a a a a a f f 1 1 1 1 1 1 1 1 1 1 1 a f f b b f . . . . . . .
        f b 1 1 1 b b b b b b b b b b b b b b b b b b b b 1 1 1 a b b b b f . . . . . . .
        . f f b b b b b b b b b b b b b b b b b b b b b b 1 1 1 b b b b b f . . . . . . .
        . . f f f b b b b b b b b b b b b b b b b b b b b f b b b b b b b f . . . . . . .
        . . . . . f f f f f f f f f f f f f f f f f b b b f f f f f f b f . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . f f f . . . . . . f . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . f f f f f f f f f f . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . f f f b b b b b b b b b b f f f f f f f f f f f . . . . . . . . . .
        . . . . . . . . . . . f f b b b b b b b b b b b b b b b b b b b b b b b b f f . . . . . . . .
        . . . . . . . . . f f b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b 1 1 f . . . . . . .
        . . . . . . . f f b b b b b b b b b b b b b b b 1 1 1 1 1 1 b b b b b b 1 1 1 f . . . . . . .
        . . . . . f f b b b b b 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 a a f . . . . . . .
        . . . . f b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b 1 1 1 1 a a f a f . . . . . . .
        . . . f 1 b b b b b b b b b b b b b b b b b b 1 b b b b b 1 1 1 1 a a f f f a f . . . . . . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b b 1 1 1 a a a f f f f f a f f f f f . . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a f a f f f f f a 1 1 1 1 1 f f .
        . . f 1 1 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a f f f a f f f f f a 1 1 1 1 1 1 1 f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 a f f f f f f a f f f f f a 1 1 1 1 1 a a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f a f f f f a a 1 1 1 a a a a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f a f f a a 1 1 1 a a a a a a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f a a a 1 1 1 a a a a f f b a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f a a 1 1 1 a a a a a b b b b a f
        . f f 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f a a 1 1 1 a a a a a a a b b b b b f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 1 1 a f a 1 1 1 1 a a a a a a a a f f b b b b f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a 1 1 1 a a a a a a a a a a a f f b b a b f
        f 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a a a a a a a f b b a a b f
        f 2 2 2 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 a a a a f f a a a a a a a a a f f b a a b f
        f 2 2 2 1 1 1 1 1 f f f a f f f 1 1 1 1 1 2 2 1 1 a a a b b b b a a a a a a a a b b b a a b f
        f 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 a a b b b b b b a a a a a b b b b b b b b f
        f 1 1 1 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 a a f f b b b b a a a b f b b b b b b b f .
        f 1 1 1 1 1 1 1 1 f f f f f f f 1 1 1 1 1 2 2 2 2 a a f b b a a b a b f f . f f f f b b b f .
        f 1 1 a a a 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 1 a a f b b a a b f f . . . . . . . f f f . .
        f 1 1 b b b b b b b b b b b a a 1 1 1 1 1 1 1 1 1 a a f f b a a b f . . . . . . . . . . . . .
        f b b b b b b b b b b b b b b b b b b b b b 1 1 1 a a b b b a a b f . . . . . . . . . . . . .
        . f f b b b b b b b b b b b b b b b b b b b 1 1 1 b b b b b a b b f . . . . . . . . . . . . .
        . . . f f f f f b b b b b b b b b b b b b b b f b b b b b b b b f . . . . . . . . . . . . . .
        . . . . . . . . f f f f f f f f f f f b b b f . f f f f f b b b f . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . f f f . . . . . . . f f f . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . f f f f b f f f f f f . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . f f f b b b b b b b b b b b f f f f f f . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . f f f b b b b b b b 1 b b b b b b b b b b b b f f f f f . . . . . . . . . . . . .
        . . . . . . . . . . f f f f b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b f f . . . . . . . . . . .
        . . . . . . f f f f b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 b b b b b b b 1 1 1 f . . . . . . . . . .
        . . . . . f b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b 1 1 1 1 1 a f . . . . . . . . . .
        . . . . f f b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b 1 1 1 1 1 a a a a a f . . . . . . . . . .
        . . . f 1 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b b b 1 1 1 1 1 a a a a f f f a f . . . . . . . . . .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 a a a a f f f f f f f a f f . . . . . . . . .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a f f f f f f f f a 1 1 f f f f f f . . .
        . . . f 1 1 8 7 7 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 a a a a f f f f a a f f f f f f f f a 1 1 1 1 1 1 1 1 f f .
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 a f f f f f f f f a a f f f f f f f f a 1 1 1 1 1 1 1 1 1 1 f
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a f f f f f f f f a 1 1 1 1 1 1 1 a a a f
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a f f f f f a a a 1 1 1 1 1 a a a a a a f
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a f f a a 1 1 1 1 1 a a a a a a a a a a f
        . f f f 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a a 1 1 1 1 a a a a a a a f f b b a a a f
        f 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f a a 1 1 1 1 1 a a a a a a a a a b b b b b b a a f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 1 1 a f a a a 1 1 1 1 1 a a a a a a a a a a a b b b b b b b a a f
        f 2 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 1 1 1 a 1 1 1 1 1 a a a a a a a a a a a a a a a f b b b b b b a a f
        f 2 2 2 1 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a a a a a a a a a a a a f b b b a b b a a f
        f 2 2 2 1 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 a a a a a a f a a a a a a a a a a a a a a f b b b a a a b f f .
        f 2 2 2 1 1 1 1 f f f a f f 1 1 1 1 1 2 2 2 2 a a a a b b b b b a a a a a a a a a a a a f f b b a a a b f . .
        f 1 1 1 1 1 1 1 f f a a a f f 1 1 1 1 2 2 2 2 a a a b b b b b b b a a a a a a a a a a a b b b b a a b b f . .
        f 1 1 1 1 1 1 1 1 f f a a f f 1 1 1 1 2 2 2 2 a a a f b b b b b b a a a a a a a a b b b b b b b b b b b f . .
        f 1 1 a 1 1 1 1 1 f f f f f 1 1 1 1 1 2 2 2 2 a a a f b b b a b b a a a a b f f f f f f b b b b b b b f . . .
        f 1 1 b b b b b b b a f f f 1 1 1 1 1 1 1 1 1 a a a f b b a a a b a b f f f . . . . . . f f f f b b f . . . .
        . f f b b b b b b b b b b b b b a a 1 1 1 1 1 a a f f b b a a a b f f . . . . . . . . . . . . . f f . . . . .
        . . f b b b b b b b b b b b b b b b b b 1 1 1 a a b b b b a a b b f . . . . . . . . . . . . . . . . . . . . .
        . . . f f f b b b b b b b b b b b b b b 1 1 1 b b b b b b a a b b f . . . . . . . . . . . . . . . . . . . . .
        . . . . . . f f f f f f f b b b b b b b b f f f b b b b b b b b f . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . f f f f f f f f . . . f f f f b b b b f . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . f b b f f . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . .
    `]
let carFramesB = [img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . f f f f f f b f f f f . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . f f f f f f b b b b b b b b b b b f f f . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . f f f f f b b b b b b b b b b b b 1 b b b b b b b f f f . . . . . . . . . . . . . .
        . . . . . . . . . . . f f b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b f f f f . . . . . . . . . .
        . . . . . . . . . . f 1 1 1 b b b b b b b 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b f f f f . . . . . .
        . . . . . . . . . . f 9 1 1 1 1 1 b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b f . . . . .
        . . . . . . . . . . f 9 9 9 9 9 1 1 1 1 1 b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b f f . . . .
        . . . . . . . . . . f 9 f f f 9 9 9 9 1 1 1 1 1 b b b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 1 f . . .
        . . . . . . . . . f f 9 f f f f f f f 9 9 9 9 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . . . f f f f f f 1 1 9 f f f f f f f f 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . f f 1 1 1 1 1 1 1 1 9 f f f f f f f f 9 9 f f f f 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 1 1 f . . .
        f 1 1 1 1 1 1 1 1 1 1 9 f f f f f f f f 9 9 f f f f f f f f 9 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 1 1 1 1 1 1 1 9 f f f f f f f f 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 9 9 9 1 1 1 1 1 9 9 9 f f f f f 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 9 f f 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f 9 9 9 b b b b 9 9 9 9 9 9 9 1 1 1 1 9 9 9 f f f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f f f .
        f 9 9 b b b b b b 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 9 f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 f
        f 9 9 b b b b b f f 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 9 9 f 9 1 1 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 9 9 b b b b b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 9 1 1 1 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 2 f
        f 9 9 b b a b b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 1 2 2 2 f
        . f f b a a a b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 1 2 2 2 f
        . . f b a a a b b b b 9 9 9 9 9 9 9 9 9 9 9 9 f f b b b 9 9 9 9 2 2 2 2 1 1 1 1 1 f f a f f f 1 1 1 1 2 2 2 f
        . . f b b a a b b b b 9 9 9 9 9 9 9 9 9 9 9 b b b b f f f 9 9 9 2 2 2 2 1 1 1 1 f f a a a f f 1 1 1 1 1 1 1 f
        . . f b b b b b b b f f f b 9 9 9 9 9 9 9 9 b b b b b f f 9 9 9 2 2 2 2 1 1 1 1 f f a a f f 1 1 1 1 1 1 1 1 f
        . . . f b b b b f f f f . f f f f b 9 9 9 9 b b a b b f f 9 9 9 2 2 2 2 1 1 1 1 1 f f f f f 1 1 1 1 1 a 1 1 f
        . . . . f b b f f f b f . . . . . f f f b 9 b a a a b b b 9 9 9 1 1 1 1 1 1 1 1 1 f f f a b b b b b b b 1 1 f
        . . . . . f f . . . f . . . . . . . . . f f b a a a b b b b 9 9 1 1 1 1 1 a a b b b b b b b b b b b b b f f .
        . . . . . . . . . . . . . . . . . . . . . f b b a a b b b 9 9 9 1 1 1 b b b b b b b b b b b b b b b b b f . .
        . . . . . . . . . . . . . . . . . . . . . f b b a a b b b b b b 1 1 1 b b b b b b b b b b b b b b f f f . . .
        . . . . . . . . . . . . . . . . . . . . . f b b b b b f f f f f f f b b b b b b b b f f f f f f f . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . f f b b b f f f f . . . f f f f f f f f . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . f b b f . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . f f f f f f f f f f . . . . . . . . . . . . . . . .
        . . . . . . . . . . f f f f f f f f f f f b b b b b b b b b b f f f . . . . . . . . . . . . .
        . . . . . . . . f f b b b b b b b b b b b b b b b b b b b b b b b b f f . . . . . . . . . . .
        . . . . . . . f 1 1 b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b f f . . . . . . . . .
        . . . . . . . f 1 1 1 b b b b b b 1 1 1 1 1 1 b b b b b b b b b b b b b b b f f . . . . . . .
        . . . . . . . f 9 9 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 b b b b b f f . . . . .
        . . . . . . . f 9 f 9 9 1 1 1 1 b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b f . . . .
        . . . . . . . f 9 f f f 9 9 1 1 1 1 b b b b b 1 b b b b b b b b b b b b b b b b b b 1 f . . .
        . . . f f f f f 9 f f f f f 9 9 9 1 1 1 b b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . f f 1 1 1 1 1 9 f f f f f 9 f 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        f 1 1 1 1 1 1 1 9 f f f f f 9 f f f 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 1 1 f . .
        f 9 9 1 1 1 1 1 9 f f f f f 9 f f f f f f 9 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f 9 9 9 9 1 1 1 9 9 f f f f 9 f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f 9 9 9 9 9 9 1 1 1 9 9 f f 9 f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f 9 f b b 9 9 9 9 1 1 1 9 9 9 f f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f b b b b b 9 9 9 9 9 1 1 1 9 9 f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . .
        f b b b f f 9 9 9 9 9 9 9 1 1 1 9 9 f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f f .
        f b b b f f f 9 9 9 9 9 9 9 9 1 1 1 1 9 f 9 1 1 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f b a b b f f 9 9 9 9 9 9 9 9 9 9 9 1 1 1 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f b a a b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 f
        f b a a b b b 9 9 9 9 9 9 9 9 f f b 9 9 9 9 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 2 2 2 f
        f b a a b b b 9 9 9 9 9 9 9 9 b b b b 9 9 9 1 1 2 2 1 1 1 1 1 f f f a f f f 1 1 1 1 1 2 2 2 f
        f b b b b b b b b 9 9 9 9 9 b b b f f f 9 9 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 f
        . f b b b f f f f f b 9 9 9 b b b b f f 9 9 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 1 1 1 f
        . . f b f f f f f . f f b 9 b a a b f f 9 9 2 2 2 2 1 1 1 1 1 f f f f f f f 1 1 1 1 1 1 1 1 f
        . . . f . . . . . . . . f f b a a b b b 9 9 1 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 a a a 1 1 f
        . . . . . . . . . . . . . f b a a b b b 9 9 1 1 1 1 1 1 1 1 1 a a b b b b b b b b b b b 1 1 f
        . . . . . . . . . . . . . f b a a b b b 9 9 1 1 1 b b b b b b b b b b b b b b b b b b b f f .
        . . . . . . . . . . . . . f b b a b b b b b 1 1 1 b b b b b b b b b b b b b b b b b b b f . .
        . . . . . . . . . . . . . . f b b b f f f f b f b b b b b b b b b b b b b b b f f f f f . . .
        . . . . . . . . . . . . . . . f b f f f f f f . f b b b f f f f f f f f f f f . . . . . . . .
        . . . . . . . . . . . . . . . f b b f . . . . . . f f f . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . f f f f f f f f f f f . . . . . . . . . . .
        . . . . . . . . f f f f f f f f f f f b b b b b b b b b b b f . . . . . . . . . .
        . . . . . . f f b b b b b b b b b b b b b b b b b b b b b b b f . . . . . . . . .
        . . . . . f 1 1 b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b f . . . . . . . .
        . . . . . f 9 1 1 b b b b 1 1 1 1 b b b b b b b b b b b b b b b b f . . . . . . .
        . . . . . f 9 9 1 1 b b b b b b b b b b b b b b b b b b b b b b b b f . . . . . .
        . . . . . f 9 f 9 1 1 b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b f . . . . .
        . . . . . f 9 f f 9 1 1 b b b b b b b b b b b b b b b b b b b b b b b 1 f . . . .
        . . f f f f 9 f f f 9 1 1 b b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 f . . .
        . f 1 1 1 1 9 f f f f 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . f 9 1 1 1 9 f f f f f 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . f 9 9 1 1 9 f f f f f f 9 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        . f 9 9 9 1 1 9 f f f f f 9 1 1 8 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        . f f f 9 9 1 1 9 f f f f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b b b 9 9 1 1 9 f f f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b f f 9 9 9 1 1 9 f f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b f f 9 9 9 9 1 1 9 f 9 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 f . . .
        f b b f f 9 9 9 9 9 1 1 9 9 1 1 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 f . .
        f b a b b 9 9 9 9 9 9 1 1 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f .
        f b a b b 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 1 1 1 f .
        f b a b b 9 9 9 b b b 9 9 1 1 1 1 1 1 1 1 1 1 1 f f f f f 1 1 1 1 1 1 2 2 2 2 f .
        f b b b b b 9 9 b b b b 9 2 2 2 2 1 1 1 1 1 1 f f f f f f f 1 1 1 1 1 2 2 2 2 b f
        . f b f f f f 9 b b f f 9 2 2 2 2 1 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 f .
        . f b f f f f f b b f f 9 2 2 2 2 1 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 b f
        . f b b b f . f b b f b 9 2 2 2 2 1 1 1 1 1 1 f f f a f f f 1 1 1 1 1 1 1 1 1 b f
        . . f f f . . f b b b b 9 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 b f
        . . . . . . . f b b b b 9 1 1 1 1 1 1 1 1 1 1 1 f f a a a a a b b b b b 1 1 1 b f
        . . . . . . . f b b b b 9 1 1 1 b b b b b b b b b b b b b b b b b b b b 1 1 1 f .
        . . . . . . . f b b b b f 1 1 1 b b b b b b b b b b b b b b b b b b b b f f f b f
        . . . . . . . f b b f f f f f f b b b b b b b b b b b b b b b b b b b b f b b f .
        . . . . . . . . f b f f f f b f b b b f f f f f f f f f f f f f f f f f . f f . .
        . . . . . . . . . f . . . . f . f f f . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . f f f f f f f f f f f f f f f f f f f f f . . . . . .
        . . . . f f b b b b b b b b b b b b b b b b b b b b b f f . . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . f 1 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        f b b 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 b b f
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        f b b 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 b b f
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b f
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 b b f
        . f f 2 2 2 2 2 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 2 2 2 2 f f .
        . f f 2 2 2 2 2 1 1 1 1 1 f f f a a f f f 1 1 1 1 1 2 2 2 2 f f .
        . f f 2 2 2 2 2 1 1 1 1 1 f f a a a f f f 1 1 1 1 1 2 2 2 2 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 f f f a a f f 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 1 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 1 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 1 b b f
        . f f f f f b b b b b b b b b b b b b b b b b b b b b f f f f f .
        . f f f f f b b b b b b b b b b b b b b b b b b b b b f f f f f .
        f b b b b b f f f f f f f f f f f f f f f f f f f f f b b b b b f
        . f f f f f . . . . . . . . . . . . . . . . . . . . . f f f f f .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . f f f f f f f f f f f . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . f b b b b b b b b b b b f f f f f f f f f f f . . . . . . . .
        . . . . . . . . . f b b b b b b b b b b b b b b b b b b b b b b b f f . . . . . .
        . . . . . . . . f b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b 1 1 f . . . . .
        . . . . . . . f b b b b b b b b b b b b b b b b 1 1 1 1 b b b b 1 1 a f . . . . .
        . . . . . . f b b b b b b b b b b b b b b b b b b b b b b b b 1 1 a a f . . . . .
        . . . . . f b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b 1 1 a f a f . . . . .
        . . . . f 1 b b b b b b b b b b b b b b b b b b b b b b b 1 1 a f f a f . . . . .
        . . . f 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b b 1 1 a f f f a f f f f . .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a f f f f a 1 1 1 1 f .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a f f f f f a 1 1 1 a f .
        . . . f 1 1 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 a f f f f f f a 1 1 a a f .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f a 1 1 a a a f .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f a 1 1 a a f f . .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f a 1 1 a a b b b f .
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f a 1 1 a a a f f b b f
        . . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f a 1 1 a a a a f f b b f
        . . f 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a a 1 1 a a a a a f f b b f
        . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a 1 1 a a a a a a b b a b f
        . f 1 1 1 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a b b a b f
        . f 2 2 2 2 1 1 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 1 1 a a b b b a a a b b a b f
        . f 2 2 2 2 1 1 1 1 1 f f f f f f f 1 1 1 1 1 1 2 2 2 2 a b b b b a a b b b b b f
        . f 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 1 2 2 2 2 a f f b b a f f f f b f .
        f b 2 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 1 2 2 2 2 a f f b b f f f f f b f .
        f b 1 1 1 1 1 1 1 1 1 f f f a f f f 1 1 1 1 1 1 2 2 2 2 a f f b b f . f b b b f .
        f b 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 a b b b b f . . f f f . .
        f b 1 1 1 b b b b b a a a a a f f 1 1 1 1 1 1 1 1 1 1 1 a b b b b f . . . . . . .
        . f 1 1 1 b b b b b b b b b b b b b b b b b b b b 1 1 1 a b b b b f . . . . . . .
        . f f f f b b b b b b b b b b b b b b b b b b b b 1 1 1 f b b b b f . . . . . . .
        . f b b f b b b b b b b b b b b b b b b b b b b b f f f f f f b b f . . . . . . .
        . . f f . f f f f f f f f f f f f f f f f f b b b f b f f f f b f . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . f f f . f . . . . f . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . f f f f f f f f f f . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . f f f b b b b b b b b b b f f f f f f f f f f f . . . . . . . . . .
        . . . . . . . . . . . f f b b b b b b b b b b b b b b b b b b b b b b b b f f . . . . . . . .
        . . . . . . . . . f f b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b 1 1 f . . . . . . .
        . . . . . . . f f b b b b b b b b b b b b b b b 1 1 1 1 1 1 b b b b b b 1 1 1 f . . . . . . .
        . . . . . f f b b b b b 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 a a f . . . . . . .
        . . . . f b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b 1 1 1 1 a a f a f . . . . . . .
        . . . f 1 b b b b b b b b b b b b b b b b b b 1 b b b b b 1 1 1 1 a a f f f a f . . . . . . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b b 1 1 1 a a a f f f f f a f f f f f . . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a f a f f f f f a 1 1 1 1 1 f f .
        . . f 1 1 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a f f f a f f f f f a 1 1 1 1 1 1 1 f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 a f f f f f f a f f f f f a 1 1 1 1 1 a a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f a f f f f a a 1 1 1 a a a a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f a f f a a 1 1 1 a a a a a a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f a a a 1 1 1 a a a a b b f a f
        . . f 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f a a 1 1 1 a a a a a b b b b a f
        . f f 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f a a 1 1 1 a a a a a a a f f b b b f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 1 1 a f a 1 1 1 1 a a a a a a a a f f b b b b f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a 1 1 1 a a a a a a a a a a a f f b b a b f
        f 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a a a a a a a b b b a a b f
        f 2 2 2 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 a a a a b b a a a a a a a a a b b b a a b f
        f 2 2 2 1 1 1 1 1 f f f a f f f 1 1 1 1 1 2 2 1 1 a a a b b b b a a a a a a a a b b b a a b f
        f 2 2 2 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 a a f f b b b b a a a a a b b b b b b b b f
        f 1 1 1 1 1 1 1 1 f f a a a f f 1 1 1 1 1 2 2 2 2 a a f f b b b b a a a b f f f f b b b b f .
        f 1 1 1 1 1 1 1 1 f f f f f f f 1 1 1 1 1 2 2 2 2 a a f b b a a b a b f f . f f f f b b b f .
        f 1 1 a a a 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 1 a a b b b a a b f f . . . . . . . f f f . .
        f 1 1 b b b b b b b b b b b a a 1 1 1 1 1 1 1 1 1 a a b b b a a b f . . . . . . . . . . . . .
        . f f b b b b b b b b b b b b b b b b b b b 1 1 1 a a b b b a a b f . . . . . . . . . . . . .
        . . f b b b b b b b b b b b b b b b b b b b 1 1 1 b b b b b a b b f . . . . . . . . . . . . .
        . . . f f f f f b b b b b b b b b b b b b b b f f f f f f b b b f . . . . . . . . . . . . . .
        . . . . . . . . f f f f f f f f f f f b b b f . . f f f f b b b f . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . f f f . . . . . . . f f f . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . f f f f b f f f f f f . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . f f f b b b b b b b b b b b f f f f f f . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . f f f b b b b b b b 1 b b b b b b b b b b b b f f f f f . . . . . . . . . . . . .
        . . . . . . . . . . f f f f b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b f f . . . . . . . . . . .
        . . . . . . f f f f b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 b b b b b b b 1 1 1 f . . . . . . . . . .
        . . . . . f b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b 1 1 1 1 1 a f . . . . . . . . . .
        . . . . f f b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b 1 1 1 1 1 a a a a a f . . . . . . . . . .
        . . . f 1 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b b b 1 1 1 1 1 a a a a f f f a f . . . . . . . . . .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 a a a a f f f f f f f a f f . . . . . . . . .
        . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a f f f f f f f f a 1 1 f f f f f f . . .
        . . . f 1 1 8 7 7 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 a a a a f f f f a a f f f f f f f f a 1 1 1 1 1 1 1 1 f f .
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 a f f f f f f f f a a f f f f f f f f a 1 1 1 1 1 1 1 1 1 1 f
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a f f f f f f f f a 1 1 1 1 1 1 1 a a a f
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a f f f f f a a a 1 1 1 1 1 a a a a a a f
        . . . f 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a f f a a 1 1 1 1 1 a a a a a a a a a a f
        . f f f 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f a a a 1 1 1 1 a a a a a a a b b b b a a a f
        f 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f a a 1 1 1 1 1 a a a a a a a a a b b b b b b a a f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 1 1 a f a a a 1 1 1 1 1 a a a a a a a a a a a f f b b b b b a a f
        f 2 1 1 1 1 1 1 1 1 f f f 1 1 1 1 1 1 1 1 1 1 1 a 1 1 1 1 1 a a a a a a a a a a a a a a a f b b b b b b a a f
        f 2 2 2 1 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a a a a a a a a a a a a b b b b a b b a a f
        f 2 2 2 1 1 1 1 1 f f f f f 1 1 1 1 1 1 1 1 1 a a a a a a f a a a a a a a a a a a a a a b b b b a a a b f f .
        f 2 2 2 1 1 1 1 f f f a f f 1 1 1 1 1 2 2 2 2 a a a a b b b b b a a a a a a a a a a a a b b b b a a a b f . .
        f 1 1 1 1 1 1 1 f f a a a f f 1 1 1 1 2 2 2 2 a a a f f f b b b b a a a a a a a a a a a b b b b a a b b f . .
        f 1 1 1 1 1 1 1 1 f f a a f f 1 1 1 1 2 2 2 2 a a a f f b b b b b a a a a a a a a b f f f b f b b b b b f . .
        f 1 1 a 1 1 1 1 1 f f f f f 1 1 1 1 1 2 2 2 2 a a a f b b b a b b a a a a b f f f f . f f f b b b b b f . . .
        f 1 1 b b b b b b b a f f f 1 1 1 1 1 1 1 1 1 a a a b b b a a a b a b f f f . . . . . f b f f f b b f . . . .
        . f f b b b b b b b b b b b b b a a 1 1 1 1 1 a a b b b b a a a b f f . . . . . . . . . f . . . f f . . . . .
        . . f b b b b b b b b b b b b b b b b b 1 1 1 a a b b b b a a b b f . . . . . . . . . . . . . . . . . . . . .
        . . . f f f b b b b b b b b b b b b b b 1 1 1 b b b b b b a a b b f . . . . . . . . . . . . . . . . . . . . .
        . . . . . . f f f f f f f b b b b b b b b f f f f f f f b b b b f . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . f f f f f f f f . . . f f f f b b b b f . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . f b b f f . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . .
    `]
let spinFrames = [img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . f f f f f f f f f f f f f f f f f f f f f . . . . . .
        . . . . f f b b b b b b b b b b b b b b b b b b b b b f f . . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . f 1 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f . .
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        f b b 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 b b f
        f b b 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 b b f
        . f f 1 1 1 1 8 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        . f f 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 2 2 2 2 2 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 2 2 2 2 b b f
        f b b 2 2 2 2 2 1 1 1 1 1 f f f a a f f f 1 1 1 1 1 2 2 2 2 b b f
        . f f 2 2 2 2 2 1 1 1 1 1 f f a a a f f f 1 1 1 1 1 2 2 2 2 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 f f f a a f f 1 1 1 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 f f f f f f 1 1 1 1 1 1 1 1 1 1 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 1 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 1 b b f
        f b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b f
        . f f f f f b b b b b b b b b b b b b b b b b b b b b f f f f f .
        . f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . f f f f f b b f f f . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . f f f f f b b b b b b b b b b f f f f f . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . f f f f f b b b b b b b b b 1 1 b b b b b b b b b f f f f f f . . . . . . . . . . . . . . .
        . . . . . . . . . f f f f b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b f . . . . . . . . . . . . . .
        . . . . . . . f f b b b b b b b b b 1 b b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b 1 f . . . . . . . . . . . . .
        . . . . . f f b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 1 f . . . . . . . . . . . .
        . . . . f 1 1 1 1 b b b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 1 a a a a f . . . . . . . . . . . .
        . . . . f 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 a a a a a a f f a f . . . . . . . . . . . .
        . . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b 1 1 1 1 1 1 a a a a a a f f f f f f f a f . . . . . . . . . . . .
        . . . . f 1 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a f f f f f f f f f f a 1 f f f f f . . . . . . .
        . . . . f 1 8 7 7 8 8 8 8 8 8 1 1 1 1 1 1 1 1 a a a a a f f f f f a a f f f f f f f f f f a 1 1 1 1 1 1 f f f f f . .
        . . . . f 1 8 7 7 8 8 8 8 8 8 8 8 8 8 1 1 1 a f f f f f f f f f f a a f f f f f f f f f f a 1 1 1 1 1 1 1 1 1 1 1 f .
        . . . . f 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f f f a a f f f f f f f f f f a 1 1 1 1 1 1 1 1 1 1 1 1 f
        . . . . f 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f f f a a f f f f f f f f a a a 1 1 1 1 1 1 1 a a a a 1 f
        . . f f f 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f f f a a f f f f a a a 1 1 1 1 1 1 a a a a a a a a a d f
        . f 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 1 1 a f f f f f f f f f f a a a a 1 1 1 1 1 1 1 a a a a a a a a a a a a a d f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 1 1 a f f f f f f a a a a 1 1 1 1 1 1 a a a a a a a a a b f f b b b a a a d f
        f 1 1 1 1 1 1 1 1 f f 1 1 1 1 1 1 1 8 8 1 1 a f a a a a 1 1 1 1 1 1 a a a a a a a a a a a a a a b b b b b b f a a 1 f
        f 2 2 2 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 a 1 1 1 1 1 1 a a a a a a a a a a a a a a a a a a b b b b b b b b a a 1 f
        f 2 2 2 1 1 1 1 f f f f 1 1 1 1 1 1 1 1 1 1 1 1 a a a a a a a a a a a a a a a a a a a a a a a f b b b b b b b a a 1 f
        f 2 2 2 1 1 1 1 f f a f f 1 1 1 1 1 1 1 a a a a a a a f f a a a a a a a a a a a a a a a a a f f b b b a a b b a a 1 f
        f 1 1 1 1 1 1 1 f a a f f 1 1 1 1 2 2 2 a a a a a a b b b b b a a a a a a a a a a a a a a a f b b b a a a b b f f f .
        f 1 1 1 1 1 1 1 f a a f f 1 1 1 1 2 2 2 a a a a a b b b b b b b a a a a a a a a a a a a a a b f b b a a a b b f . . .
        f 1 1 1 1 1 1 1 f f f f f 1 1 1 1 2 2 2 a a a a f b b b b b b b a a a a a a a a a a a a b b b b b b a a b b b f . . .
        f 1 b b b b b a 1 f f f f 1 1 1 1 1 2 2 a a a a f b b b b a b b a a a a a a a b f f f f f b b b b b b b b b f . . . .
        . f b b b b b b b b b b a 1 1 1 1 1 1 1 a a a a f b b b a a b b f a b f f f f f . . . . . f f f f b b b b b f . . . .
        . f b b b b b b b b b b b b b b b a 1 1 a a a f f b b a a a b b f f f . . . . . . . . . . . . . f b b b b f . . . . .
        . . f f b b b b b b b b b b b b b a 1 1 a a a b b b b a a a b b f . . . . . . . . . . . . . . . . f f f f . . . . . .
        . . . . f f f f f b b b b b b b b b 1 1 b f b b b b b b a a b b f . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . f f f f f b b b b b f f f b b b b b b b b b f . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . f f f f f . . . f f f f b b b b b f . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . f b f b f f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . f . f . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . . . . . . . . .
        . . . . . . f f b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b f f f . . . . . . . . . . . . . . .
        . . . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b 1 1 1 f . . . . . . . . . . . . . .
        . . . . . f 1 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 b b b 1 1 1 f . . . . . . . . . . . . . .
        . . . . . f 1 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 b b b 1 1 1 f . . . . . . . . . . . . . .
        . . . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b 1 1 1 f . . . . . . . . . . . . . .
        . . . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b 1 1 1 f . . . . . . . . . . . . . .
        . . . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . . . . . . . . . . . . .
        . . . . . f 1 a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a 1 f . . . . . . . . . . . . . .
        . . . . . f 1 a a f f f f f f f f f f f f f f a a f f f f f f f f f f f f f f a a 8 f . . . . . . . . . . . . . .
        . . . f f f 1 a a f f f f f f f f f f f f f f a a f f f f f f f f f f f f f f a a 8 f f f f f f f f f f f f f f .
        . . f 1 1 1 1 a a f f f f f f f f f f f f f f a a f f f f f f f f f f f f f f a a 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        . . f 1 1 1 1 a a f f f f f f f f f f f f f f a a f f f f f f f f f f f f f f a a 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        . . . f 1 1 1 a a f f f f f f f f f f f f f f a a f f f f f f f f f f f f f f a a 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        . . f 1 1 1 1 a a f f f f f f f f f f f f f f a a f f f f f f f f f f f f f f a a 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        . . f 1 1 1 1 a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        . . f 1 a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a 1 f
        . f f 2 a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a 1 f
        f b a 2 a a a a a a a f b b b b a a a a a a a a a a a a a a a a a a a a a a a a a a a b b b b b b a a a a a a d f
        f b a 2 a a a a a b b b b b b b b a a a a a a a a a a a a a a a a a a a a a a a a b b b b b b b b b a a a a a d f
        f b a 2 a a a a a b b b b b b b b b a a a a a a a a a a a a a a a a a a a a a a a b b b b b b b b b f a a a a d f
        f b a 1 a a a a b b b b b b b b b b f a a a a a a a a a a a a a a a a a a a a a f b b b b b b b b b b a a a a 1 f
        f b a 1 a a a a b b b b a a a b b b b a a a a a a a a a a a a a a a a a a a a a b b b b a a a a b b b a a a a 1 f
        f b b 1 a a a a b b b b a a a a b b b a a a a a a a a a a a a a a a a a a a a a b b b b a a a a b b b a a a a 1 f
        f b b 1 b b b b b b b b a a a a b b b b b b b b b b b b b b b b b b b b b b b b b b b b a a a a b b b b b b b 1 f
        f b b b f f f f b b b b a a a a b b b f f f f f f f f f f f f f f f f f f f f f b b b b a a a a b b b f f f f f .
        . f f f . . . . f b b b b b b b b b f . . . . . . . . . . . . . . . . . . . . . f b b b b b b b b b b f . . . . .
        . . . . . . . . f b b b b b b b b f . . . . . . . . . . . . . . . . . . . . . . . f b b b b b b b b f . . . . . .
        . . . . . . . . . f f b b b b b f . . . . . . . . . . . . . . . . . . . . . . . . . f b b b b b f f . . . . . . .
        . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . . . . . . . . . . . . . f f f f f . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . f f f f f f f . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . f f f f f b b b b b b b f f f f f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . f f f f f b b b b b b b b b b b b b b b b b f f f f f . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . f f b b b b b b b b b 1 1 1 1 1 1 1 1 1 b b b b b b b b b f f f f f . . . . . . . . . . . . . . . . . .
        . . . . . f f b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b f f f . . . . . . . . . . . . . . .
        . . . . f 1 1 1 1 b b b b b b b b b 1 b b b b b b b b b 1 1 1 1 1 1 1 1 1 b b b b b b b f . . . . . . . . . . . . . .
        . . . . f a a 1 1 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b 1 f . . . . . . . . . . . . .
        . . . . f a f a a a a a 1 1 1 1 1 1 b b b b b b b b b b 1 b b b b b b b b b 1 1 1 1 1 1 1 1 f . . . . . . . . . . . .
        . . . . f a f f f f f f a a a a a 1 1 1 1 1 1 b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . . . . . . . . . . .
        . . . . f a f f f f f f f f f f a a a a a a 1 1 1 1 1 1 b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 f . . . . . . . . . . . .
        . . . . f a f f f f f f f f f f a a f f f a a a a a a 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 f . . . . . . . . . . . .
        . . . . f a f f f f f f f f f f a a f f f f f f f f a a a 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 f . . . . . . . . . . . .
        . . f f f a f f f f f f f f f f a a f f f f f f f f f f a 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 f . . . . . . . . . . . .
        . f 1 1 1 a f f f f f f f f f f a a f f f f f f f f f f a 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 f . . . . . . . . . . . .
        f 1 1 1 1 1 1 a a a a f f f f f a a f f f f f f f f f f a 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 f . . . . . . . . . . . .
        f 2 a a a a 1 1 1 1 1 1 a a a a a a f f f f f f f f f f a 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 f f f f f . . . . . . .
        f 2 a a a a a a a a a 1 1 1 1 1 1 a a a f f f f f f f f a 8 8 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f f f . .
        f 2 a a a a a a a a a a a a a 1 1 1 1 1 1 1 a a a f f f a 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f .
        f 2 a a a b b b b b a a a a a a a a a a 1 1 1 1 1 1 a a a 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 a a b b b b b b b a a a a a a a a a a a a a a 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 a a b b b b b b b b a a a a a a a a a a a a a a a a a a 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 d d f
        f 1 a a b b b b b b b f a a a a a a a a a a a a a a a a a a a a a a a 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f 1 d d d d f
        f 1 a a b b a a b b b f f a a a a a a a a a a a a a a a a a f a a a a a a a a 1 1 1 1 1 1 1 f f f b b b f 1 d d d d f
        . f b b b b a a a b b b f a a a a a a a a a a a a a a a b b b b b a a a a a a 1 1 d d 1 b b b f f f b b f 1 d 1 1 1 f
        . . f f b b a a a b b f f a a a a a a a a a a a a a a b b b b b b b a a a a a d d d d 1 f b b f f f b b b 1 1 1 1 1 f
        . . . f b b b a a b b b b b b a a a a a a a a a a a a b b b b b b b f a a a a d d d d 1 f b b b f f f b b 1 1 1 1 1 f
        . . . . f b b b b b b b b b f f f f f b a a a a a a a b b a b b b b f a a a a d d 1 1 1 f f b b b 1 1 1 1 1 1 1 1 1 f
        . . . . f b b b b b f f f f . . . . . f f f f f b a f b b a a b b b f a a a a 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f f .
        . . . . . f b b b b f . . . . . . . . . . . . . f f f b b a a a b b f f a a a 1 1 1 1 1 1 1 1 1 1 1 b f f f f . . . .
        . . . . . . f f f f . . . . . . . . . . . . . . . . f b b a a a b b b b a a a 1 1 1 1 1 1 f f b b b b f . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . f b b a a b b b b b b f b 1 1 f f f f . . f f f f . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . f b b b b b b b b b f f f f . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . f b b b b b f f f f . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f b f f . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . f f f f f f f f f f f f f f f f f f f f f . . . . . .
        . . . . f f b b b b b b b b b b b b b b b b b b b b b f f . . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f 1 1 b b b b b b b b b b b b b b b b b b b b b 1 1 f . . .
        . . . f 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 f . . .
        . . . f a 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . .
        . . f 1 f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        . . f 1 f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 f . .
        . . f 1 f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 f . .
        . . f 1 f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 f . .
        . f f 1 f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 f f .
        f b b 1 f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 b b f
        f b b 1 f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 1 b b f
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b f
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b f
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b f
        . f f d d d d d 1 b b b b b b b b b b b b b b 1 d d d d d d f f .
        f b f d d d d d 1 b b b b b b b b b b b b b b 1 d d d d d d f b f
        . f f 1 1 1 1 1 1 b b b b b b b b b b b b b b 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 f f f f f f f f f f f f f f 1 1 1 1 1 1 1 f f .
        . f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f f .
        f b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b b f
        f b b b b b f f f f f f f f f f f f f f f f f f f f f b b b b b f
        . f f f f f . . . . . . . . . . . . . . . . . . . . . f f f f f .
        . f f f f f . . . . . . . . . . . . . . . . . . . . . f f f f f .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f f f f f f . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f f f f b b b b b b b f f f f f . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . f f f f f b b b b b b b b b b b b b b b b b f f f f f . . . . . . . . .
        . . . . . . . . . . . . . . . . . . f f f f f b b b b b b b b b 1 1 1 1 1 1 1 1 1 b b b b b b b b b f f . . . . . . .
        . . . . . . . . . . . . . . . f f f b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b f f . . . . .
        . . . . . . . . . . . . . . f b b b b b b b 1 1 1 1 1 1 1 1 1 b b b b b b b b b 1 b b b b b b b b b 1 1 1 1 f . . . .
        . . . . . . . . . . . . . f 1 b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 1 1 9 9 f . . . .
        . . . . . . . . . . . . f 1 1 1 1 1 1 1 1 b b b b b b b b b 1 b b b b b b b b b b 1 1 1 1 1 1 9 9 9 9 9 f 9 f . . . .
        . . . . . . . . . . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b 1 1 1 1 1 1 9 9 9 9 9 f f f f f f 9 f . . . .
        . . . . . . . . . . . . f 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 b 1 1 1 1 1 1 9 9 9 9 9 9 f f f f f f f f f f 9 f . . . .
        . . . . . . . . . . . . f 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 9 9 9 9 9 9 f f f 9 9 f f f f f f f f f f 9 f . . . .
        . . . . . . . . . . . . f 8 8 8 8 8 8 8 8 8 8 8 8 8 1 1 1 1 9 9 9 f f f f f f f f 9 9 f f f f f f f f f f 9 f . . . .
        . . . . . . . . . . . . f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 9 f f f f f f f f f f 9 9 f f f f f f f f f f 9 f f f . .
        . . . . . . . . . . . . f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 9 f f f f f f f f f f 9 9 f f f f f f f f f f 9 1 1 1 f .
        . . . . . . . . . . . . f 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 9 f f f f f f f f f f 9 9 f f f f f 9 9 9 9 1 1 1 1 1 1 f
        . . . . . . . f f f f f 1 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 8 9 f f f f f f f f f f 9 9 9 9 9 9 1 1 1 1 1 1 9 9 9 9 2 f
        . . f f f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 8 9 f f f f f f f f 9 9 9 1 1 1 1 1 1 9 9 9 9 9 9 9 9 9 2 f
        . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 8 9 f f f 9 9 9 1 1 1 1 1 1 1 9 9 9 9 9 9 9 9 9 9 9 9 9 2 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 9 9 9 1 1 1 1 1 1 9 9 9 9 9 9 9 9 9 b b f b b b 9 9 9 2 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b b b b b b b 9 9 1 f
        f d d 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b b b b b b b b 9 9 1 f
        f d d d d 1 f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f f b b b b b b 9 9 1 f
        f d d d d 1 f b b b f f f 1 1 1 1 1 1 1 9 9 9 9 9 9 9 f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f f b b b a a b b 9 9 1 f
        f 1 1 1 d 1 f b b f f f b b b 1 d d 1 1 9 9 9 9 9 9 b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f f b b a a a b b b b f .
        f 1 1 1 1 1 b b b f f f b b f 1 d d d d 9 9 9 9 9 b b b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f f b b a a a b b f f . .
        f 1 1 1 1 1 b b f f f b b b f 1 d d d d 9 9 9 9 f f b b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 b b b b b b a a b b b f . . .
        f 1 1 1 1 1 1 1 1 1 b b b f f 1 1 1 d d 9 9 9 9 f f b b b a b b f 9 9 9 9 9 9 b f f f f f b b b b b b b b b f . . . .
        . f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 9 9 9 9 f f b b a a b b f 9 b f f f f f . . . . . f f f f b b b b b f . . . .
        . . . . f f f f b 1 1 1 1 1 1 1 1 1 1 1 9 9 9 f f b b a a a b b b f f . . . . . . . . . . . . . f f b b b f . . . . .
        . . . . . . . f f b b b f f 1 1 1 1 1 1 9 9 9 b b b b a a a b b f . . . . . . . . . . . . . . . . . f f f . . . . . .
        . . . . . . . . . f f f . . f f f f 1 1 b f b b b b b b a a b b f . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . f f f f b b b b b b b b b f . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . f f f f f b b b b f . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . f f b f f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f . . . . . . . .
        . . . . . . . . . . . . . . . f f f b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b f f . . . . . .
        . . . . . . . . . . . . . . f 1 1 1 b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b 1 1 f . . . . .
        . . . . . . . . . . . . . . f 1 1 1 b b b 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 1 f . . . . .
        . . . . . . . . . . . . . . f 1 1 1 b b b 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 1 1 1 1 1 1 1 1 1 1 b b 1 1 1 f . . . . .
        . . . . . . . . . . . . . . f 1 1 1 b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b 1 1 f . . . . .
        . . . . . . . . . . . . . . f 1 1 1 b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b 1 1 f . . . . .
        . . . . . . . . . . . . . . f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . . . .
        . . . . . . . . . . . . . . f 8 1 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 f . . . . .
        . . . . . . . . . . . . . . f 8 8 9 f f f f f f f f f f f f f f 9 9 f f f f f f f f f f f f f f 9 9 1 f . . . . .
        . f f f f f f f f f f f f f f 8 8 9 f f f f f f f f f f f f f f 9 9 f f f f f f f f f f f f f f 9 9 1 f f f . . .
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 9 f f f f f f f f f f f f f f 9 9 f f f f f f f f f f f f f f 9 9 1 1 1 1 f . .
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 9 f f f f f f f f f f f f f f 9 9 f f f f f f f f f f f f f f 9 9 1 1 1 1 f . .
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 9 f f f f f f f f f f f f f f 9 9 f f f f f f f f f f f f f f 9 9 1 1 1 f . . .
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 9 f f f f f f f f f f f f f f 9 9 f f f f f f f f f f f f f f 9 9 1 1 1 1 f . .
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 f . .
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . .
        f 1 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 f . .
        f 1 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 2 f f .
        f d 9 9 9 9 9 9 9 b f f f b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b f f f f 9 9 9 9 9 9 9 2 a b f
        f d 9 9 9 9 9 b b b b b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b b b b b b b b 9 9 9 9 9 2 a b f
        f d 9 9 9 9 f b b b b b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b b b b b b b b b 9 9 9 9 9 2 a b f
        f 1 9 9 9 9 f f b b b b b b b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f f b b b b b b b f f 9 9 9 9 1 a b f
        f 1 9 9 9 9 b b b a a a a b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f b b b a a a b b b b 9 9 9 9 1 a a f
        f 1 9 9 9 9 b b b a a a a b b b f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b b b a a a a b b b f 9 9 9 9 1 b b f
        f 1 b b b b b b b a a a a b b b b b b b b b b b b b b b b b b b b b b b b b b b b a a a a b b b b b b b b 1 b b f
        . f f f f f b b b a a a a b b b b f f f f f f f f f f f f f f f f f f f f f b b b a a a a b b b b f f f f b b b f
        . . . . . f b b b b b b b b b b f . . . . . . . . . . . . . . . . . . . . . f b b b b b b b b b b f . . . f f f .
        . . . . . . f f b b b b b b b f . . . . . . . . . . . . . . . . . . . . . . . f b b b b b b b b f . . . . . . . .
        . . . . . . . . f f b b b f f . . . . . . . . . . . . . . . . . . . . . . . . . f f b b b f f f . . . . . . . . .
        . . . . . . . . . . f f f . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f f . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . f f f b b f f f f f . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . f f f f f b b b b b b b b b b f f f f f . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . f f f f f f b b b b b b b b b 1 1 b b b b b b b b b f f f f f . . . . . . . . . . . . .
        . . . . . . . . . . . . . . f b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b b b b b f f f f . . . . . . . . .
        . . . . . . . . . . . . . f 1 b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b b 1 b b b b b b b b b f f . . . . . . .
        . . . . . . . . . . . . f 1 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 1 b b b b b b b f f . . . . .
        . . . . . . . . . . . . f 9 9 9 9 1 1 1 1 1 1 b b b b b b b b b 1 1 1 1 1 1 1 1 b b b b b b b b b b 1 1 1 1 f . . . .
        . . . . . . . . . . . . f 9 f f 9 9 9 9 9 9 1 1 1 1 1 1 b b b b b b b b b b b b b b b b b 1 1 1 1 1 1 1 1 1 f . . . .
        . . . . . . . . . . . . f 9 f f f f f f f 9 9 9 9 9 9 1 1 1 1 1 1 b b b b b b b 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f . . . .
        . . . . . . . f f f f f 1 9 f f f f f f f f f f 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 1 f . . . .
        . . f f f f f 1 1 1 1 1 1 9 f f f f f f f f f f 9 9 f f f f f 9 9 9 9 9 1 1 1 1 1 1 1 1 8 8 8 8 8 8 8 8 8 1 f . . . .
        . f 1 1 1 1 1 1 1 1 1 1 1 9 f f f f f f f f f f 9 9 f f f f f f f f f f 9 1 1 1 8 8 8 8 8 8 8 8 8 8 8 8 8 1 f . . . .
        f 1 1 1 1 1 1 1 1 1 1 1 1 9 f f f f f f f f f f 9 9 f f f f f f f f f f 9 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 f . . . .
        f 1 9 9 9 9 1 1 1 1 1 1 1 9 9 9 f f f f f f f f 9 9 f f f f f f f f f f 9 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 f . . . .
        f d 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 9 9 9 f f f f 9 9 f f f f f f f f f f 9 1 1 8 7 7 8 8 8 8 8 8 8 8 8 8 8 1 f f f . .
        f d 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 9 9 9 9 f f f f f f f f f f 9 1 1 8 7 7 8 8 8 8 8 8 8 8 1 1 1 1 1 1 1 f .
        f d 9 9 9 b f f f b 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 9 9 9 9 f f f f f f 9 1 1 8 7 7 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 9 9 b b b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 9 9 9 9 f 9 1 1 8 8 1 1 1 1 1 1 1 f f 1 1 1 1 1 1 1 1 f
        f 1 9 9 b b b b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 9 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 2 2 2 f
        f 1 9 9 b b b b b b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 1 1 1 1 1 f f f f 1 1 1 1 2 2 2 f
        f 1 9 9 b b a a b b f f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f 9 9 9 9 9 9 9 9 1 1 1 1 1 1 1 f f a f f 1 1 1 1 2 2 2 f
        . f f f b b a a a b b f f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b f f b b 9 9 9 9 9 9 2 2 2 1 1 1 1 f f a a f 1 1 1 1 1 1 1 f
        . . . f b b a a a b b f b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 b b b b b b b 9 9 9 9 9 2 2 2 1 1 1 1 f f a a f 1 1 1 1 1 1 1 f
        . . . f b b b a a b b b b b b 9 9 9 9 9 9 9 9 9 9 9 9 b b b b b b b f 9 9 9 9 2 2 2 1 1 1 1 f f f f f 1 1 1 1 1 1 1 f
        . . . . f b b b b b b b b b f f f f f b 9 9 9 9 9 9 f b b a b b b f f 9 9 9 9 2 2 1 1 1 1 1 f f f f 1 a b b b b b 1 f
        . . . . f b b b b b f f f f . . . . . f f f f f b 9 f b b a a b b f f 9 9 9 9 1 1 1 1 1 1 1 a b b b b b b b b b b f .
        . . . . . f b b b f f . . . . . . . . . . . . . f f b b b a a a b b f f 9 9 9 1 1 a b b b b b b b b b b b b b b b f .
        . . . . . . f f f . . . . . . . . . . . . . . . . . f b b a a a b b b b 9 9 9 1 1 a b b b b b b b b b b b b b f f . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . f b b a a b b b b b b f b 1 1 b b b b b b b b b f f f f f . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . f b b b b b b b b b f f f b b b b b f f f f f . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . f b b b b f f f f . . . f f f f f . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f b f f . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `]
// أضواء الفرامل | brake lights
let carBrakeA: Image[] = []
let carBrakeB: Image[] = []
for (let i = 0; i < carFramesA.length; i++) {
    let a = carFramesA[i].clone()
    a.replace(2, 14)
    carBrakeA.push(a)
    let b = carFramesB[i].clone()
    b.replace(2, 14)
    carBrakeB.push(b)
}
let rivalFrames = [img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . f f f f f f . . . . . . . . . . .
        . . . . . . f f f f f f f f f f f f f f f f f f 8 e e e e e f . . . . . . . . . .
        . . . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . . . . . . . .
        . . . . . f e e e e e e e e e e e e e e e e e e e e e e e e e e f . . . . . . . .
        . . . . . f 2 e e e e e e e e e e e e e e e e e e e e e e e e e e f . . . . . . .
        . . . . . . f 2 e e e e e e e e e e e e e e e e e e e e e e e e e e f f . . . . .
        . . . . . . f f 2 e e e e e e e e e e e e e e e e e e e e e e e e e e e f . . . .
        . f f f f f f f f 2 e e e e e e e e e e e e e e e e e e e e e e e e e e e f . . .
        f e e e e e f f f f 2 2 e e e e e e e e e e e e e e e e e e e e e e e e e e f . .
        f 2 e e e e f f f f f 2 2 e e e e e e e e e e e e e e e e e e e e e e e e e f . .
        f 2 2 e e e f f f f f f f 2 e e e e e e e e e e e e e e e e e e e e e e e e f . .
        f 2 2 2 e e 2 f f f f f f f e e e e e e e e e e e 8 8 8 8 8 8 8 8 8 8 8 8 e f . .
        f 2 2 2 2 e e 2 f f f f f f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e f . .
        f 2 2 2 2 2 e e 2 f f f f f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e f . .
        . f b b 2 2 2 2 e e 2 f f f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e f . .
        f b b b b 2 2 2 2 e e 2 f f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e f . .
        f b b b b 2 2 2 2 2 e e 2 f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e f . .
        f a b f f 2 2 2 2 2 2 e e 2 e e e 8 8 8 8 e e e e e e e e e e e e e e e e e e f .
        f a b f f 2 2 2 2 2 2 2 e e e e e e e e e e e e e e e e e e e e e e e e e e e e f
        f a b f f 2 2 2 2 2 2 2 2 e e e e e e e e e e e e e e e e e e e e e e e e e e e f
        f a b f f 2 2 2 2 f f f 2 2 e e e e e e e e e e e e e e e e e e e e e e d d d d f
        f b b b b b 2 2 2 b b b 2 2 d d d d e e e e e e e e e e e e e e e e e e d d d d f
        f b b b b b b 2 b b b b b 2 d d d d e e e e e e e e e e e e e e e e e e d d d d f
        f b f f f f f f b b b f f 2 d d d d e e e e e e e e e e e e e e e e e e d d d d f
        . f f f f f b f b a b f f 2 d d d d e e e e e e e e e e e e e e e e e e e e e e f
        . . . . . . f f b a b f f 2 e e e e e e e e e e e e 1 1 1 1 1 e e e e e e e e e f
        . . . . . . . f b a b f f 2 e e e e e e e e e e 1 1 a a a a b b b b b b b e e e f
        . . . . . . . . f a b b b 2 e e e b b b b b b b b b b b b b b b b b b b b e e e f
        . . . . . . . . f b b b b b e e e b b b b b b b b b b b b b b b b b b b b f f f .
        . . . . . . . . f b f b b b b b f b b b b b b b b b b b b b b b b b b b b f f f .
        . . . . . . . . f b f f f f f f f b b b b f f f f f f f f f f f f f f f f . . . .
        . . . . . . . . . f . . . . . . . f f f f . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . f f f f f f f f f f f f f f f f f f f f f f f f f . . . .
        . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . .
        . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . .
        . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . .
        . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . .
        . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . .
        . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . .
        . . f e e e e e e e e e e e e e e e e e e e e e e e e e e e f . .
        . . f e e e e e e e e e e e e e e e e e e e e e e e e e e e f . .
        . . f e e e e e e e e e e e e e e e e e e e e e e e e e e e f . .
        . . f e e e e e e e e e e e e e e e e e e e e e e e e e e e f . .
        . . f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f . .
        . f f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f f .
        f b b e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e b b f
        f b b e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e b b f
        . f f e e e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f f .
        . f f e e e e e e e e e e e e e e e e e e e e e e e e e e e f f .
        . f f e e e e e e e e e e e e e e e e e e e e e e e e e e e f f .
        . f f e e e e e e e e e e e e e e e e e e e e e e e e e e e f f .
        f b b d d d d d e e e e e e e e e e e e e e e e e e d d d d b b f
        f b b d d d d d e e e e e e e e e e e e e e e e e e d d d d b b f
        f b b d d d d d e e e e e e e e e e e e e e e e e e d d d d b b f
        . f f d d d d d e e e e e e e e e e e e e e e e e e d d d d f f .
        . f f d d d d d e e e e e e e e e e e e e e e e e e d d d d f f .
        . f f e e e e e e e e e e e e e e e e e e e e e e e e e e e f f .
        f b b e e e e e e e e e e 1 1 1 1 1 1 1 e e e e e e e e e e b b f
        f b b e e e b b b b b b b b b b b b b b b b b b b b b e e e b b f
        f b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b f
        . f f f f f b b b b b b b b b b b b b b b b b b b b b f f f f f .
        . f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `, img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . f f f f f f . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . f e e e e e 8 f f f f f f f f f f f f f f f f f f . . . . . .
        . . . . . . . . . f e e e e e e e e e e e e e e e e e e e e e e e e e f . . . . .
        . . . . . . . . f e e e e e e e e e e e e e e e e e e e e e e e e e e f . . . . .
        . . . . . . . f e e e e e e e e e e e e e e e e e e e e e e e e e e 2 f . . . . .
        . . . . . f f e e e e e e e e e e e e e e e e e e e e e e e e e e 2 f . . . . . .
        . . . . f e e e e e e e e e e e e e e e e e e e e e e e e e e e 2 f f . . . . . .
        . . . f e e e e e e e e e e e e e e e e e e e e e e e e e e e 2 f f f f f f f f .
        . . f e e e e e e e e e e e e e e e e e e e e e e e e e e 2 2 f f f f e e e e e f
        . . f e e e e e e e e e e e e e e e e e e e e e e e e e 2 2 f f f f f e e e e 2 f
        . . f e e e e e e e e e e e e e e e e e e e e e e e e 2 f f f f f f f e e e 2 2 f
        . . f e 8 8 8 8 8 8 8 8 8 8 8 8 e e e e e e e e e e e f f f f f f f 2 e e 2 2 2 f
        . . f e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f f f f f f 2 e e 2 2 2 2 f
        . . f e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f f f f f 2 e e 2 2 2 2 2 f
        . . f e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f f f 2 e e 2 2 2 2 b b b f
        . . f e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f f 2 e e 2 2 2 2 b b b b f
        . . f e 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 e e e f 2 e e 2 2 2 2 2 b b b b f
        . f e e e e e e e e e e e e e e e e e e 8 8 8 8 e e e 2 e e 2 2 2 2 2 2 f f b a f
        f e e e e e e e e e e e e e e e e e e e e e e e e e e e e 2 2 2 2 2 2 2 f f b a f
        f e e e e e e e e e e e e e e e e e e e e e e e e e e e 2 2 2 2 2 2 2 2 f f b a f
        f d d d d e e e e e e e e e e e e e e e e e e e e e e 2 2 f f b 2 2 2 2 f f b a f
        f d d d d e e e e e e e e e e e e e e e e e e d d d d 2 2 b b b 2 2 2 b b b b b f
        f d d d d e e e e e e e e e e e e e e e e e e d d d d 2 b b b b b 2 b b b b b b f
        f d d d d e e e e e e e e e e e e e e e e e e d d d d 2 f f b b b f f f f f b b f
        f e e e e e e e e e e e e e e e e e e e e e e d d d d 2 f f b a b f b f f f f f .
        f e e e e e e e e e 1 1 1 1 1 e e e e e e e e e e e e 2 f f b a b f f . . . . . .
        f e e e b b b b b b b a a a a 1 1 e e e e e e e e e e 2 f f b a b f . . . . . . .
        f e e e b b b b b b b b b b b b b b b b b b b b e e e 2 b b b a f . . . . . . . .
        . f f f b b b b b b b b b b b b b b b b b b b b e e e b b b b b f . . . . . . . .
        . f f f b b b b b b b b b b b b b b b b b b b b f b b b b b b b f . . . . . . . .
        . . . . f f f f f f f f f f f f f f f f b b b b f f f f f f f b f . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . f f f f . . . . . . . f . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `]
let imgCamel1 = img`
        . . . . . . . . . . . . . . . . . . . . . . 6 6 . . . .
        . . . . . . . . . . . . . . . . . . . . . 6 5 5 6 . . .
        . . . . . . . . . . . . . . . . . . . . . 6 5 f 6 . . .
        . . . . . . . . . . . . . . . . . . . . . . 6 5 6 . . .
        . . . . . . . . . . . . . . . . . . . . . . 6 6 . . . .
        . . . . . . . . . 6 6 6 6 . . . . . . . . . 6 6 . . . .
        . . . . . . . 6 6 5 5 5 5 6 6 . . . . . . 6 6 . . . . .
        . . . . . . 6 5 5 5 5 5 5 5 5 6 6 6 6 6 6 6 . . . . . .
        . . . . . 6 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 6 . . . . . .
        . . . . 6 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 6 . . . . . .
        . . . . 6 6 5 5 5 5 5 5 5 5 5 5 5 5 5 6 6 . . . . . . .
        . . . . 6 . 6 5 5 5 5 5 5 5 5 5 5 6 6 . . . . . . . . .
        . . . . . . 6 5 6 6 6 6 6 5 6 5 6 . . . . . . . . . . .
        . . . . . . 6 6 . . . . . 6 . 6 6 . . . . . . . . . . .
        . . . . . . 6 . 6 . . . . 6 . . 6 . . . . . . . . . . .
        . . . . . 6 . . 6 . . . . 6 . . . 6 . . . . . . . . . .
        . . . . . 6 . . 6 . . . . 6 . . . 6 . . . . . . . . . .
        . . . . . 6 . . . 6 . . . 6 . . . 6 . . . . . . . . . .
        . . . . 6 . . . . 6 . . . 6 . . . 6 . . . . . . . . . .
        . . . . 6 . . . . 6 . . . 6 . . . 6 . . . . . . . . . .
        . . . 6 6 . . . . 6 6 . . 6 6 . . 6 6 . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `
let imgCamel2 = img`
        . . . . . . . . . . . . . . . . . . . . . . 6 6 . . . .
        . . . . . . . . . . . . . . . . . . . . . 6 5 5 6 . . .
        . . . . . . . . . . . . . . . . . . . . . 6 5 f 6 . . .
        . . . . . . . . . . . . . . . . . . . . . . 6 5 6 . . .
        . . . . . . . . . . . . . . . . . . . . . . 6 6 . . . .
        . . . . . . . . . 6 6 6 6 . . . . . . . . . 6 6 . . . .
        . . . . . . . 6 6 5 5 5 5 6 6 . . . . . . 6 6 . . . . .
        . . . . . . 6 5 5 5 5 5 5 5 5 6 6 6 6 6 6 6 . . . . . .
        . . . . . 6 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 6 . . . . . .
        . . . . 6 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 6 . . . . . .
        . . . . 6 6 5 5 5 5 5 5 5 5 5 5 5 5 5 6 6 . . . . . . .
        . . . . 6 . 6 5 5 5 5 5 5 5 5 5 5 6 6 . . . . . . . . .
        . . . . . . 6 5 6 5 6 6 6 6 6 5 6 . . . . . . . . . . .
        . . . . . . 6 6 . 6 . . . . . 6 6 . . . . . . . . . . .
        . . . . . . . 6 6 . 6 . . . . 6 . 6 . . . . . . . . . .
        . . . . . . . 6 . . 6 . . . . 6 . . 6 . . . . . . . . .
        . . . . . . 6 . . . 6 . . . 6 . . . 6 . . . . . . . . .
        . . . . . . 6 . . . 6 . . . 6 . . . . 6 . . . . . . . .
        . . . . . . 6 . . . 6 . . . 6 . . . . 6 . . . . . . . .
        . . . . . 6 . . . . 6 . . 6 . . . . . 6 . . . . . . . .
        . . . . . 6 6 . . . 6 6 . 6 6 . . . . 6 6 . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    `
let imgCamel1L = imgCamel1.clone()
imgCamel1L.flipX()
let imgCamel2L = imgCamel2.clone()
imgCamel2L.flipX()
let imgFuel = img`
        . . . . b b b b . . . .
        . . . b . . . . b . . .
        . e e e e e e e e e e .
        . e e e e e e e e e e .
        . e 1 e e e e e e 1 e .
        . e e 1 e e e e 1 e e .
        . e e e 1 e e 1 e e e .
        . e e e e 1 1 e e e e .
        . e e e 1 e e 1 e e e .
        . e e 1 e e e e 1 e e .
        . e 1 e e e e e e 1 e .
        . e e e e e e e e e e .
        . e e e e e e e e e e .
        . . f f f f f f f f . .
    `
let imgNitro = img`
        . . . . b b . . . .
        . . . b b b b . . .
        . . . . b b . . . .
        . . . 8 8 8 8 . . .
        . . 8 8 8 8 8 8 . .
        . . 8 1 7 8 8 8 . .
        . . 8 1 7 8 8 8 . .
        . . 8 7 8 8 d 8 . .
        . . 8 8 d d 8 8 . .
        . . 8 d d 8 8 8 . .
        . . 8 8 d d 8 8 . .
        . . 8 8 8 d 8 8 . .
        . . 8 8 8 8 8 8 . .
        . . 8 8 8 8 8 8 . .
        . . 8 8 8 8 8 8 . .
        . . . 8 8 8 8 . . .
    `
let imgShrub = img`
        . . . . . . . c . . c . . . . . . .
        . . . . c . . c c . c . . c . . . .
        . . . c c . c c c c c . c c . . . .
        . . c c c c c 6 c c c c c c c . c .
        . c c c c 6 c c c c c 6 c c c c c .
        . c c c c c c c 6 c c c c c c c . .
        . . c c c c 6 c c c c c 6 c c c . .
        . . . c c c c c c c c c c c c c . .
        . . . . c c 6 6 c 6 6 c c c . . . .
        . . . . . . 6 . . 6 . . . . . . . .
        . . . . . 6 . . . . 6 . . . . . . .
        . . . . . 5 5 5 5 5 5 5 . . . . . .
    `
let imgFlag = img`
        b . . . . . . . . . . . . .
        b 1 1 1 2 2 2 2 2 2 2 2 2 .
        b 1 1 1 1 2 2 2 2 2 2 2 2 .
        b 1 1 1 2 2 2 2 2 2 2 2 2 .
        b 1 1 1 1 2 2 2 2 2 2 2 2 .
        b 1 1 1 2 2 2 2 2 2 2 2 2 .
        b 1 1 1 1 2 2 2 2 2 2 2 2 .
        b 1 1 1 2 2 2 2 2 2 2 2 2 .
        b 1 1 1 1 2 2 2 2 2 2 2 2 .
        b 1 1 1 2 2 2 2 2 2 2 2 2 .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b . . . . . . . . . . . . .
        b b . . . . . . . . . . . .
    `
let imgDune = img`
        . . . . . . . . . . . . . . . . . . . 3 3 3 3 3 . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . 3 3 3 3 3 3 3 3 3 3 3 3 . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 . . . . . . . . . . . . . . . .
        . . . . . . . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 . . . . . . . . . . . . . .
        . . . . . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . . . . . . . . . .
        . . . . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . . . . . .
        . . . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . . . . .
        . . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . . . .
        . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . . .
        . . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . .
        . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 .
        . 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 .
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        3 3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        3 3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        3 3 3 3 3 3 3 3 3 3 3 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    `
let imgBanner = img`
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 b b .
        . b b f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f b b .
        . b b f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f b b .
        . b b f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f b b .
        . b b f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f b b .
        . b b 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 b b .
        . b b 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 b b .
        . b b 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 b b .
        . b b 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 1 1 f f f f 1 1 b b .
        . b b 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
        . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b .
    `
let imgSign = img`
        . . . . . . . e e . . . . . . .
        . . . . . . e 1 1 e . . . . . .
        . . . . . e 1 1 1 1 e . . . . .
        . . . . . e 1 1 1 1 e . . . . .
        . . . . e 1 1 1 1 1 1 e . . . .
        . . . . e 1 1 1 1 1 1 e . . . .
        . . . e f f 1 1 1 1 1 1 e . . .
        . . . e 1 f 1 1 f f 1 1 e . . .
        . . e 1 1 f f f f f f f 1 e . .
        . . e 1 1 1 f 1 f 1 f 1 1 e . .
        . e 1 1 1 1 f 1 f 1 f 1 1 1 1 e
        . e e e e e e e e e e e e e e e
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . . b b . . . . . . .
        . . . . . . b b b b . . . . . .
    `
let imgHorizon = img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 6 . . 6 . . 6 . . 6 . . 6 . 5 6 5 5 6 5 5 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . . . 5 4 4 4 4 4 4 4 5 5 5
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 5 5 5 5 . . . . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . . . . . 5 4 4 4 4 4 4 4 4 4 4 4 4
        4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 . . . . . 4 4 4 4 4 4 4 4 4 4 4 4 . 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . . . . 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . . . . . . . . . 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        4 4 4 4 4 4 4 4 4 5 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 . . . 4 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 5 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 5 5 5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
    `
let imgFarDunes = img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9
        9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . . . . . . 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 . . . . . . . . . . . . . . . . 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 . . . . . . . . . . . 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9 9 9 9 9 9 9 9 9 9 9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
        3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
    `
let imgPost = img`
        . e e e .
        . e e e .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . 1 1 1 .
        . b b b .
        . b b b .
    `
let imgTent = img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 . . . . . . . . . . . . .
        . . . . . . . . . . . . 9 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 . . . . . . . . . . .
        . . . . . . . . . . . 6 9 9 9 9 6 6 6 6 6 6 6 6 9 9 9 9 6 6 6 6 6 6 . . . . . . . . . .
        . . . . . . . . . . 6 6 9 9 9 9 6 6 6 6 6 6 6 6 9 9 9 9 6 6 6 6 6 6 6 . . . . . . . . .
        . . . . . . . . . 6 6 6 9 9 9 9 6 6 6 6 6 6 6 6 9 9 9 9 6 6 6 6 6 6 6 6 . . . . . . . .
        . . . . . . . . 6 6 6 6 9 9 9 9 6 6 6 6 6 6 6 6 9 9 9 9 6 6 6 6 6 6 6 6 9 . . . . . . .
        . . . . . . . 6 6 6 6 6 9 9 9 9 6 6 6 6 6 6 6 6 9 9 9 9 6 6 6 6 6 6 6 6 9 9 . . . . . .
        . . . . . . 6 6 6 6 6 6 9 9 5 f f f f 5 f f f f 5 f f f f 5 6 6 6 6 6 6 9 9 9 . . . . .
        . . . . . 6 6 6 6 6 6 6 9 9 5 f f f f 5 f f f f 5 f f f f 5 6 6 6 6 6 6 9 9 9 9 . . . .
        . . . . 6 6 6 6 6 6 6 6 9 9 5 f f f f 5 f f f f 5 f f f f 5 6 6 6 6 6 6 9 9 9 9 6 . . .
        . . . 9 6 6 6 6 6 6 6 6 9 9 5 f f f f 5 f f f f 5 f f f f 5 6 6 6 6 6 6 9 9 9 9 6 6 . .
        . . 9 9 6 6 6 6 6 6 6 6 9 9 5 f f f f 5 f f f f 5 f f f f 5 6 6 6 6 6 6 9 9 9 9 6 6 6 .
        . . . . . . . . . . . . . . 5 f f f f 5 f f f f 5 f f f f 5 . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . 5 f f f f 5 f f f f 5 f f f f 5 . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . 5 f f f f 5 f f f f 5 f f f f 5 . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . 5 f f f f 5 f f f f 5 f f f f 5 . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . 5 f f f f 5 f f f f 5 f f f f 5 . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . 5 f f f f 5 f f f f 5 f f f f 5 . . . . . . . . . . . . . .
    `
let imgCrowd1 = img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . b 1 2 2 2 . . . . . . . . . . . . . . . . . . . . . . . . . . . b 1 2 2
        . . . . . . . . . . . . b 1 2 2 2 . . . . . . . . . . . b 1 2 2 2 . . . b 1 2 2 2 . . . b 1 2 2
        . . . . . . . . . . . . b 1 2 2 2 . . . b 1 2 2 2 . . . b 1 2 2 2 . . . b 1 2 2 2 . . . b 1 2 2
        . . . . . e 1 e . 1 1 1 b . . . . . . . b 1 e 1 2 . . . b 1 2 2 2 . . . b 1 1 1 2 1 1 1 b . . .
        . 1 1 e . 5 5 5 . 5 5 5 b . . . . . . . b 5 5 5 2 e 1 e b 1 e 1 . e 1 e b 5 5 5 . 5 5 5 b . . .
        . 5 5 5 . 5 5 5 . 5 5 5 b e 1 1 . e 1 e b 5 5 5 . 5 5 5 b 5 5 5 . 5 5 5 b 5 5 5 . 5 5 5 b . . .
        . 5 5 5 . 1 1 1 . 1 1 1 b 5 5 5 . 5 5 5 b 1 1 1 . 5 5 5 b 5 5 5 . 5 5 5 b e e e . 9 9 9 b . . .
        . e e e . 1 1 1 . 1 1 1 b 5 5 5 . 5 5 5 b 1 1 1 . 9 9 9 b 9 9 9 . 9 9 9 b e e e . 9 9 9 b . . .
        . e e e . 1 1 1 . 1 1 1 b 1 1 1 . 1 1 1 b 1 1 1 . 9 9 9 b 9 9 9 . 9 9 9 b e e e . 9 9 9 b . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 b 1 1 1 . 9 9 9 b 9 9 9 . 9 9 9 b e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 b 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
    `
let imgCrowd2 = img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . b 1 2 2 2 . . . . . . . . . . . . . . . . . . . . . . . . . . . b 1 2 2
        . . . . . . . . . . . . b 1 2 2 2 . . . . . . . . . . . b 1 2 2 2 . . . b 1 2 2 2 . . . b 1 2 2
        . . . . . e 1 e . 1 1 1 b 1 2 2 2 . . . b 1 e 1 2 . . . b 1 2 2 2 . . . b 1 1 1 2 1 1 1 b 1 2 2
        . 1 1 e . 5 5 5 . 5 5 5 b . . . . . . . b 5 5 5 2 e 1 e b 1 e 1 2 e 1 e b 5 5 5 2 5 5 5 b . . .
        . 5 5 5 . 5 5 5 . 5 5 5 b e 1 1 . e 1 e b 5 5 5 2 5 5 5 b 5 5 5 . 5 5 5 b 5 5 5 . 5 5 5 b . . .
        . 5 5 5 . 1 1 1 . 1 1 1 b 5 5 5 . 5 5 5 b 1 1 1 . 5 5 5 b 5 5 5 . 5 5 5 b e e e . 9 9 9 b . . .
        . e e e . 1 1 1 . 1 1 1 b 5 5 5 . 5 5 5 b 1 1 1 . 9 9 9 b 9 9 9 . 9 9 9 b e e e . 9 9 9 b . . .
        . e e e . 1 1 1 . 1 1 1 b 1 1 1 . 1 1 1 b 1 1 1 . 9 9 9 b 9 9 9 . 9 9 9 b e e e . 9 9 9 b . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 b 1 1 1 . 9 9 9 b 9 9 9 . 9 9 9 b e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 b 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
        . e e e . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 1 1 1 . 9 9 9 . 9 9 9 . 9 9 9 . e e e . 9 9 9 . . . .
    `

// نسخ مصغرة لكل صورة عشان تبين بعيدة | shrunk copies so things look far away
const SIZES = 12
function makeSizes (src: Image): Image[] {
    let list: Image[] = []
    for (let i = 0; i < SIZES; i++) {
        let f = (i + 1) / SIZES
        let w = Math.max(1, Math.round(src.width * f))
        let h = Math.max(1, Math.round(src.height * f))
        let out = image.create(w, h)
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                out.setPixel(x, y, src.getPixel(Math.floor(x * src.width / w), Math.floor(y * src.height / h)))
            }
        }
        list.push(out)
    }
    return list
}
let sizesRival = makeSizes(rivalFrames[1])
let sizesRivalL = makeSizes(rivalFrames[0])
let sizesRivalR = makeSizes(rivalFrames[2])
let sizesCamel1 = makeSizes(imgCamel1)
let sizesCamel2 = makeSizes(imgCamel2)
let sizesCamel1L = makeSizes(imgCamel1L)
let sizesCamel2L = makeSizes(imgCamel2L)
let sizesFuel = makeSizes(imgFuel)
let sizesNitro = makeSizes(imgNitro)
let sizesShrub = makeSizes(imgShrub)
let sizesFlag = makeSizes(imgFlag)
let sizesDune = makeSizes(imgDune)
let sizesBanner = makeSizes(imgBanner)
let sizesSign = makeSizes(imgSign)
let sizesPost = makeSizes(imgPost)
let sizesTent = makeSizes(imgTent)
let sizesCrowd1 = makeSizes(imgCrowd1)
let sizesCrowd2 = makeSizes(imgCrowd2)

// =====================================================
//  بناء الطريق | Building the track
//  غيّر هذي عشان تصمم مسارك! | Change these to design your own track!
// =====================================================
function lastY (): number {
    if (segY2.length == 0) {
        return 0
    }
    return segY2[segY2.length - 1]
}
function easeIn (a: number, b: number, p: number): number {
    return a + (b - a) * p * p
}
function easeInOut (a: number, b: number, p: number): number {
    return a + (b - a) * (0.5 - Math.cos(p * Math.PI) / 2)
}
function addSegment (curve: number, y: number) {
    segY1.push(lastY())
    segY2.push(y)
    segCurve.push(curve)
    segKind.push(paintKind)
    segProps.push([])
}
// قطعة طريق: دخول، ثبات، خروج، منحنى، ارتفاع
// one piece of road: ease in, hold, ease out, curve, height change
function addRoad (enter: number, hold: number, leave: number, curve: number, height: number) {
    let startY = lastY()
    let endY = startY + height * SEGMENT
    let total = enter + hold + leave
    for (let n = 0; n < enter; n++) {
        addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total))
    }
    for (let n = 0; n < hold; n++) {
        addSegment(curve, easeInOut(startY, endY, (enter + n) / total))
    }
    for (let n = 0; n < leave; n++) {
        addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total))
    }
}
function addStraight (length: number) {
    addRoad(length / 3, length / 3, length / 3, 0, 0)
}
function addCurve (length: number, curve: number) {
    addRoad(length / 4, length / 2, length / 4, curve, 0)
}
// طعس: طلعة ونزلة | a dune: up then down
function addDune (length: number, height: number) {
    addRoad(length / 2, 0, length / 2, 0, height)
    addRoad(length / 2, 0, length / 2, 0, 0 - height)
}
// قفزة: طلعة حادة ونزلة | a jump: steep up then down
function addJump () {
    paintKind = 2
    addRoad(8, 0, 2, 0, 10)
    paintKind = 0
    addRoad(2, 4, 12, 0, -10)
}
function addSabkha (length: number) {
    paintKind = 1
    addStraight(length)
    paintKind = 0
}
function addProp (seg: number, x: number, kind: number) {
    if (kind == P_CAMEL && seg > 25) {
        // لوحة تحذير قبل الجمل | a warning sign before every camel
        addProp(seg - 22, 1.4, P_SIGN)
    }
    if (seg < segCurve.length) {
        propSeg.push(seg)
        propX.push(x)
        propType.push(kind)
        propAlive.push(true)
        propPhase.push(Math.randomRange(0, 100))
        segProps[seg].push(propSeg.length - 1)
    }
}
function here (): number {
    return segCurve.length
}

function buildTrack () {
    let s = 0
    addStraight(30)
    addProp(8, -1.25, P_BANNER)
    addStraight(30)
    addCurve(60, 2)
    addDune(40, 18)
    s = here()
    addStraight(60)
    addProp(s + 30, 0.4, P_FUEL)
    addProp(s + 50, -0.3, P_CAMEL)
    addCurve(60, -3)
    addDune(30, 24)
    addDune(30, 16)
    s = here()
    addJump()
    addProp(s + 25, 0, P_NITRO)
    addCurve(80, 3)
    s = here()
    addSabkha(80)
    addProp(s + 40, -0.5, P_FUEL)
    addCurve(40, -2)
    s = here()
    addStraight(60)
    addProp(s + 15, 0.5, P_CAMEL)
    addProp(s + 35, -0.6, P_CAMEL)
    addDune(50, 30)
    s = here()
    addJump()
    addProp(s + 28, -0.4, P_NITRO)
    addCurve(50, -4)
    addCurve(50, 4)
    s = here()
    addStraight(50)
    addProp(s + 25, 0.2, P_FUEL)
    addDune(40, 20)
    addDune(40, 26)
    s = here()
    addSabkha(60)
    addProp(s + 30, 0.6, P_CAMEL)
    addCurve(70, 3)
    s = here()
    addJump()
    addCurve(60, -3)
    s = here()
    addStraight(60)
    addProp(s + 20, -0.2, P_FUEL)
    addProp(s + 45, 0.3, P_CAMEL)
    addDune(60, 34)
    addCurve(40, 2)
    // النص الثاني | second half
    s = here()
    addStraight(50)
    addProp(s + 25, -0.4, P_FUEL)
    addCurve(80, -4)
    addDune(40, 22)
    addDune(30, 28)
    s = here()
    addSabkha(90)
    addProp(s + 20, -0.4, P_CAMEL)
    addProp(s + 55, 0.5, P_CAMEL)
    addProp(s + 75, 0, P_NITRO)
    addCurve(60, 5)
    s = here()
    addJump()
    addCurve(50, -2)
    s = here()
    addStraight(60)
    addProp(s + 30, 0.5, P_FUEL)
    addDune(50, 36)
    addDune(40, 18)
    addCurve(70, -3)
    s = here()
    addStraight(50)
    addProp(s + 10, 0.4, P_CAMEL)
    addProp(s + 30, -0.4, P_CAMEL)
    addProp(s + 45, 0, P_CAMEL)
    s = here()
    addJump()
    addProp(s + 26, 0.3, P_FUEL)
    addCurve(60, 4)
    addDune(40, 24)
    addCurve(50, -4)
    s = here()
    addStraight(80)
    finishZ = (s + 60) * SEGMENT
    addProp(s + 60, -1.25, P_BANNER)
    addStraight(60)
    trackLength = segCurve.length * SEGMENT
    // أعمدة عاكسة على الجنبين تحسسك بالسرعة | reflector posts make you feel the speed
    for (let i = 4; i < segCurve.length; i += 4) {
        addProp(i, -1.22, P_POST)
        addProp(i + 2, 1.22, P_POST)
    }
    // خيام وجمهور عند البداية والنهاية | tents and crowd at the start and finish
    let finishSeg = Math.floor(finishZ / SEGMENT)
    for (let k = 0; k < 4; k++) {
        addProp(3 + k * 5, -2.1, P_CROWD)
        addProp(5 + k * 5, 2.1, P_CROWD)
        addProp(finishSeg - 12 + k * 5, -2.1, P_CROWD)
        addProp(finishSeg - 10 + k * 5, 2.1, P_CROWD)
    }
    addProp(10, -3.4, P_TENT)
    addProp(16, 3.4, P_TENT)
    addProp(finishSeg - 6, 3.4, P_TENT)
    addProp(finishSeg - 2, -3.4, P_TENT)
    // زينة على الجوانب | scenery on the sides
    for (let i = 25; i < segCurve.length - 5; i += 6) {
        let pick = Math.randomRange(0, 9)
        let side = 1
        if (Math.percentChance(50)) {
            side = -1
        }
        if (pick < 4) {
            addProp(i, side * Math.randomRange(15, 30) / 10, P_SHRUB)
        } else if (pick < 7) {
            addProp(i, side * Math.randomRange(22, 40) / 10, P_DUNE)
        } else if (pick < 8) {
            addProp(i, side * 1.35, P_FLAG)
        }
    }
}

// =====================================================
//  الرسم ثلاثي الأبعاد | 3D drawing
// =====================================================
let projX: number[] = []
let projY: number[] = []
let projScale: number[] = []
let projClip: number[] = []
for (let i = 0; i < DRAW_DISTANCE; i++) {
    projX.push(0)
    projY.push(0)
    projScale.push(0)
    projClip.push(0)
}

function segIndexAt (z: number): number {
    return Math.max(0, Math.min(segCurve.length - 1, Math.floor(z / SEGMENT)))
}
function heightAt (z: number): number {
    let i = segIndexAt(z)
    let p = (z % SEGMENT) / SEGMENT
    return segY1[i] + (segY2[i] - segY1[i]) * p
}

function drawStrip (target: Image, y: number, x: number, w: number, band: number, kind: number, worldZ: number) {
    let ground = 3
    let road = 10
    let rumble = 1
    if (band == 1) {
        ground = 4
        rumble = 2
    }
    if (kind == 1) {
        // سبخة | sabkha
        ground = 9
        road = 9
        if (band == 1) {
            ground = 3
        }
    }
    target.fillRect(0, y, SW, 1, ground)
    let r = Math.max(1, w / 7)
    target.fillRect(x - w - r, y, r, 1, rumble)
    target.fillRect(x + w, y, r, 1, rumble)
    target.fillRect(x - w, y, w * 2, 1, road)
    // آثار الكفرات | tyre tracks
    if (kind != 1 && w > 6) {
        let t = Math.max(1, w / 14)
        target.fillRect(x - w * 0.5, y, t, 1, 11)
        target.fillRect(x + w * 0.5 - t, y, t, 1, 11)
    }
    // حصى على الطريق يتحرك معك | gravel that moves with the road
    let k = Math.floor(worldZ / 37)
    let h = (k * 97 + 13) % 101
    if (h < 60 && w > 8) {
        target.setPixel(x - w + (h * 7 % 100) / 100 * w * 2, y, 11)
        target.setPixel(x - w + (h * 13 % 100) / 100 * w * 2, y, 9)
    }
}

function pickSize (list: Image[], screenWidth: number): Image {
    let full = list[SIZES - 1].width
    let i = Math.round(screenWidth / full * SIZES) - 1
    if (i < 0) {
        return null
    }
    if (i >= SIZES) {
        i = SIZES - 1
    }
    return list[i]
}

function drawWorldThing (target: Image, n: number, x: number, list: Image[], worldWidth: number) {
    let s = projScale[n]
    let w = s * worldWidth * HALF_W
    let pic = pickSize(list, w)
    if (pic) {
        let sx = projX[n] + s * x * ROAD_WIDTH * HALF_W
        let bottom = projY[n]
        if (bottom - pic.height < projClip[n]) {
            target.drawTransparentImage(pic, sx - pic.width / 2, bottom - pic.height)
        }
    }
}

function drawSky (target: Image) {
    // سماء متدرجة | gradient sky
    target.fillRect(0, 0, SW, 46, 7)
    target.fillRect(0, 0, SW, 16, 8)
    for (let y = 16; y < 24; y++) {
        for (let x = (y % 2) * 2; x < SW; x += 4) {
            target.setPixel(x, y, 8)
        }
    }
    for (let y = 30; y < 38; y++) {
        for (let x = (y % 2) * 2; x < SW; x += 4) {
            target.setPixel(x, y, 9)
        }
    }
    target.fillRect(0, 38, SW, 8, 9)
    target.fillRect(0, 46, SW, SH - 46, 3)
    // الشمس | the sun
    let sunX = 124 - Math.floor(skyOffset * 0.1) % 200
    target.fillCircle(sunX, 25, 9, 9)
    target.fillCircle(sunX, 25, 6, 13)
    // طبقتين كثبان تتحرك بسرعات مختلفة | two dune layers moving at different speeds
    let fx = Math.floor(skyOffset * 0.15) % imgFarDunes.width
    if (fx < 0) {
        fx += imgFarDunes.width
    }
    target.drawTransparentImage(imgFarDunes, 0 - fx, 28)
    target.drawTransparentImage(imgFarDunes, imgFarDunes.width - fx, 28)
    let hx = Math.floor(skyOffset * 0.35) % imgHorizon.width
    if (hx < 0) {
        hx += imgHorizon.width
    }
    target.drawTransparentImage(imgHorizon, 0 - hx, 34)
    target.drawTransparentImage(imgHorizon, imgHorizon.width - hx, 34)
}

function render (target: Image) {
    drawSky(target)
    let base = segIndexAt(position)
    let basePercent = (position % SEGMENT) / SEGMENT
    let playerY = heightAt(position + PLAYER_Z)
    let camY = playerY + CAMERA_HEIGHT
    let camX = playerX * ROAD_WIDTH
    let maxY = SH
    let x = 0
    let dx = 0 - segCurve[base] * basePercent
    for (let n = 0; n < DRAW_DISTANCE; n++) {
        let i = base + n
        projScale[n] = 0
        if (i >= segCurve.length) {
            break
        }
        let z1 = i * SEGMENT - position
        let z2 = z1 + SEGMENT
        let s1 = depthNow / Math.max(1, z1)
        let s2 = depthNow / z2
        let x1 = HALF_W + s1 * (x - camX) * HALF_W
        let x2 = HALF_W + s2 * (x + dx - camX) * HALF_W
        let y1 = HALF_H - s1 * (segY1[i] - camY) * HALF_H
        let y2 = HALF_H - s2 * (segY2[i] - camY) * HALF_H
        let w1 = s1 * ROAD_WIDTH * HALF_W
        let w2 = s2 * ROAD_WIDTH * HALF_W
        projX[n] = x1
        projY[n] = y1
        projScale[n] = s1
        projClip[n] = maxY
        x += dx
        dx += segCurve[i]
        if (z1 <= depthNow || y2 >= y1 || y2 >= maxY) {
            continue
        }
        let band = Math.floor(i / 3) % 2
        let top = Math.max(0, Math.ceil(y2))
        let bottom = Math.min(maxY, Math.floor(y1) + 1)
        for (let y = top; y < bottom; y++) {
            let t = (y - y2) / (y1 - y2)
            drawStrip(target, y, x2 + (x1 - x2) * t, w2 + (w1 - w2) * t, band, segKind[i], i * SEGMENT + (1 - t) * SEGMENT)
        }
        // خط البداية والنهاية | start and finish line
        if (segProps[i].length > 0 && propType[segProps[i][0]] == P_BANNER) {
            for (let y = top; y < bottom; y++) {
                let t = (y - y2) / (y1 - y2)
                let cx = x2 + (x1 - x2) * t
                let cw = w2 + (w1 - w2) * t
                for (let k = 0; k < 8; k++) {
                    if ((k + y) % 2 == 0) {
                        target.fillRect(cx - cw + k * cw / 4, y, cw / 4, 1, 15)
                    } else {
                        target.fillRect(cx - cw + k * cw / 4, y, cw / 4, 1, 1)
                    }
                }
            }
        }
        maxY = y2
    }
    // من البعيد للقريب | far to near
    rivalScreenW = 0
    for (let n = DRAW_DISTANCE - 1; n > 0; n--) {
        if (projScale[n] <= 0) {
            continue
        }
        let i = base + n
        for (let p of segProps[i]) {
            if (propAlive[p]) {
                drawProp(target, n, p)
            }
        }
        let rivalSeg = segIndexAt(rivalZ)
        if (rivalSeg == i) {
            let list = sizesRival
            if (segCurve[i] < -1) {
                list = sizesRivalL
            } else if (segCurve[i] > 1) {
                list = sizesRivalR
            }
            drawWorldThing(target, n, rivalX, list, CAR_WORLD_WIDTH)
            rivalScreenX = projX[n] + projScale[n] * rivalX * ROAD_WIDTH * HALF_W
            rivalScreenY = projY[n]
            rivalScreenW = projScale[n] * CAR_WORLD_WIDTH * HALF_W
        }
    }
    drawParticles(target)
    drawPlayer(target)
    drawSpeedLines(target)
    drawHud(target)
}

function drawProp (target: Image, n: number, p: number) {
    let kind = propType[p]
    if (kind == P_CAMEL) {
        let walking = Math.floor(game.runtime() / 250) % 2
        if (camelDirection(p) > 0) {
            if (walking == 0) {
                drawWorldThing(target, n, camelX(p), sizesCamel1, 680)
            } else {
                drawWorldThing(target, n, camelX(p), sizesCamel2, 680)
            }
        } else {
            if (walking == 0) {
                drawWorldThing(target, n, camelX(p), sizesCamel1L, 680)
            } else {
                drawWorldThing(target, n, camelX(p), sizesCamel2L, 680)
            }
        }
    } else if (kind == P_FUEL) {
        drawWorldThing(target, n, propX[p], sizesFuel, 170)
    } else if (kind == P_NITRO) {
        drawWorldThing(target, n, propX[p], sizesNitro, 140)
    } else if (kind == P_SHRUB) {
        drawWorldThing(target, n, propX[p], sizesShrub, 320)
    } else if (kind == P_FLAG) {
        drawWorldThing(target, n, propX[p], sizesFlag, 260)
    } else if (kind == P_DUNE) {
        drawWorldThing(target, n, propX[p], sizesDune, 1500)
    } else if (kind == P_POST) {
        drawWorldThing(target, n, propX[p], sizesPost, 70)
    } else if (kind == P_TENT) {
        drawWorldThing(target, n, propX[p], sizesTent, 1400)
    } else if (kind == P_CROWD) {
        if (Math.floor(game.runtime() / 300 + propPhase[p]) % 2 == 0) {
            drawWorldThing(target, n, propX[p], sizesCrowd1, 1300)
        } else {
            drawWorldThing(target, n, propX[p], sizesCrowd2, 1300)
        }
    } else if (kind == P_SIGN) {
        drawWorldThing(target, n, propX[p], sizesSign, 300)
    } else if (kind == P_BANNER) {
        drawWorldThing(target, n, 0, sizesBanner, ROAD_WIDTH * 2.6)
    }
}

// الجمل يمشي من جهة لجهة | the camel walks across the road
function camelX (p: number): number {
    return propX[p] + Math.sin((game.runtime() / 1000 + propPhase[p]) * 0.7) * 1.1
}
function camelDirection (p: number): number {
    return Math.cos((game.runtime() / 1000 + propPhase[p]) * 0.7)
}

function drawPlayer (target: Image) {
    let pic: Image = null
    if (game.runtime() < spinUntil) {
        // تدور السيارة بعد الحادث | the car spins after a crash
        pic = spinFrames[Math.floor(game.runtime() / 70) % spinFrames.length]
    } else {
        // نختار الصورة الأقرب لزاوية السيارة | pick the frame nearest the car angle
        let best = 0
        for (let i = 0; i < carAngles.length; i++) {
            if (Math.abs(carAngles[i] - yawNow) < Math.abs(carAngles[best] - yawNow)) {
                best = i
            }
        }
        let rolling = Math.floor(position / 90) % 2
        let braking = controller.B.isPressed() && raceStarted && !(raceOver)
        if (rolling == 0) {
            if (braking) {
                pic = carBrakeA[best]
            } else {
                pic = carFramesA[best]
            }
        } else {
            if (braking) {
                pic = carBrakeB[best]
            } else {
                pic = carFramesB[best]
            }
        }
    }
    let bounce = 0
    if (Math.abs(playerX) > 1 && speed > 0) {
        bounce = Math.randomRange(0, 2)
    } else if (speed > MAX_SPEED * 0.5) {
        bounce = Math.floor(game.runtime() / 80) % 2
    }
    let lift = Math.floor(jumpHeight / 22)
    let carX = HALF_W - pic.width / 2 + yawNow * 0.25
    let carY = SH - pic.height - 2 - bounce - lift
    // ظل | shadow
    let shadowW = 30 - Math.min(16, lift)
    target.fillRect(HALF_W - shadowW / 2 + yawNow * 0.25, SH - 4, shadowW, 3, 5)
    target.drawTransparentImage(pic, carX, carY)
    // نار النيترو من الشكمان | nitro flame from the exhaust
    if (game.runtime() < nitroUntil) {
        let flick = Math.randomRange(3, 7)
        let ex = HALF_W + 8 + yawNow * 0.2
        let ey = carY + pic.height - 6
        target.fillRect(ex, ey, 3, flick, 13)
        target.fillRect(ex + 1, ey, 1, flick + 2, 14)
    }
    // غبار الرمل والسبخة | sand and sabkha dust
    if (speed > MAX_SPEED * 0.2 && !(airborne)) {
        let seg = segIndexAt(position + PLAYER_Z)
        if (Math.abs(playerX) > 1) {
            spawnDust(HALF_W - 12, SH - 4, 4, 2)
            spawnDust(HALF_W + 12, SH - 4, 4, 2)
        } else if (segKind[seg] == 1) {
            spawnDust(HALF_W - 12, SH - 4, 9, 1)
            spawnDust(HALF_W + 12, SH - 4, 9, 1)
        } else if (Math.percentChance(30)) {
            spawnDust(HALF_W + Math.randomRange(-12, 12), SH - 3, 3, 1)
        }
    }
    // غبار ورا الباترول | dust behind the Patrol
    if (rivalScreenW > 6 && rivalSpeed > MAX_SPEED * 0.3 && Math.percentChance(50)) {
        spawnDust(rivalScreenX + Math.randomRange(-1, 1) * rivalScreenW / 3, rivalScreenY - 1, 3, 1)
    }
}

// =====================================================
//  الدخان والغبار | Smoke and dust
// =====================================================
function addParticle (x: number, y: number, vx: number, vy: number, r: number, life: number, c: number) {
    if (partX.length > 60) {
        return
    }
    partX.push(x)
    partY.push(y)
    partVX.push(vx)
    partVY.push(vy)
    partR.push(r)
    partLife.push(life)
    partColor.push(c)
}
function spawnSmoke (x: number, y: number) {
    addParticle(x + Math.randomRange(-2, 2), y, Math.randomRange(-25, 25) - driftDir * 30, Math.randomRange(-40, -15), 2, 0.7, 1)
}
function spawnDust (x: number, y: number, c: number, count: number) {
    for (let i = 0; i < count; i++) {
        addParticle(x + Math.randomRange(-3, 3), y, Math.randomRange(-20, 20), Math.randomRange(-25, -5), 1, 0.45, c)
    }
}
function updateParticles (dt: number) {
    for (let i = partX.length - 1; i >= 0; i--) {
        partLife[i] += 0 - dt
        if (partLife[i] <= 0) {
            partX.removeAt(i)
            partY.removeAt(i)
            partVX.removeAt(i)
            partVY.removeAt(i)
            partR.removeAt(i)
            partLife.removeAt(i)
            partColor.removeAt(i)
        } else {
            partX[i] += partVX[i] * dt
            partY[i] += partVY[i] * dt
            partR[i] += dt * 9
        }
    }
}
function drawParticles (target: Image) {
    for (let i = 0; i < partX.length; i++) {
        let c = partColor[i]
        // الدخان الأبيض يغمق وهو يختفي | white smoke greys out as it fades
        if (c == 1 && partLife[i] < 0.35) {
            c = 9
        }
        if (c == 1 && partLife[i] < 0.15) {
            c = 10
        }
        target.fillCircle(partX[i], partY[i], partR[i], c)
    }
}
// خطوط السرعة وقت النيترو | speed lines during nitro
function drawSpeedLines (target: Image) {
    if (game.runtime() < nitroUntil) {
        for (let i = 0; i < 8; i++) {
            let side = 1
            if (i % 2 == 0) {
                side = -1
            }
            let sx = HALF_W + side * Math.randomRange(40, 80)
            let sy = Math.randomRange(50, 110)
            target.drawLine(sx, sy, sx + side * 10, sy + 6, 1)
        }
    }
}

function drawHud (target: Image) {
    // السرعة | speed
    let kmh = Math.floor(speed / MAX_SPEED * 180)
    target.fillRect(0, 0, SW, 11, 15)
    target.print(kmh + " km/h", 2, 2, 1)
    // المركز | position
    if (playerAhead()) {
        target.print("1ST", 62, 2, 13)
    } else {
        target.print("2ND", 62, 2, 14)
    }
    // البنزين | fuel
    target.drawRect(98, 2, 34, 7, 1)
    let fuelColor = 12
    if (fuel < 25) {
        fuelColor = 14
    }
    target.fillRect(99, 3, Math.floor(fuel / 100 * 32), 5, fuelColor)
    target.drawTransparentImage(sizesFuel[4], 90, 2)
    // النيترو | nitro
    for (let k = 0; k < nitroCount; k++) {
        target.drawTransparentImage(sizesNitro[5], 136 + k * 8, 1)
    }
    // خريطة السباق | race progress
    target.fillRect(10, 13, 140, 1, 1)
    let px = 10 + Math.min(1, (position + PLAYER_Z) / finishZ) * 140
    let rx = 10 + Math.min(1, rivalZ / finishZ) * 140
    target.fillRect(rx - 1, 12, 3, 3, 14)
    target.fillRect(px - 1, 12, 3, 3, 1)
    target.fillRect(149, 11, 2, 5, 15)
    // عداد التفحيط | drift meter
    if (driftMeter > 0) {
        target.print("DRIFT", 4, 18, 1)
        target.drawRect(34, 18, 32, 7, 1)
        target.fillRect(35, 19, Math.floor(driftMeter / 100 * 30), 5, 13)
    }
    // إشارات البداية | start lights
    if (startLights > 0) {
        target.fillRect(50, 24, 60, 18, 15)
        for (let l = 0; l < 3; l++) {
            let c = 11
            if (startLights == 4) {
                c = 12
            } else if (l < startLights) {
                c = 14
            }
            target.fillCircle(62 + l * 18, 33, 6, c)
        }
    }
    // رسالة | message
    if (game.runtime() < messageUntil) {
        let mw = message.length * 6 + 6
        target.fillRect(HALF_W - mw / 2, 40, mw, 12, 15)
        target.print(message, HALF_W - mw / 2 + 3, 42, 13)
    }
}

function playerAhead (): boolean {
    return position + PLAYER_Z >= rivalZ
}

function say (text: string, ms: number) {
    message = text
    messageUntil = game.runtime() + ms
}

// =====================================================
//  الحركة | Movement
// =====================================================
function update (dt: number) {
    let seg = segIndexAt(position + PLAYER_Z)
    let speedPercent = speed / MAX_SPEED
    let spinning = game.runtime() < spinUntil
    let nitroOn = game.runtime() < nitroUntil
    let topSpeed = MAX_SPEED
    if (nitroOn) {
        topSpeed = MAX_SPEED * 1.4
    }
    // اللف والتفحيط | steering and drifting
    let steer = 0
    if (controller.left.isPressed()) {
        steer = -1
    } else if (controller.right.isPressed()) {
        steer = 1
    }
    let wasDrifting = drifting
    drifting = !(airborne) && !(spinning) && raceStarted && !(raceOver) && controller.B.isPressed() && steer != 0 && speed > MAX_SPEED * 0.45
    if (drifting) {
        driftDir = steer
    }
    if (!(airborne) && !(spinning) && raceStarted) {
        let grip = 3 * Math.max(0.35, speedPercent) * dt
        if (segKind[seg] == 1) {
            grip = grip * 0.55
        }
        if (drifting) {
            // في التفحيط السيارة تدور أكثر ما تنزلق | while drifting the car rotates more than it slides
            grip = grip * 0.25
        }
        playerX += steer * grip
    }
    // زاوية السيارة: لف خفيف أو تفحيط قوي | car angle: small when steering, big when drifting
    let wantYaw = steer * 12
    if (drifting) {
        wantYaw = driftDir * 36
    } else if (speedPercent > 0.6) {
        wantYaw += segCurve[seg] * 2
    }
    if (airborne) {
        wantYaw = yawNow
    }
    yawNow += (wantYaw - yawNow) * Math.min(1, dt * 9)
    if (drifting) {
        driftMeter += dt * (30 + Math.abs(segCurve[seg]) * 10)
        spawnSmoke(HALF_W - 11 + yawNow * 0.2, SH - 5)
        spawnSmoke(HALF_W + 11 + yawNow * 0.2, SH - 5)
        if (!(wasDrifting) || game.runtime() - lastScreech > 450) {
            lastScreech = game.runtime()
            music.play(music.createSoundEffect(WaveShape.Noise, 2200, 1400, 90, 40, 420, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        }
        if (driftMeter >= 100) {
            driftMeter = 0
            if (nitroCount < 3) {
                nitroCount += 1
                say("DRIFT! NITRO +1", 1200)
                music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
            } else {
                info.changeScoreBy(100)
                say("DRIFT! +100", 1000)
            }
        }
    } else if (driftMeter > 0) {
        driftMeter = Math.max(0, driftMeter - dt * 25)
    }
    // المنحنى يدفّك لبرا | curves push you outwards
    let push = CENTRIFUGAL
    if (segKind[seg] == 1) {
        push = CENTRIFUGAL * 2.5
    }
    if (drifting) {
        push = 0
    }
    playerX += 0 - dt * 2 * speedPercent * speedPercent * segCurve[seg] * push
    // البنزين والفرامل | gas and brake
    if (spinning) {
        speed += BRAKE * 0.7 * dt
    } else if (!(raceStarted) || raceOver) {
        speed += BRAKE * dt
    } else if (airborne) {
        speed += COAST * 0.2 * dt
    } else if (controller.A.isPressed() && fuel > 0 && !(drifting)) {
        if (nitroOn) {
            speed += ACCEL * 2 * dt
        } else {
            speed += ACCEL * dt
        }
        fuel += 0 - FUEL_USE * dt
    } else if (drifting) {
        // البنزين يشتغل نص قوته وأنت تفحّط | gas works at half power while drifting
        if (controller.A.isPressed() && fuel > 0) {
            speed += ACCEL * 0.5 * dt
            fuel += 0 - FUEL_USE * dt
        }
        speed += 0 - MAX_SPEED * 0.1 * dt
    } else if (controller.B.isPressed()) {
        speed += BRAKE * dt
    } else {
        speed += COAST * dt
    }
    if (nitroOn && !(spinning)) {
        speed += ACCEL * dt
    }
    // برا الطريق في الرمل | off the road in the sand
    if (Math.abs(playerX) > 1 && speed > OFFROAD_LIMIT && !(airborne)) {
        speed += OFFROAD_SLOW * dt
    }
    playerX = Math.max(-2.6, Math.min(2.6, playerX))
    speed = Math.max(0, Math.min(topSpeed, speed))
    fuel = Math.max(0, fuel)
    position += speed * dt
    if (position > trackLength - PLAYER_Z - SEGMENT * 2) {
        position = trackLength - PLAYER_Z - SEGMENT * 2
    }
    skyOffset += dt * speedPercent * segCurve[seg] * 30
    // النيترو يوسّع النظرة | nitro widens the view
    let wantDepth = CAMERA_DEPTH
    if (nitroOn) {
        wantDepth = CAMERA_DEPTH * 0.82
    }
    depthNow += (wantDepth - depthNow) * Math.min(1, dt * 4)
    updateParticles(dt)
    updateJump(dt, seg)
    checkHits(seg)
    updateRival(dt)
    checkFinish()
}

// القفز فوق الطعوس | jumping over dunes
function updateJump (dt: number, seg: number) {
    if (!(airborne)) {
        // آخر المنصة = طيران | end of a ramp = take off
        if (lastKind == 2 && segKind[seg] != 2 && speed > MAX_SPEED * 0.5) {
            airborne = true
            jumpSpeed = 900 + speed * 0.12
            jumpHeight = 0
            say("JUMP!", 600)
        }
    } else {
        jumpHeight += jumpSpeed * dt
        jumpSpeed += -3800 * dt
        if (jumpHeight <= 0) {
            jumpHeight = 0
            airborne = false
            // لو كنت لاف وأنت تنزل تنقلب | land while steering = you spin out
            if (controller.left.isPressed() || controller.right.isPressed()) {
                crash("LAND STRAIGHT!")
            } else {
                music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
                spawnDust(HALF_W - 12, SH - 4, 3, 5)
                spawnDust(HALF_W + 12, SH - 4, 3, 5)
                scene.cameraShake(2, 150)
            }
        }
    }
    lastKind = segKind[seg]
}

function crash (text: string) {
    spinUntil = game.runtime() + 1500
    speed = speed * 0.3
    crashCount += 1
    say(text, 1500)
    scene.cameraShake(4, 400)
    drifting = false
    yawNow = 0
    spawnDust(HALF_W, SH - 8, 3, 12)
    music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
}

// اللمس: جمال، بنزين، نيترو | touching camels, fuel and nitro
function checkHits (seg: number) {
    for (let check = seg; check <= seg + 1; check++) {
        if (check >= segProps.length) {
            continue
        }
        for (let p of segProps[check]) {
            if (!(propAlive[p]) || airborne) {
                continue
            }
            let kind = propType[p]
            if (kind == P_CAMEL) {
                if (Math.abs(camelX(p) - playerX) < 0.55 && game.runtime() > spinUntil) {
                    crash("CAMEL!")
                }
            } else if (kind == P_FUEL) {
                if (Math.abs(propX[p] - playerX) < 0.45) {
                    propAlive[p] = false
                    fuel = Math.min(100, fuel + 35)
                    say("FUEL +35", 900)
                    music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.InBackground)
                }
            } else if (kind == P_NITRO) {
                if (Math.abs(propX[p] - playerX) < 0.45) {
                    propAlive[p] = false
                    nitroCount = Math.min(3, nitroCount + 1)
                    say("NITRO!", 900)
                    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
                }
            }
        }
    }
}

// الباترول الأحمر | the red Patrol
function updateRival (dt: number) {
    if (!(raceStarted) || raceOver) {
        rivalSpeed = Math.max(0, rivalSpeed - MAX_SPEED * dt)
        return
    }
    let target = MAX_SPEED * 0.86
    let gap = rivalZ - (position + PLAYER_Z)
    // يخفف إذا سبقك بواجد، ويسرع إذا تأخر | eases off when far ahead, pushes when behind
    if (gap > SEGMENT * 40) {
        target = MAX_SPEED * 0.72
    } else if (gap < 0 - SEGMENT * 30) {
        target = MAX_SPEED * 1.02
    }
    let rseg = segIndexAt(rivalZ)
    if (segKind[rseg] == 1) {
        target = target * 0.85
    }
    if (rivalSpeed < target) {
        rivalSpeed += ACCEL * 0.8 * dt
    } else {
        rivalSpeed += COAST * dt
    }
    rivalZ += rivalSpeed * dt
    // يتفادى سيارتك: يروح للجهة الثانية | avoids your car: moves to the other side
    let wantX = 0.35 * Math.sin(rivalZ / 9000)
    if (Math.abs(rivalZ - (position + PLAYER_Z)) < SEGMENT * 8) {
        if (playerX > 0) {
            wantX = Math.min(wantX, playerX - 0.95)
        } else {
            wantX = Math.max(wantX, playerX + 0.95)
        }
        wantX = Math.max(-0.8, Math.min(0.8, wantX))
    }
    if (rivalX < wantX) {
        rivalX = Math.min(wantX, rivalX + 1.6 * dt)
    } else {
        rivalX = Math.max(wantX, rivalX - 1.6 * dt)
    }
    // تصادم مع الباترول | bump into the Patrol
    let near = rivalZ - (position + PLAYER_Z)
    if (Math.abs(near) < SEGMENT * 1.5 && Math.abs(rivalX - playerX) < 0.7 && !(airborne)) {
        if (near > 0) {
            speed = Math.min(speed, rivalSpeed * 0.85)
        } else {
            rivalSpeed = Math.min(rivalSpeed, speed * 0.85)
        }
        if (playerX < rivalX) {
            playerX += -0.05
        } else {
            playerX += 0.05
        }
    }
}

function checkFinish () {
    if (raceOver) {
        return
    }
    if (position + PLAYER_Z >= finishZ) {
        raceOver = true
        let seconds = Math.floor((game.runtime() - startTime) / 100) / 10
        if (rivalZ < finishZ) {
            say("YOU WIN!", 5000)
            effects.confetti.startScreenEffect()
            music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
            control.runInParallel(function () {
                pause(2500)
                game.splash("YOU WIN! " + seconds + "s")
                game.gameOver(true)
            })
        } else {
            say("2ND PLACE", 5000)
            control.runInParallel(function () {
                pause(2500)
                game.splash("Patrol won. Try again!")
                game.gameOver(false)
            })
        }
    } else if (rivalZ >= finishZ && !(raceOver)) {
        // الباترول وصل قبلك | the Patrol got there first
        if (position + PLAYER_Z < finishZ - SEGMENT * 60) {
            raceOver = true
            say("PATROL WINS", 3000)
            control.runInParallel(function () {
                pause(2500)
                game.splash("Patrol won. Try again!")
                game.gameOver(false)
            })
        }
    } else if (fuel <= 0 && speed < 10 && raceStarted) {
        raceOver = true
        say("OUT OF FUEL", 3000)
        control.runInParallel(function () {
                pause(2500)
            game.splash("Out of fuel!")
            game.gameOver(false)
        })
    }
}

// =====================================================
//  الأزرار | Buttons
// =====================================================
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (nitroCount > 0 && game.runtime() > nitroUntil && raceStarted && !(raceOver)) {
        nitroCount += -1
        nitroUntil = game.runtime() + 2000
        say("NITRO!", 700)
        music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.InBackground)
    }
})

// =====================================================
//  البداية | Start
// =====================================================
buildTrack()
position = 0
rivalZ = PLAYER_Z + SEGMENT * 2
scene.createRenderable(0, function (target: Image, camera: scene.Camera) {
    render(target)
})
game.onUpdate(function () {
    let now = game.runtime()
    let dt = Math.min(0.05, (now - lastTime) / 1000)
    lastTime = now
    update(dt)
})
lastTime = game.runtime()
game.splash("GULF RALLY", "Beat the red Patrol!")
game.showLongText("A = GAS\nB = BRAKE\nB + TURN = DRIFT\nUP = NITRO\nWatch for camels!", DialogLayout.Center)
startLights = 1
music.play(music.tonePlayable(330, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
pause(900)
startLights = 2
music.play(music.tonePlayable(330, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
pause(900)
startLights = 3
music.play(music.tonePlayable(330, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
pause(900)
startLights = 4
say("GO!", 800)
music.play(music.tonePlayable(660, music.beat(BeatFraction.Half)), music.PlaybackMode.InBackground)
raceStarted = true
startTime = game.runtime()
pause(900)
startLights = 0
