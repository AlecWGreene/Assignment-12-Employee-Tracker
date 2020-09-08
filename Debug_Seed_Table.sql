USE employee_tracker_db;
SET FOREIGN_KEY_CHECKS = 0;

-- Add Default Departments --
INSERT INTO department_table (`name`, `head_id`, `budget`) VALUES
("Wild Cats",19,500000),
("Canines",41,460000),
("Avians",9,320000),
("Reptiles",31,290000),
("Equines",42,590000),
("Aquatic",13,375000),
("Corporate",1,500000),
("Gift Shop",15,200000);

-- Add default roles --
INSERT INTO role_table (title, salary) VALUES 
("Director",110000),
("Finance Manager",70000),
("Gift Shop Manager",60000),
("Curator",90000),
("PR Representative",60000),
("Accountant",70000),
("Veternarian",80000),
("Zoologist",70000),
("Caretaker",70000),
("Gift Shop Clerk",45000),
("Ticket Attendant",44000),
("Volunteer Coordinator",60000);


-- Add Default Employees --
INSERT INTO employee_table (first_name, last_name, department_id, role_id, manager_id)
VALUES 					   
("Alec","Greene",2,8,1),
("Desare","Farris",3,9,9),
("Kanye","Wet",5,9,1),
("Fin","Kardashian",6,7,1),
("Jimmy","Kibble",7,5,1),
("Bear","Grylls",5,4,1),
("Dick","Wolf",2,7,1),
("Scrooge","McDuck",7,1,1),
("Jack","Sparrow",3,4,1),
("Robin","Carlson",6,7,1),
("Dick","Johnson",5,8,1),
("Sam","Wilson",3,9,9),
("Wade","Wilson",6,4,1),
("John","Jameson",7,5,1),
("Doc","Brown",8,3,1),
("Laura","Terra",2,9,1),
("Marty","McFly",8,11,1),
("John","Dolittle",4,8,1),
("Aslan","Lewis",1,4,19),
("Jim","Halpert",7,12,1),
("Dwight","Schrute",8,11,1),
("Stanley","Hudson",8,11,1),
("Angela","Martin",1,9,19),
("Kevin","Malone",7,6,1),
("Oscar","Martinez",7,6,1),
("Shaggy","Rogers",2,9,1),
("Velma","Dinkley",4,8,1),
("Fred","Jones",1,9,19),
("Daphne","Blake",6,8,1),
("Scoobert","Doo",2,9,1),
("Steve","Irwin",4,4,1),
("Bindi","Irwin",4,9,1),
("Carol","Baskin",1,8,19),
("Joe","Exotic",1,7,19),
("Robert","Brown",3,7,9),
("Jebediah","Lyson",5,7,1),
("Chanice","Tyson",6,8,1),
("Omar","Al-Saud",5,9,1),
("North","West",7,11,1),
("Terry","Haymond",5,7,1),
("Cruella","Devil", 2,4,1),
("Chiron","Kaustus", 5,4,1);

SET FOREIGN_KEY_CHECKS = 1;