import axios from 'axios';
import {showAlert} from './alerts.js';
import {version} from '../../utils/server.js';

export const logIn = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `/api/${version}/users/login`,
      data: {
        email,
        password,
      },
    });

    if (response.data.status === 'Success!') {
      showAlert('success', 'Logged in successfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: `/api/${version}/users/logout`,
    });

    if (response.data.status === 'Success!') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
