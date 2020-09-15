
![License](https://img.shields.io/badge/license-MIT-green)

# Assignment 12 -- Employee Tracker 


  
  ## Description 

This CLI will help you manage a database containing employee information. Using a MySQL database hosted on a MySQL server, the CLI will take user input and format custom queries to create entries, update entries, view entries, and remove them. 


  
  ## Table of Contents 

  1. [Installation](#installation) 

  2. [Usage](#usage) 

  3. [Contributing](#contributing) 

  4. [Tests](#tests) 

  5. [Questions](#questions) 

  
  ## Installation 

After downloading the files from GitHub, run `npm install` to install the packages listed in package.json including inquirer and mysql. Before connecting to the database, make sure to put the password for the database inside password.txt. Run the SQL script `Debug_Seed_SQL.sql` inside the db directory. To populate the database, either use the table data import wizard from the mysql workbench, or run the script `Debug_Seed_Table.sql` to load the example information.  


  
  ## Usage 

To launch the program, run the command `node index.js` from the command line. An inquirer prompt will appear, and offers a nesting menu to direct you through interacting with the database. The menu is structured with 3 main categories: View Information, Update Information, and Validate Database.

- *View information* will allow you to select a database, and then manipulate the view by filtering the rows based on specific column values, searching the rows for REGEX matches in column values, sort the rows based on column values, or change which columns are being displayed.
 
 - *Update Information* is a little more intricate, but the prompts will help you manage your data mutation needs. First, the prompt will ask you which table you would like to update. The database is made up of 3 tables: Departments, Roles, and Employees. Updating a table will prompt you to choose between creating a new entry, updating an existing one, or deleting an existing entry. The CLI will dynamically generate the appropriate questions needed to perform these tasks. Departments require a department name, a budget, and an optional reference to the department head's employee id. Roles require a title and a salary. Finally, Employees require a first name, last name, department, role, and a reference to their manager's employee id. Furthermore, the department's expenses will automatically be calculated using the assigned salaries of its emplyees, and selecting `Reset Employee Managers` under `Update>Departments` will automatically assign the manager reference of every employee in the department to the current department head. 
 
 - *Validate database* will run a preset set of rules against your database entries and look for any discrepancies. These rules include: "Employee's must have managers from the same department", "Department's must have a budget", "Department heads must be from the same department", "Roles must have salaries". 


  
  ## Contribution 

Contribution is being soley managed by Alec Greene in accordance to submit the assignment to the Michigan State University Full-Stack Web Development Bootcamp 

  ## Feature Roadmap

Planned features to implement:
- Finish implentation of JSDoc commenting 
  
  ## Testing 

This program does not use jest as it primarily strings together inquirer and mysql using logic structures. 


  
  ## License 

Assignment 12 -- Employee Tracker 


  
  ## Questions 

Github:  AlecWGreene 

Email: AlecWGreene@gmail.com 

  