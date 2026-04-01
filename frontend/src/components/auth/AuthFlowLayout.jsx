import OSSvg from "../svgs/OS";

/** Matches LoginPage / SignupPage: split hero + centered card column. */
const AuthFlowLayout = ({ leftTitle, leftDescription, topLeft, children }) => {
  return (
    <div className="relative min-h-screen w-full bg-base-100">
      {topLeft ?? null}
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        <div className="hidden h-full w-full lg:flex flex-col items-center justify-center gap-6 px-10">
          <OSSvg forceDark className="w-full max-w-md" />
          <div className="max-w-md space-y-2 text-center">
            <h2 className="text-2xl font-bold text-base-content">{leftTitle}</h2>
            <p className="text-base-content/70">{leftDescription}</p>
          </div>
        </div>
        <div className="flex h-full w-full items-center justify-center px-4 py-8 md:px-8">
          <div className="flex w-full max-w-md flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlowLayout;
