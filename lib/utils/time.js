/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


/**
 * Return the current timestamp as a number of milliseconds since 1970
 * @return {Number} Current timestamp as a number of milliseconds.
 */
function getCurrent() {
  return new Date().getTime();
};


module.exports.getCurrent = getCurrent;
