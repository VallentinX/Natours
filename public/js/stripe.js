import axios from 'axios';
import Stripe from 'stripe';
import {showAlert} from './alerts';

const stripe = Stripe(
  'pk_test_51PU72jAPi4AaMRa38LFvkkPkbiFVw4Y5JfRkXGOF1QxBtWO1KjAArPV1EldzTXxYWBKglv3xlNLyvd3XThee4CEX00vjLHRwLu'
);

export const bookTour = async tourId => {
  try {
    const session = await axios(`http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`);

    window.location.assign(session.data.session.url);
  } catch (error) {
    showAlert('Error!', error);
  }
};
