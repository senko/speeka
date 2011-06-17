$(function(){

    var nickname = '';
    var room_id = null;
    var visible = true;
    var unread_count = 0;
    var document_title = document.title || 'Speeka';

    if (localStorage && localStorage.nickname) {
        nickname = localStorage.nickname;

        if (nickname)
            $('#change-nick-btn').val(nickname);
    }

    $('#nickname-input').val(nickname);
    $('#chat-input').val('');

    $(window).focus(function() {
        visible = true;
        unread_count = 0;
        document.title = document_title;
    });

    $(window).blur(function() {
        visible = false;
    });

    function intercept_unload(e) {
        var txt = 'Leave the chatroom?';
        var e = e || window.event;
        if (e) {
            e.returnValue = txt;
        }
        return txt;
    }

    function room_join_cb(success) {
        if (success) {
            window.onbeforeunload = intercept_unload;
            $('#chatroom').fadeIn('fast', function() {
                $('#chat-input').focus();
            });
        } else {
            $('#intro').fadeIn('fast');
            room_id = null;
            window.location.hash = '';
            alert("Can't join the chatroom, sorry.");
        }
    }
    $('#create-chatroom-btn').click(function() {
        $('#intro').fadeOut('fast', function() {
            now.createRoom(function (id) {
                if (id == null) {
                    $('#intro').fadeIn('fast');
                    room_id = null;
                    alert("Can't create the chatroom, sorry.");
                } else {
                    room_id = id;
                    window.location.hash = room_id;
                    now.joinRoom(room_id, nickname, room_join_cb);
                }
            });
        });
    });

    /* nickname changing */
    $('#change-nick-btn').click(function() {
        $(this).hide();
        $('#chat-input').hide();
        $('#send-message-btn').hide();
        $('#nick-change-done-btn').show();
        $('#nickname-input').show().focus();
    })

    $('#nick-change-done-btn').click(function() {
        nickname = $.trim($('#nickname-input').val()).substring(0, 40);
        $('#nickname-input').val(nickname);

        if (nickname)
            $('#change-nick-btn').val(nickname);
        else
            $('#change-nick-btn').val('Change nickname');

        $('#nick-change-done-btn').hide();
        $('#nickname-input').hide();
        $('#change-nick-btn').show();
        $('#chat-input').show();
        $('#send-message-btn').show();
        $('#chat-input').focus();

        now.changeNickname(room_id, nickname);
        if (localStorage)
            localStorage.nickname = nickname;
    });

    $('#nickname-input').keypress(function (e) {
        if (e.which == 13) $('#nick-change-done-btn').click();
    });

    /* message sending */
    $('#send-message-btn').click(function() {
        var msg = $.trim($('#chat-input').val());
        if (!msg)
            return;

        now.sendMessage(room_id, msg);

        $('#chat-input').val('');
    });

    $('#chat-input').keypress(function (e) {
        if (e.which == 13) $('#send-message-btn').click();
    });

    /* receivers */
    function output(text, cls) {
        $('<p>')
            .addClass(cls)
            .html(text)
            .appendTo('#output')
            .embedly({
                maxWidth: 400,
                maxHeight: 320,
                wmode: 'transparent',
                method: 'after'
            });
        var h = $('#output')[0].scrollHeight;
        if (!h) h = $('#output').height();
        $('#output').scrollTop(h);

        if (!visible) {
            unread_count++;
            document.title = '(' + unread_count + ') ' + document_title;
        }
    }

    function outputMessage(clientId, who, msg) {
        if (clientId == now.core.clientId) {
            cls = 'own-message';
            if (!who) who = 'You';
        } else {
            if (!who) who = 'Someone';
            cls = '';
        }

        who = $('<div/>').text('<' + who + '> ').html();
        msg = $('<div/>').text(msg).html();

        var re = /\b((?:[a-z][\w-]{1,6}:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
        msg = msg.replace(re, '<a target="_blank" href="\$1">\$1</a>');
        output(who + msg, cls);
    }

    function outputNickChange(clientId, old_nick, new_nick) {
        if (!old_nick) old_nick = 'Someone';
        if (!new_nick) new_nick = 'Someone';

        var text = '*** ' + old_nick + ' changed their nickname to ' + new_nick + '.';
        text = $('<div/>').text(text).html();

        output(text, 'system-notice');
    }

    function outputJoin(clientId, who) {
        if (clientId == now.core.clientId) {
            var text = '*** You have joined the chatroom.';
        } else {
            if (!who) who = 'Someone';
            var text = '*** ' + who + ' has joined the chatroom.';
        }

        text = $('<div/>').text(text).html();
        output(text, 'system-notice');
    }

    function outputLeave(clientId, who) {
        if (!who) who = 'Someone';
        var text = '*** ' + who + ' has left the chatroom.';

        text = $('<div/>').text(text).html();
        output(text, 'system-notice');
    }

    function outputNicknameList(people) {
        var text;
        if (people.length > 0) {
            text = '*** People in the room: ';
            var first = true;
            $.each(people, function() {
                if (first)
                    first = false;
                else
                    text += ', ';

                if (this == '')
                    text += 'Someone';
                else
                    text += this;
            });

            text += ' and you.';
            text = $('<div/>').text(text).html();
        } else {
            text = '** Hello there. You just created a new anonymous chat. ' +
                'To invite people here, give them the <a href="' + window.location.href +
                '" onclick="javascript:return false;">URL to this page</a>. ' +
                'This chat will exist as long as at least one person is here.';
        }
        output(text, 'system-notice');
    }

    now.receiveNickChange = outputNickChange;
    now.receiveMessage = outputMessage;
    now.receiveJoin = outputJoin;
    now.receiveLeave = outputLeave;
    now.receiveNicknameList = outputNicknameList;

    now.ready(function() {
        $('#loader-spinner').hide();
        if (window.location.hash) {
            $('#intro').hide();
            room_id = window.location.hash;
            if (room_id.indexOf('#') == 0)
                room_id = room_id.slice(1);
            now.joinRoom(room_id, nickname, room_join_cb);
        }
        $('#create-chatroom-btn').show();
    });
});

