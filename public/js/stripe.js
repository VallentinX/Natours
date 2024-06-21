import axios from 'axios';
import Stripe from 'stripe';
import {showAlert} from './alerts';
import {version} from '../../utils/server.js';

const stripe = Stripe(
  'pk_test_51PU72jAPi4AaMRa38LFvkkPkbiFVw4Y5JfRkXGOF1QxBtWO1KjAArPV1EldzTXxYWBKglv3xlNLyvd3XThee4CEX00vjLHRwLu'
);

export const bookTour = async tourId => {
  try {
    const session = await axios(`/api/${version}/booking/checkout-session/${tourId}`);

    window.location.assign(session.data.session.url);
  } catch (error) {
    showAlert('Error!', error);
  }
};
