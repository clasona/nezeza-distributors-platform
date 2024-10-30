const createTokenUser = (user) => {
  return { email: user.email, userId: user._id, roles: user.roles };
};

module.exports = createTokenUser;
