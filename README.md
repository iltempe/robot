# Fare un robot facebook

![Alt text](/demo/Demo.gif)

Esperimento sviluppato da [questo repository](https://github.com/jw84/messenger-bot-tutorial).

### *Impostare l'applicazione server*

Creare un file index.js file che includa la verifica del webhook. inserire al posto di XXX il token di verifica del webhook.

    ```
    var express = require('express')
    var bodyParser = require('body-parser')
    var request = require('request')
    var app = express()

    app.set('port', (process.env.PORT || 5000))

    // Process application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: false}))

    // Process application/json
    app.use(bodyParser.json())

    // Index route
    app.get('/', function (req, res) {
    	res.send('Ciao!!')
    })

    // for Facebook verification
    app.get('/webhook/', function (req, res) {
    	if (req.query['hub.verify_token'] === 'XXX') {
    		res.send(req.query['hub.challenge'])
    	}
    	res.send('Error, wrong token')
    })

    // Spin up the server
    app.listen(app.get('port'), function() {
    	console.log('running on port', app.get('port'))
    })
    ```

Una volta fatto questo è necessario caricare il file (ed eventuali file accessori) in una folder su un tuo server. La connessione deve essere https. Se hai un account HEROKU puoi fare un deploy di questo repository direttamente su Heroku creando una applicazione e facendo deploy di un repository come questo. Heroku si preoccupa anche installare le dipendenze JS necessarie. se fai deploy su Heroku il webhook da configurare sarà del tipo "https://XXXXXXX.herokuapp.com/webhook/"


### *Setup su Facebook*

1. Creare una applicazione Facebook https://developers.facebook.com/apps/

    ![Alt text](/demo/shot1.jpg)
    ![Alt text](/demo/4.png)

2. Nella app configura il webhook nella sezione Messenger. 

    ![Alt text](/demo/shot3.jpg)

3. Preleva e copia un token di una pagina Facebook. 

    ![Alt text](/demo/2.png)

4. Usando il token della pagina copiato da Facebook da riga di digitare

    ```
    curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=<PAGE_ACCESS_TOKEN>"
    ```

### *Setup del BOT*

Facebook e il server (Heroku) a questo punto si parlano ed è possibile sviluppare il codice dell'applicazione BOT .

1. Aggiungere un API endpoint a index.js per leggere i messaggi. Ricordati di includere anche il token della pagina facebook che hai usato in PAGE_ACCESS_TOKEN. 

    ```
    app.post('/webhook/', function (req, res) {
	    messaging_events = req.body.entry[0].messaging
	    for (i = 0; i < messaging_events.length; i++) {
		    event = req.body.entry[0].messaging[i]
		    sender = event.sender.id
		    if (event.message && event.message.text) {
			    text = event.message.text
			    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		    }
	    }
	    res.sendStatus(200)
    })

    var token = "<PAGE_ACCESS_TOKEN>"
    ```

2. Aggiungi una funzione per ripetere i messaggi inviati

    ```
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
    ```

3. Fai un deploy dell'applicazione

4. Vai su Facebook e verifica che puoi iniziare a chattare!

![Alt text](/demo/5.png)

## Personalizza quello che il BOT dice

### *Inviare messaggi strutturati*

Facebook Messenger può inviare messaggi strutturati come card o button. 

1. Usa del codice come segue per inviare messaggi strutturati.

    ```
    function sendGenericMessage(sender) {
	    messageData = {
		    "attachment": {
			    "type": "template",
			    "payload": {
    				"template_type": "generic",
				    "elements": [{
    					"title": "First card",
					    "subtitle": "Element #1 of an hscroll",
					    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.messenger.com",
						    "title": "web url"
					    }, {
						    "type": "postback",
						    "title": "Postback",
						    "payload": "Payload for first element in a generic bubble",
					    }],
				    }, {
					    "title": "Second card",
					    "subtitle": "Element #2 of an hscroll",
					    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					    "buttons": [{
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
    ```

2. Aggiorna le API del webhook per inviare messaggi di tipo speciale

    ```
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
			    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		    }
	    }
	    res.sendStatus(200)
    })
    ```

### *Intercettare cosa l'utente digitale come messaggi*

La funzione di postback può essere usata per definire cosa l'utente fa nell'azionamento su messaggi strutturati.

		```
    app.post('/webhook/', function (req, res) {
	    messaging_events = req.body.entry[0].messaging
	    for (i = 0; i < messaging_events.length; i++) {
		    event = req.body.entry[0].messaging[i]
		    sender = event.sender.id
		    if (event.message && event.message.text) {
			    text = event.message.text
			    if (text === 'opendata') {
				    sendGenericMessage(sender)
				    continue
			    }
			    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		    }
		    if (event.postback) {
			    text = JSON.stringify(event.postback)
			    sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			    continue
		    }
	    }
	    res.sendStatus(200)
    })
    ```


Quando digiti 'Generic' ora vedrai i messaggi strutturati.

## Condividere il tuo BOT

### *Aggiungere una chat alla tua pagina*

Vai [qui](https://developers.facebook.com/docs/messenger-platform/plugin-reference) per apprendere come inserire una chat su una pagina.

Attualmente il tuo BOT è ancora in fase di test e sviluppo. Per renderlo pubblico devi procedere a rendere pubblica la applicazione facebook e sottoporla al processo di review.

