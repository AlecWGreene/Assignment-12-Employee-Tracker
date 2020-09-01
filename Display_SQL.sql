USE employee_tracker_db;

UPDATE department_table SET head_id = 1 WHERE id > 0;

SELECT * FROM department_table;
SELECT * FROM role_table;
SELECT * FROM employee_table;
SELECT first_name, last_name FROM employee_table WHERE (id) IN (SELECT id FROM role_table WHERE salary > 70000);
SELECT id, first_name, last_name FROM employee_table WHERE (id) NOT IN (SELECT head_id FROM department_table);
UPDATE employee_table SET first_name = "Alec", last_name = "Wade", department_id = 4 WHERE id = 2;
-- Display foreign keys --
SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
WHERE information_schema.TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'FOREIGN KEY'
AND information_schema.TABLE_CONSTRAINTS.TABLE_NAME = 'employee_table';


