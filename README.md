# ![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png)  SOFTWARE ENGINEERING IMMERSIVE

## Getting started

1. Fork
1. Clone

# Express API using Router

```sh
cd express-api-using-router
npm init -y && npm install sequelize pg &&  npm install --save-dev sequelize-cli
```

Next we will initialize a Sequelize project:

```sh
npx sequelize-cli init
```

Let's setup our database configuration:

express-api/config/config.json
```js
{
  "development": {
    "database": "projects_api_development",
    "dialect": "postgres"
  },
  "test": {
    "database": "projects_api_test",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": true
    }
  }
}
```

> Notice: For production we use `use_env_variable` and `DATABASE_URL`. We are going to deploy this app to [Heroku](https://www.heroku.com). Heroku is smart enough to replace `DATABASE_URL` with the production database. You will see this at the end of the lesson.

Cool, now create the Postgres database:

```sh
npx sequelize-cli db:create
```

Next we will create a User model:

```sh
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string,password:string
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
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      password: '123456789',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@smith.com',
      password: '123456789',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstName: 'John',
      lastName: 'Stone',
      email: 'john@stone.com',
      password: '123456789',
      createdAt: new Date(),
      updatedAt: new Date()
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
echo "
/node_modules
.DS_Store
.env" >> .gitignore
```

In our API, Users will have many Projects. Let's build that out:

```sh
npx sequelize-cli model:generate --name Project --attributes title:string,imageUrl:string,description:text,userId:integer
```

Make sure we create the association between Project and User (belongs to):

```js
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    title: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    description: DataTypes.TEXT,
    userId: DataTypes.INTEGER
  }, {});
  Project.associate = function (models) {
    // associations can be defined here
    Project.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  };
  return Project;
};
```
> Note: `onDelete: 'CASCADE'` means that if we delete a user we also delete all their associated projects.

Setup the assocation between User and Project (has many):

```js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Project, {
      foreignKey: 'userId'
    })
  };
  return User;
};
```

Add the foreign key to the migration file:

migrations/20190914222216-create-project.js
```js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId',
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Projects');
  }
};  
```

Perform the migration to create the Projects table in the Postgres database:

```sh
npx sequelize-cli db:migrate
```

Let's create some seed for Projects:

```sh
npx sequelize-cli seed:generate --name projects
```

Add some code to the seed file:

seeders/20190914230148-projects.js
```js
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Projects', [{
      title: 'Project 1',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
      description: 'This project was built using Vanilla JavaScript, HTML, and CSS',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Project 2',
      imageUrl: 'https://www.stickpng.com/assets/images/584830f5cef1014c0b5e4aa1.png',
      description: 'This project was built using React & a 3rd-party API.',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Project 3',
      imageUrl: 'https://expressjs.com/images/express-facebook-share.png',
      description: 'This project was built using Express & React.',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Project 4',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Ruby_on_Rails-logo.png',
      description: 'This project was built using Rails & React.',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Projects', null, {});
  }
};
```

Run the seed file:

```sh
npx sequelize-cli db:seed --seed 20190914230148-projects.js
```

Make sure the data exists on the database:

```sh
psql projects_api_development
SELECT * FROM "Users" JOIN "Projects" ON "Users".id = "Projects"."userId";
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

app.use('/api', routes);

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
```

Test the route:

```sh
npm start
```

Test the root endpoint in your browser:  http://localhost:3000/api/

Good, now let's work on the controller. The controller is where we will set up all of our logic e.g. what does the API do when we want to create a new user? Update a user? etc.

Now I want to create a controller method to grab all the users from the database along with their associated projects:

./controllers/index.js
```js
const { User, Project } = require('../models');

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
```

Open http://localhost:3000/api/users in your browser or do a GET request in Postman.

Nice, now let's add the ability to find a specific user with their associated projects:

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

So we can now show all users, and show a specific user.

Make sure your exports are updated:

Success! We built a full CRUD JSON API in Express, Sequelize, and Postgress using Express Router!

### Deployment

Let's deploy our app to [heroku](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).

First we need to update our package.json:

```js
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:reset": "npx sequelize-cli db:drop && npx sequelize-cli db:create && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all"
  },
```

> Make sure you're on the `master` branch!

1. `heroku create your-heroku-app-name`
2. `heroku buildpacks:set heroku/nodejs`
3. `heroku addons:create heroku-postgresql:hobby-dev --app=your-heroku-app-name`
4. `git status`
5. `git commit -am "add any pending changes"`
6. `git push heroku master`
7. `heroku run npx sequelize-cli db:migrate`
8. `heroku run npx sequelize-cli db:seed:all`

> Having issues? Debug with the Heroku command `heroku logs --tail` to see what's happening on the Heroku server.

Test the endpoints :)

> https://your-heroku-app-name.herokuapp.com/api/projects

> https://your-heroku-app-name.herokuapp.com/api/projects/1

**Excellent!**

> ✊ **Fist to Five**

## Feedback

> [Take a minute to give us feedback on this lesson so we can improve it!](https://forms.gle/vgUoXbzxPWf4oPCX6)
