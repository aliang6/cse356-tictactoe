
$('.cell')
.click(function() {
    $('.cell > .char').val("X");
    var gameState = "";
    $('.char').each(function() {
        gameState += $(this).text();
    });
    console.log(gameState);
    var json = {gameState: gameState};
    $.post("/ttt/play", json);
    /*$.ajax({
        url: '130.245.168.173:3000/ttt/play',
        type: 'POST',
        data: json,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
       	success: function(msg) {
	    console.log("request sent");
        }
    });*/
});
