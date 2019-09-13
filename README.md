# ![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png)  SOFTWARE ENGINEERING IMMERSIVE

## Getting started

1. Fork
1. Clone

# Express API

```sh
cd express-api-using-router
npm init -y && npm install --save-dev sequelize-cli
```

Next we will initialize a Sequelize project:

```sh
npx sequelize-cli init
```

Let's setup our database credentials. Database credentials consist of sensitive data (database url, port numbers, sometimes usernames and passwords) - this is not information that we want to push up to GitHub, instead what we want to do is store this information on our local computers as environment variables so that can be accessed via JavaScript in our config files.

That being said, let's configure our application to support this.

First, let's create a `.env` file where will be storing our sensitive information:

```sh
touch .env
```

Add the development, test, and production database url's to your `.env` file:

```sh
DATABASE_URL=
DEV_DATABASE_URL=postgres://127.0.0.1:5432/projects_api_development
TEST_DATABASE_URL=postgres://127.0.0.1:5432/projects_api_test
```

> Note: the production database url (DATABASE_URL) is blank intentionally because when we deploy to Heroku, Heroku will create its own production url and override this environment variable.

Next, we will install an npm package called [dotenv](https://www.npmjs.com/package/dotenv) that will take whatever we wrote in our `.env` file and inject it into our system's environment variable so it can be made available via [process.env](https://nodejs.org/docs/latest/api/process.html#process_process_env).

```sh
npm install dotenv
```

Ok, so now rename `express-api-using-router/config/config.json` to `express-api-using-router/config/config.js` and replace the code with the following

express-api-using-router/config/config.js
```js
require('dotenv').config()

module.exports = {
  development: {
    url: process.env.DEV_DATABASE_URL,
    dialect: 'postgres',
    operatorsAliases: false,
    underscored: true
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    dialect: 'postgres',
    operatorsAliases: false,
    underscored: true
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    operatorsAliases: false,
    underscored: true
  },
}
```

> Note: Notice how we're using process.env via the dotenv package we installed! No sensitive information in this file!

Because we renamed `config.json` to `config.js` we need to make a minor edit to `express-api-using-router/models/index.js`:

Find:

```js
const config = require(__dirname + '/../config/config.json')[env];
```

Replace it with:

```js
const config = require(__dirname + '/../config/config')[env];
```

Cool, now create the Postgres database:

```sh
npx sequelize-cli db:create
```

Next we will create a User model:

```sh
npx sequelize-cli model:generate --name User --attributes first_name:string,last_name:string,email:string --underscored
```
> Checkout the Sequelize Data Types that are available: https://sequelize.org/master/manual/data-types.html

Now we need to execute our migration which will create the Users table in our Postgres database along with the columns:

```sh
npx sequelize-cli db:migrate
```

> If you made a mistake, you can always rollback: `npx sequelize-cli db:migrate:undo`

Now let's create a seed file:

```sh
npx sequelize-cli seed:generate --name users
```

Let's edit the seed file:

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john@smith.com',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      first_name: 'John',
      last_name: 'Stone',
      email: 'john@stone.com',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
```

Execute the seed file:

```sh
npx sequelize-cli db:seed:all
```

> Made a mistake? You can always undo: `npx sequelize-cli db:seed:undo`

Drop into psql and query the database for the demo user:

```sh
psql projects_api_development
SELECT * FROM "Users";
```

Create a .gitignore file `touch .gitignore`!

```sh
/node_modules
.DS_Store
.env
```

In our API, Users will have many Projects. Let's build that out:

```sh
npx sequelize-cli model:generate --name Project --attributes title:string,image_url:string,description:text,user_id:integer --underscored
```

Make sure we create the association between Project and User (belongs to):

```js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    title: DataTypes.STRING,
    image_url: DataTypes.STRING,
    description: DataTypes.TEXT,
    user_id: DataTypes.INTEGER
  }, {
    underscored: true,
  });
  Project.associate = function (models) {
    // associations can be defined here
    Project.belongsTo(models.User)
  };
  return Project;
};
```

Setup the assocation between User and Project (has many):

```js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    underscored: true,
  });
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Project, {
      onDelete: 'CASCADE'
    })
  };
  return User;
};
```

> Note: `onDelete: 'CASCADE'` means that if we delete a user we also delete all their associated projects.

Perform the migration to create the Projects table in the Postgres database:

```sh
npx sequelize-cli db:migrate
```

Let's create some seed for Projects:

```sh
npx sequelize-cli seed:generate --name projects
```

Add some code to the seed file:

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Projects', [{
      title: 'Project 1',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
      description: 'This project was built using Vanilla JavaScript, HTML, and CSS',
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      title: 'Project 2',
      image_url: 'https://www.stickpng.com/assets/images/584830f5cef1014c0b5e4aa1.png',
      description: 'This project was built using React & a 3rd-party API.',
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      title: 'Project 3',
      image_url: 'https://expressjs.com/images/express-facebook-share.png',
      description: 'This project was built using Express & React.',
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      title: 'Project 4',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Ruby_on_Rails-logo.png',
      description: 'This project was built using Rails & React.',
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Projects', null, {});
  }
};
```

