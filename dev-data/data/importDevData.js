/** Models */
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

/** Developer's Models */
import Tour from '../../models/tourModel';
import User from '../../models/userModel';
import Review from '../../models/reviewModel';

dotenv.config({path: './config.env'});

/** Others */
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection successful'));

/** Read .json file */
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

/** Import Data Into DB */
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave: false});
    await Review.create(reviews);

    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

/** Remove All Data From DB */
const removeData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data successfully deleted!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') removeData();
