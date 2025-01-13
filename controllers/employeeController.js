import multer from'multer'
import Employee from "../models/Employee.js"
import User from "../models/User.js"
import bcrypt from "bcrypt"
import path from 'path'
import Department from '../models/Department.js'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage })

const addEmployee = async (req, res) => {
    try{
        
    const {
        name,
        email,
        employeeId,
        dob,
        gender,
        martialStatus,
        designation,
        department,
        salary,
        password,
        role,    
    } = req.body;

    const user = await User.findOne({email})
    if(user){
        return res.status(400).json({success: false, error: "User Already Registered !"})
    }

    const hashPassword = await bcrypt.hash(password,10)

    const newUser = new User({
        name,
        email,
        password: hashPassword,
        role,
        profileImage: req.file ? req.file.filename : ""
    })
    const savedUser = await newUser.save();await newUser.save()

    const newEmployee = new Employee({
        userId: savedUser._id,
        employeeId,
        dob,
        gender,
        martialStatus,
        designation,
        department,
        salary, 
    })

    await newEmployee.save()
    return res.status(200).json({success: true, message: "Employee Created"})

    } catch(error){
        console.log(error);
        
        return res.status(500).json({success: false, error: "Server Error In Adding Employee !"})
}

};

const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate('userId', {password:0}).populate('department')
        return res.status(200).json({success: true, employees})
    } catch (error) {
        return res.status(500).json({success: false, error: "Get Employees Server Error"})
    }
};

const getEmployee = async (req, res) => {
    const {id} = req.params;
    try {
        const employee = await Employee.findById({_id: id}).populate('userId', {password:0}).populate('department')
        return res.status(200).json({success: true, employee})
    } catch (error) {
        return res.status(500).json({success: false, error: "Get Employees Server Error"})
    }
};

const updateEmployee = async (req,res) => {
    try {
        const {id} = req.params;
        const {name, martialStatus, designation, department, salary} = req.body;
        const employee = await Employee.findById({_id : id});
        if(!employee){
            return res.status(404).json({success: false, error: "Employee Not Found !"})        
        }
        
        const user = await User.findById({_id: employee.userId})
        if(!employee){
            return res.status(404).json({success: false, error: "User Not Found !"})        
        }

        const updateUser = await User.findByIdAndUpdate({_id: employee.userId}, {name})
        const updateEmployee = await Employee.findByIdAndUpdate({_id: id},{
            martialStatus,
            designation,
            salary,
            department
        });

        if(!updateUser || !updateEmployee){
            return res.status(404).json({success: false, error: "Document Not Found !"})        
        }

        return res.status(200).json({success: true, message: "Employee Updated !"})        

    } catch (error) {
        return res.status(500).json({success: false, error: "Edit Employee Server Error !"})        
    }

}

//const deleteEmployee = async (req, res) => {
//    try {
//        const { id } = req.params;  // Ensure the ID is coming from the route parameter
//        if (!id) {
//            return res.status(400).json({ success: false, error: "Employee ID is required" });
//        }
//        const employee = await Employee.findByIdAndDelete(id);  // Correct usage of the id parameter
//
//        if (!employee) {
//            return res.status(404).json({ success: false, error: "Employee not found" });
//        }
//
//        return res.status(200).json({ success: true, message: "Employee deleted successfully" });
//    } catch (error) {
//        console.error("Delete Employee Error:", error);  // Add logging for any unexpected error
//        return res.status(500).json({ success: false, error: "Delete Employee Server Error!" });
//    }
//};
export const getEmployeeDetails = async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: req.user.employeeId }).populate('userId');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const currentMonthAttendance = employee.getCurrentMonthAttendance();
        const totalAttendance = currentMonthAttendance.length;

        return res.status(200).json({
            success: true,
            employee: {
                name: employee.userId.name,
                employeeId: employee.employeeId,
                department: employee.department,
                salary: employee.salary,
                totalAttendance,
                currentMonthAttendance,
            },
        });
    } catch (error) {
        console.error("Error fetching employee details:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

const fetchEmployeesByDepId = async (req, res) => {
    const { id } = req.params;
    try {
      // Ensure the department ID is correctly casted to ObjectId if it's a MongoDB ObjectId
      const employees = await Employee.find({ department: id }).populate('userId');
      
      if (!employees.length) {
        return res.status(404).json({ success: false, error: "No employees found for this department" });
      }
  
      return res.status(200).json({ success: true, employees });
    } catch (error) {
      console.error("Error fetching employees by department ID:", error);
      return res.status(500).json({ success: false, error: "Error fetching employees by department" });
    }
  };
  
  




export{addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId}