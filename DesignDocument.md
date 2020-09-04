
## Department Table
id, name, head_id

## Role Table
id, title, salary, ... [Department Names]

## Employee Table
id first_name, last_name, department_id, role_id, manager_id


# UX Flow
> Main Menu
    > Update info
        > department
            > ADD
            > UPDATE
            > DELETE
        > roles
            > ADD
            > UPDATE
            > DELETE
        > employee
            > ADD
            > UPDATE
            > DELETE
        > project
            > ADD
            > UPDATE
            > DELETE
    > View info
        > department
        > employees
            > FILTER BY 
                > department
                > role
                > manager
                > project
            > SORT BY
                > name
                > salary
                > department
                > id
    > Exit

# Code outline

> app()
    > *while* not exit
        > prompt(Main Menu)
            > case: "View Information" COMPLETED
                > loadData(default_query) COMPLETED
                > *while* not return_to_menu COMPLETED
                    > prompt(alter view) COMPLETED
                        > case: "Filter" COMPLETED
                        > case: "Sort" COMPLETED
                        > case: "Select Columns" COMPLETED
                        > case: "Join additional table" TODO
                        > case: "View different table" COMPLETED
                        > case: "Return to Main Menu" COMPLETED
                    > loadData(new_query)
            > case: "Update Information" TODO
                > *while* not return_to_menu
                    > prompt(data to update) 
                        > case "Departments":
                        > case "Roles":
                        > case "Employees":
            > case: "Initiate Database" 
            > case: "Exit"

TODO
- Create a larger test DB
- Implement update methods
    - Create templates for db info
    - outline menus
- Add validation to make filter only work for number rows

Departments
> id int (PRIMARY KEY)
> name string 
> budget decimal

Roles
> id int (PRIMARY KEY)
> name string
> salary decimal

Employee
> id int
> first_name string
> last_name string
> deparment_id int
> role_id int (FOREIGN KEY)
> manager_id int (FOREIGN KEY)


Examples 
*Gaia Sanctuary*
- Departments
    - Wild Cats
    - Canines
    - Avians
    - Reptiles
    - Equines
    - Aquatic
    - Corporate
    - Gift Shop
- Roles
    - Director, 110000
    - Finance Manager, 70000
    - Gift Shop Manager, 60000
    - Curator, 90000
    --------------------
    - Veternarian, 80000
    - Zoologist, 70000
    - Caretaker, 70000
    - Gift Shop Clerk, 45000
    - Ticket Attendant, 44000
    - Volunteer Coordinator, 60000

Employees