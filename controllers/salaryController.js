import Salary from '../models/Salary.js';

const addSalary = async (req, res) => {
  try {
    const { employeeId, basicSalary, allowances, deductions, payDate } = req.body;

    // Validate required fields
    if (!employeeId || !basicSalary || !payDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Calculate net salary
    const totalSalary = parseInt(basicSalary) + parseInt(allowances || 0) - parseInt(deductions || 0);

    // Create and save salary document
    const newSalary = new Salary({
      employeeId,
      basicSalary,
      allowances,
      deductions,
      netSalary: totalSalary,
      payDate,
    });

    await newSalary.save();

    return res.status(200).json({ success: true, message: 'Salary added successfully' });
  } catch (error) {
    console.error('Error in addSalary controller:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getSalary = async (req, res) => {
    try {
        const {id} = req.params;
        const salary = await Salary.find({ employeeId: id});
        return res.status(200).json({success: true, salary})
    } catch (error) {
        return res.status(500).json({success: false, error:'Salary get server error'})
    }
};

export { addSalary, getSalary };
