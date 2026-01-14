const FormCard = ({ children }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
      {children}
    </div>
  );
};

export default FormCard;
