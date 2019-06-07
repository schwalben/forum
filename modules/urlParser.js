const url = require('url');

function getThreadId(originalUrl) {
    const parsedUrl = originalUrl.split('/');

    if (parsedUrl.length < 3 || parsedUrl[1] != 'thread') {
        return '';
    }
    threadId = parsedUrl[2]
    return threadId;
}


module.exports = {getThreadId};