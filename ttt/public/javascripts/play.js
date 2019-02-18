$('.cell')
.click(function() {
    var gameState = "";
    $('.char').each(function() {
        gameState += $(this).text();
    });
    console.log(gameState);
    var json = {gameState: gameState}
    $.ajax({
        url: 'localhost:3000/ttt/play',
        type: 'POST',
        data: JSON.stringify(json),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: true,
        success: function(msg) {
            alert(msg);
        }
    });
    
});