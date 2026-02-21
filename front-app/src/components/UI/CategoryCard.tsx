type Props = {
  image: string;
  label: string;
  onClick?: () => void;
  className?: string;
};

/**
 * CategoryCard component - A card with an image and label for category display
 */
export function CategoryCard({ image, label, onClick, className }: Props) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  const content = (
    <>
      <div
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <p className="text-[#0e141b] dark:text-white text-base font-medium leading-normal">
        {label}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={handleClick}
        className={[
          "flex flex-col gap-3 pb-3 text-left hover:opacity-80 transition-opacity",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={["flex flex-col gap-3 pb-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      {content}
    </div>
  );
}
