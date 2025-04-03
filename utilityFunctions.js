function getExponentialBackOffTime(
  attemptNumber,
  baseWaitPeriod,
  maxWaitPeriod
) {
  let waitTimeRequired = Math.min(
    baseWaitPeriod * Math.pow(2, attemptNumber - 1),
    maxWaitPeriod
  );

  return waitTimeRequired;
}

module.exports = getExponentialBackOffTime;
