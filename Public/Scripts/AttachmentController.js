// -----JS CODE-----
// AttachmentController.js
// version 0.0.1
// Defines global Transform Attachment class
// Defines global Attachments array that contains all Attachments and updates their Transforms every frame if Full Body is tracking


const VEC3_ONE = vec3.one();
const QUAT_IDENTITY = quat.quatIdentity();

//global definitions
global.TransformAttachment = TransformAttachment;
global.Attachments = [];

//bone attachment function
function TransformAttachment(trackingPoint, sceneObject, lerpCoef) {
    this.sceneObject = sceneObject;
    this.trackingPoint = trackingPoint;
    this.lerpCoef = lerpCoef !== undefined ? lerpCoef : 1.0;

    this.transform = sceneObject.getTransform(); //bone transform
    this.targetWPos = this.transform.getWorldPosition();

    this.snap = true;
    global.Attachments.push(this);
}

TransformAttachment.prototype.setEnabled = function(isEnabled) {
    this.sceneObject.enabled = isEnabled;
};

TransformAttachment.prototype.setParentBone = function(parentBone, rotate, scale, influence) {
    this.initLocalPos = this.transform.getLocalPosition(); // initial bone local position
    this.targetLT = new LocalTransform(this.transform); // target bone local position, rotation and scale
    this.initLen = this.initLocalPos.length;

    this.pTransform = parentBone.getTransform();
    this.pInitLT = new LocalTransform(this.pTransform);
    this.pTargetLT = new LocalTransform(this.pTransform);

    this.scaleParent = scale;
    this.rotateParent = rotate;
    this.influence = influence !== undefined ? influence : 1.0;
};

TransformAttachment.prototype.updateTransform = function() {
    if (!this.trackingPoint.isTracking() && this.lerpCoef < 1.0) {
        if (this.rotateParent) {
            this.pTargetLT.lerpTo(this.pTransform, this.lerpCoef);
            this.targetLT.lerpTo(this.transform, this.lerpCoef);
        } else {
            this.transform.setWorldPosition(vec3.lerp(this.transform.getWorldPosition(), this.targetWPos, this.lerpCoef));
        }
        return;
    }

    this.targetWPos = this.trackingPoint.getWorldPosition();
    var wPos = this.snap ? this.targetWPos : vec3.lerp(this.transform.getWorldPosition(), this.targetWPos, this.lerpCoef);

    if (this.rotateParent || this.scaleParent) {
        //affecting parent
        if (this.lerpCoef < 1.0 && !this.snap) {
            var pCurrentT = new LocalTransform(this.pTransform);
            var currentT = new LocalTransform(this.transform);
        }

        this.pTransform.setLocalRotation(this.pInitLT.rotation);
        this.pTransform.setLocalScale(this.pInitLT.scale);

        this.transform.setWorldPosition(wPos);

        var localPos = this.transform.getLocalPosition();
        this.transform.setLocalPosition(this.initLocalPos);

        if (this.rotateParent) {
            var rot = quat.rotationFromTo(this.initLocalPos, localPos);
            if (this.influence < 1.0) {
                rot = quat.slerp(QUAT_IDENTITY, rot, this.influence);
            }
            this.pTransform.setLocalRotation(rot.multiply(this.pInitLT.rotation));
        }

        if (this.scaleParent) {
            var newLen = lerp(this.initLen, localPos.length, this.influence);
            this.pTransform.setLocalScale(VEC3_ONE.uniformScale(newLen / this.initLen));
        }

        if (this.lerpCoef < 1.0 && !this.snap) {
            this.pTargetLT.updateFrom(this.pTransform);
            this.targetLT.updateFrom(this.transform);

            pCurrentT.lerpTo(this.pTransform, this.lerpCoef);
            currentT.lerpTo(this.transform, this.lerpCoef);
        }
    } else {
        this.transform.setWorldPosition(wPos);
    }
    this.snap = false;
};

// Local Transform function
function LocalTransform(transform) {
    this.position = transform.getLocalPosition();
    this.rotation = transform.getLocalRotation();
    this.scale = transform.getLocalScale();
}

LocalTransform.prototype.applyTo = function(toTransform) {
    toTransform.setLocalPosition(this.position);
    toTransform.setLocalRotation((this.rotation));
    toTransform.setLocalScale(this.scale);
};

LocalTransform.prototype.updateFrom = function(fromTransform) {
    this.position = fromTransform.getLocalPosition();
    this.rotation = fromTransform.getLocalRotation();
    this.scale = fromTransform.getLocalScale();
};

LocalTransform.prototype.lerpFrom = function(fromTransform, t) {
    fromTransform.setLocalPosition(vec3.lerp(fromTransform.getLocalPosition(), this.position, t));
    fromTransform.setLocalRotation(quat.lerp(fromTransform.getLocalRotation(), this.rotation, t));
    fromTransform.setLocalScale(vec3.lerp(fromTransform.getLocalScale(), this.scale, t));
};

LocalTransform.prototype.lerpTo = function(toTransform, t) {
    toTransform.setLocalPosition(vec3.lerp(this.position, toTransform.getLocalPosition(), t));
    toTransform.setLocalRotation(quat.lerp(this.rotation, toTransform.getLocalRotation(), t));
    toTransform.setLocalScale(vec3.lerp(this.scale, toTransform.getLocalScale(), t));
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

//  initialize

var isBodyTracking;

script.createEvent("TurnOnEvent").bind(onTurnOn);

function onTurnOn() {
    if (global.behaviorSystem) {
        global.behaviorSystem.addCustomTriggerResponse("FULL_BODY_TRACKING_STARTED", onTrackingStarted);
        global.behaviorSystem.addCustomTriggerResponse("FULL_BODY_TRACKING_LOST", onTrackingLost);

        script.createEvent("UpdateEvent").bind(onUpdate);
    } else {
        debugPrint("ERROR, Please make sure Behavior script exists in the scene");
    }
}

function onUpdate() {
    if (isBodyTracking) {
        global.Attachments.forEach(function(a) {
            a.updateTransform();
        });
    }
}
//state change callbacks

function onTrackingStarted() {
    isBodyTracking = true;
    global.Attachments.forEach(function(a) {
        a.setEnabled(true);
    });
}

function onTrackingLost() {
    isBodyTracking = false;
    global.Attachments.forEach(function(a) {
        a.setEnabled(false);
    });
}

//helper functions
function debugPrint(msg) {
    print("[AttachmentController], " + msg);
}