Run the seed file:

```sh
npx sequelize-cli db:seed:all
```

Make sure the data exists on the database:

```sh
psql projects_api_development
SELECT * FROM "Users" JOIN "Projects" ON "Users".id = "Projects".user_id;
```

Cool, enough Sequelize. Now, let's setup the server and routes. First install Express:

```sh
npm install express --save
npm install nodemon -D
```

Let's setup the architecture:

```sh
mkdir routes controllers
touch server.js  routes/index.js controllers/index.js
```

Modify your package.json file to support nodemon. Also, let's create a command `npm db:reset` that will drop the database, create the database, run the migrations, and seed!

```js
....
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon server.js",
    "db:reset": "npx sequelize-cli db:drop && npx sequelize-cli db:create && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all"
  },
....
```

Let's setup the root route:

./routes/index.js
```js
const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => res.send('This is root!'))

module.exports = router;
```

Inside of server.js:

```js
const express = require('express');
const routes = require('./routes');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use('/api', routes);

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
```

Test the route:

```sh
npm start
open  http://localhost:3000/api/
```

Now let's work on the controller. The controller is where we will set up all of our logic e.g. what does the API do when we want to create a new user? Update a user? etc.

./controllers/index.js
```js
const { User } = require('./models');

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        return res.status(201).json({
            user,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    createUser,
}
```

Remember we will need the expressnbody-parser middleware to access the `req.body` object so: 

```sh
npm i body-parser
```

Add the following lines of code to the top of server.js:

```js
const bodyParser = require('body-parser');
app.use(bodyParser.json())
```

Cool. We have the logic to create a new user. Now let's create a route on our server to connect the request with the controller:

./routes/index.js:
```js
const { Router } = require('express');
const controllers = require('../controllers')
const router = Router();

router.get('/', (req, res) => res.send('This is root!'))

router.post('/users', controllers.createUser)

module.exports = router;
```

Use Postman (POST) method to test the create route (http://localhost:3000/api/users):

```js
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@smith.com"
}
```

Awesome! Now I want to create a controller method to grab all the users from the database along with their associated projects:

./controllers/index.js
```js
const { User, Project } = require('./models');

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        return res.status(201).json({
            user,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                {
                    model: Project
                }
            ]
        });
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

module.exports = {
    createUser,
    getAllUsers
}
```

Add the following route to your ./routes/index.js file:

```js
router.get('/users', controllers.getAllUsers)
```

Test the route:

```sh
npm start
open  http://localhost:3000/api/users
```

Now let's add the ability to find a specific user with their associated projects:

./controllers/index.js
```js
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({
            where: { id: id },
            include: [
                {
                    model: Project
                }
            ]
        });
        if (user) {
            return res.status(200).json({ user });
        }
        return res.status(404).send('User with the specified ID does not exists');
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
```

Add it to the export:

./controllers/index.js
```js
module.exports = {
    createUser,
    getAllUsers,
    getUserById
}
```

Add the route:

./routes/index.js
```js
router.get('/users/:id', controllers.getUserById)
```

Test it! http://localhost:3000/api/users/2

This is a good point to integrate better logging. Right now, if we check our terminal when we hit the http://localhost:3000/api/users/2 endpoint we see the raw SQL that was executed. For debugging purposes and overall better logging we're going to use an express middleware called [morgan](https://www.npmjs.com/package/morgan):

```sh
npm install morgan
```

Add the following to your server.js file:

```js
const logger = require('morgan');
app.use(logger('dev'))
```

Let's see the result:

```sh
npm start
open http://localhost:3000/api/users/2
```

You should now see in your terminal something like this:

```sh
GET /api/users/2 304 104.273 ms
```

That's morgan!

So we can now create users, show all users, and show a specific user. How about updating a user and deleting a user?

./controllers/index.js
```js
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await User.update(req.body, {
            where: { id: id }
        });
        if (updated) {
            const updatedUser = await User.findOne({ where: { id: id } });
            return res.status(200).json({ user: updatedUser });
        }
        throw new Error('User not found');
    } catch (error) {
        return res.status(500).send(error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({
            where: { id: id }
        });
        if (deleted) {
            return res.status(204).send("User deleted");
        }
        throw new Error("User not found");
    } catch (error) {
        return res.status(500).send(error.message);
    }
};
```

Make sure your exports are updated:

```js
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}
```

Let's add our routes:

./routes/index.js
```js
router.put('/users/:id', controllers.updateUser)
router.delete('/users/:id', controllers.deleteUser)
```

Test update (PUT) in Postman. Your request body in Postman will have to look something like this:

http://localhost:3000/users/3

```js
{
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@smith.com"
}
```

Test delete (DEL) in Postman using a URL like this http://localhost:3000/api/users/3

Success! We built a full CRUD JSON API in Express, Sequelize, and Postgress using Express Router!
