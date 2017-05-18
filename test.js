import LonelyPlanet from './main.js';


const lp = new LonelyPlanet();

lp.city('denmark/copenhagen').then(city => {
  return city.sights();
}).then(sights => {
  console.log(sights);
})