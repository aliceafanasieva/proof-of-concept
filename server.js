// - - - - - - - Setup - - - - - - - -



// Importeer het npm pakket express uit de node_modules map
import express from "express";
import fetchJson from "./helpers/fetch-json.js";

// Maak een nieuwe express app aan
const app = express();

// Stel ejs in als template engine
app.set("view engine", "ejs");

// Stel de map met ejs templates in
app.set("views", "./views");

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

const apiUrl = "https://fdnd-agency.directus.app/items/"
const apiPersons = (apiUrl + 'anwb_persons')
const apiRoles = (apiUrl + 'anwb_roles')
const apiVacation= (apiUrl + 'anwb_vacation_days')

const persons = await fetchJson(apiPersons);
console.log('persons API', persons)


// - - - - - - - Routing - - - - - - - -

// - - - - GET Route voor login pagina - - - - 

app.get('/', function(request, response) {
  response.render('login');
  
});

// - - - - POST-route voor het afhandelen van het indienen van inlogformulier - - - -

app.post('/login', async function(request, response) {
  const username = request.body.username;
  try {
    // De fetchJson-functie doet een HTTP-verzoek aan een API-endpoint en retourneert JSON-gegevens.
    const persons = await fetchJson(apiPersons);
    console.log('persons API', persons)
    /* profiles bevat data over members {"id":2,"family_id":1,"name":"Daan", etc. . . }
     find() zoekt het eerste profiel uit de profiles.data waarvan de naam 
     (in kleine letters) overeenkomt met de ingevoerde username (ook in kleine letters). */
    const user = persons.data.find(person => person.name.toLowerCase() === username.toLowerCase());

    if (user) {
      response.redirect(`/overzicht/${user.id}`);
    } else {
      response.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});

app.get('/overzicht/:id', async function(request, response) {
  /* Functie request.params.id geeft de waarde van id terug (bijv. 2)
   Het maakt een URL met een filterqueryparameter om alleen  
   data van item met de specifieke ID op te halen. */
  const userId = request.params.id;
  const currentPath = request.path;
  try {
    const profileResponse = await fetchJson(`${apiPersons}?filter={"id":${userId}}`);
    const user = profileResponse.data[0];

    if (user) {
      response.render('overzicht', {
        user: user,
        userId: userId, 
        currentPath: currentPath
      });
    } else {
      response.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// - - - - GET route voor HEAD - - - -

app.get('/partials/head/:id', async function(request, response) {
  const userId = request.params.id;
  const currentPath = request.path;
  try {
    response.render('head', {
      userId: userId,
      currentPath: currentPath
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// - - - - - - - Start webserver - - - - - - - -

// Stel het poortnummer in waar express op moet gaan luisteren
app.set("port", process.env.PORT || 8006);

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
