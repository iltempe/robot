var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))

// leggi application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// leggi application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// facebook messenger webook
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'token_opendatagentediprato') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// postare dati
app.post('/webhook/', function (req, res) {
	messaging_events = req.body.entry[0].messaging
	for (i = 0; i < messaging_events.length; i++) {
		event = req.body.entry[0].messaging[i]
		sender = event.sender.id
		if (event.message && event.message.text) {
			text = event.message.text
			if (text === 'Generic') {
				sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "Ho ricevuto questo testo: " + text.substring(0, 200))
		}
		if (event.postback) {
			text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Ho ricevuto un postback: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})

var token = "CAAJQpVkc21wBAJs0ZBlVwLaSQ6jEoaPIat0oe1ECMMMKilNDsQ3ZBGRZA2ZCh7BVECyrKN0lZCFZCMamhyNpGCuBOYuBiRdA3DcDwDV5FpputwXcoQpsejWzOZCdesgKLLvh8piFOnFmHSXSFK3YvrZAr5BpZBm83AggjKZBlvBOb283jDfKZCZBvhw8pgNYOEQLZAFUZD"

//invio messaggi di testo
function sendTextMessage(sender, text) {
	messageData = {
		text:text
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}
//invio messaggio strutturato
function sendGenericMessage(sender) {
	messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Artigiani",
					"subtitle": "Tutti hi artigiani di prato estratti da Openstreetmap",
					"image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Openstreetmap_logo.svg/2000px-Openstreetmap_logo.svg.png",
					"buttons": [{
						"type": "web_url",
						"url": "http://iltempe.github.io/opendatagentediprato/datasets/artigiani/",
						"title": "Link"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Biometeo",
					"subtitle": "Biometeo di Prato",
					"image_url": "http://www.cibic.unifi.it/upload/sub/LogoCIBICb.jpg",
					"buttons": [
					{
						"type": "web_url",
						"url": "http://iltempe.github.io/opendatagentediprato/datasets/artigiani/",
						"title": "Link"
					},{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
