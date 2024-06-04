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


// - - - - - - - Routing - - - - - - - -

// - - - - GET Route voor login pagina - - - - 

app.get('/', function(request, response) {
  response.render('login');
});

// - - - - - - - Start webserver - - - - - - - -

// Stel het poortnummer in waar express op moet gaan luisteren
app.set("port", process.env.PORT || 8006);

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
