$.ajax({
    type: 'GET',
    url: 'http://logos.iti.gr/logolist',
    dataType: "jsonp",
    success: function (json) {
        var images = "";
        for (var i = 0; i < json.logofiles.length; i++) {
            images = "";
            for (var k = 0; k < json.logofiles[i].length; k++) {
                images += '<img class="logo_img" src="' + json.logofiles[i][k] + '"/>';
            }
            $('#table').append('<tr><td>' + images + '</td><td><a href="' + json.logowikilinks[i] + '" target="_blank">' + json.logonames[i] + '</a></td></tr>');
        }
    },
    error: function () {
    },
    async: true
});
$(function () {
    $(window).on("load resize ", function () {
        $('.tbl-content').css('height', $(this).height() - 200);
    }).resize();
});