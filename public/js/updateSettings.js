import axios from 'axios';
import {showAlert} from './alerts.js';
import {version} from '../../utils/server.js';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? `/api/${version}/users/update-user-password`
        : `/api/${version}/users/update-me`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success')
      showAlert('Success!', `${type.toUpperCase()} updated successfully!`);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
