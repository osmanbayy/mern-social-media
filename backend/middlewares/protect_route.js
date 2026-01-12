import User from "../models/user_model.js";
import jwt from "jsonwebtoken";

export const protect_route = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      console.log("Token hatası");
      return res
        .status(401)
        .json({ message: "Bu işlemi yapabilmek için giriş yapmalısınız." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      console.log("Decode hatası");
      return res
        .status(401)
        .json({ message: "Bu işlemi yapabilmek için giriş yapmalısınız." });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protect route middleware", error.message);
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın." });
    }
    res
      .status(401)
      .json({ message: "Bu işlemi yapabilmek için giriş yapmalısınız." });
  }
};
