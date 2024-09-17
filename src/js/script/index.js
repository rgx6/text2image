(function () {
    // 'use strict';

    var CANVAS_MARGIN = 20;

    var FONT_SIZE_MIN = 1;
    var FONT_SIZE_MAX = 50;
    var FONT_SIZE_DEFAULT = 16;

    var FONT_DEFAULT = 'ＭＳ Ｐゴシック';

    var TAB_WIDTH_DEFAULT = 4;

    var BACKGROUND_DEFAULT = 0;

    var ADDITIONAL_FONT_DEFAULT = [];

    var canvas = $('#canvas').get(0);
    var context = canvas.getContext('2d');

    var lines = [];
    var font = '';

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

    var backgroundList = [
        null,
        {
            src: './img/background_01.jpg',
            width: 718,
            height: 375,
            x: 382,
            y: 218,
            authorName: '@TheCoolMuseum',
            authorLink: 'https://twitter.com/TheCoolMuseum',
        },
    ];


    // init

    var defaultFontSize = localStorage.getItem('lastFontSize') ?
            localStorage.getItem('lastFontSize') - 0 :
            FONT_SIZE_DEFAULT;

    $('#fontsize').slider({
        min:     FONT_SIZE_MIN,
        max:     FONT_SIZE_MAX,
        step:    1,
        value:   defaultFontSize,
        tooltip: 'hide',
    });
    $('#fontsize').val(defaultFontSize);
    $('#fontsizebadge').text(defaultFontSize + 'px');

    var defaultTabWidth = localStorage.getItem('lastTabWidth') ?
            localStorage.getItem('lastTabWidth') :
            TAB_WIDTH_DEFAULT;
    $('input[name="tab"][value="' + defaultTabWidth + '"]').attr('checked', 'checked');

    var defaultBackground = localStorage.getItem('lastBackground') ?
            localStorage.getItem('lastBackground') :
            BACKGROUND_DEFAULT;
    $('input[name="background"][value="' + defaultBackground + '"]').attr('checked', 'checked');

    var additionalFontList = localStorage.getItem('additionalFontList') ?
            JSON.parse(localStorage.getItem('additionalFontList')) :
            ADDITIONAL_FONT_DEFAULT;

    initFontFamily();


    // event

    $('#fontfamily').on('change', function () {
        'use strict';
        // console.log('#fontfamily change');

        setFont();
    });

    $('#fontfamily').on('click', '#addFont option', function (e) {
        'use strict';

        e.stopPropagation();
    });

    $('#fontsize').on('slide', function (e) {
        'use strict';
        // console.log('#fontsize slide');

        $('#fontsizebadge').text(e.value + 'px');
        setFont();
    }).on('slideStop', function (e) {
        'use strict';
        // console.log('#fontsize slideStop');

        $('#fontsizebadge').text(e.value + 'px');
        setFont();
    });

    $('#text').on('keydown', function (e) {
        'use strict';
        // console.log('#text keydown', e.keyCode);

        if (e.keyCode === 9) {
            e.preventDefault();
            var elem = e.target;
            var val = elem.value;
            var pos = elem.selectionStart;
            var i;
            for (i = pos - 1; 0 <= i; i--) { if (val[i] && val[i].match(/[\r\n]/)) break; }
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

        // 先頭と末尾の空行を削除
        $('#text').val($('#text').val().replace(/^\s*\r?\n/, ''));
        $('#text').val($('#text').val().replace(/\s+$/, ''));
    });

    $('input[name="tab"]').on('change', function () {
        'use strict';
        // console.log('input[name="tab"] change');

        localStorage.setItem('lastTabWidth', $('input[name="tab"]:checked').val() - 0);
    });

    $('input[name="background"]').on('change', function () {
        'use strict';
        // console.log('input[name="background"] change');

        localStorage.setItem('lastBackground', $('input[name="background"]:checked').val() - 0);
    });

    $('#fontfamily').on('click', '#addFont', function () {
        'use strict';

        var font = window.prompt('フォント名を入力してください。', '');

        if (font == null) return;

        font = font.trim();

        if (font === '') return;

        $('#addFont').append('<option value="' + font + '" selected="selected">' + font + '</option>');

        additionalFontList.push(font);
        localStorage.setItem('additionalFontList', JSON.stringify(additionalFontList));

        setFont();
    });

    $('#fontfamily').on('click', '#deleteFont', function () {
        'use strict';

        var result = window.confirm('追加したフォントを削除します。');

        if (!result) return;

        $('#addFont').empty();

        additionalFontList = [];
        localStorage.setItem('additionalFontList', JSON.stringify(additionalFontList));

        setFont();
    });

    $('#preview').on('click', function () {
        'use strict';
        // console.log('#preview click');

        startBlockUI();

        // テキストを前処理
        lines = $('#text').val().replace(/\r?\n/g, '\n').split('\n');
        for (var l = lines.length - 1; 0 <= l; l--) {
            // 行末の空白文字を削除
            lines[l] = lines[l].replace(/\s+$/, '');
        }

        // テキスト部分の幅を計算
        context.font = font;
        var textWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            var metrics = context.measureText(lines[i]);
            if (textWidth < metrics.width) textWidth = metrics.width;
        }

        // テキスト部分の高さを計算
        var lineHeight = $('#text').css('line-height').replace('px', '') - 0;
        var textHeight = lineHeight * lines.length;

        // 画像のサイズを設定
        var background = backgroundList[($('input[name="background"]:checked').val() - 0)];

        if (background) {
            $('#canvas').attr('width', background.width);
            $('#canvas').attr('height', background.height);
            $('#author').show();
            $('#authorLink').text(background.authorName);
            $('#authorLink').attr('href', background.authorLink);
        } else {
            $('#canvas').attr('width', textWidth + 2 * CANVAS_MARGIN);
            $('#canvas').attr('height', textHeight + 2 * CANVAS_MARGIN);
            $('#author').hide();
        }

        // 背景描画
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (background) {
            var image = new Image();
            image.src = background.src;
            image.onload = function () {
                context.drawImage(image, 0, 0);

                var offsetX = background.x - Math.round(textWidth / 2);
                var offsetY = background.y - Math.round(textHeight / 2);

                drawText(lineHeight, offsetX, offsetY);
            };
        } else {
            drawText(lineHeight, CANVAS_MARGIN, CANVAS_MARGIN);
        }
    });


    // function

    function initFontFamily () {
        'use strict';
        // console.log('initFontFamily');

        var defaultFont = localStorage.getItem('lastSelectedFont') ?
                localStorage.getItem('lastSelectedFont') :
                FONT_DEFAULT;

        var detective = new Detector();

        fontlist.forEach(function (group) {
            var optgroup = $('<optgroup label="' + group.type + '"></optgroup>');

            group.fonts.forEach(function (font) {
                if (detective.detect(font)) {
                    if (font === defaultFont) {
                        optgroup.append('<option value="' + font + '" selected="selected">' + font + '</option>');
                    } else {
                        optgroup.append('<option value="' + font + '">' + font + '</option>');
                    }
                }
            });

            $('#fontfamily').append(optgroup);
        });

        $('#fontfamily').append('<optgroup id="addFont" label="フォントを追加"></optgroup>');

        additionalFontList.forEach(function (font) {
            if (font === defaultFont) {
                $('#addFont').append('<option value="' + font + '" selected="selected">' + font + '</option>');
            } else {
                $('#addFont').append('<option value="' + font + '">' + font + '</option>');
            }
        });

        $('#fontfamily').append('<optgroup id="deleteFont" label="フォントを削除"></optgroup>');

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

        localStorage.setItem('lastSelectedFont', fontFamily);
        localStorage.setItem('lastFontSize', fontSize);
    }

    function drawText(lineHeight, offsetX, offsetY) {
        'use strict';

        context.font = font;
        context.textBaseline = 'top';
        context.fillStyle = '#000';

        // テキスト描画
        for (var j = 0; j < lines.length; j++) {
            context.fillText(lines[j], offsetX + 0, offsetY + j * lineHeight);
        }

        $.unblockUI();
    }

    function startBlockUI () {
        'use strict';
        // console.log('startBlockUI');

        $.blockUI({ message: '<h3><img src="./img/spinner.gif" />  処理中</h3>' });
    }

    // for IE
    if (!String.prototype.repeat) String.prototype.repeat = function (times) {
        'use strict';
        // console.log('repeat');

        var out = '';
        for (var i = 0; i < times; i++) out += this;

        return out;
    };
})();
