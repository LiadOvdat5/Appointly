type Props = { children: React.ReactNode };

export function SectionTitle({ children }: Props) {
  return (
    <h2 className="border-b border-gray-100 px-4 pb-3 pt-5 text-[22px] font-bold leading-tight tracking-[-0.015em] text-[#111418] dark:border-gray-800 dark:text-white">
      {children}
    </h2>
  );
}
