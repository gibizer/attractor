// TypeScript declarations for Phaser Box2D functions we use

declare module '../PhaserBox2D.js' {
    export * from './box2d';
}

export class b2Vec2 {
    constructor(x: number, y: number);
    x: number;
    y: number;
}

export class b2Rot {
    constructor(c: number, s: number);
    c: number;
    s: number;
}

export interface b2WorldDef {
    gravity: b2Vec2;
    restitutionThreshold?: number;
    contactPushoutVelocity?: number;
    contactHertz?: number;
    contactDampingRatio?: number;
    jointHertz?: number;
    jointDampingRatio?: number;
    enableSleep?: boolean;
    enableContinuous?: boolean;
}

export interface b2BodyDef {
    type?: number;
    position?: b2Vec2;
    rotation?: b2Rot;
    linearVelocity?: b2Vec2;
    angularVelocity?: number;
    linearDamping?: number;
    angularDamping?: number;
    gravityScale?: number;
    sleepThreshold?: number;
    userData?: any;
    enableSleep?: boolean;
    isAwake?: boolean;
    fixedRotation?: boolean;
    isBullet?: boolean;
    isEnabled?: boolean;
    automaticMass?: boolean;
}

export interface b2ShapeDef {
    friction?: number;
    restitution?: number;
    density?: number;
    filter?: any;
    userData?: any;
    isSensor?: boolean;
    enableSensorEvents?: boolean;
    enableContactEvents?: boolean;
    enableHitEvents?: boolean;
    enablePreSolveEvents?: boolean;
}

export interface b2BodyId {
    index1: number;
    world0: number;
    revision: number;
}

export interface b2WorldId {
    index1: number;
    revision: number;
}

export interface World {
    worldId: b2WorldId;
    stepWorld(timeStep: number, subStepCount?: number): void;
    destroyWorld(): void;
}

export interface Body {
    bodyId: b2BodyId;
    getPosition(): b2Vec2;
    getLinearVelocity(): b2Vec2;
    getAngularVelocity(): number;
    setLinearVelocity(velocity: b2Vec2): void;
    setAngularVelocity(omega: number): void;
    applyForce(force: b2Vec2, point: b2Vec2, wake: boolean): void;
    applyForceToCenter(force: b2Vec2, wake: boolean): void;
    applyLinearImpulse(impulse: b2Vec2, point: b2Vec2, wake: boolean): void;
    applyLinearImpulseToCenter(impulse: b2Vec2, wake: boolean): void;
    getMass(): number;
    setAwake(flag: boolean): void;
}

export enum b2BodyType {
    b2_staticBody = 0,
    b2_kinematicBody = 1,
    b2_dynamicBody = 2,
}

export enum b2HexColor {
    b2_colorAliceBlue,
    b2_colorAntiqueWhite,
    b2_colorAqua,
    b2_colorAquamarine,
    b2_colorLawnGreen,
    b2_colorGold,
    b2_colorRed,
    b2_colorYellow,
}

export function b2DefaultWorldDef(): b2WorldDef;
export function b2DefaultBodyDef(): b2BodyDef;
export function b2DefaultShapeDef(): b2ShapeDef;

export function CreateWorld(options: { worldDef: b2WorldDef }): World;

export interface CreateCircleOptions {
    worldId: b2WorldId;
    type: b2BodyType;
    bodyDef?: b2BodyDef;
    position: b2Vec2;
    radius: number;
    density?: number;
    friction?: number;
    restitution?: number;
    color?: b2HexColor;
    userData?: any;
}

export interface CreateBoxPolygonOptions {
    worldId: b2WorldId;
    type: b2BodyType;
    bodyDef?: b2BodyDef;
    position: b2Vec2;
    size: b2Vec2 | number;
    density?: number;
    friction?: number;
    restitution?: number;
    color?: b2HexColor;
    userData?: any;
}

export interface CreateEdgeOptions {
    worldId: b2WorldId;
    bodyDef?: b2BodyDef;
    point1: b2Vec2;
    point2: b2Vec2;
    restitution?: number;
    friction?: number;
    userData?: any;
}

export function CreateCircle(options: CreateCircleOptions): Body;
export function CreateBoxPolygon(options: CreateBoxPolygonOptions): Body;
export function CreateEdge(options: CreateEdgeOptions): Body;

export function b2World_EnableSleeping(
    worldId: b2WorldId,
    flag: boolean
): void;
export function b2World_EnableContinuous(
    worldId: b2WorldId,
    flag: boolean
): void;

export interface ContactBeginEvent {
    shapeIdA: any;
    shapeIdB: any;
}

export interface ContactEndEvent {
    shapeIdA: any;
    shapeIdB: any;
}

export function b2World_SetPreSolveCallback(
    worldId: b2WorldId,
    callback: (shapeIdA: any, shapeIdB: any, manifold: any) => boolean,
    context: any
): void;

export function b2World_SetContactBeginCallback(
    worldId: b2WorldId,
    callback: (event: ContactBeginEvent) => void,
    context: any
): void;

export function b2World_SetContactEndCallback(
    worldId: b2WorldId,
    callback: (event: ContactEndEvent) => void,
    context: any
): void;
