USE employee_tracker_db;

SELECT * FROM department_table;
SELECT * FROM role_table;
SELECT * FROM employee_table GROUP BY department_id, role_id;

-- Display foreign keys --
SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
WHERE information_schema.TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'FOREIGN KEY'
AND information_schema.TABLE_CONSTRAINTS.TABLE_NAME = 'employee_table';


CALL update_department_expenses();
