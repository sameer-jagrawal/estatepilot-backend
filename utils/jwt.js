var jwt = require('jsonwebtoken');

function generateToken (user){
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRETE;

    return jwt.sign(
        {
          userId: user._id,
          tenantId: user.tenantId,
          role: user.role,
        },
        jwtSecret,
        {
          expiresIn: "30d",
        }
      );
}


const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      adminId: admin._id,
      role: admin.role,
    },
    process.env.ADMIN_JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


module.exports = {generateToken,generateAdminToken}
