const StepHeader = ({ icon: Icon, title, description, highlightText }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/25">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">
        {title.split(" ").map((word, index) => {
          if (highlightText && word.toLowerCase() === highlightText.toLowerCase()) {
            return (
              <span
                key={index}
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              >
                {word}{" "}
              </span>
            );
          }
          return <span key={index}>{word} </span>;
        })}
      </h1>
      <div className="text-slate-300 text-sm leading-relaxed">{description}</div>
    </div>
  );
};

export default StepHeader;
