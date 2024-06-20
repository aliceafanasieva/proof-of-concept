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
const apiAssignments = (apiUrl + 'anwb_assignments')
const apiWeeks = (apiUrl + 'anwb_weeks')
const anwbWeek = apiUrl + "anwb_week?fields=*,assignments.*,assignments.anwb_assignments_id.*,assignments.anwb_assignments_id.role.anwb_roles_id.role,assignments.anwb_assignments_id.person.anwb_persons_id.name"
   

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
    /* profiles bevat data over members 
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

// - - - - GET Route voor overzicht pagina - - - - 

app.get('/overzicht/:id', async function(request, response) {
  /* Functie request.params.id geeft de waarde van id terug (bijv. 2)
   Het maakt een URL met een filterqueryparameter om alleen  
   data van item met de specifieke ID op te halen. */
  const userId = request.params.id;
  const currentPath = request.path;

  try {
    const persons = await fetchJson(apiPersons);
    const assignments = await fetchJson(apiAssignments);
    const roles = await fetchJson(apiRoles);
    const weeks = await fetchJson(anwbWeek);
    const user = persons.data.find(person => person.id == userId);

    const roleNamesByWeek = weeks.data.map(week => {
      const userRoles = [];

      week.assignments.forEach(assignment => {
        const rolesForAssignment = assignment.anwb_assignments_id.role.map((role, index) => {
          const person = assignment.anwb_assignments_id.person[index];
          if (person && person.anwb_persons_id.name === user.name) {
            return role.anwb_roles_id.role;
          }
          return null;
        }).filter(role => role !== null);

        userRoles.push(...rolesForAssignment);
      });

      return {
        week: `Week ${week.week.split('-W')[1]}`,
        roles: userRoles
      };
    }).filter(item => item.roles.length > 0);



    const predefinedRoles = ["1e lijns support", "2e lijns support", "Incident Manager", "Incident Coordinator", "Technische Beheerder"];


    if (user) {
      response.render('overzicht', {
        user: user,
        userId: userId,
        currentPath: currentPath,
        roleNamesByWeek: roleNamesByWeek,
        weeks: weeks.data,
        roles: predefinedRoles
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
