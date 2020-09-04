DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE department_table(
id INT auto_increment,
`name` VARCHAR(255),
head_id INT,
budget DECIMAL,
expenses DECIMAL,
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

DELIMITER //

CREATE PROCEDURE update_department_expenses()
BEGIN
	UPDATE department_table SET expenses = get_department_expenses(id) WHERE id > 0;
END //

CREATE FUNCTION get_department_expenses(arg_dept INT) RETURNS DECIMAL DETERMINISTIC
BEGIN
	DECLARE exp DECIMAL;
    -- Assign the sum of the salaries into the dept value --
    SELECT SUM(r.salary) INTO exp FROM employee_table AS emp LEFT JOIN role_table AS r ON emp.role_id = r.id WHERE emp.department_id = arg_dept;
    -- Update the value in department_table --
    RETURN exp;
END//

CREATE FUNCTION validate_managers_departments() RETURNS BOOL DETERMINISTIC
BEGIN
	
END//
DELIMITER ;


