import '@babel/polyfill';
import {logIn, logOut} from './login.js';
import {displayMap} from './map.js';
import {updateSettings} from './updateSettings.js';
import {bookTour} from './stripe.js';

const map = document.getElementById('map');
const logInForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (map)
  document.addEventListener('DOMContentLoaded', () => {
    const locationsData = JSON.parse(map.dataset.locations);

    displayMap(locationsData);
  });

if (logInForm)
  logInForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    logIn(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logOut);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';

    const {tourId} = e.target.dataset;

    bookTour(tourId);
  });
