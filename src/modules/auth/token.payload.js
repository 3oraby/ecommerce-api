
exports.createRefreshPayload = (user, jti) => {

  return {
    id: user.id,
    role: user.role,
    account_status: user.account_status,
    jti,
    type: "refresh",
  };
};

exports.createAccessPayload = (user) => {
  return {
    id: user.id,
    role: user.role,
    account_status: user.account_status,
    type: "access",
  };
};
