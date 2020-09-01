DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE department_table(
id INT auto_increment,
`name` VARCHAR(255),
budget DECIMAL,
head_id INT,
PRIMARY KEY(id)
);

CREATE TABLE role_table(
id INT auto_increment PRIMARY KEY,
title VARCHAR(30),
salary DECIMAL
);

CREATE TABLE employee_table(
id INT auto_increment PRIMARY KEY,
first_name VARCHAR(30),
last_name VARCHAR(30),
department_id INT,
role_id INT,
manager_id INT,
CONSTRAINT department_label FOREIGN KEY(department_id) REFERENCES department_table(id) ON UPDATE CASCADE ON DELETE SET NULL,
CONSTRAINT role_label FOREIGN KEY(role_id) REFERENCES role_table(id) ON UPDATE CASCADE ON DELETE SET NULL
);

ALTER TABLE department_table
ADD CONSTRAINT employee_label 
FOREIGN KEY(head_id) 
REFERENCES employee_table(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;