export function QuestionCard({ question }) {
  return (
    <div className="p-6 bg-brand-light dark:bg-[#1e1b4b] border-l-[3px] border-brand-primary rounded-brand rounded-l-none shadow-sm">
      <h3 className="text-lg font-medium text-brand-dark dark:text-gray-100 leading-relaxed">
        {question}
      </h3>
    </div>
  );
}
