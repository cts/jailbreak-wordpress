if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}

Jailbreak.Evaluator = function(options) {
  this.trials = [];
};

/*
 * Record one trial
 */
Jailbreak.Evaluator.prototype.evaluate = function(options) {
  var gold = options.gold;
  var test = options.test;
  trial = {};
  if (gold == test) {
    trial.correct = 1;
  } else {
    trial.correct = 0;
  }
  this.trials.push(trial);
};

/*
 * Returns CORRECT TRIALS / TOTAL TRIALS
 */
Jailbreak.Evaluator.prototype.accuracy = function() {
  var correct = _.filter(this.trials, function(trial) {
    return (trial.correct === 1);
  }).length;
  return correct / this.trials.length;
};
