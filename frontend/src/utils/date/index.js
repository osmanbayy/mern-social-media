export const formatPostDate = (createdAt) => {
  const currentDate = new Date();
  const createdAtDate = new Date(createdAt);

  const timeDifferenceInSeconds = Math.floor(
    (currentDate - createdAtDate) / 1000
  );
  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

  if (timeDifferenceInDays > 1) {
    return createdAtDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else if (timeDifferenceInDays === 1) {
    return "1 gün önce";
  } else if (timeDifferenceInHours >= 1) {
    return `${timeDifferenceInHours} saat önce`;
  } else if (timeDifferenceInMinutes >= 1) {
    return `${timeDifferenceInMinutes} dakika önce`;
  } else {
    return "Hemen Şimdi";
  }
};

export const formatMemberSinceDate = (createdAt) => {
  const date = new Date(createdAt);
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year} 'de Katıldı`;
};
