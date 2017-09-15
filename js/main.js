var yt_player, video_id;
var image_detect = gup('image');
var video_detect = gup('video');
if (image_detect !== "") {
    $("#image_detect").val(image_detect);
    load_image_logos();
}
else if (video_detect !== "") {
    $("#image_detect").val(video_detect);
    load_video_logos();
}
else {
    $('.examples,hr,.title_example').show();
    load_examples_image();
}
var calls_interval;
function detect_image_drop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var imageUrl = evt.dataTransfer.getData('text/html');
    if (imageUrl === "") {
        $('#myModal h1').html("Oops! Something went wrong");
        $('#myModal p').html("You have to drag an image from the web. Images from local disk aren't accepted!");
        $('#myModal').reveal();
    }
    else {

        if (imageUrl.indexOf('<a href="https://www.youtube.com/watch?v=') > -1) {
            var id = imageUrl.substring(41, 52);
            image_detect = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        }
        else if (imageUrl === "") {
            imageUrl = evt.dataTransfer.getData('text');
            var id = imageUrl.substring(32, 43);
            image_detect = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        }
        else {
            if ($(imageUrl).children().length > 0) {
                image_detect = $(imageUrl).find('img').attr('src');
            } else {
                image_detect = $(imageUrl).attr('src');
                if (navigator.userAgent.indexOf('Mac OS X') != -1) {
                    image_detect = $(imageUrl)[1].src;
                }
            }
        }
        if (image_detect.length < 300) {
            if (image_detect.indexOf('i.ytimg.com') > -1) {
                if (image_detect.indexOf('vi_webp') > -1) {
                    image_detect = image_detect.substring(0, 40) + "hqdefault.webp";
                }
                else {
                    image_detect = image_detect.substring(0, 35) + "hqdefault.jpg";
                }
            }
            parse_example_image(image_detect);
        } else {
            $('#myModal h1').html("Oops! Something went wrong");
            $('#myModal p').html("The provived image URL is <b>" + image_detect.length + "</b> characters long<br/>We can not handle such big URL");
            $('#myModal').reveal();
        }

    }
}
function detect_image_text() {
    if ($("#image_detect").val() !== "") {
        parse_input($("#image_detect").val());
    }
}

$("#image_detect").keyup(function (e) {
    if (e.keyCode === 13) {
        detect_image_text();
    }
});

