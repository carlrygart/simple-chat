$(document).ready(function() {

	var username = "";
	while (!username) {
		var username = prompt('Please enter your username', 'User'+Math.floor((Math.random() * 999) + 1));
	}
	
	var socket;

	function createNewSocket() {
		socket = new WebSocket("ws://10.0.1.2:8080/" + username);
		socket.onopen = function() {
			
			$("#main-chat").append('<p class="status-connected">'+ getTime() +' Connected!</p>');
			updateScroll();
		}

		socket.onclose = function() {
			$("#main-chat").append('<p class="status-disconnected">'+getTime()+' Connection closed!</p>');
			updateScroll();
		}

		socket.onmessage = function(event) {
			var mes = JSON.parse(event.data);
			if (mes.type == 'chatmsg') {
				var className = 'others';
				if (mes.fromId == username) {
					className = 'you';
				}
				$("#main-chat").append('<p>'+getTime()+'<span class="'+className+'"> '+ mes.fromId +': </span>' + mes.data + '</p>');
				updateScroll();
			} else {
				var userList = mes.data;
				$('#user-list').html('');
				userList.forEach((username) => {
					$('#user-list').append('<p>'+ username +'</p>');
				});
			}
		}
	}

	$('#send').click(() => {
		var message = $('#text-message-input').val();
		var toId = $('#to-userid').val();
		var messageJson = {
			type: 'chatmsg',
			fromId: username,
			toId: null,
			data: message
		}
		socket.send(JSON.stringify(messageJson), function ack(error) {
			if (error) {
				$("#main-chat").append('<p class="status-disconnected">'+getTime()+' Error: '+ error +'</p>');
				updateScroll();
			}
		});
		//$("#main-chat").append('<p>'+getTime()+' <span class="you">'+ messageJson.fromId +': </span>' + messageJson.message + '</p>');
		$('#text-message-input').val('');
	});

	$('#text-message-input').keypress(function(event){ 
		var keyCode = event.which;   
		if (keyCode == 13 && $(this).val() != '') {
		    $('#send').trigger('click');
		}
	});

	$('#close').click(() => {
		socket.close();
	})

	$('#open').click(() => {
		createNewSocket();
	});

	createNewSocket();

	function getTime() {
		var d = new Date();
		return padDigits(d.getHours(), 2) +':'+ padDigits(d.getMinutes(), 2) +':'+ padDigits(d.getSeconds(), 2);
	}

	function padDigits(number, digits) {
    	return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
	}

	function updateScroll(){
		$('.left-pane').scrollTop($('.left-pane')[0].scrollHeight);
	}
});