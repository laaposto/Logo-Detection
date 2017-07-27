var input_selector = 'input[type=text]';
$(document).on('focus', input_selector, function () {
    $(this).siblings('label, i').addClass('active');
});
$(document).on('blur', input_selector, function () {
    var $inputElement = $(this);
    if ($inputElement.val().length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === undefined) {
        $inputElement.siblings('label, i').removeClass('active');
    }
});
$('#logo_name').on('input', function (e) {
    $('#error_name').slideUp();
    $('#logo_name').removeClass('error_input');
});
$('#logo_wiki').on('input', function (e) {
    $('#error_wiki').slideUp();
    $('#logo_wiki').removeClass('error_input');
});
$("#upload").submit(function (e) {
    $('#upload_fail,#upload_done').slideUp();
    var filled = true;
    e.preventDefault();
    if ($('#logo_name').val() === "") {
        $('#error_name').slideDown();
        $('#logo_name').addClass('error_input');
        filled = false;
    }
    if ($('#logo_wiki').val() === "") {
        $('#error_wiki').slideDown();
        $('#logo_wiki').addClass('error_input');
        filled = false;
    }
    if (filled) {
        var formData = new FormData($(this)[0]);
        $.ajax({
            url: "../upload.php",
            type: "POST",
            data: formData,
            async: false,
            success: function (msg) {
                if (msg === "error1") {
                    $('#error_photo').html("File is not an Image").slideDown();
                }
                else if (msg === "error3") {
                    $('#error_photo').html("Only JPG, JPEG, PNG & GIF files are allowed").slideDown();
                }
                else if (msg === "error4") {
                    $('#error_photo').html("Unexpected error while uploading your file").slideDown();
                }
                else {
                    $('#error_photo').slideUp();
                    submit_logo("http://logos.iti.gr/newlogo/uploads/" + msg, $('#logo_name').val(), $('#logo_wiki').val());
                }
            },
            cache: false,
            contentType: false,
            processData: false
        });
    }
});
function submit_logo(url, name, wiki) {
    $('.form').addClass('opacity');
    $('.loading-spinner').show();
    $.ajax({
        type: 'GET',
        url: 'http://logos.iti.gr/submitlogo?url=' + url + "&name=" + name + "&wiki=" + wiki,
        dataType: "jsonp",
        success: function (json) {
            $('.form').removeClass('opacity');
            $('.loading-spinner').hide();
            if (json.Status === "Error") {
                $('#upload_fail').text(json.Message).slideDown();
            }
            else {
                $('#logo_wrapper').show();
                $('#form_wrapper').hide();
                $('#logo').attr('src', url);
                $('#logo_link').attr('href', wiki);
                $('#logo_title').text(name);
                $('#logo_name').val('').blur();
                $('#logo_wiki').val('').blur();
                $('#fileToUpload').val('');
                $("label[for='fileToUpload']").find('span').text('Upload an image');
            }
        },
        error: function () {
        },
        async: true
    });
}
$('#new_upload').click(function () {
    $('#logo_wrapper').hide();
    $('#form_wrapper').show();
});