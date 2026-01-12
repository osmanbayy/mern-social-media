import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
    path: "/", // Path belirt (cookie silme için gerekli)
    // Domain belirtme - Vercel'de domain belirtmemek daha iyi
  });
};
