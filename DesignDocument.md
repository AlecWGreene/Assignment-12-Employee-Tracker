
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

> init
    > app()
    > *while* not exit 
        > prompt(Main Menu)
            > case: "View Information"
                > loadData(default_query)
                > *while* not return_to_menu
                    > prompt(Filter or Sort)
                    > loadData(new_query)
            > case: "Update Information"
                > *while* not return_to_menu
                    > prompt(Table)
                    > displayData(table)
                    > prompt(ADD or UPDATE or DELETE)
            > case: exit