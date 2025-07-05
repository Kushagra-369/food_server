
exports.ValidName = (name)=>{

    const NameRegex = /^[A-Za-z ]+$/
    return NameRegex.test(name)
}   
exports.ValidEmail = (email) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
};

exports.ValidPassword = (password)=>{
    const PasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return PasswordRegex.test(password);
}
