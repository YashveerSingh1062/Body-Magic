// -----JS CODE-----
// AttachTransform.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Drives the position of scene object according to the trackingPoint position on the screen, 
// allows to set parent transform that can rotated or/and stretched towards the child
// Requires AttachmentController.js

//@input SceneObject bone {"label": "Scene Object"}
//@input string attachmentPoint = "Nose" { "widget":"combobox","values":[{ "label" : "Nose" , "value" : "Nose"},{ "label" : "Right Eye" , "value" : "RightEye"},{ "label" : "Left Eye" , "value" : "LeftEye"},{ "label" : "Right Ear" , "value" : "RightEar"},{ "label" : "Left Ear" , "value" : "LeftEar"},{ "label" : "Neck" , "value" : "Neck"},{ "label" : "Left Hip" , "value" : "LeftHip"},{ "label" : "Left Knee" , "value" : "LeftKnee"},{ "label" : "Left Ankle" , "value" : "LeftAnkle"},{ "label" : "Right Hip" , "value" : "RightHip"},{ "label" : "Right Knee" , "value" : "RightKnee"},{ "label" : "Right Ankle" , "value" : "RightAnkle"},{ "label" : "Left Shoulder" , "value" : "LeftShoulder"},{ "label" : "Left Elbow" , "value" : "LeftElbow"},{ "label" : "Left Wrist" , "value" : "LeftWrist"},{ "label" : "Right Shoulder" , "value" : "RightShoulder"},{ "label" : "Right Elbow" , "value" : "RightElbow"},{ "label" : "Right Wrist" , "value" : "RightWrist"},{ "label" : "Hip" , "value" : "Hip"}]}
//@input float smoothing = 0.1 {"widget" : "slider", "min" : "0", "max" : "0.99", "step" : "0.001"}
//@ui {"widget":"separator"}
//@input bool affectParent
//@input SceneObject parentBone {"showIf" : "affectParent", "label": "Parent"}
//@input float influence = 1.0 {"widget" : "slider", "min" : "0", "max" : "1", "step" : "0.001", "showIf" : "affectParent"}
//@input bool rotateTo = true {"showIf" : "affectParent"}
//@input bool scaleTo = true {"showIf" : "affectParent"}


if (checkInputs()) {

    var trackingPoint = global.FullBodyTracking[script.attachmentPoint];
    
    var att = new global.TransformAttachment(trackingPoint, script.bone, 1.0 - script.smoothing);

    if (script.affectParent && (script.scaleTo || script.rotateTo)) {
        att.setParentBone(script.parentBone, script.rotateTo, script.scaleTo, script.influence);
    }
}

//helper functions

function debugPrint(message) {
    print("[AttachTransform], " + message);
}

function checkInputs() {
    if (!global.TransformAttachment) {
        debugPrint("ERROR, Please make sure that [Attachment Controller] script is above [" + script.getSceneObject().name + "] sceneobject in scene hierarchy");
        return false;
    }
    if (!global.FullBodyTracking) {
        debugPrint("ERROR, Please make sure that [Full Body Tracking Controller] script is above [" + script.getSceneObject().name + "] sceneobject in scene hierarchy");
        return false;
    }
    if (!global.FullBodyTracking[script.attachmentPoint]) {
        debugPrint("ERROR, " + script.attachmentPoint + " was not created. Please check log for previous mesages");
        return false;
    }
    if (!script.bone) {
        debugPrint("ERROR, [Scene Object] script input is not set on [" + script.getSceneObject().name + "] scene object");
        return false;
    }
    if (script.affectParent && !script.parentBone) {
        debugPrint("ERROR, Parent Bone sceneobject is not set on [" + script.getSceneObject().name + "] sceneobject");
        return false;
    }
    return true;
}
