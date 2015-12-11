module.exports = function(User) {
  User.validatesLengthOf('password', {min: 5, message: {min: 'Password is too short'}});
};
