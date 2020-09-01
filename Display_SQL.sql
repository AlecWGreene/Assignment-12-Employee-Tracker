USE employee_tracker_db;

SELECT * FROM department_table;
SELECT * FROM role_table;
SELECT * FROM employee_table WHERE true ORDER BY id DESC;
SELECT first_name, last_name FROM employee_table WHERE (id) IN (SELECT id FROM employee_table WHERE department_id = 1);

-- Display foreign keys --
SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
WHERE information_schema.TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'FOREIGN KEY'
AND information_schema.TABLE_CONSTRAINTS.TABLE_NAME = 'employee_table';

