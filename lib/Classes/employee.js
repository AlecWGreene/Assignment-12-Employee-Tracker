class Employee{
    constructor(arg_name){
        let t_name = arg_name.split(" ");
        this.firstName = t_name[0];
        this.lastName = t_name[1];
        this.department = 0;
        this.role = 0;
    }
}

