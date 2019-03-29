# CSCI3230_Final_Project
    - This appication is used as a Formula One driver search and update tool.
    - For this project we used paired programming.

# How To start:

## Node
```bash
npm install
npm start or nodemon npm start
```

## Database:
    - There are 3 data files neede for this app:
    - Files are stored in data folder.
        1. Drivers.json: Holds all the dirver data
        2. Users.json: Stores all users
        3. driversToReview: If updates to drivers are made, data is stored here (made by app if it doesnt exist,)
    
    - The mongo client looks for mongodb://localhost:27017/

## Description of the site:
    - The homepage provides a brief look into the sport.
    - The Search pages allows you to search for drivers based on First/Last name and provides brief information.
    - Add driver allows you to add new drivers to DB.
    - Admin tab allows you to login as admin and confirm changes to DB.

## List of Drivers:
    Here is a list of drives that can be used to search:
        1. Mark Webber
        2. Lewis Hamilton
        3. Mika Salo
        4. Martin Brundel
        5. Takuma Sato

