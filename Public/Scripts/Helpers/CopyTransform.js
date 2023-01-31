// CopyTransform.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Allows to copy position rotation and scale from one sceneObject to another

//@input SceneObject from
//@input SceneObject to
//@input bool copyPosition 
//@input string posSpace = "World" {"widget" : "combobox", "values": [{"label" : "Local", "value" : "Local"}, {"label" : "World", "value" : "World"}], "showIf" : "copyPosition"}
//@input bool copyRotation
//@input string rotSpace = "World" {"widget" : "combobox", "values": [{"label" : "Local", "value" : "Local"}, {"label" : "World", "value" : "World"}], "showIf" : "copyRotation"}
//@input bool copyScale
//@input string sclSpace = "World" {"widget" : "combobox", "values": [{"label" : "Local", "value" : "Local"}, {"label" : "World", "value" : "World"}], "showIf" : "copyScale"}



if (checkInputs()) {
    if (script.copyPosition || script.copyRotation || script.copyScale) {

        var fromTransform = script.from.getTransform();
        var toTransform = script.to.getTransform();
        
        var copyTransform = {};
        
        copyTransform.sceneObject = script.to;

        copyTransform.updateTransform = function() {
            if (script.copyPosition) {
                toTransform["set" + script.posSpace + "Position"](fromTransform["get" + script.posSpace + "Position"]());
            }
            if (script.copyRotation) {
                toTransform["set" + script.rotSpace + "Rotation"](fromTransform["get" + script.rotSpace + "Rotation"]());
            }
            if (script.copyScale) {
                toTransform["set" + script.sclSpace + "Scale"](fromTransform["get" + script.sclSpace + "Scale"]());
            }
        };

        copyTransform.setEnabled = function() { };

        script.createEvent("UpdateEvent").bind(function() {
            copyTransform.updateTransform();
        });
    }
}

function debugPrint(message) {
    print("[CopyTransform], " + message);
}

function checkInputs() {
    if (!script.from) {
        debugPrint("ERROR, From sceneobject is not set on [" + script.getSceneObject().name + "] sceneobject");
        return false;
    }
    if (!script.to) {
        debugPrint("ERROR, To sceneobject is not set on [" + script.getSceneObject().name + "] sceneobject");
        return false;
    }
    return true;
}