exports.sendResetEmail = async (email, token) => {
  console.log(`Reset link for ${email}: http://localhost:5000/reset?token=${token}`);
};