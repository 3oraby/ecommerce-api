exports.createRefreshTokenPayload = (user, jti) => {
  return {
    id: user.id,
    role: user.role,
    account_status: user.account_status,
    jti,
    type: "refresh",
  };
};

exports.createAccessTokenPayload = (user) => {
  return {
    id: user.id,
    role: user.role,
    account_status: user.account_status,
    type: "access",
  };
};

exports.createResetPasswordPayload = (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    type: "reset",
  };
};