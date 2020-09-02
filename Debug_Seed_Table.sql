USE employee_tracker_db;

-- Add Default Departments --
INSERT INTO department_table (`name`, `budget`) VALUES ("Mathematics", 150000), ("Physics", 200000), ("Biology", 190000), ("Chemistry", 175000), ("Computer Science", 100000), ("Mechanical Engineering", 175000), ("Electrical Engineering", 175000);

-- Add default roles --
INSERT INTO role_table (title, salary) VALUES 
("Department Head", 150000.00), 
("Professor", 110000.00), 
("Research Fellow", 60000.00), 
("Teaching Assistant", 25000.00), 
("Lab Assistant", 20000.00);

-- Add Default Employees --
INSERT INTO employee_table (first_name, last_name, role_id, department_id, manager_id)
VALUES 					   ("Leonhard", "Euler", 1, 1, 0),
						   ("Alec", "Greene", 3, 1, 1),
						   ("Louis", "Cauchy", 2, 1, 1),
                           ("Carl", "Gauss", 2, 1, 1),
                           ("Desare", "Farris", 1, 4, 0),
                           ("Ian", "Greene", 4, 1, 2),
                           ("John", "Smith", 4, 1, 2);