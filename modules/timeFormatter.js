const moment = require('moment-timezone');


function toStrJST(UTC) {

  if (!UTC) {
    return null;
  }
  return moment(UTC).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
}


module.exports = {toStrJST};