function load_image_logos() {
    abort();
    clearInterval(calls_interval);
    var $tiles = $('#tiles');
    $('#loading,.back_examples').show();
    $tiles.css('visibility', 'hidden');
    $('#progress_text,#empty,#main,.examples').hide();
    $('#progress').html('0 %');
    $tiles.empty();
    $('#container').css('height', '0');
    calls_interval = setInterval(function () {
        $.ajax({
            type: 'GET',
            url: 'http://logos.iti.gr/fromimageurl?url=' + encodeURIComponent(image_detect),
            dataType: "jsonp",
            success: function (json) {
                var percent_number_step = $.animateNumber.numberStepFactories.append(' %');
                if (json.status === "ERROR") {
                    $('#video_error_desc').text(json.message).show();
                    clearInterval(calls_interval);
                    $('#loading').hide();
                    $('#progress_text').show();
                    $('#status').html(json.status);
                    $('#progress').animateNumber(
                        {
                            number: json.progress,
                            easing: 'easeInQuad',
                            numberStep: percent_number_step
                        }, 500
                    );
                }
                else if (json.status === "DONE") {
                    clearInterval(calls_interval);
                    $tiles.empty();
                    for (var i = 0; i < json.detectionResult.length; i++) {
                        var logos_length = json.detectionResult[i].detectedLogos.length;
                        if (logos_length > 1) {
                            var logos = "";
                            for (var j = 0; j < logos_length; j++) {
                                logos += '<div class="more_item"><p style="min-width:200px">' + json.detectionResult[i].detectedLogos[j].logoName + '<img src="imgs/link.png" class="link" onerror="imgError(this);" data-link="' + json.detectionResult[i].detectedLogos[j].wikiURL + '"></p><img class="logo_img" style="margin-left:0;width:auto;height: 200px" src="' + json.detectionResult[i].detectedLogos[j].logoURL + '"></div>'
                            }
                            $('#tiles').append('<li class="item" style="display: inline-block"><div class="tiles_video_li"><p class="table_title" style="border-right: 2px dashed #d3d3d3;">Original Image</p><p class="table_title">Logos( ' + logos_length + ' )</p><div class="image_wrap" style="padding-right: 4px;"><img class="logo_img" style="width:auto;height: 200px" src="' + json.detectionResult[i].sampleKeyframe + '"></div><div class="vertical_dotted_line"></div><div class="image_wrap" style="padding-left: 4px;">' + logos + '</div></li>')
                        }
                        else if (logos_length === 1) {
                            $('#tiles').append('<li class="item" style="display: inline-block"><div class="tiles_video_li"><p class="table_title" style="border-right: 2px dashed #d3d3d3;">Original Image</p><p class="table_title">Logo</p><div class="image_wrap" style="padding-right: 4px;"><img class="logo_img" style="height: 200px;width: auto;" src="' + json.detectionResult[i].sampleKeyframe + '"></div><div class="vertical_dotted_line"></div><div class="image_wrap" style="padding-left: 4px;"><div class="more_item"><p style="min-width: 200px;">' + json.detectionResult[i].detectedLogos[0].logoName + '<img src="imgs/link.png" class="link" onerror="imgError(this);" data-link="' + json.detectionResult[i].detectedLogos[0].wikiURL + '"></p><img class="logo_img" style="margin-left:0;width:auto;height: 200px" src="' + json.detectionResult[i].detectedLogos[0].logoURL + '"></div></div></div></li>')
                        }
                    }
                    if (i === 0) {
                        $('#user_image').attr('src', image_detect).show();
                        $('#loading').hide();
                        $('#progress_text,#empty').show();
                        $('#progress').html('100%');
                        $('#status').html('DONE');
                    }
                    else {
                        $tiles.imagesLoaded(function () {
                            $('#user_image').remove();
                            $('#loading').hide();
                            $('#progress_text').show();
                            $('#progress').html('100%');
                            $('#status').html('DONE');
                            var image_wrap = $('.image_wrap');
                            var table_title = $('.table_title');
                            var more_item = $('.more_item');
                            var li_width = 0, title2_width = 0;
                            more_item.each(function () {
                                li_width += $(this).outerWidth() + 24;
                            });
                            title2_width = li_width;
                            li_width += 4 + $('.logo_img').eq(0).outerWidth() + 2;
                            if (logos_length === 1) {
                                li_width += 8;
                                title2_width += 8;
                            }
                            $('.tiles_video_li').css('width', li_width);
                            var title1_width = $('.logo_img').eq(0).width() + 8 - 14 + 2;
                            table_title.eq(0).css('width', title1_width);
                            table_title.eq(1).css('width', title2_width - 20);
                            $(".vertical_dotted_line").each(function () {
                                var height = $(this).parent().height() - 39;
                                var margin = -((height / 2) - 22);
                                $(this).css({'height': height, 'margin-bottom': margin});
                            });
                            $tiles.css('visibility', 'visible');
                        });
                    }

                }
                else {
                    $('#loading').hide();
                    $('#progress_text').show();
                    $('#status').html(json.status);
                    $('#progress').animateNumber(
                        {
                            number: json.progress,
                            easing: 'easeInQuad',
                            numberStep: percent_number_step
                        },
                        500
                    );
                }
            },
            error: function () {
                clearInterval(calls_interval);
                $('#loading').hide();
                $('#progress_text').show();
                $('#progress').html('100%');
                $('#status').html('ERROR');
            },
            async: true
        });
    }, 1000);
}
function load_video_logos() {
    var error_video = false;
    abort();
    clearInterval(calls_interval);
    window.history.replaceState('page2', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?video=' + video_detect);
    var $tiles = $('#tiles');
    $tiles.css('visibility', 'hidden');
    $('#loading,.back_examples').show();
    $('#empty,#user_video,#video_error,#main,.examples,#video_error_desc').hide();
    if ((video_detect.indexOf("www.youtube.com") !== -1) || (video_detect.indexOf("youtu.be") !== -1)) {
        video_id = youtube_parser(video_detect);
        if ($('#youtube_api').length) {
            yt_player.cueVideoById(video_id);
        }
        else {
            var tag = document.createElement('script');
            tag.setAttribute('id', 'youtube_api');
            tag.src = "https://www.youtube.com/player_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }
    else if ((video_detect.indexOf("dailymotion.com") !== -1) || (video_detect.indexOf("dai.ly") !== -1)) {
        video_id = getDailyMotionId(video_detect);
        DM.player(document.getElementById("yt_player"), {
            video: video_id,
            height: '305',
            width: '510',
            params: {
                autoplay: false,
                mute: false
            }
        });
    }
    else {
        error_video = true;
    }
    $tiles.empty();
    $('#container').css('height', '0');
    if (error_video) {
        $('#video_error').show();
        $('#loading').hide();
    }
    else {
        calls_interval = setInterval(function () {
            $.ajax({
                type: 'GET',
                url: 'http://logos.iti.gr/fromvideourl?url=' + encodeURIComponent(video_detect),
                dataType: 'jsonp',//jsonp
                success: function (json) {
                    var percent_number_step = $.animateNumber.numberStepFactories.append(' %');
                    $('#loading').hide();
                    $('#user_video').show();
                    if (json.status === "ERROR") {
                        abort();
                        $('#video_error_desc').text(json.message).show();
                        clearInterval(calls_interval);
                        $('#status_video').html(json.status);
                        $('#progress_video').animateNumber(
                            {
                                number: json.progress,
                                easing: 'easeInQuad',
                                numberStep: percent_number_step
                            },
                            500
                        );
                    }
                    else if (json.status === "DONE") {
                        abort();
                        clearInterval(calls_interval);
                        var added = false;
                        for (var i = 0; i < json.detectionResult.length; i++) {
                            if (!($('*[data-shot="' + json.detectionResult[i].shotID + '"]').length)) {
                                var logos_length = json.detectionResult[i].detectedLogos.length;
                                var li_width = 310 + (300 * logos_length) + 4;
                                if (logos_length > 1) {
                                    var image_wrap_width = 300 * logos_length;
                                    //var title_width = image_wrap_width - 10;

                                    var more_width = (((300 * logos_length) - logos_length * 24) / logos_length) - 1;
                                    var title_width_in = more_width - 14;
                                    var logos = "";
                                    for (var j = 0; j < logos_length; j++) {
                                        logos += '<div class="more_item" style="width: ' + more_width + 'px;"><p style="width: ' + title_width_in + 'px;">' + json.detectionResult[i].detectedLogos[j].logoName + '<img src="imgs/link.png" class="link" onerror="imgError(this);" data-link="' + json.detectionResult[i].detectedLogos[j].wikiURL + '"></p><img class="logo_img" src="' + json.detectionResult[i].detectedLogos[j].logoURL + '" style="width: ' + more_width + 'px;margin-left:0"></div>'
                                    }
                                    added = true;
                                    $('#tiles').append('<li class="item" data-shot="' + json.detectionResult[i].shotID + '" style="display: inline-block"><div class="tiles_video_li" style="width:' + li_width + 'px;"><p class="table_title" style="border-right: 2px dashed #d3d3d3;">KeyFrame</p><p class="table_title">Logos( ' + logos_length + ' )</p><div class="image_wrap" style="padding-right: 4px;"><img class="logo_img" src="' + json.detectionResult[i].sampleKeyframe + '"></div><div class="vertical_dotted_line"></div><div class="image_wrap" style="padding-left: 4px;width:' + image_wrap_width + 'px;">' + logos + '</div></li>')
                                }
                                else if (logos_length === 1) {
                                    added = true;
                                    $('#tiles').append('<li class="item" data-shot="' + json.detectionResult[i].shotID + '" style="display: inline-block"><div class="tiles_video_li" style="width:' + li_width + 'px;"><p class="table_title" style="border-right: 2px dashed #d3d3d3;">KeyFrame</p><p class="table_title">Logo</p><div class="image_wrap" style="padding-right: 4px;"><img class="logo_img" src="' + json.detectionResult[i].sampleKeyframe + '"></div><div class="vertical_dotted_line"></div><div class="image_wrap" style="padding-left: 4px;"><div class="more_item" style="width: 275px;"><p style="width: 261px;">' + json.detectionResult[i].detectedLogos[0].logoName + '<img src="imgs/link.png" class="link" onerror="imgError(this);" data-link="' + json.detectionResult[i].detectedLogos[0].wikiURL + '"></p><img class="logo_img" src="' + json.detectionResult[i].detectedLogos[0].logoURL + '" style="width: 275px;margin-left:0"></div></div></div></li>')
                                }
                            }
                        }
                        if (added) {
                            $tiles.imagesLoaded(function () {
                                $(".vertical_dotted_line").each(function () {
                                    var height = $(this).parent().height() - 37;
                                    var margin = -((height / 2) - 22);
                                    $(this).css({'height': height, 'margin-bottom': margin});
                                });
                                var image_wrap = $('.image_wrap');
                                var table_title = $('.table_title');
                                $('.tiles_video_li').each(function (i, obj) {
                                    $(this).find(table_title).eq(0).css('width', $(this).find(image_wrap).eq(0).width() - 10);
                                    $(this).find(table_title).eq(1).css('width', $(this).find(image_wrap).eq(1).width() - 10);
                                });
                                $tiles.css('visibility', 'visible');
                            });
                        }
                        if ($('.item').length === 0) {
                            $('#empty').show();
                        }
                        $('#progress_video').html('100%');
                        $('#status_video').html('DONE');
                    }
                    else {
                        $('#status_video').html(json.status);
                        $('#progress_video').animateNumber(
                            {
                                number: json.progress,
                                easing: 'easeInQuad',
                                numberStep: percent_number_step
                            },
                            500
                        );
                        var added = false;
                        for (var i = 0; i < json.detectionResult.length; i++) {
                            if (!($('*[data-shot="' + json.detectionResult[i].shotID + '"]').length)) {
                                var logos_length = json.detectionResult[i].detectedLogos.length;
                                var li_width = 310 + (300 * logos_length) + 4;
                                if (logos_length > 1) {
                                    var image_wrap_width = 300 * logos_length;
                                    //var title_width = image_wrap_width - 10;

                                    var more_width = (((300 * logos_length) - logos_length * 24) / logos_length) - 1;
                                    var title_width_in = more_width - 14;
                                    var logos = "";
                                    for (var j = 0; j < logos_length; j++) {
                                        logos += '<div class="more_item" style="width: ' + more_width + 'px;"><p style="width: ' + title_width_in + 'px;">' + json.detectionResult[i].detectedLogos[j].logoName + '<img src="imgs/link.png" class="link" onerror="imgError(this);" data-link="' + json.detectionResult[i].detectedLogos[j].wikiURL + '"></p><img class="logo_img" src="' + json.detectionResult[i].detectedLogos[j].logoURL + '" style="width: ' + more_width + 'px;margin-left:0"></div>'
                                    }
                                    added = true;
                                    $('#tiles').append('<li class="item" data-shot="' + json.detectionResult[i].shotID + '" style="display: inline-block"><div class="tiles_video_li" style="width:' + li_width + 'px;"><p class="table_title" style="border-right: 2px dashed #d3d3d3;">KeyFrame</p><p class="table_title">Logos( ' + logos_length + ' )</p><div class="image_wrap" style="padding-right: 4px;"><img class="logo_img" src="' + json.detectionResult[i].sampleKeyframe + '"></div><div class="vertical_dotted_line"></div><div class="image_wrap" style="padding-left: 4px;width:' + image_wrap_width + 'px;">' + logos + '</div></li>')
                                }
                                else if (logos_length === 1) {
                                    added = true;
                                    $('#tiles').append('<li class="item" data-shot="' + json.detectionResult[i].shotID + '" style="display: inline-block"><div class="tiles_video_li" style="width:' + li_width + 'px;"><p class="table_title" style="border-right: 2px dashed #d3d3d3;">KeyFrame</p><p class="table_title">Logo</p><div class="image_wrap" style="padding-right: 4px;"><img class="logo_img" src="' + json.detectionResult[i].sampleKeyframe + '"></div><div class="vertical_dotted_line"></div><div class="image_wrap" style="padding-left: 4px;"><div class="more_item" style="width: 275px;"><p style="width: 261px;">' + json.detectionResult[i].detectedLogos[0].logoName + '<img src="imgs/link.png" class="link" onerror="imgError(this);" data-link="' + json.detectionResult[i].detectedLogos[0].wikiURL + '"></p><img class="logo_img" src="' + json.detectionResult[i].detectedLogos[0].logoURL + '" style="width: 275px;margin-left:0"></div></div></div></li>')
                                }
                            }
                        }
                        if (added) {
                            $tiles.imagesLoaded(function () {
                                $(".vertical_dotted_line").each(function () {
                                    var height = $(this).parent().height() - 37;
                                    var margin = -((height / 2) - 22);
                                    $(this).css({'height': height, 'margin-bottom': margin});
                                });
                                var image_wrap = $('.image_wrap');
                                var table_title = $('.table_title');
                                $('.tiles_video_li').each(function (i, obj) {
                                    $(this).find(table_title).eq(0).css('width', $(this).find(image_wrap).eq(0).width() - 10);
                                    $(this).find(table_title).eq(1).css('width', $(this).find(image_wrap).eq(1).width() - 10);
                                });
                                $tiles.css('visibility', 'visible');
                            });
                        }
                    }
                },
                error: function () {
                    clearInterval(calls_interval);
                    $('#loading').hide();
                    $('#user_video').show();
                    $('#progress_video').html('0%');
                    $('#status_video').html('ERROR');
                },
                async: true
            });
        }, 3000);
    }
}

$("#tiles").on("click", ".link", function () {
    window.open($(this).attr('data-link'), '_blank');
});
$("#upload").submit(function (e) {
    var formData = new FormData($(this)[0]);
    $.ajax({
        url: "upload.php",
        type: "POST",
        data: formData,
        async: false,
        success: function (msg) {
            if (msg === "error1") {
                $('#error_upload').html("File is not an Image").css('display', 'block');
            }
            else if (msg === "error3") {
                $('#error_upload').html("Only JPG, JPEG, PNG & GIF files are allowed").css('display', 'block');
            }
            else if (msg === "error4") {
                $('#error_upload').html("Unexpected error while uploading your file").css('display', 'block');
            }
            else {
                parse_example_image("http://logos.iti.gr/uploads/" + msg);
            }
        },
        cache: false,
        contentType: false,
        processData: false
    });
    e.preventDefault();
});
function imgError(image) {
    image.src = "imgs/noimage.png";
    return true;
}
function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}
function youtube_parser(url) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    } else {
        //error
    }
}
function getDailyMotionId(url) {
    var m = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
    if (m !== null) {
        if (m[4] !== undefined) {
            return m[4];
        }
        return m[2];
    }
    return null;
}
function onYouTubePlayerAPIReady() {
    yt_player = new YT.Player('yt_player', {
        height: '305',
        width: '510',
        videoId: video_id
    });
}
function load_examples_image() {
    var $tiles_images_examples = $('#tiles_images_examples');
    $tiles_images_examples.append('<li><img src="https://i.ytimg.com/vi/-NUPT3-pWhY/hqdefault.jpg" width="325" onerror="imgError1(this);" onclick="parse_example_image(&quot;https://i.ytimg.com/vi/-NUPT3-pWhY/hqdefault.jpg&quot;)"></li>');
    $tiles_images_examples.append('<li><img src="http://wpmedia.o.canada.com/2013/08/faith-goldy.png?w=660" width="325" onerror="imgError1(this);" onclick="parse_example_image(&quot;http://wpmedia.o.canada.com/2013/08/faith-goldy.png?w=660&quot;)"></li>');
    $tiles_images_examples.append('<li><img src="http://p2.img.cctvpic.com/program//dialogue/20110401/images/1301709911576_1301709911576_r.jpg" width="325" onerror="imgError1(this);" onclick="parse_example_image(&quot;http://p2.img.cctvpic.com/program//dialogue/20110401/images/1301709911576_1301709911576_r.jpg&quot;)"></li>');
    $tiles_images_examples.append('<li><img src="https://i.ytimg.com/vi/v2pEiiSv004/maxresdefault.jpg" width="325" onerror="imgError1(this);" onclick="parse_example_image(&quot;https://i.ytimg.com/vi/v2pEiiSv004/maxresdefault.jpg&quot;)"></li>');
    $tiles_images_examples.append('<li><img src="http://www.livenewson.com/wp-content/uploads/2015/02/I24-News-640x352.png" width="325" onerror="imgError1(this);" onclick="parse_example_image(&quot;http://www.livenewson.com/wp-content/uploads/2015/02/I24-News-640x352.png&quot;)"></li>');
    $tiles_images_examples.append('<li><img src="https://pbs.twimg.com/media/Cs4wuExWAAIF--p.jpg" width="325" onerror="imgError1(this);" onclick="parse_example_image(&quot;https://pbs.twimg.com/media/Cs4wuExWAAIF--p.jpg&quot;)"></li>');

    var $tiles_video_examples = $('#tiles_video_examples');
    $tiles_video_examples.append('<li style="width: 360px"> <div class="video"><img src="imgs/youtube-placeholder.jpg"><iframe width="360" height="305" frameborder="0" src="https://www.youtube.com/embed/btQ7zZ3cyuw"></iframe><button type="button" style="margin:10px 0;" onclick="parse_example_video(&quot;https://www.youtube.com/watch?v=btQ7zZ3cyuw&quot;);return false;" class="btn btn_small">Detect</button></div></li>');
    $tiles_video_examples.append('<li style="width: 360px"> <div class="video"><img src="imgs/youtube-placeholder.jpg"><iframe width="360" height="305" frameborder="0" src="https://www.youtube.com/embed/8EWbFzHwuKg"></iframe><button type="button" style="margin:10px 0;" onclick="parse_example_video(&quot;https://www.youtube.com/watch?v=8EWbFzHwuKg&quot;);return false;" class="btn btn_small">Detect</button></div></li>');
    $tiles_video_examples.append('<li style="width: 360px"> <div class="video"><img src="imgs/youtube-placeholder.jpg"><iframe width="360" height="305" frameborder="0" src="https://www.youtube.com/embed/K4kgL_11fIo"></iframe><button type="button" style="margin:10px 0;" onclick="parse_example_video(&quot;https://www.youtube.com/watch?v=K4kgL_11fIo&quot;);return false;" class="btn btn_small">Detect</button></div></li>');
    $tiles_video_examples.append('<li style="width: 360px"> <div class="video"><img src="imgs/youtube-placeholder.jpg"><iframe width="360" height="305" frameborder="0" src="https://www.youtube.com/embed/CSC9DKvyIW4"></iframe><button type="button" style="margin:10px 0;" onclick="parse_example_video(&quot;https://www.youtube.com/watch?v=CSC9DKvyIW4&quot;);return false;" class="btn btn_small">Detect</button></div></li>');
    $tiles_video_examples.append('<li style="width: 360px"> <div class="video"><img src="imgs/youtube-placeholder.jpg"><iframe width="360" height="305" frameborder="0" src="https://www.youtube.com/embed/qhBm8dgZEy0"></iframe><button type="button" style="margin:10px 0;" onclick="parse_example_video(&quot;https://www.youtube.com/watch?v=qhBm8dgZEy0&quot;);return false;" class="btn btn_small">Detect</button></div></li>');
    $tiles_video_examples.append('<li style="width: 360px"> <div class="video"><img src="imgs/youtube-placeholder.jpg"><iframe width="360" height="305" frameborder="0" src="https://www.youtube.com/embed/DGTqjMNvWz0"></iframe><button type="button" style="margin:10px 0;" onclick="parse_example_video(&quot;https://www.youtube.com/watch?v=DGTqjMNvWz0&quot;);return false;" class="btn btn_small">Detect</button></div></li>');

    loadimage();
}
function loadimage() {

    jQuery('#tiles_images_examples').imagesLoaded(function () {
        var options = {
            autoResize: true,
            container: $('#main'),
            offset: 10,//10
            itemWidth: 345,//210
            outerOffset: 0
        };
        var handler = jQuery('#tiles_images_examples li');
        handler.wookmark(options);
    });

    jQuery('#tiles_video_examples').imagesLoaded(function () {
        var options = {
            autoResize: true,
            container: $('#main_video'),
            offset: 10,//10
            itemWidth: 380,//210
            outerOffset: 0
        };
        var handler = jQuery('#tiles_video_examples li');
        handler.wookmark(options);
    });
}
function parse_example_image(url) {
    window.location.href = "?image=" + url;
}
function parse_example_video(url) {
    window.location.href = "?video=" + url;
}
function parse_input(url){
    $('#loading').show();
    $('hr,.examples,.title_example,#main,#main_video').hide();
    $.ajax({
        type: 'GET',
        url: 'http://logos.iti.gr/fromurl?url=' + encodeURIComponent(url),
        dataType: "jsonp",
        success: function (json) {
            if(json.format==="video"){
                window.location.href = "?video=" + url;
            }
            else{
                window.location.href = "?image=" + url;
            }
        },
        error: function () {
            $('#loading').hide();
            $('#progress_text').show();
            $('#progress').html('100%');
            $('#status').html('ERROR');
        },
        async: true
    });
}