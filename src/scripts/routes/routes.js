import HomePage from '../pages/home/home-page.js';
import FavoritePage from '../pages/favorite/favorite-page.js';
import AddPage from '../pages/add/add-page.js';
import MapPage from '../pages/map/map-page.js';
import LoginPage from '../pages/login/login-page.js';
import RegisterPage from '../pages/register/register-page.js';
import AboutPage from '../pages/about/about-page.js';

const routes = {
  '/': new HomePage(),
  '/favorites': new FavoritePage(),
  '/add': new AddPage(),
  '/map': new MapPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/about': new AboutPage(),
};

export default routes;
