import LoadingSpinner from "../common/LoadingSpinner";

export default function PostDetailLoadingState() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
