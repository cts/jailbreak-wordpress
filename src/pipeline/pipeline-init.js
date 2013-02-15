if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}
if (typeof Jailbreak.Pipeline == "undefined") {
  Jailbreak.Pipeline = {};
}

Jailbreak.Pipeline.log = function(stage, message) {
  console.log("[" + stage.name + "] " + message);
};
