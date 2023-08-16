const inquirer = require('inquirer');
const mysql = require('mysql2');

// initial function that prompts the user. reused after every action until the user selects EXIT
function handleOptions() {
    const options =  [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'EXIT'
    ]

    inquirer.prompt([{
        message: 'What would you like to do?',
        name: 'initialCommand',
        type: 'list',
        choices: options
    }])
    .then(selection => {
        switch (selection.initialCommand) {
            case 'View all departments':
                displayDepts();
                break;
            case 'View all roles':
                displayRoles();
                break;
            case 'View all employees':
                displayEmployees();
                break;
            case 'Add a department':
                addDept();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateRole();
                break;
            default:
                console.log('Goodbye!');
                db.end();
                break;
        }
    });
    
}

// **** query functions used to access table data ****
function queryDepartments() {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM departments", function (err, res){
            if(err) reject(err);
            resolve(res);
        });
    });
}

function queryRoles() {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM roles", function (err, res){
            if(err) reject(err);
            resolve(res);
        });
    });
}

function queryEmployees() {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM employees", function (err, res){
            if(err) reject(err);
            resolve(res);
        });
    });
}

// **** display functions used to print data ****
function displayDepts() {
    db.query("SELECT * FROM departments", function (req, res){
        console.log("All departments...");
        console.table(res);
    });
    handleOptions();
}

function displayRoles() {
    db.query("SELECT * FROM roles", function (req, res){
        console.log("All roles...");
        console.table(res);
    });
    handleOptions();
}

function displayEmployees() {
    db.query("SELECT * FROM employees", function (req, res){
        console.log("All employees...");
        console.table(res);
    });
    handleOptions();
}

// adding a department name to the department table
function addDept() {
    inquirer.prompt({
        type: "input",
        name: "departmentName",
        message: "Enter the department name:"
    }).then((answer)=>{
        db.query("INSERT INTO departments (name) VALUES (?)", [answer.departmentName],
        function (err) {
            if (err) throw err;
            console.log("Department successfully added!");
            handleOptions();
        });
    });  
}

// adding a role with the help of a query to make department selection easier
async function addRole() {
    const departments = await queryDepartments();
    inquirer.prompt([
        {
            type: "input",
            name: "roleTitle",
            message: "Enter the role title:"
        }, 
        {
            type: "input",
            name: "roleSalary",
            message: "Enter the salary for role:"
        }, 
        {
            type: "list",
            name: "departmentId",
            message: "Select the department:",
            choices: departments.map((department)=>({name: department.name, value: department.id}))
        }
    ])
    .then((answer)=>{
        db.query("INSERT INTO roles SET ?", 
        {
            title: answer.roleTitle,
            salary: answer.roleSalary,
            department_id: answer.departmentId
        },
        function (err) {
            if (err) throw err;
            console.log("Role successfully added!");
            handleOptions();
        });
    }); 
}

// same as the function before, but adding an employee with a role 
async function addEmployee() {
    const roles = await queryRoles();
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "Enter the employee's first name:"
        },
        {
            type: "input",
            name: "lastName",
            message: "Enter the employee's last name:"
        },
        {
            type: "list",
            name: "roleId",
            message: "Select the role:",
            choices: roles.map((role)=>({name: role.title, value: role.id}))
        },
        {
            type: "input",
            name: "managerId",
            message: "Enter the manager id:"
        }
    ]).then((answer)=>{
        db.query("INSERT INTO employees SET ?", 
        {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.roleId,
            manager_id: answer.managerId,
        },
        function (err) {
            if (err) throw err;
            console.log("Employee successfully added!");
            handleOptions();
        });
    }); 
}

// updates chosen employee's role in the database
async function updateRole() {
    const employees = await queryEmployees();
    const roles = await queryRoles();
    inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Select the employee whose role you'd like to change:",
            choices: employees.map((employee)=>({
                name: employee.first_name + " " + employee.last_name, 
                value: employee.id
            }))
        },
        {
            type: "list",
            name: "newRole",
            message: "Select the new role for this employee:",
            choices: roles.map((role)=>({name: role.title, value: role.id}))
        }
    ]).then((answer)=>{
        db.query("UPDATE employees SET ? WHERE ?", 
        [
            {
                role_id: answer.newRole,
            },
            {
                id: answer.employee,
            },
        ],
        function (err) {
            if (err) throw err;
            console.log("Employee successfully updated!");
            handleOptions();
        });
    }); 
}

// initial call to begin the prompting.
handleOptions();

// creates a connection to the sql database
const db = mysql.createConnection(
    {
      host: 'localhost', //'127.0.0.1',
      user: 'root',
      password: 'sqlpassword',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  );