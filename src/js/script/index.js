(function () {
    // 'use strict';

    var imageDataUrlBase = location.protocol + '//' + location.host + '/i/{fileName}';

    var tweetUrlBase = 'https://twitter.com/intent/tweet'
            + '?lang=ja'
            + '&text={picUrl}+{imageDataUrl}';

    var THUMBNAIL_SOURCE_WIDTH = 200;
    var THUMBNAIL_SOURCE_HEIGHT = 200;
    var THUMBNAIL_WIDTH = 100;
    var THUMBNAIL_HEIGHT = 100;

    var CANVAS_MARGIN = 20;

    var FONT_SIZE_MIN = 1;
    var FONT_SIZE_MAX = 50;
    var FONT_SIZE_DEFAULT = 16;

    var canvas = $('#canvas').get(0);
    var context = canvas.getContext('2d');

    var lines = [];
    var font = '';
    var tweetUrl = '';

    var fontlist = [
        {
            type: '等幅',
            fonts: [
                'ＭＳ ゴシック',
                'MS Gothic',
                'ＭＳ 明朝',
                'MS Mincho',
                '小夏 等幅',
                'Osaka－等幅',
                'Osaka-mono',
                'Takaoゴシック',
                'TakaoGothic',
                'Takao明朝',
                'TakaoMincho',
                'Courier',
                'Courier New',
                'Consolas',
                'Inconsolata',
                'monospace',
                'Ricty',
                'Ricty Diminished',
            ]
        }, {
            type: 'ゴシック',
            fonts: [
                '游ゴシック',
                'YuGothic',
                'メイリオ',
                'Meiryo',
                'Meiryo UI',
                'ＭＳ Ｐゴシック',
                'MS PGothic',
                'MS UI Gothic',
                'ヒラギノ角ゴ ProN W3',
                'Hiragino Kaku Gothic ProN',
                'ヒラギノ丸ゴ ProN W4',
                'Hiragino Maru Gothic ProN',
                'Takao Pゴシック',
                'TakaoPGothic',
                'TakaoEXゴシック',
                'TakaoExGothic',
                'Arial',
                'Droid Sans',
                'fantasy',
                'Roboto',
                'sans-serif',
                'Verdana',
            ]
        }, {
            type: '明朝',
            fonts: [
                '游明朝',
                'YuMincho',
                'ＭＳ Ｐ明朝',
                'MS PMincho',
                'ヒラギノ明朝 ProN W3',
                'Hiragino Mincho ProN',
                'Takao P明朝',
                'TakaoPMincho',
                'TakaoEX明朝',
                'TakaoExMincho',
                'Georgia',
                'serif',
                'Times New Roman',
            ]
        }
    ];


    // init

    $('#fontsize').slider({
        min:     FONT_SIZE_MIN,
        max:     FONT_SIZE_MAX,
        step:    1,
        value:   FONT_SIZE_DEFAULT,
        tooltip: 'hide',
    });
    $('#fontsize').val(FONT_SIZE_DEFAULT);
    $('#fontsizebadge').text(FONT_SIZE_DEFAULT + 'px');

    initFontFamily();


    // event

    $('#fontfamily').on('change', function () {
        'use strict';
        // console.log('#fontfamily change');

        setFont();
        disableTweetButton();
    });

    $('#fontsize').on('slide', function (e) {
        'use strict';
        // console.log('#fontsize slide');

        $('#fontsizebadge').text(e.value + 'px');
        setFont();
        disableTweetButton();
    }).on('slideStop', function (e) {
        'use strict';
        // console.log('#fontsize slideStop');

        $('#fontsizebadge').text(e.value + 'px');
        setFont();
        disableTweetButton();
    });

    $('#text').on('keydown', function (e) {
        'use strict';
        // console.log('#text keydown');

        if (e.keyCode === 9) {
            e.preventDefault();
            var elem = e.target;
            var val = elem.value;
            var pos = elem.selectionStart;
            var i;
            for (i = pos - 1; 0 <= i; i--) { if (val[i].match(/[\r\n]/)) break; }
            var indexFromLineHead = pos - i - 1;
            var tabWidth = $('input[name="tab"]:checked').val() - 0;
            var indent = tabWidth - indexFromLineHead % tabWidth;
            elem.value = val.substr(0, pos) + ' '.repeat(indent) + val.substr(pos, val.length);
            elem.setSelectionRange(pos + indent, pos + indent);
        }
    });

    $('#text').on('blur', function () {
        'use strict';
        // console.log('#text blur');

        // タブ文字を処理
        var tabWidth = $('input[name="tab"]:checked').val() - 0;
        $('#text').val($('#text').val().replace(/\t/g, ' '.repeat(tabWidth)));
    });

    $('#text').on('change', function () {
        'use strict';
        // console.log('#text change');

        disableTweetButton();
    });

    $('#preview').on('click', function () {
        'use strict';
        // console.log('#preview click');

        disableTweetButton();

        startBlockUI();

        // テキストを前処理
        lines = $('#text').val().replace(/\r?\n/g, '\n').split('\n');
        var flag = false;
        for (var l = lines.length - 1; 0 <= l; l--) {
            // 行末の空白文字を削除
            lines[l] = lines[l].replace(/\s+$/, '');
            // 末尾の空行を削除
            if (!flag && lines[l] === '') lines.splice(l, 1);
            else flag = true;
        }

        // 画像の幅を計算
        context.font = font;
        var width = 0;
        for (var i = 0; i < lines.length; i++) {
            var metrics = context.measureText(lines[i]);
            if (width < metrics.width) width = metrics.width;
        }

        // 画像の高さを計算
        var lineHeight = $('#text').css('line-height').replace('px', '') - 0;
        var height = lineHeight * lines.length;

        // 画像のサイズを設定
        $('#canvas').attr('width', width + 2 * CANVAS_MARGIN);
        $('#canvas').attr('height', height + 2 * CANVAS_MARGIN);

        // 背景描画 todo : param
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 描画context設定
        context.font = font;
        context.textBaseline = 'top';
        // todo : param backgroundも
        context.fillStyle = '#000';

        // テキスト描画
        for (var j = 0; j < lines.length; j++) {
            drawWord(lines[j], 0, j * lineHeight);
        }

        if (0 < lines.length) {
            enableTweetButton();
            $('html, body').animate({ scrollTop: $('#tweetUpper').offset().top });
        }

        $.unblockUI();
    });

    $('#tweetUpper, #tweetLower').on('click', function () {
        'use strict';
        // console.log('#tweetUpper/Lower click');

        if (isTweetUrlAvailable()) {
            window.open(tweetUrl);
            return;
        }

        startBlockUI();

        var png = canvas.toDataURL('image/png').split(',')[1];
        var thumbPng = getThumbnailPng();
        var text = lines.join('\n');

        $.ajax({
            type:        'POST',
            url:         '/i',
            contentType: 'application/json',
            data:        JSON.stringify({ png: png, thumbPng: thumbPng, text: text }),
            dataType:    'json',
            cache:       false,
            timeout:     30 * 1000,
            success: function (data) {
                var imageDataUrl = imageDataUrlBase.replace('{fileName}', data.fileName);
                tweetUrl = tweetUrlBase
                        .replace('{picUrl}', data.picUrl)
                        .replace('{imageDataUrl}', encodeURI(imageDataUrl));
                window.open(tweetUrl);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var res = parseJson(XMLHttpRequest.responseText);
                if (res && res.errorCode) {
                    if (res.errorCode === 324) {
                        alert('エラーが発生しました。\n\n'
                              + '画像のサイズが大きすぎるかもしれません。\n'
                              + 'テキストを減らすか、フォントを小さくしてみてください。');
                    } else {
                        alert('エラーが発生しました。\n\n'
                              + 'error code : ' + res.errorCode);
                    }
                } else if (textStatus === 'timeout') {
                    alert('タイムアウトしました。');
                } else {
                    alert('エラーが発生しました。\n\n'
                          + '少し待ってからもう1度試してみてください。');
                }
            },
            complete: function () {
                $.unblockUI();
            }
        });
    });


    // function

    function initFontFamily () {
        'use strict';
        // console.log('initFontFamily');

        // hack : 前回選択したフォントを記憶しておきたい

        var isFirst = true;
        var detective = new Detector();
        fontlist.forEach(function (group) {
            $('#fontfamily').append('<optgroup label="' + group.type + '">');
            group.fonts.forEach(function (font) {
                if (detective.detect(font)) {
                    if (isFirst) {
                        $('#fontfamily').append('<option value="' + font + '" selected="selected">' + font + '</option>');
                        isFirst = false;
                    } else {
                        $('#fontfamily').append('<option value="' + font + '">' + font + '</option>');
                    }
                }
            });
            $('#fontfamily').append('</optgroup>');
        });

        setFont();
    }

    function setFont () {
        'use strict';
        // console.log('setFont');

        var fontFamily = $('#fontfamily').val();
        var fontSize   = $('#fontsize').val() - 0;
        var fontmargin = Math.ceil(fontSize / 10);

        font = fontSize + 'px "' + fontFamily + '"';

        $('#text').css('font-family', fontFamily);
        $('#text').css('font-size', fontSize + 'px');
        $('#text').css('line-height', fontSize + fontmargin + 'px');
    }

    function drawWord (text, x, y) {
        'use strict';
        // console.log('drawWord ', text, x, y);

        context.fillText(text, x + CANVAS_MARGIN, y + CANVAS_MARGIN);
    }

    function getThumbnailPng () {
        'use strict';
        // console.log('getThumbnailPng');

        var thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = THUMBNAIL_WIDTH;
        thumbnailCanvas.height = THUMBNAIL_HEIGHT;
        var thumbnailContext = thumbnailCanvas.getContext('2d');
        thumbnailContext.fillStyle = '#fff';
        thumbnailContext.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
        thumbnailContext.scale(0.5, 0.5);
        thumbnailContext.drawImage(canvas, -CANVAS_MARGIN, -CANVAS_MARGIN);

        var dataUrl = thumbnailCanvas.toDataURL('image/png');
        return dataUrl.split(',')[1];
    }

    function enableTweetButton () {
        'use strict';
        // console.log('enableTweetButton');

        $('#tweetUpper').removeAttr('disabled');
        $('#tweetLower').removeAttr('disabled');
    }

    function disableTweetButton () {
        'use strict';
        // console.log('disableTweetButton');

        $('#tweetUpper').attr('disabled', 'disabled');
        $('#tweetLower').attr('disabled', 'disabled');
        tweetUrl = '';
    }

    function isTweetUrlAvailable () {
        'use strict';
        // console.log('isTweetURLAvailable');

        return tweetUrl !== '';
    }

    function startBlockUI () {
        'use strict';
        // console.log('startBlockUI');

        $.blockUI({ message: '<h3><img src="/images/spinner.gif" />  処理中</h3>' });
    }

    function parseJson (data) {
        'use strict';
        // console.log('parseJson');

        var json = null;

        try {
            json = JSON.parse(data);
        } catch (e) {
            // do nothing
        }

        return json;
    }
})();
