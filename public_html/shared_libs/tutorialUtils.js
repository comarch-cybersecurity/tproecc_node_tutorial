/*global $, PR*/

/**
Utils functions for tutorials
**/

function showDialogInfo(title, message) {
    'use strict';

    $('#dialogInfoMessage').text(message);
    $('#dialogInfoTitle').text(title);
    $('#dialogInfo').openModal();
}

function showDialogError(title, message) {
    'use strict';

    $('#dialogErrorTitle').text('Error:' + title);
    $('#dialogErrorMessage').text(message);
    $('#dialogError').openModal();
}

function showDialogWarn(message) {
    'use strict';

    $('#dialogWarnMessage').text(message);
    $('#dialogWarn').openModal();
}

function showCode(call) {
    'use strict';

    var str = call.toString(),
        outputCode = '',
        blockSkip = false,
        lineSkip;

    str = str.replace(/(?:\r\n|\r|\n)/g, '<br/>');
    str = str.replace(/ /g, '&nbsp;');
    str = str.replace(/\t/g, '&nbsp;&nbsp;');

    // remove lines which special comments
    str.split('<br/>').forEach(function (element) {
        lineSkip = false;
        if (element.indexOf('[DEMO]') !== -1) {
            lineSkip = true;
        }
        if (element.indexOf('[DEMO-START]') !== -1) {
            blockSkip = true;
        }
        if (element.indexOf('[DEMO-END]') !== -1) {
            blockSkip = false;
            lineSkip = true;
        }
        if (!lineSkip && !blockSkip) {
            outputCode = outputCode + element + '\n';
        }
    });

    $('.prettyprinted').removeClass('prettyprinted');
    $('#dialogCodeMessage').html(outputCode);
    $('#dialogCodeTitle').text(call.name);
    $('#dialogCode').openModal();
    PR.prettyPrint();
}

function showDialogJSON(title, message) {
    'use strict';
    var str = JSON.stringify(message, null, '  '),
        outputJson = '';

    str = str.replace(/(?:\r\n|\r|\n)/g, '<br/>');
    str = str.replace(/ /g, '&nbsp;');
    str = str.replace(/\t/g, '&nbsp;&nbsp;');

    str.split('<br/>').forEach(function (line) {
        if (line.length > 60) {
            line = line.substring(0, 60) + '...,"';
        }
        outputJson = outputJson + line + '\n';
    });

    $('.prettyprinted').removeClass('prettyprinted');
    $('#dialogJsonMessage').html(outputJson);
    $('#dialogJsonTitle').text(title);
    $('#dialogJson').openModal();
    PR.prettyPrint();
}

function showPushPutton() {
    'use strict';
    $('#pushButton').openModal({
        dismissible: false
    });
}

function hidePushPutton() {
    'use strict';
    $('#pushButton').closeModal();
}

function showWait() {
    'use strict';
    $('#wait').openModal({
        dismissible: false
    });
}

function hideWait() {
    'use strict';
    $('#wait').closeModal();
}
