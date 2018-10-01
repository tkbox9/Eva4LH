/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);



//cards
var HeroCardName = 'Hero card';
var ThumbnailCardName = 'Thumbnail card';
var ReceiptCardName = 'Receipt card';
var SigninCardName = 'Sign-in card';
var AnimationCardName = "Animation card";
var VideoCardName = "Video card";
var AudioCardName = "Audio card";
var CardNames = [HeroCardName, ThumbnailCardName, ReceiptCardName, SigninCardName, AnimationCardName, VideoCardName, AudioCardName];

const welcomeGreetings = ['Hello', 'Howdy', 'Hi', 'Good day']; // Array of items for welcome greetings
const dataPrivacy = ['Security is always on my mind...', 'Dont worry I will never hold your data without permission', 'I was ready for the GDPR even before the GDPR', 'I take privacy very seriously']; // Array of items for welcome greetings
const reightForMe = ['Dont worry, we will find the right perfect fit', 'I will give the best product ever ', 'Gotcha! We will find the best fit together']; // Array of items for welcome greetings


function randomPhrase(myData) {
    var i = 0;
    i = Math.floor(Math.random() * myData.length);
    return (myData[i]);
}





function createCards(session) {
    return [
        new builder.HeroCard(session)
            .title('Azure Storage')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/aspnet/aspnet/overview/developing-apps-with-windows-azure/building-real-world-cloud-apps-with-windows-azure/data-storage-options/_static/image5.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('DocumentDB')
            .subtitle('Blazing fast, planet-scale NoSQL')
            .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Azure Functions')
            .subtitle('Process events with a serverless code architecture')
            .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
            .images([
                builder.CardImage.create(session, 'https://msdnshared.blob.core.windows.net/media/2016/09/fsharp-functions2.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/functions/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('Cognitive Services')
            .subtitle('Build powerful intelligence into your applications to enable natural and contextual interactions')
            .text('Enable natural and contextual interaction with tools that augment users\' experiences using the power of machine-based intelligence. Tap into an ever-growing collection of powerful artificial intelligence algorithms for vision, speech, language, and knowledge.')
            .images([
                builder.CardImage.create(session, 'https://msdnshared.blob.core.windows.net/media/2017/03/Azure-Cognitive-Services-e1489079006258.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/cognitive-services/', 'Learn More')
            ])
    ];
}




// Ask the user for their name and greet them by name.
bot.dialog('RightForMe', [
    function (session) {
        session.beginDialog('aboutEva');
    },
    function (session, results) {
        session.endDialog(`Hello ${results.response}!`);
    }
]).triggerAction({
    matches: 'Greeting'
});

bot.dialog('aboutEva', [
    function (session) {
        session.sendTyping();
        session.send(randomPhrase(reightForMe));
        session.send('Why dont you tell me a bit about yourself?');
        session.send('Dont be shy :D.. Oh ok, I will go first');
        session.send('Im 34 years old, single with no kid and work as digital assitant. I enjoy skiing and deep dive in open waters :)');
       
        builder.Prompts.text(session, "Now is your turn... Tell me a bit about yourself?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);



// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('GreetingDialog',
    (session) => {
        session.sendTyping();
        session.send(randomPhrase(welcomeGreetings));

        var cards = createCards(session);
        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);

        session.send(msg);
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting'
})


bot.dialog('HelpDialog',
    (session) => {
        session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
})

bot.dialog('DataPrivacy',
    (session) => {

        session.sendTyping();
        session.send(randomPhrase(dataPrivacy));

        session.send('If you want to know more, take a look here: https://www.verti.com/conditions/');
        session.endDialog();
    }
).triggerAction({
    matches: 'DataPrivacy'
})



bot.dialog('CancelDialog',
    (session) => {
        session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
})

