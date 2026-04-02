/**
 * express.json limit (entity.too.large), multer LIMIT_FILE_SIZE vb. için anlaşılır JSON yanıtı.
 */
export function payloadErrorHandler(err, req, res, next) {
  if (!err) {
    return next();
  }

  if (err.type === "entity.too.large" || err.status === 413 || err.statusCode === 413) {
    return res.status(413).json({
      message:
        "Gönderilen veri sunucunun izin verdiği boyutu aşıyor (ör. çok büyük görsel veya metin). Lütfen daha küçük bir dosya seçin veya görseli sıkıştırın.",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message:
        "Dosya boyutu çok büyük. Daha küçük bir dosya seçin (yükleme limiti aşıldı).",
      code: "FILE_TOO_LARGE",
    });
  }

  return next(err);
}
