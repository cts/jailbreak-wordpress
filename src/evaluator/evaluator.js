if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
};

Jailbreak.Evaluator = function(options) {
  this.trials = [];
};

Jailbreak.Evaluator.prototype.evaluate(gold, test) {
  trial = {};
  if (gold == test) {
    trial['correct'] = 1;
  } else {
    trial['correct'] = 0;
  }
  this.trials.push(trial);
};

Jailbreak.Evaluator.prototype.accuracy {
  var correct = _.filter(this.trials, function(trial) {
    trial.correct == 1;
  }).length;
  return correct / this.trials.length;
};

