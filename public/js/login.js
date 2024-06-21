import axios from 'axios';
import {showAlert} from './alerts.js';

export const logIn = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
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
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (response.data.status === 'Success!') location.reload(true);
  } catch (error) {
    console.log(error.response);

    showAlert('error', 'Error logging out! Try again.');
  }
};
