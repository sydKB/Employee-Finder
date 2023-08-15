const inquirer = require('inquirer');
const mysql = require('mysql2');
const fs = require('fs');

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
        //console.info(selection.initialCommand);
        if (selection.initialCommand == 'View all departments') { 
            displayDepts(); 
        } else if (selection.initialCommand == 'View all roles') {
            displayRoles();
        } else if (selection.initialCommand == 'View all employees') {
            displayEmployees();
        } else if (selection.initialCommand == 'Add a department') {
            addDept();
        } else if (selection.initialCommand == 'Add a role') {
            addRole();
        } else if (selection.initialCommand == 'Add an employee') {
            addEmployee();
        } else if (selection.initialCommand == 'Update an employee role') {
            updateRole();
        } else {
            console.log('Goodbye!');
            db.end();
        }
    });   
}

// **** query functions used to access table data ****
async function queryDepartments() {
    return new Promise((resolve, reject) => {
        db.query("select * from departments", function (err, res){
            if(err) reject(err);
            resolve(res);
        });
    });
}

async function queryRoles() {
    return new Promise((resolve, reject) => {
        db.query("select * from roles", function (err, res){
            if(err) reject(err);
            resolve(res);
        });
    });
}

async function queryEmployees() {
    return new Promise((resolve, reject) => {
        db.query("select * from employees", function (err, res){
            if(err) reject(err);
            resolve(res);
        });
    });
}

// **** display functions used to print data ****
async function displayDepts() {
    db.query("select * from departments", function (req, res){
        console.log("All departments...");
        console.table(res);
    });
    handleOptions();
}

async function displayRoles() {
    db.query("select * from roles", function (req, res){
        console.log("All roles...");
        console.table(res);
    });
    handleOptions();
}

async function displayEmployees() {
    db.query("select * from employees", function (req, res){
        console.log("All employees...");
        console.table(res);
    });
    handleOptions();
}

// adding a department name to the department table
async function addDept() {
    inquirer.prompt({
        type: "input",
        name: "departmentName",
        message: "Enter the department name:"
    }).then((answer)=>{
        console.log(answer.departmentName);
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
            choices: departments.map((departments)=>({name: departments.name, value: departments.id}))
        }
    ])
    .then((answer)=>{
        console.log(answer);
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
    console.log(roles);
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
            choices: roles.map((roles)=>({name: roles.title, value: roles.id}))
        },
        {
            type: "input",
            name: "managerId",
            message: "Enter the manager id:"
        }
    ]).then((answer)=>{
        console.log(answer);
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

handleOptions();

const db = mysql.createConnection(
    {
      host: 'localhost', //'127.0.0.1',
      user: 'root',
      password: 'sqlpassword',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  );