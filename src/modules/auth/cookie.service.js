exports.sendCookies = (res, refreshToken) => {
  const expiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90;
  const maxAge = expiresInDays * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/",
  };

  return res.cookie("refreshToken", refreshToken, cookieOptions);
};

exports.clearCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };

  return res.clearCookie("refreshToken", cookieOptions);
};
