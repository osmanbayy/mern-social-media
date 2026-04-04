export default function PostDetailNotFoundState({ onGoHome }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <p className="mb-4 text-xl">Gönderi bulunamadı</p>
      <button type="button" onClick={onGoHome} className="btn btn-primary">
        Ana Sayfaya Dön
      </button>
    </div>
  );
}
